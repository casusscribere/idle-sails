// Feature pass 3.5 — unique active names + retirement (RANKING.md).
// The sim-layer name ledger must (a) make live duplicate names rare, (b) rest
// a lost name for the refractory period, (c) stay granularity-independent,
// (d) survive save round-trips and backfill pre-3.5 saves, and (e) never
// touch fates or counters — names are the ONLY thing allowed to move.
//   node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createWorld } from '../world.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const datasets = JSON.parse(readFileSync(join(HERE, '..', 'data', 'datasets.json'), 'utf8'));
const routes = JSON.parse(readFileSync(join(HERE, '..', 'data', 'routes.json'), 'utf8'));
const data = { datasets, routes };
const DAY = 86400, YEAR = 365.25 * DAY;
const R_SEC = 5 * YEAR;   // NAME_REFRACTORY_YEARS in world.js

// fingerprint minus the name field — the pass-3 method: fates, counters, and
// every other vessel property must be byte-identical whatever the names do.
function strippedFingerprint(w) {
  return w.state.vessels.map(v =>
    `${v.id}:${v.typeId}:${v.powerId}:${v.tonnage}:${v.cargoId}:${v.status}:${Math.round(v.voyageEnd)}:${v.fate.lost ? Math.round(v.fate.atSec) : 'ok'}`).join('\n')
    + `\n#${w.state.counters.spawned}/${w.state.counters.arrived}/${w.state.counters.lost}`;
}

test('live duplicate names are rare (pass 3.5 active)', () => {
  const w = createWorld({ seed: 42, data });
  let dup = 0, n = 0;
  for (let d = 0; d < 30 * 365; d += 5) {
    w.tick(5 * DAY); n++;
    const seen = new Map();
    for (const v of w.state.vessels) if (v.status === 'sailing')
      seen.set(v.name, (seen.get(v.name) || 0) + 1);
    if ([...seen.values()].some(c => c > 1)) dup++;
  }
  assert.ok(w.state.counters.spawned > 2000, `enough traffic to test (${w.state.counters.spawned})`);
  // pre-3.5 this was ~97% of samples; the ledger holds it to the
  // accept-the-duplicate tail (measured ~1.6% over 60 yrs, seeds 42/7)
  assert.ok(dup / n < 0.05, `duplicate-name samples rare: ${dup}/${n}`);
});

test('a lost name rests: refractory respawns are only the accepted-duplicate tail', () => {
  const w = createWorld({ seed: 42, data });
  const spawns = [];
  const seen = new Set();
  for (let d = 0; d < 40 * 365; d += 10) {
    w.tick(10 * DAY);
    for (const v of w.state.vessels) if (!seen.has(v.id)) {
      seen.add(v.id);
      spawns.push({ name: v.name, spawnAt: v.spawnAt, lost: v.fate.lost, atSec: v.fate.atSec });
    }
  }
  const losses = spawns.filter(s => s.lost);
  assert.ok(losses.length > 50, `enough losses to test (${losses.length})`);
  const byName = new Map();
  for (const s of spawns) { if (!byName.has(s.name)) byName.set(s.name, []); byName.get(s.name).push(s); }
  let violations = 0;
  for (const list of byName.values()) {
    list.sort((a, b) => a.spawnAt - b.spawnAt);
    for (let i = 0; i < list.length; i++) if (list[i].lost)
      for (let j = i + 1; j < list.length; j++)
        if (list[j].spawnAt > list[i].atSec && list[j].spawnAt < list[i].atSec + R_SEC) violations++;
  }
  // the redraw budget can exhaust at peak pressure — the accepted duplicates
  // (~0.1% of spawns measured) are the DESIGNED tail, not a bug
  assert.ok(violations / spawns.length < 0.005,
    `refractory violations are the rare accepted tail: ${violations}/${spawns.length}`);
});

test('names are granularity-independent (one big tick == many small)', () => {
  const big = createWorld({ seed: 23, data });
  const small = createWorld({ seed: 23, data });
  big.tick(730 * DAY);
  for (let d = 0; d < 730; d++) small.tick(1 * DAY);
  assert.equal(big.fingerprint(), small.fingerprint());   // fingerprint INCLUDES names
});

test('the ledger rides the save: restore continues identically', () => {
  const a = createWorld({ seed: 7, data });
  a.tick(3 * YEAR);
  const saved = a.serialize();
  const b = createWorld({ seed: 7, data, restore: saved });
  a.tick(3 * YEAR);
  b.tick(3 * YEAR);
  assert.equal(a.fingerprint(), b.fingerprint());
});

test('a pre-3.5 save backfills the ledger from surviving vessels', () => {
  const a = createWorld({ seed: 7, data });
  a.tick(3 * YEAR);
  const saved = a.serialize();
  delete saved.nameLedger;                       // simulate an old save
  const b = createWorld({ seed: 7, data, restore: saved });
  // every surviving vessel's block is reconstructed to at least her block end
  for (const v of b.state.vessels) {
    const end = v.fate.lost ? v.fate.atSec + R_SEC : v.voyageEnd;
    assert.ok(b.state.nameLedger[v.name] >= end, `${v.name} blocked ≥ her block end`);
  }
  b.tick(2 * YEAR);                              // and the world sails on
  assert.ok(b.state.counters.spawned > saved.counters.spawned);
});

test('the uniqueness layer is fate-inert: name pools may change, fates may not', () => {
  // reverse several pools — different names get drawn AND different names get
  // blocked (different redraw counts), yet the stripped fingerprint must hold:
  // redraws live on hashSeed('name', seed, id), never on the vessel stream.
  const mangled = JSON.parse(JSON.stringify(datasets));
  mangled.names.merchant.women.reverse();
  mangled.names.merchantByPower.portugal.reverse();
  mangled.names.naval.classical.reverse();
  const a = createWorld({ seed: 99, data });
  const b = createWorld({ seed: 99, data: { datasets: mangled, routes } });
  a.tick(4 * YEAR); b.tick(4 * YEAR);
  assert.equal(strippedFingerprint(a), strippedFingerprint(b));
  assert.notEqual(a.fingerprint(), b.fingerprint(), 'names themselves DID move (the test is live)');
});
