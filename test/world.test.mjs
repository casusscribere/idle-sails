// Node tests for the headless world engine (Milestone 3).
//   node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createWorld, _internals } from '../app/world.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, '..', 'app', 'data');
const datasets = JSON.parse(readFileSync(join(DATA, 'datasets.json'), 'utf8'));
const routes = JSON.parse(readFileSync(join(DATA, 'routes.json'), 'utf8'));
const data = { datasets, routes };
const DAY = _internals.SEC_PER_DAY;

const mk = (seed) => createWorld({ seed, data });

test('determinism: same seed → identical world', () => {
  const a = mk(42), b = mk(42);
  for (let i = 0; i < 200; i++) { a.tick(0.5 * DAY); b.tick(0.5 * DAY); }
  assert.equal(a.fingerprint(), b.fingerprint());
  assert.ok(a.state.counters.spawned > 50, 'should have spawned a healthy number of vessels');
});

test('determinism: different seeds → different worlds', () => {
  const a = mk(1), b = mk(2);
  for (let i = 0; i < 200; i++) { a.tick(0.5 * DAY); b.tick(0.5 * DAY); }
  assert.notEqual(a.fingerprint(), b.fingerprint());
});

test('granularity independence: big step == many small steps (offline accrual)', () => {
  const total = 90 * DAY;
  const big = mk(7); big.tick(total);
  const small = mk(7); for (let i = 0; i < 900; i++) small.tick(total / 900);
  assert.equal(Math.round(small.simClock), Math.round(big.simClock));
  assert.equal(small.fingerprint(), big.fingerprint());
});

test('plausibility: no generated vessel contradicts the historical data', () => {
  const w = mk(123);
  const shipById = new Map(datasets.shipTypes.map(s => [s.id, s]));
  const powerById = new Map(datasets.powers.map(p => [p.id, p]));
  const cargoById = new Map(datasets.cargo.map(c => [c.id, c]));
  const legKeys = new Set(routes.routes.map(r => r.id));
  const laneBySystem = new Map(datasets.routes.map(r => [r.name, r]));
  let checked = 0;

  for (let step = 0; step < 400; step++) {
    w.tick(0.5 * DAY);
    for (const v of w.activeVessels()) {
      checked++;
      const type = shipById.get(v.typeId), power = powerById.get(v.powerId), cargo = cargoById.get(v.cargoId);
      assert.ok(type && power && cargo, `resolvable refs for #${v.id}`);
      assert.ok(v.year >= 1700 && v.year <= 1815, `era-year in scope (${v.year})`);
      assert.ok(v.year >= type.era.from && v.year <= type.era.to, `${v.typeId} active in ${v.year}`);
      assert.ok(v.year >= power.era.from && v.year <= power.era.to, `${v.powerId} active in ${v.year}`);
      assert.equal(v.routeClass, type.routeClass, 'routeClass matches ship-type');
      assert.ok(v.tonnage >= type.tonnage.min && v.tonnage <= type.tonnage.max, `tonnage ${v.tonnage} in range for ${v.typeId}`);
      // Middle-Passage invariant (PLAN §10.5)
      if (v.cargoId === 'enslaved-people') {
        assert.ok(v.middlePassage, 'enslaved-people ⇒ middlePassage voyage');
        assert.equal(v.system, 'atlantic-slave', 'enslaved-people only on the Atlantic slave system');
      }
      if (v.middlePassage) assert.equal(v.cargoId, 'enslaved-people', 'Middle-Passage voyage carries only enslaved-people');
      // itinerary references real baked polylines
      for (const seg of v.schedule) assert.ok(legKeys.has(seg.legId), `baked leg exists: ${seg.legId}`);
      // position is finite and on the globe
      assert.ok(Number.isFinite(v.pos.lon) && Number.isFinite(v.pos.lat), 'finite position');
      assert.ok(v.pos.lat >= -60 && v.pos.lat <= 90, `sane latitude (${v.pos.lat})`);
      assert.ok(Number.isFinite(v.pos.heading), 'finite heading');
    }
  }
  assert.ok(checked > 1000, `inspected a broad sample of vessels (${checked})`);
});

test('24h fast-forward behaves: population stabilises in a sane band', () => {
  const w = mk(99);
  let min = Infinity, max = 0;
  for (let day = 0; day < 365; day++) {
    w.tick(DAY);
    const atSea = w.state.vessels.filter(v => v.status === 'sailing').length;
    if (day > 60) { min = Math.min(min, atSea); max = Math.max(max, atSea); } // after warm-up
  }
  assert.ok(min > 5, `world stays populated (min at sea ${min})`);
  assert.ok(max < 400, `population bounded (max at sea ${max})`);
  assert.ok(w.state.counters.arrived > 0 && w.state.counters.spawned > w.state.counters.arrived, 'vessels arrive over time');
});

test('log stays capped and events are ordered by recency', () => {
  const w = mk(5);
  for (let i = 0; i < 300; i++) w.tick(DAY);
  assert.ok(w.state.log.length <= 200, 'log capped at 200');
  const snap = w.snapshot();
  assert.ok(snap.log.length <= 40, 'snapshot log trimmed');
  assert.ok(snap.date.match(/\d+ \w+ \d{4}/), `readable date (${snap.date})`);
});

test('calendar cycles within the era and maps seasons', () => {
  const { calendar } = _internals;
  assert.equal(calendar(0).year, 1700);
  const s = calendar(0).season;
  assert.ok(['djf', 'mam', 'jja', 'son'].includes(s));
  // 120 years on → cycles back into the era (never leaves 1700–1815)
  const c = calendar(120 * 365.25 * DAY);
  assert.ok(c.year >= 1700 && c.year <= 1815, `year cycles inside era (${c.year})`);
});
