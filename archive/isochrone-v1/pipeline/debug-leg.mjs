import fs from 'node:fs';
import { GRID, VESSELS } from './config.mjs';
import { makeGridIndex, haversine, bearing, angDiff } from './geo.mjs';
import { route, snapToOcean } from './router.mjs';
import { windAt, currentAt } from './windfield.mjs';
import { boatSpeed } from './polar.mjs';

const grid = JSON.parse(fs.readFileSync(new URL('./build/grid.json', import.meta.url)));
const mask = Uint8Array.from(grid.mask);
const gi = makeGridIndex(GRID);
const brig = VESSELS.find(v => v.id === 'brig');
const D2R = Math.PI / 180;

const [sc, sr] = snapToOcean(mask, -38.5, -13.0); // Bahia
const [dc, dr] = snapToOcean(mask, 2.1, 6.2);     // Whydah
const s = 2;
const { time, prev } = route(mask, brig, s, sc, sr);
const dest = gi.idx(dc, dr);
console.log('Bahia->Whydah season', s, 'total', (time[dest] / 86400).toFixed(1), 'd');

// reconstruct
const path = []; let cur = dest;
while (cur !== -1) { path.push(cur); cur = prev[cur]; }
path.reverse();
console.log('path cells:', path.length);
let cum = 0;
for (let i = 1; i < path.length; i++) {
  const a = path[i - 1], b = path[i];
  const alat = gi.latOf((a / GRID.cols) | 0), alon = gi.lonOf(a % GRID.cols);
  const blat = gi.latOf((b / GRID.cols) | 0), blon = gi.lonOf(b % GRID.cols);
  const dist = haversine(alat, alon, blat, blon);
  const hdg = bearing(alat, alon, blat, blon);
  const w = windAt((alat + blat) / 2, (alon + blon) / 2, s);
  const twa = angDiff(hdg, w.wdir);
  let spd = boatSpeed(brig, twa, w.wspd);
  const c = currentAt((alat + blat) / 2, (alon + blon) / 2, s);
  if (c.cspd > 0) spd += c.cspd * Math.cos(angDiff(hdg, c.cdir) * D2R);
  if (spd < 0.4) spd = 0.4;
  cum += dist / spd / 86400;
  if (i % 3 === 0 || i < 4)
    console.log(`  @${blon.toFixed(0)},${blat.toFixed(0)} hdg${hdg.toFixed(0)} wind ${w.wdir}/${w.wspd.toFixed(1)} twa${twa.toFixed(0)} spd ${(spd / 0.514).toFixed(1)}kn  cum ${cum.toFixed(1)}d`);
}
