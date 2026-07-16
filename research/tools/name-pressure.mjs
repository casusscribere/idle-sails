// name-pressure.mjs — the T5 measurement harness (research/TASKS.md).
//
// Measures peak SIMULTANEOUS active vessels per (naming culture, role) across
// full 270-year cycles and compares each against its distinct name-pool size.
// Feature pass 3.5 (unique active names + retirement) is gated on every pool
// sitting under 70% peak pressure — re-run this after ANY flow-matrix or
// spawn-pacing change, since traffic growth silently re-raises pressure.
//
//   node research/tools/name-pressure.mjs [seed seed ...]   (default: 42 7 23)
//
// Reads the BUILT bundle (data/), not data-src/ — run `npm run build:data`
// first if names.json changed. Pure measurement; touches nothing.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const { createWorld } = await import(join(ROOT, 'world.js'));
const datasets = JSON.parse(readFileSync(join(ROOT, 'data', 'datasets.json'), 'utf8'));
const routes = JSON.parse(readFileSync(join(ROOT, 'data', 'routes.json'), 'utf8'));

const names = datasets.names;
const powerById = new Map(datasets.powers.map(p => [p.id, p]));
const cultureOf = pid => { const p = powerById.get(pid); return p.kind === 'nation' ? p.id : (p.parent || p.id); };

// distinct stems available to a (culture, role) under the makeName themes
function poolSize(cid, role) {
  const themes = (names.themesByPower[cid] || names.themesByPower.britain)[role];
  const s = new Set();
  for (const th of themes) {
    if (th === 'places') for (const n of names.navalPlaces[cid] || names.navalPlaces.britain) s.add(n);
    else if (th === 'byPower') for (const n of names.merchantByPower[cid] || names.merchant.abstract) s.add(n);
    else if (names.naval[th]) for (const n of names.naval[th]) s.add(n);
    else if (names.merchant[th]) for (const n of names.merchant[th]) s.add(n);
  }
  return s.size;
}

const DAY = 86400;
const TARGET = 0.7;
const seeds = process.argv.slice(2).map(Number).filter(Boolean);
if (!seeds.length) seeds.push(42, 7, 23);

const maxActive = new Map();   // "culture/role" → max concurrent across all seeds
let dupSamples = 0, samples = 0;
for (const seed of seeds) {
  const w = createWorld({ seed, data: { datasets, routes } });
  for (let d = 0; d < 270 * 365; d += 5) {           // sample every 5 sim-days
    w.tick(5 * DAY);
    const counts = new Map(), nameSeen = new Map();
    for (const v of w.state.vessels) {
      if (v.status !== 'sailing') continue;
      const key = cultureOf(v.powerId) + '/' + (v.isNaval ? 'naval' : 'merchant');
      counts.set(key, (counts.get(key) || 0) + 1);
      nameSeen.set(v.name, (nameSeen.get(v.name) || 0) + 1);
    }
    for (const [k, n] of counts) if (n > (maxActive.get(k) || 0)) maxActive.set(k, n);
    samples++;
    if ([...nameSeen.values()].some(n => n > 1)) dupSamples++;
  }
  console.error(`seed ${seed}: done`);
}

console.log(`\nseeds ${seeds.join(', ')} · ${samples} samples · a live duplicate name exists in ${Math.round(100 * dupSamples / samples)}% of samples\n`);
console.log('culture/role                     peak  pool  pressure  need(<70%)');
const rows = [...maxActive].map(([k, n]) => {
  const [cid, role] = k.split('/');
  const pool = poolSize(cid, role);
  return { k, n, pool, ratio: n / pool, need: Math.ceil(n / TARGET) };
}).sort((a, b) => b.ratio - a.ratio);
let failures = 0;
for (const r of rows) {
  const flag = r.ratio > TARGET ? '  ← EXPAND' : '';
  if (r.ratio > TARGET) failures++;
  console.log(`${r.k.padEnd(32)} ${String(r.n).padStart(4)} ${String(r.pool).padStart(5)}  ${(100 * r.ratio).toFixed(0).padStart(6)}%  ${String(r.need).padStart(9)}${flag}`);
}
console.log(failures
  ? `\n✗ ${failures} pool(s) over the ${TARGET * 100}% gate — pass 3.5 stays blocked`
  : `\n✓ every pool under the ${TARGET * 100}% gate — pass 3.5 is unblocked`);
process.exit(failures ? 1 : 0);
