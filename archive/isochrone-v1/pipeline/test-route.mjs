import fs from 'node:fs';
import { VESSELS } from './config.mjs';
import { makeGridIndex } from './geo.mjs';
import { GRID } from './config.mjs';
import { route, snapToOcean } from './router.mjs';

const grid = JSON.parse(fs.readFileSync(new URL('./build/grid.json', import.meta.url)));
const mask = Uint8Array.from(grid.mask);
const gi = makeGridIndex(GRID);
const brig = VESSELS.find(v => v.id === 'brig');

const [sc, sr] = snapToOcean(mask, 1.2, 51.4); // London
console.log('London snapped to', gi.lonOf(sc).toFixed(1), gi.latOf(sr).toFixed(1));

const dests = [
  ['New York', -74, 40.6], ['Kingston', -76.8, 17.9], ['Boston', -71, 42.3],
  ['Cape Town', 18.4, -34.0], ['Batavia', 106.9, -5.9], ['Canton', 114.2, 22.2]
];

for (const s of [2, 0]) { // JJA summer, DJF winter
  const t0 = Date.now();
  const { time } = route(mask, brig, s, sc, sr);
  const ms = Date.now() - t0;
  console.log(`\nseason=${s}  (${ms} ms)`);
  for (const [name, lon, lat] of dests) {
    const [c, r] = snapToOcean(mask, lon, lat);
    const days = time[gi.idx(c, r)] / 86400;
    console.log('  London ->', name.padEnd(10), isFinite(days) ? days.toFixed(1) + ' d' : 'unreachable');
  }
}
