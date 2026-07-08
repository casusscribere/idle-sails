// Phase 1: rasterize Natural Earth land into a 1-degree ocean/land mask.
// Uses even-odd scanline fill per polygon (fast, no geospatial deps).
import fs from 'node:fs';
import { GRID, STRAIT_CARVES } from './config.mjs';
import { makeGridIndex } from './geo.mjs';

const { res, lon0, lat0, cols, rows } = GRID;
const gi = makeGridIndex(GRID);

const gj = JSON.parse(fs.readFileSync(new URL('../data-raw/ne_110m_land.geojson', import.meta.url)));
const mask = new Uint8Array(cols * rows); // 1 = land, 0 = ocean

function polygonsOf(geom) {
  if (!geom) return [];
  if (geom.type === 'Polygon') return [geom.coordinates];
  if (geom.type === 'MultiPolygon') return geom.coordinates;
  return [];
}

for (const f of gj.features) {
  for (const poly of polygonsOf(f.geometry)) {
    let minLat = 90, maxLat = -90;
    for (const ring of poly) for (const p of ring) { if (p[1] < minLat) minLat = p[1]; if (p[1] > maxLat) maxLat = p[1]; }
    const r0 = Math.max(0, gi.rowOf(minLat)), r1 = Math.min(rows - 1, gi.rowOf(maxLat));
    for (let r = r0; r <= r1; r++) {
      const y = gi.latOf(r);
      const xs = [];
      for (const ring of poly) {
        for (let i = 0; i < ring.length - 1; i++) {
          const y1 = ring[i][1], y2 = ring[i + 1][1];
          if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
            const t = (y - y1) / (y2 - y1);
            xs.push(ring[i][0] + t * (ring[i + 1][0] - ring[i][0]));
          }
        }
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const xa = xs[k], xb = xs[k + 1];
        let ca = Math.max(0, Math.ceil((xa - lon0) / res - 0.5));
        let cb = Math.min(cols - 1, Math.floor((xb - lon0) / res - 0.5));
        for (let c = ca; c <= cb; c++) mask[gi.idx(c, r)] = 1;
      }
    }
  }
}

// Force key straits open.
let carved = 0;
for (const [lon, lat] of STRAIT_CARVES) {
  const c = gi.colOf(lon), r = gi.rowOf(lat);
  if (c >= 0 && c < cols && r >= 0 && r < rows && mask[gi.idx(c, r)] === 1) { mask[gi.idx(c, r)] = 0; carved++; }
}

const land = mask.reduce((a, v) => a + v, 0);
console.log(`grid ${cols}x${rows}  land=${land}  ocean=${cols * rows - land}  carved=${carved}/${STRAIT_CARVES.length}`);

// ASCII sanity preview (downsampled): '#' land, ' ' ocean.
const OW = 90, OH = 36;
let art = '';
for (let oy = OH - 1; oy >= 0; oy--) {
  let line = '';
  for (let ox = 0; ox < OW; ox++) {
    const c = Math.floor(ox / OW * cols), r = Math.floor(oy / OH * rows);
    line += mask[gi.idx(c, r)] ? '#' : ' ';
  }
  art += line + '\n';
}
console.log(art);

fs.mkdirSync(new URL('./build/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('./build/grid.json', import.meta.url),
  JSON.stringify({ res, lon0, lat0, cols, rows, mask: Array.from(mask) }));
console.log('wrote build/grid.json');
