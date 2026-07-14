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
  // 1560s: the old world leads — with the S2 universe sailable, the busiest
  // ports are the Mediterranean/Baltic/Iberian metabolisms (Istanbul's
  // provisioning above all: the declared-boundary exemplar, now IN the sim) —
  // and never the Atlantic-industrial ports whose century hasn't come.
  assert.ok(['istanbul', 'venice', 'naples', 'genoa', 'cadiz', 'lisbon', 'danzig', 'amsterdam', 'hamburg'].includes(leaderAt(15)), `16th-c leader (${leaderAt(15)})`);
  assert.ok(!['london', 'liverpool', 'boston', 'new-york'].includes(leaderAt(15)), '16th-c leader is not an Atlantic-industrial port');
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
  // the S2 world's 1560s runs many SHORT Mediterranean/Baltic legs, so the
  // at-sea count per spawn is lower than the old ocean-only world's — alive
  // means alive, not crowded
  assert.ok(early > 8, `early era still alive (${early.toFixed(0)} at sea)`);
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

test('every voyage knows its evidence class (S3: the ledger line)', () => {
  const w = mk(21);
  const YR = 365.25 * DAY;
  w.tick(200 * YR);                      // mid-18th c: all strata active
  const seen = new Set();
  for (let i = 0; i < 400; i++) { w.tick(DAY); for (const v of w.state.vessels) if (v.evidence) seen.add(v.evidence); }
  assert.ok(seen.has('counted'), `counted trades sail (${[...seen]})`);
  assert.ok(seen.has('reconstructed') || seen.has('asserted'), `the reconstructed/asserted strata sail (${[...seen]})`);
  for (const e of seen) assert.ok(['counted', 'proxied', 'reconstructed', 'asserted', 'state'].includes(e), `valid class ${e}`);
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
  // early period: the OLD WORLD dominates — Mediterranean, Baltic, Iberian —
  // and the Atlantic-colonial ports do not yet exist as origins
  const oldWorld1560 = ['istanbul', 'venice', 'naples', 'genoa', 'livorno', 'cadiz', 'lisbon', 'danzig', 'amsterdam', 'hamburg', 'marseille', 'kaffa']
    .reduce((s, p) => s + share(1560, p), 0);
  assert.ok(oldWorld1560 > 0.5, `1560s dominated by old-world origins (${oldWorld1560.toFixed(2)})`);
  const colonial1560 = ['boston', 'new-york', 'philadelphia', 'chesapeake'].reduce((s, p) => s + share(1560, p), 0);
  assert.ok(colonial1560 < 0.01, `no colonial-American origins in the 1560s (${colonial1560.toFixed(3)})`);
  // late period: the Atlantic-industrial ports rise; the junk trade is present throughout
  assert.ok(share(1800, 'london') > share(1650, 'london'), 'London rises across the era');
  assert.ok(share(1800, 'liverpool') > share(1650, 'liverpool'), 'Liverpool busier late than early');
  assert.ok(share(1650, 'amoy') > 0, `the Nanyang junk trade sails the 17th century (${share(1650, 'amoy').toFixed(3)})`);
});

test('wrecks: a loss marks the chart for a sim-year, then fades from the record', () => {
  // sail long enough to accumulate losses (base loss ~2.5%/30-day leg)
  const w = mk(3);
  w.tick(400 * DAY);
  const wrecks = w.state.wrecks;
  assert.ok(wrecks.length > 0, `some vessels were lost (${w.state.counters.lost} lost, ${wrecks.length} wrecks)`);
  // every wreck is a complete, positioned record of what/when/how
  for (const wr of wrecks) {
    assert.ok(wr.name && wr.typeName && wr.powerName, 'wreck identifies the ship');
    assert.ok(wr.date && wr.cause, 'wreck records the day and the cause');
    assert.ok(Number.isFinite(wr.lon) && Number.isFinite(wr.lat), 'wreck is positioned');
    assert.ok(wr.at > w.simClock - 365.25 * DAY, 'no wreck older than a year survives');
  }
  // wrecks are in the snapshot for the renderer
  assert.deepEqual(w.snapshot().wrecks, wrecks);
  // a year later, every one of today's wrecks has faded from the chart
  const ids = new Set(wrecks.map(x => x.id));
  w.tick(366 * DAY);
  assert.ok(w.state.wrecks.every(x => !ids.has(x.id)), 'all of the earlier wrecks culled after their year');
});

test('wrecks + port calls: granularity-independent (offline accrual)', () => {
  const total = 200 * DAY;
  const big = mk(11); big.tick(total);
  const small = mk(11); for (let i = 0; i < 400; i++) small.tick(total / 400);
  assert.deepEqual(big.state.wrecks, small.state.wrecks);
  assert.deepEqual(big.state.portCalls, small.state.portCalls);
  assert.deepEqual([...big.activePortsSince(big.simClock)].sort(), [...small.activePortsSince(small.simClock)].sort());
});

test('port greying keys on ACTUAL calls: the 1550s slave factories stay grey until a ship truly sails', () => {
  // At the 1550 start the middle-passage flow is [15,30] voyages per DECADE
  // split across ~6 lanes — era-active (nonzero weight) but with no actual
  // sailings for long stretches. The old weight-proxy lit Elmina/Whydah/Luanda
  // permanently; the calls-based test must only light them when a vessel's
  // schedule really touches them.
  const w = mk(5);
  w.tick(150 * DAY);
  const active = w.activePortsSince(w.simClock);
  // ground truth from the same world's spawn record: every port a live-or-past
  // schedule actually called at
  const called = new Set(Object.keys(w.state.portCalls));
  for (const pid of active) assert.ok(called.has(pid), `${pid} active only via a real call`);
  // busy old-world ports have real traffic within 150 days…
  assert.ok(active.has('lisbon') || active.has('seville') || active.has('venice'), 'the old-world hubs are lit');
  // …and any factory port NOT yet called is grey (the user-reported bug)
  for (const pid of ['elmina', 'whydah', 'luanda'])
    if (!called.has(pid)) assert.ok(!active.has(pid), `${pid} must be greyed when no ship has called`);
});

test('port lifecycle invariant: every lane era fits inside both endpoints’ windows', () => {
  const windowOf = new Map(datasets.ports.map(p => [p.id, p.active || { from: 1550, to: 1815 }]));
  for (const r of datasets.routes) {
    for (const pid of [r.from, r.to]) {
      const w = windowOf.get(pid);
      assert.ok(r.era.from >= w.from && r.era.to <= w.to,
        `lane ${r.id} era ${r.era.from}-${r.era.to} escapes port ${pid}'s lifecycle ${w.from}-${w.to}`);
    }
  }
  // the flagship lifecycles are actually declared
  assert.deepEqual(datasets.ports.find(p => p.id === 'louisbourg').active, { from: 1713, to: 1758 });
  assert.deepEqual(datasets.ports.find(p => p.id === 'smeerenburg').active, { from: 1614, to: 1660 });
  assert.deepEqual(datasets.ports.find(p => p.id === 'kaffa').active, { from: 1550, to: 1783 });
});

test('port lifecycle behavior: a full 270-year cycle schedules zero calls outside any port’s window', () => {
  // The user-requested verification, kept as a regression: tick a whole cycle
  // and check every scheduled departure/arrival against the port windows.
  // Tolerance +3 yr past `to`: spawning fades out THROUGH era.to (weight >0
  // until to+1) and a MAX_LEGS voyage can arrive up to ~2 yr later — in-flight
  // arrivals after a founding-limited lane closes are real ships coming home,
  // not new traffic. Reset-ramp years (>1815) clamp to 1815, as spawning does.
  const windowOf = new Map(datasets.ports.map(p => [p.id, p.active || { from: 1550, to: 1815 }]));
  const w = mk(42);
  const WEEK = 7 * DAY, weeks = Math.ceil(270 * 365.25 / 7);
  const seen = new Set();
  const yearAt = (t) => { const c = w.calendar(t); return c.reset > 0 ? 1815 : c.year; };
  let checked = 0;
  for (let i = 0; i < weeks; i++) {
    w.tick(WEEK);
    for (const v of w.state.vessels) {
      if (seen.has(v.id)) continue; seen.add(v.id);
      for (const seg of v.schedule) {
        const check = (pid, t) => {
          if (v.fate.lost && v.fate.atSec < t) return;   // never happens — she was lost
          const y = yearAt(t), win = windowOf.get(pid);
          assert.ok(y >= win.from && y <= win.to + 3,
            `${pid} called in ${y}, outside its lifecycle ${win.from}-${win.to} (vessel ${v.id}, lane ${seg.laneId})`);
          checked++;
        };
        check(seg.from, seg.depart); check(seg.to, seg.arrive);
      }
    }
  }
  assert.ok(seen.size > 50000, `a full cycle of vessels was generated (${seen.size})`);
  assert.ok(checked > 100000, `port calls were actually checked (${checked})`);
});
