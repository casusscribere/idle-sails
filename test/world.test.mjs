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
  // the test starts at 1550, when the realized world flow is smallest (activity
  // clamps at 0.5×) — a sparse-but-alive sea is the intended data-driven state
  assert.ok(a.state.counters.spawned > 30, `should have spawned a healthy number of vessels (${a.state.counters.spawned})`);
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
  assert.ok(snap.year >= 1550 && snap.year <= 1820, `snapshot exposes the flowing year (${snap.year})`);
  assert.ok(snap.reset >= 0 && snap.reset <= 1, 'snapshot exposes reset progress');
});

test('serialize/restore: a reopened world continues identically (Milestone 6)', () => {
  // Run a world, save it mid-flight, resume the save in a NEW world, then drive
  // both forward — the restored session must be indistinguishable from the one
  // that never closed (vessels, spawn stream, counters, everything).
  const a = mk(314);
  for (let i = 0; i < 120; i++) a.tick(0.7 * DAY);
  const savedState = a.serialize();
  const b = createWorld({ seed: 314, data, restore: savedState });
  assert.equal(a.fingerprint(), b.fingerprint(), 'restore reproduces the saved world exactly');
  for (let i = 0; i < 160; i++) { a.tick(0.9 * DAY); b.tick(0.9 * DAY); }
  assert.equal(a.fingerprint(), b.fingerprint(), 'restored world continues identically');
  assert.ok(b.state.counters.spawned > savedState.counters.spawned, 'restored world keeps living');
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
  let prev = w.weightsAt(0), maxJump = 0, maxSeen = 1e-9;
  for (let i = 1; i <= steps; i++) {
    const cur = w.weightsAt(i * stepYears * YR);
    for (const p of ports) {
      maxJump = Math.max(maxJump, Math.abs(cur[p] - prev[p]));
      maxSeen = Math.max(maxSeen, cur[p]);
    }
    prev = cur;
  }
  // A quarter-year step over piecewise-linear decade ramps (and the 5-year reset
  // blend) must move any port's weight only a small fraction of the busiest
  // port's weight — no discontinuity at any decade edge or the seam. Lane era
  // windows still gate on integer years (matching spawn behaviour), so allow
  // for those small authored steps.
  assert.ok(maxJump / maxSeen < 0.15, `weights change smoothly (max quarter-year jump ${(100 * maxJump / maxSeen).toFixed(1)}% of peak)`);
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
  // 1560s: only the Iberian-Atlantic systems have sailable lanes — the leader is
  // one of the Carrera/Brazil endpoints, and never a northern port.
  assert.ok(['cadiz', 'kingston', 'lisbon', 'bahia'].includes(leaderAt(15)), `16th-c leader (${leaderAt(15)})`);
  assert.ok(!['london', 'liverpool', 'amsterdam'].includes(leaderAt(15)), '16th-c leader is not a northern port');
  // 1750s: the leader is London or Gothenburg — Gothenburg is the Phase-A proxy
  // carrying the ENTIRE folded Baltic (Danzig, Riga, Stockholm, St Petersburg),
  // so its concentration is a documented coverage artifact, not a claim about
  // the Swedish port. London must in any case dominate every other real port.
  const wt1750 = w.weightsAt(205 * YR);
  assert.ok(['london', 'gothenburg'].includes(leaderAt(205)), `1750s leader (${leaderAt(205)})`);
  const others = Object.entries(wt1750).filter(([p]) => p !== 'london' && p !== 'gothenburg').map(([, v]) => v);
  assert.ok(wt1750.london > Math.max(...others), 'London out-weighs every non-proxy port in the 1750s');
  // Liverpool rises late: its lanes (Guinea trade, West India homeward) have flow
  // in the 1800s and none in the 1650s.
  const early = w.weightsAt(105 * YR).liverpool, late = w.weightsAt(255 * YR).liverpool;
  assert.ok(late > early * 3 && late > 0, `Liverpool rises late (${early.toFixed(2)} → ${late.toFixed(2)})`);
});

test('per-seed flow realization: seeds read the evidence differently, each deterministically', () => {
  const YR = 365.25 * DAY;
  const a1 = mk(11), a2 = mk(11), b = mk(12);
  const t = 205 * YR;
  const wa1 = a1.laneWeightsAt(t), wa2 = a2.laneWeightsAt(t), wb = b.laneWeightsAt(t);
  // same seed ⇒ identical reading of the evidence
  assert.deepEqual(wa1, wa2, 'same seed, same realization');
  // different seeds ⇒ (almost surely) a different reading within the ranges
  const diff = Object.keys(wa1).some(k => Math.abs((wa1[k] || 0) - (wb[k] || 0)) > 1e-9);
  assert.ok(diff, 'different seeds realize different traffic within the evidence bounds');
  // realization stays within each system's authored envelope: weights are finite, non-negative
  for (const [k, v] of Object.entries(wa1)) assert.ok(Number.isFinite(v) && v >= 0, `sane weight for ${k}`);
});

test('spawn-rate drift: the sea thickens from the 1550s to the 1810s', () => {
  const YR = 365.25 * DAY;
  const meanAtSea = (startYears) => {
    const w = mk(51);
    w.tick(startYears * YR);              // fast-forward to the era (offline-accrual style)
    let sum = 0, n = 0;
    for (let d = 0; d < 200; d++) { w.tick(DAY); if (d > 60) { sum += w.state.vessels.filter(v => v.status === 'sailing').length; n++; } }
    return sum / n;
  };
  const early = meanAtSea(10), late = meanAtSea(255);   // 1560s vs 1800s
  assert.ok(late > early * 1.4, `late era busier than early (${early.toFixed(0)} → ${late.toFixed(0)} at sea)`);
  assert.ok(early > 15, `early era still alive (${early.toFixed(0)} at sea)`);
});

test('pre-1700 wars: early-era voyages can be taken as prizes', () => {
  const w = mk(88);
  const YR = 365.25 * DAY;
  w.tick(35 * YR);                        // → 1585, the Anglo-Spanish & Dutch-Iberian wars
  let prizes = 0;
  for (let d = 0; d < 365 * 12 && prizes === 0; d++) {   // sail 1585–1597
    w.tick(DAY);
    for (const e of w.state.log) if (e.kind === 'loss' && /prize/.test(e.text)) prizes++;
  }
  assert.ok(prizes > 0, 'a 16th-century voyage was taken as a prize');
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
