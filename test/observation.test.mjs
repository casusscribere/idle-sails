// Node tests for the observation layer (feature pass 1): statistics, port
// histories, and the tracker. All of it is accounting on top of sim events —
// it must never change what the sim computes, and it must be exactly as
// granularity-independent as the sim itself.
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

test('statistics: tallies reconcile with the counters and are granularity-independent', () => {
  const total = 90 * DAY;
  const big = createWorld({ seed: 7, data }); big.tick(total);
  const small = createWorld({ seed: 7, data });
  for (let i = 0; i < 900; i++) small.tick(total / 900);
  assert.deepEqual(small.state.stats, big.state.stats, 'stats: big tick == many small ticks');
  assert.deepEqual(small.state.portHistory, big.state.portHistory, 'port history too');

  const st = big.state.stats, c = big.state.counters;
  const sum = (k) => Object.values(st.byLane).reduce((a, s) => a + s[k], 0);
  assert.equal(sum('spawned'), c.spawned, 'per-lane spawns sum to the counter');
  assert.equal(sum('arrived'), c.arrived, 'per-lane arrivals sum to the counter');
  assert.equal(sum('lost'), c.lost, 'per-lane losses sum to the counter');
  assert.equal(Object.values(st.byCargo).reduce((a, b) => a + b, 0), c.spawned, 'every spawn carries one cargo');
});

test('tracker: pins are sim-inert; a pinned vessel’s record survives the cull', () => {
  const a = createWorld({ seed: 21, data });
  const b = createWorld({ seed: 21, data });
  for (let i = 0; i < 60; i++) { a.tick(DAY); b.tick(DAY); }
  // pin b's shortest-lived active vessel so her end falls inside the test run
  const v = b.state.vessels.filter(x => x.status === 'sailing')
    .sort((x, y) => (x.fate.lost ? x.fate.atSec : x.voyageEnd) - (y.fate.lost ? y.fate.atSec : y.voyageEnd))[0];
  assert.ok(b.pinVessel(v.id), 'pinning a live vessel succeeds');
  assert.ok(b.isPinned(v.id));
  for (let i = 0; i < 200; i++) { a.tick(DAY); b.tick(DAY); }
  // she has retired and been culled — but her record is kept
  assert.ok(!b.state.vessels.some(x => x.id === v.id), 'the vessel is culled as usual');
  const kept = b.trackedVessels().find(r => r.id === v.id);
  assert.ok(kept, 'her record is in the tracker');
  assert.ok(kept.status === 'arrived' || kept.status === 'lost');
  assert.ok(!kept.live);
  assert.ok(kept.pos && typeof kept.pos.lon === 'number', 'positioned where her voyage ended');
  // and none of it moved the sim: the pinned world matches the unpinned one
  assert.equal(a.fingerprint(), b.fingerprint(), 'pins never change the world');
  // unfollowing forgets the record
  b.unpinVessel(v.id);
  assert.ok(!b.trackedVessels().some(r => r.id === v.id));
});

test('tracker: the pin cap is enforced and live-tunable', () => {
  const w = createWorld({ seed: 5, data, tuning: { pinCap: 2 } });
  for (let i = 0; i < 80; i++) w.tick(DAY);
  const ids = w.state.vessels.filter(v => v.status === 'sailing').map(v => v.id);
  assert.ok(ids.length >= 3, `enough vessels to test (${ids.length})`);
  assert.ok(w.pinVessel(ids[0]));
  assert.ok(w.pinVessel(ids[1]));
  assert.ok(!w.canPin());
  assert.ok(!w.pinVessel(ids[2]), 'the cap refuses a third pin');
  w.tuning.pinCap = 3;                       // the player raises the tier
  assert.ok(w.pinVessel(ids[2]), 'raising the cap allows it');
  assert.ok(!w.pinVessel(99999), 'a vessel not on the chart cannot be pinned');
});

test('port history: depth-capped, past-only, newest first; depth 0 records nothing', () => {
  const w = createWorld({ seed: 9, data, tuning: { portHistoryDepth: 5 } });
  for (let i = 0; i < 300; i++) w.tick(DAY);
  const withHist = Object.entries(w.state.portHistory).filter(([, h]) => h.length);
  assert.ok(withHist.length > 0, 'busy ports have recorded calls');
  for (const [, h] of withHist) assert.ok(h.length <= 5, `capped at depth (${h.length})`);
  const busiest = withHist.sort((a, b) => b[1].length - a[1].length)[0][0];
  const hist = w.portHistoryOf(busiest);
  for (const e of hist) assert.ok(e.t <= w.simClock, 'history is the past, not the schedule');
  for (let i = 1; i < hist.length; i++) assert.ok(hist[i - 1].t >= hist[i].t, 'newest first');

  const none = createWorld({ seed: 9, data, tuning: { portHistoryDepth: 0 } });
  for (let i = 0; i < 100; i++) none.tick(DAY);
  assert.deepEqual(none.state.portHistory, {}, 'depth 0 records nothing at all');
});

test('naval prefix applies exactly once — no "HMS HMS" names', () => {
  const w = createWorld({ seed: 77, data });
  // the 1550s sail no HMS — jump to the 1700s, when the Royal Navy is thick
  w.tick(150 * 365.25 * DAY);
  const seen = new Set();
  for (let i = 0; i < 600; i++) {
    w.tick(0.5 * DAY);
    for (const v of w.state.vessels) {
      if (!v.prefix || seen.has(v.id)) continue;
      seen.add(v.id);
      assert.ok(!v.name.startsWith(v.prefix + ' '),
        `the name must not bake the prefix in ("${v.prefix} ${v.name}")`);
    }
  }
  assert.ok(seen.size > 0, `prefixed naval vessels sailed and were checked (${seen.size})`);
});

test('observation state survives a save/restore round-trip', () => {
  const a = createWorld({ seed: 33, data });
  for (let i = 0; i < 100; i++) a.tick(DAY);
  const pin = a.state.vessels.find(v => v.status === 'sailing');
  a.pinVessel(pin.id);
  const saved = a.serialize();

  const b = createWorld({ seed: 33, data, restore: saved });
  assert.deepEqual(b.state.stats, a.state.stats);
  assert.deepEqual(b.state.portHistory, a.state.portHistory);
  assert.ok(b.isPinned(pin.id));
  for (let i = 0; i < 100; i++) { a.tick(DAY); b.tick(DAY); }
  assert.equal(a.fingerprint(), b.fingerprint(), 'restored world continues identically');
  assert.deepEqual(b.state.stats, a.state.stats, 'and keeps counting identically');

  // a save from before the observation layer restores cleanly (back-fill)
  const old = a.serialize();
  delete old.stats; delete old.portHistory; delete old.tracked;
  const c = createWorld({ seed: 33, data, restore: old });
  c.tick(30 * DAY);   // records from now on, never crashes
  assert.ok(c.state.stats && c.state.tracked.pins.length === 0);
});
