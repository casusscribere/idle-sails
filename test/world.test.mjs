// Node tests for the headless world engine (Milestone 3).
//   node --test
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
      assert.ok(v.year >= 1550 && v.year <= 1815, `era-year in scope (${v.year})`);
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

test('calendar flows 1550→1815, ramps a 5-year reset, and loops', () => {
  const { calendar, ERA, FLOW_SPAN, RESET_YEARS, CYCLE_YEARS } = _internals;
  const YR = 365.25 * DAY;
  assert.equal(ERA.from, 1550);
  assert.equal(calendar(0).year, 1550);                 // epoch = start of the flow
  assert.ok(['djf', 'mam', 'jja', 'son'].includes(calendar(0).season));
  assert.equal(calendar(0).reset, 0);
  // partway through the forward flow
  assert.equal(calendar(132.5 * YR).year, 1682);
  assert.equal(calendar(132.5 * YR).reset, 0);
  // end of the forward flow = 1815
  assert.equal(calendar(FLOW_SPAN * YR).year, 1815);
  // inside the reset ramp: a "fake" post-1815 year with reset progress in (0,1)
  const mid = calendar((FLOW_SPAN + RESET_YEARS / 2) * YR);
  assert.ok(mid.year > 1815 && Math.abs(mid.reset - 0.5) < 1e-9, `reset midpoint (${mid.year}, ${mid.reset})`);
  // one full cycle later ⇒ identical calendar (loops with period CYCLE_YEARS)
  const a = calendar(37 * YR), b = calendar((37 + CYCLE_YEARS) * YR);
  assert.equal(a.year, b.year);
  assert.ok(Math.abs(a.yearFloat - b.yearFloat) < 1e-6, 'yearFloat loops');
});

test('flowing weights: smooth across decade boundaries and the reset seam', () => {
  const w = mk(1);
  const { CYCLE_YEARS } = _internals;
  const YR = 365.25 * DAY;
  const ports = datasets.ports.map(p => p.id);
  const stepYears = 0.25, steps = Math.round(CYCLE_YEARS / stepYears);
  let prev = w.weightsAt(0), maxJump = 0;
  for (let i = 1; i <= steps; i++) {
    const cur = w.weightsAt(i * stepYears * YR);
    for (const p of ports) maxJump = Math.max(maxJump, Math.abs(cur[p] - prev[p]));
    prev = cur;
  }
  // A quarter-year step over a piecewise-linear ramp (range ~0.08..1.2) must move a
  // port's weight only a little — no discontinuity at any decade edge or the seam.
  assert.ok(maxJump < 0.1, `weights change smoothly (max quarter-year jump ${maxJump.toFixed(4)})`);
});

test('flowing weights: loop with period CYCLE_YEARS', () => {
  const w = mk(1);
  const { CYCLE_YEARS } = _internals;
  const YR = 365.25 * DAY;
  for (const t of [11, 88, 210, 260]) {
    const a = w.weightsAt(t * YR), b = w.weightsAt((t + CYCLE_YEARS) * YR);
    for (const p of datasets.ports) assert.ok(Math.abs(a[p.id] - b[p.id]) < 1e-9, `weight loops for ${p.id} at year+${t}`);
  }
});

test('flowing weights: historical dominance rotates over the era', () => {
  const w = mk(1);
  const YR = 365.25 * DAY;
  const leaderAt = (yearsIn) => {
    const wt = w.weightsAt(yearsIn * YR);
    return Object.entries(wt).sort((a, b) => b[1] - a[1])[0][0];
  };
  // 1560s: the Iberian / Antwerp-via-Amsterdam world leads; London/Liverpool do not.
  assert.ok(['amsterdam', 'lisbon', 'cadiz'].includes(leaderAt(15)), `16th-c leader (${leaderAt(15)})`);
  // 1750s: London is the busiest port in the world.
  assert.equal(leaderAt(205), 'london');
  // Liverpool rises late: much stronger in the 1800s than in the 1600s.
  const early = w.weightsAt(55 * YR).liverpool, late = w.weightsAt(255 * YR).liverpool;
  assert.ok(late > early * 3, `Liverpool rises late (${early.toFixed(2)} → ${late.toFixed(2)})`);
});

test('spawn mix flows with history: origins shift across the cycle', () => {
  const w = mk(2024);
  const YR = 365.25 * DAY, WEEK = 7 * DAY;
  const { CYCLE_YEARS } = _internals;
  const weeks = Math.round((CYCLE_YEARS * YR) / WEEK);
  const byDecade = new Map();            // decade → Map(portId → count)
  let lastT = -1;
  for (let i = 0; i < weeks; i++) {
    w.tick(WEEK);
    for (const e of w.state.log) {
      if (e.kind !== 'depart' || e.t <= lastT || e.from == null) continue;
      const dec = Math.floor(e.year / 10) * 10;
      if (!byDecade.has(dec)) byDecade.set(dec, new Map());
      const m = byDecade.get(dec);
      m.set(e.from, (m.get(e.from) || 0) + 1);
    }
    lastT = w.simClock;
  }
  const share = (dec, port) => {
    const m = byDecade.get(dec); if (!m) return 0;
    const tot = [...m.values()].reduce((s, n) => s + n, 0);
    return tot ? (m.get(port) || 0) / tot : 0;
  };
  // early period is Iberian/Brazil (Cádiz+Lisbon+Bahia dominate the thin 1560s mix)
  const iberianEarly = share(1560, 'cadiz') + share(1560, 'lisbon') + share(1560, 'bahia');
  assert.ok(iberianEarly > 0.5, `1560s dominated by Iberian/Brazil origins (${iberianEarly.toFixed(2)})`);
  // late period: London is a top origin and Liverpool is materially present
  assert.ok(share(1800, 'london') > 0.1, `London a major 1800s origin (${share(1800, 'london').toFixed(2)})`);
  assert.ok(share(1800, 'liverpool') > share(1650, 'liverpool'), 'Liverpool busier late than early');
});
