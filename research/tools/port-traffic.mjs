// port-traffic.mjs — measure a port's REALIZED annual traffic across seeds.
//
// Why this exists (F-02 / D-15): the small-trade visibility floor (2026-07-20)
// raised York Factory from ~1 ship a DECADE to ~1.1 a year against a historical
// 1–2, but the port still reads as unreliable in play. "Unreliable" has two very
// different causes and only one is a bug:
//
//   (a) the RATE is too low            → the floor needs raising
//   (b) the rate is right but BURSTY   → a Poisson process at 1–2/yr produces
//                                        multi-year gaps as a matter of course,
//                                        and the fix is a scheduled annual
//                                        sailing, not a bigger number
//
// So this reports the mean AND the gap structure: the share of years with no
// arrival at all, and the longest dry spell. That is what distinguishes the two.
//
// Usage:  node research/tools/port-traffic.mjs [portId] [--seeds=42,7,23] [--from=1700] [--to=1800]

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createWorld, _internals } from '../../world.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, '..', '..', 'data');
const data = {
  datasets: JSON.parse(readFileSync(join(DATA, 'datasets.json'), 'utf8')),
  routes: JSON.parse(readFileSync(join(DATA, 'routes.json'), 'utf8'))
};
const DAY = _internals.SEC_PER_DAY;

const args = process.argv.slice(2);
const portId = args.find(a => !a.startsWith('--')) || 'york-factory';
const opt = (k, d) => { const a = args.find(x => x.startsWith(`--${k}=`)); return a ? a.split('=')[1] : d; };
const seeds = opt('seeds', '42,7,23').split(',').map(Number);
const yFrom = +opt('from', 1700), yTo = +opt('to', 1800);

const port = data.datasets.ports.find(p => p.id === portId);
if (!port) { console.error(`no such port: ${portId}`); process.exit(2); }

// the lanes that can ever touch this port, with their declared eras — context
// for reading the measurement (a port with two lanes cannot be busy)
const lanes = data.datasets.routes.filter(r => r.from === portId || r.to === portId);

console.log(`\n${port.name} (${portId}) — realized annual traffic`);
console.log(`window ${yFrom}–${yTo} · seeds ${seeds.join(', ')}`);
if (port.active) console.log(`port active window: ${port.active.from}–${port.active.to}`);
console.log(`lanes touching this port: ${lanes.length}`);
for (const l of lanes) console.log(`  ${l.id}  ${l.from}→${l.to}  era ${l.era.from}–${l.era.to}`);

const rows = [];
for (const seed of seeds) {
  const w = createWorld({ seed, data });
  const perYear = new Map();       // year → arrivals (a voyage whose leg ENDS here)
  const seen = new Set();
  // step in 20-day ticks; every vessel is inspected once, at first sighting
  while (Math.floor(w.calendar(w.simClock).year) < yTo) {
    w.tick(20 * DAY);
    for (const v of w.state.vessels) {
      if (seen.has(v.id)) continue; seen.add(v.id);
      for (const seg of v.schedule) {
        if (seg.to !== portId) continue;
        const y = Math.floor(w.calendar(seg.arrive).year);
        if (y >= yFrom && y <= yTo) perYear.set(y, (perYear.get(y) || 0) + 1);
      }
    }
  }
  const years = [];
  for (let y = yFrom; y <= yTo; y++) years.push(perYear.get(y) || 0);
  const total = years.reduce((a, b) => a + b, 0);
  const dry = years.filter(n => n === 0).length;
  let longest = 0, run = 0;
  for (const n of years) { if (n === 0) { run++; longest = Math.max(longest, run); } else run = 0; }
  rows.push({ seed, mean: total / years.length, dry: dry / years.length, longest, total });
}

console.log(`\n  seed |  ships/yr | years with none | longest dry spell`);
console.log(`  -----+-----------+-----------------+------------------`);
for (const r of rows)
  console.log(`  ${String(r.seed).padStart(4)} | ${r.mean.toFixed(2).padStart(9)} | ${(100 * r.dry).toFixed(0).padStart(14)}% | ${String(r.longest).padStart(14)} yr`);

const mean = rows.reduce((a, r) => a + r.mean, 0) / rows.length;
const dry = rows.reduce((a, r) => a + r.dry, 0) / rows.length;
const longest = Math.max(...rows.map(r => r.longest));
console.log(`\n  mean across seeds: ${mean.toFixed(2)} ships/yr · ${(100 * dry).toFixed(0)}% of years empty · worst gap ${longest} yr`);
console.log(`\n  reading it: a rate near the historical figure WITH a high empty-year`);
console.log(`  share is cause (b) — correct on average, unreadable in play. A rate`);
console.log(`  well under the historical figure is cause (a).\n`);
