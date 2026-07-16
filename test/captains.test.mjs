// Node tests for feature pass 3's captains: every vessel sails with a
// shipmaster drawn from her OWN RNG sub-stream ('captain', seed, id) — never
// from the vessel stream — so captains exist without moving any existing
// #seed= world. (The one-off pool extension changed name STRINGS only; the
// name-stripped fingerprint was verified identical against pre-pass HEAD.)
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

test('every vessel sails with a culturally-pooled shipmaster', () => {
  const w = createWorld({ seed: 42, data });
  for (let i = 0; i < 600; i++) w.tick(0.5 * DAY);
  const vs = w.state.vessels;
  assert.ok(vs.length > 10, `enough vessels to sample (${vs.length})`);
  for (const v of vs)
    assert.ok(typeof v.captain === 'string' && v.captain.length > 1,
      `vessel #${v.id} (${v.powerId}) carries a captain (got ${JSON.stringify(v.captain)})`);
  // the titles that travel IN the name appear where their cultures sail:
  // run long enough and the Indian Ocean gives a nakhoda, the Ottoman a reis
  const all = [];
  const w2 = createWorld({ seed: 7, data });
  for (let i = 0; i < 2000; i++) { w2.tick(2 * DAY); }
  for (const v of w2.state.vessels) all.push(v.captain);
  // not asserting specific cultures spawned (seed-dependent) — but no captain
  // may ever be the raw fallback of a missing pool
  assert.ok(all.every(c => c && c !== 'undefined'), 'no malformed captains');
});

test('captain pools are sim-inert: swapping them moves no ship, no name, no fate', () => {
  const a = createWorld({ seed: 42, data });
  // same world, but every captain pool replaced — if the captain draw touched
  // the vessel stream, names/tonnages/fates would shift; they must not
  const swapped = JSON.parse(JSON.stringify(datasets));
  for (const k of Object.keys(swapped.names.captains))
    swapped.names.captains[k] = { full: ['Test Master'] };
  const b = createWorld({ seed: 42, data: { datasets: swapped, routes } });
  for (let i = 0; i < 400; i++) { a.tick(0.7 * DAY); b.tick(0.7 * DAY); }
  assert.equal(a.fingerprint(), b.fingerprint(), 'fingerprint (incl. vessel names) identical');
  assert.ok(b.state.vessels.every(v => v.captain === 'Test Master'), 'swapped pools took effect');
  assert.ok(a.state.vessels.some(v => v.captain !== 'Test Master'), 'real pools differ');
});

test('captains are deterministic and granularity-independent', () => {
  const a = createWorld({ seed: 11, data });
  const b = createWorld({ seed: 11, data });
  for (let i = 0; i < 300; i++) a.tick(DAY);          // many small ticks
  for (let i = 0; i < 10; i++) b.tick(30 * DAY);      // few big ticks
  const capA = new Map(a.state.vessels.map(v => [v.id, v.captain]));
  for (const v of b.state.vessels)
    if (capA.has(v.id)) assert.equal(v.captain, capA.get(v.id), `vessel #${v.id} keeps her master`);
});

test('a pre-captain save backfills the exact same masters on restore', () => {
  const a = createWorld({ seed: 23, data });
  for (let i = 0; i < 300; i++) a.tick(DAY);
  const saved = a.serialize();
  const expected = new Map(saved.vessels.map(v => [v.id, v.captain]));
  for (const v of saved.vessels) delete v.captain;    // simulate an old save
  const b = createWorld({ seed: 23, data, restore: saved });
  assert.ok(b.state.vessels.length > 0, 'restored vessels present');
  for (const v of b.state.vessels)
    assert.equal(v.captain, expected.get(v.id), `vessel #${v.id} backfills her original master`);
});

test('a wreck keeps her captain in the loss record', () => {
  const w = createWorld({ seed: 5, data });
  for (let i = 0; i < 3000 && !w.state.wrecks.length; i++) w.tick(DAY);
  assert.ok(w.state.wrecks.length > 0, 'a loss occurred within the window');
  for (const wreck of w.state.wrecks)
    assert.ok(typeof wreck.captain === 'string' && wreck.captain.length > 1,
      `wreck of ${wreck.name} names her master`);
});
