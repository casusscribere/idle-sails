// Node tests for the performance settings: the tier may tune only the render
// and observation layers — the sim underneath must be IDENTICAL at every
// setting (same seed ⇒ same world, whatever the slider says).
//   node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createWorld, _internals } from '../world.js';
import { loadSettings, saveSettings, perfValues, PERF_TIERS, defaultSettings } from '../settings.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, '..', 'data');
const datasets = JSON.parse(readFileSync(join(DATA, 'datasets.json'), 'utf8'));
const routes = JSON.parse(readFileSync(join(DATA, 'routes.json'), 'utf8'));
const data = { datasets, routes };
const DAY = _internals.SEC_PER_DAY;
const YEAR = DAY * _internals.DAY_OF_YEAR;

test('tuning is sim-inert: same seed, different tuning ⇒ identical fingerprints', () => {
  const a = createWorld({ seed: 42, data });
  const b = createWorld({ seed: 42, data, tuning: { logCap: 10, wreckLingerDays: 5 } });
  for (let i = 0; i < 300; i++) { a.tick(0.5 * DAY); b.tick(0.5 * DAY); }
  assert.equal(a.fingerprint(), b.fingerprint());
  assert.ok(b.state.log.length <= 10, `tuned log stays capped (${b.state.log.length})`);
  assert.ok(a.state.log.length > 10, 'default log grows past the tuned cap');
});

test('tuning is live-adjustable mid-run and stays sim-inert', () => {
  const a = createWorld({ seed: 7, data });
  const b = createWorld({ seed: 7, data });
  for (let i = 0; i < 100; i++) { a.tick(DAY); b.tick(DAY); }
  Object.assign(b.tuning, { logCap: 25, wreckLingerDays: 30 });   // the player moves the slider
  for (let i = 0; i < 100; i++) { a.tick(DAY); b.tick(DAY); }
  assert.equal(a.fingerprint(), b.fingerprint());
});

test('ship-density thinning: a stable subset of the full snapshot, sim untouched', () => {
  const w = createWorld({ seed: 11, data });
  for (let i = 0; i < 200; i++) w.tick(0.5 * DAY);
  const full = w.snapshot();
  const half = w.snapshot({ density: 0.5 });
  const fullIds = new Set(full.vessels.map(v => v.id));
  assert.ok(half.vessels.length > 0 && half.vessels.length < full.vessels.length,
    `thinning keeps a strict subset (${half.vessels.length}/${full.vessels.length})`);
  for (const v of half.vessels) assert.ok(fullIds.has(v.id), 'thinned vessels come from the full set');
  // counters describe the FULL world at every density — the sim is untouched
  assert.deepEqual(half.counters, full.counters);
  // stable: the same ships are the visible ones on every call
  assert.deepEqual(w.snapshot({ density: 0.5 }).vessels.map(v => v.id), half.vessels.map(v => v.id));
});

test('war events derive purely from the flowing clock', () => {
  const w = createWorld({ seed: 3, data });
  const war = datasets.wars.find(x => x.from > 1550);
  const t = (war.from - 1550 + 0.5) * YEAR;    // half a year into the war
  const evs = w.warEventsSince(t, 1);
  assert.ok(evs.some(e => e.kind === 'war-begin' && e.text === `${war.name} began`),
    `war-begin entry for ${war.name} within the window`);
  assert.deepEqual(w.warEventsSince(t, 1), evs, 'pure: same instant ⇒ same events');
  // and across the 270-year loop seam: the same war, one full cycle later
  const evs2 = w.warEventsSince(t + _internals.CYCLE_YEARS * YEAR, 1);
  assert.ok(evs2.some(e => e.kind === 'war-begin' && e.text === `${war.name} began`),
    'the window reads correctly in later cycles');
  // the newborn world has no past: cycle one's opening window must not read
  // "Napoleonic Wars ended" out of a previous cycle that never happened
  assert.ok(w.warEventsSince(0.4 * YEAR, 10).every(e => e.kind !== 'war-end'),
    'no pre-world endings in cycle one');
  // …and the same instant one cycle on ALSO shows no endings: the chart is
  // redrawn at every 1550 wrap, and its displayed past starts there — the
  // previous cycle's late wars are hidden with the rest of its history
  const wrap = w.warEventsSince(_internals.CYCLE_YEARS * YEAR + 0.4 * YEAR, 10);
  assert.ok(wrap.every(e => e.kind !== 'war-end'),
    'cycle two’s opening window does not read the previous cycle’s endings');
});

test('settings: defaults, round-trip, junk tolerance, medium = pre-slider behaviour', () => {
  const store = new Map();
  const storage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, v) };
  const s = loadSettings(storage);
  assert.deepEqual(s, defaultSettings());
  s.perfTier = 'low'; s.panels.legend = true; s.furled = true; s.collapsed.events = true;
  saveSettings(s, storage);
  const back = loadSettings(storage);
  assert.equal(back.perfTier, 'low');
  assert.equal(back.panels.legend, true);
  assert.equal(back.panels.counters, true);
  assert.equal(back.furled, true, 'a furled chart stays furled');
  assert.equal(back.collapsed.events, true, 'a collapsed panel stays collapsed');
  assert.equal(back.collapsed.legend, false);
  // junk in storage falls back to defaults, never throws
  storage.setItem('idle-sails-settings', '{"perfTier":"turbo","panels"');
  assert.deepEqual(loadSettings(storage), defaultSettings());
  storage.setItem('idle-sails-settings', JSON.stringify({ perfTier: 'turbo', panels: { legend: 'yes' } }));
  assert.deepEqual(loadSettings(storage), defaultSettings());
  // the default tier is exactly the constants the world always used
  assert.deepEqual(perfValues(defaultSettings()), PERF_TIERS.medium);
});

test('settings: chart view + layer toggles round-trip and reject junk', () => {
  const store = new Map();
  const storage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, v) };
  const s = loadSettings(storage);
  assert.equal(s.region, 'world');
  assert.deepEqual(s.layers, {}, 'no basin stored ⇒ every layer on');
  // sparse storage: only switched-off basins persist
  s.region = 'caribbean'; s.layers['east-asia'] = false;
  saveSettings(s, storage);
  const back = loadSettings(storage);
  assert.equal(back.region, 'caribbean', 'the chosen plate persists');
  assert.equal(back.layers['east-asia'], false, 'a hidden layer stays hidden');
  assert.equal(back.layers['atlantic'], undefined, 'absent basin = on');
  // junk shapes are dropped, never throw
  storage.setItem('idle-sails-settings', JSON.stringify({
    region: { evil: true },
    layers: { 'east-asia': 'nope', 'INVALID KEY!': false, atlantic: false }
  }));
  const junk = loadSettings(storage);
  assert.equal(junk.region, 'world', 'a non-string region falls back');
  assert.deepEqual(junk.layers, { atlantic: false }, 'only well-formed boolean layer entries survive');
  storage.setItem('idle-sails-settings', JSON.stringify({ region: 'x'.repeat(99) }));
  assert.equal(loadSettings(storage).region, 'world', 'an over-long region id falls back');
});

test('settings: port-names policy round-trips and rejects junk', () => {
  const store = new Map();
  const storage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, v) };
  assert.equal(loadSettings(storage).portNames, 'default', 'defaults to the fading-names policy');
  for (const mode of ['none', 'active', 'default']) {
    const s = loadSettings(storage); s.portNames = mode; saveSettings(s, storage);
    assert.equal(loadSettings(storage).portNames, mode, `${mode} persists`);
  }
  storage.setItem('idle-sails-settings', JSON.stringify({ portNames: 'wat' }));
  assert.equal(loadSettings(storage).portNames, 'default', 'an unknown policy falls back to default');
});

test('settings: events tree + sunken-ships toggle round-trip and reject junk', () => {
  const store = new Map();
  const storage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, v) };
  const d = loadSettings(storage);
  assert.deepEqual(d.events, { losses: true, wars: true, ports: true }, 'all event categories default on');
  assert.equal(d.wrecks, true, 'sunken ships shown by default');
  d.events.wars = false; d.events.ports = false; d.wrecks = false;
  saveSettings(d, storage);
  const back = loadSettings(storage);
  assert.deepEqual(back.events, { losses: true, wars: false, ports: false }, 'category toggles persist');
  assert.equal(back.wrecks, false, 'the sunken-ships toggle persists');
  // junk shapes are dropped, defaults kept, never throw
  storage.setItem('idle-sails-settings', JSON.stringify({ events: { wars: 'no', ports: false, evil: true }, wrecks: 'nope' }));
  const junk = loadSettings(storage);
  assert.deepEqual(junk.events, { losses: true, wars: true, ports: false }, 'only well-formed boolean categories survive');
  assert.equal(junk.wrecks, true, 'a non-boolean wrecks flag falls back to on');
});

test('settings: cursor-position toggle round-trips', () => {
  const store = new Map();
  const storage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, v) };
  assert.equal(loadSettings(storage).cursor, false, 'cursor readout off by default');
  const s = loadSettings(storage); s.cursor = true; saveSettings(s, storage);
  assert.equal(loadSettings(storage).cursor, true, 'the cursor toggle persists');
  storage.setItem('idle-sails-settings', JSON.stringify({ cursor: 'yes' }));
  assert.equal(loadSettings(storage).cursor, false, 'a non-boolean cursor flag falls back to off');
});
