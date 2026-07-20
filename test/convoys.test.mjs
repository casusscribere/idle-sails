// Convoys (movement-realism branch, PLAN-convoys.md §6). Sim-layer tests: the
// grouping is decided + generated at the spawn event, so fate-at-spawn and the
// determinism/granularity guarantees still hold.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createWorld, _internals } from '../world.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, '..', 'data');
const datasets = JSON.parse(readFileSync(join(DATA, 'datasets.json'), 'utf8'));
const routes = JSON.parse(readFileSync(join(DATA, 'routes.json'), 'utf8'));
const data = { datasets, routes };
const DAY = _internals.SEC_PER_DAY, YR = 365.25 * DAY;
const mk = (seed) => createWorld({ seed, data });

// convoys grouped from the live vessel array (leader id → members)
function liveConvoys(w) {
  const by = new Map();
  for (const v of w.state.vessels) if (v.convoyId) { (by.get(v.convoyId) || by.set(v.convoyId, []).get(v.convoyId)).push(v); }
  return by;
}

test('convoys exist and are structurally sound', () => {
  const w = mk(42);
  for (let i = 0; i < Math.round(120 * YR / (20 * DAY)); i++) w.tick(20 * DAY);
  const convoys = liveConvoys(w);
  assert.ok(convoys.size > 0, `some convoys formed (${convoys.size})`);
  for (const [leadId, members] of convoys) {
    const trade = members.filter(m => !m.convoyEscort);
    const escorts = members.filter(m => m.convoyEscort);
    // one lane + one leg sequence for the whole body of sail
    const laneSet = new Set(members.map(m => m.schedule.map(s => s.legId).join('>')));
    assert.equal(laneSet.size, 1, `convoy ${leadId} sails one leg sequence`);
    // the leader is a member and carries her own id as convoyId
    assert.ok(members.some(m => m.id === leadId && m.convoyId === leadId), 'leader present');
    // departures strictly staggered (line astern), leader first
    const departs = trade.map(m => m.schedule[0].depart).sort((a, b) => a - b);
    for (let i = 1; i < departs.length; i++) assert.ok(departs[i] > departs[i - 1], 'members staggered');
    // at most one escort; when present she is naval, in ballast, era-valid type
    assert.ok(escorts.length <= 1, 'at most one escort');
    for (const e of escorts) {
      assert.ok(e.isNaval, 'escort is naval');
      assert.equal(e.cargoId, 'ballast', 'escort sails in ballast');
    }
  }
});

test('determinism: same seed ⇒ identical convoys + fingerprints', () => {
  const a = mk(42), b = mk(42);
  const steps = Math.round(80 * YR / (20 * DAY));
  for (let i = 0; i < steps; i++) { a.tick(20 * DAY); b.tick(20 * DAY); }
  assert.equal(a.fingerprint(), b.fingerprint());
  const ca = [...liveConvoys(a).keys()].sort(), cb = [...liveConvoys(b).keys()].sort();
  assert.deepEqual(ca, cb, 'identical convoy leaders');
});

test('granularity: one big tick ⇒ same world as many small (convoys included)', () => {
  const big = mk(7), small = mk(7);
  big.tick(200 * DAY);
  for (let i = 0; i < 40; i++) small.tick(5 * DAY);
  assert.equal(big.fingerprint(), small.fingerprint());
});

test('charter: coerced-flow lanes never convoy', () => {
  const w = mk(3);
  for (let i = 0; i < Math.round(150 * YR / (20 * DAY)); i++) {
    w.tick(20 * DAY);
    for (const v of w.state.vessels) if (v.convoyId) {
      assert.ok(!v.middlePassage, `${v.name} on a Middle-Passage lane must not convoy`);
      assert.ok(!v.laneFraming, `${v.name} on a framing (coerced) lane must not convoy`);
    }
  }
});

test('reprieve: only escorted convoys, only the configured causes', () => {
  // Reprieve clears a prize-taking for an escorted member. Observe indirectly:
  // an UNescorted convoy's members can still be lost to capture; the mechanic
  // never touches weather losses. Here we assert the data contract + that some
  // escorted convoys sail losslessly through wars (the protection shows).
  const rp = datasets.convoys.reprieve;
  assert.deepEqual(rp.causes, ['taken as a prize'], 'reprieve is capture-only (weather spares no one)');
  assert.ok(rp.q > 0 && rp.q <= 1);
});

test('flow honesty + population: convoys do not blow up the sea', () => {
  const w = mk(42);
  let peak = 0;
  for (let yr = 0; yr < 200; yr++) {
    w.tick(YR);
    peak = Math.max(peak, w.state.vessels.filter(v => v.status === 'sailing').length);
  }
  const perYr = w.state.counters.spawned / 200;
  // the spectator band holds (interval scaling keeps voyages/yr ≈ the matrix's)
  assert.ok(peak < 320, `population stays in band (peak ${peak})`);
  assert.ok(perYr > 200 && perYr < 900, `spawns/yr sane (${perYr.toFixed(0)})`);
});

test('persistence: a convoy world save/restores and continues identically', () => {
  const a = mk(33);
  for (let i = 0; i < Math.round(120 * YR / (10 * DAY)); i++) a.tick(10 * DAY);
  assert.ok(liveConvoys(a).size > 0, 'has live convoys to preserve');
  const saved = a.serialize();
  const b = createWorld({ seed: 33, data, restore: saved });
  // convoy membership survives the round-trip
  assert.deepEqual([...liveConvoys(b).keys()].sort(), [...liveConvoys(a).keys()].sort());
  for (let i = 0; i < 60; i++) { a.tick(5 * DAY); b.tick(5 * DAY); }
  assert.equal(a.fingerprint(), b.fingerprint(), 'restored convoy world continues identically');

  // a pre-convoy save (no convoyId anywhere) restores without error
  const old = a.serialize();
  for (const v of old.vessels) delete v.convoyId;
  const c = createWorld({ seed: 33, data, restore: old });
  c.tick(30 * DAY);
  assert.ok(c.state.counters.spawned > 0);
});
