// Phase 3: generate seasonal passage-time fields for every port x vessel x
// season, applying the fitted calibration, and emit compact binaries + manifest.
import fs from 'node:fs';
import { GRID, SEASONS, VESSELS, ISO_DAYS } from './config.mjs';
import { makeGridIndex } from './geo.mjs';
import { route, snapToOcean } from './router.mjs';

const here = (p) => new URL(p, import.meta.url);
const grid = JSON.parse(fs.readFileSync(here('./build/grid.json')));
const mask = Uint8Array.from(grid.mask);
const gi = makeGridIndex(GRID);
const cal = JSON.parse(fs.readFileSync(here('./build/calibration.json')));
const validation = JSON.parse(fs.readFileSync(here('./build/validation.json')));
const portsRaw = JSON.parse(fs.readFileSync(here('./ports.json')));

const outDir = here('../docs/data/');
const fieldDir = here('../docs/data/fields/');
fs.mkdirSync(fieldDir, { recursive: true });

// Calibrated vessels (scalar *= fitted k).
const vessels = VESSELS.map(v => ({ ...v, scalar: v.scalar * (cal[v.id] ?? 1) }));

function prep(list) {
  return list.map(p => {
    const [sc, sr] = snapToOcean(mask, p.lon, p.lat);
    return { ...p, srcCol: sc, srcRow: sr, srcLon: +gi.lonOf(sc).toFixed(2), srcLat: +gi.latOf(sr).toFixed(2) };
  });
}
const ports = { setA: prep(portsRaw.setA), setB: prep(portsRaw.setB) };
const all = [...ports.setA, ...ports.setB];

const N = GRID.cols * GRID.rows;
let done = 0; const total = all.length * vessels.length * SEASONS.length;
const t0 = Date.now();
for (const p of all) {
  for (const v of vessels) {
    for (const s of SEASONS) {
      const { time } = route(mask, v, s.idx, p.srcCol, p.srcRow);
      const hrs = new Uint16Array(N);
      for (let i = 0; i < N; i++) {
        if (mask[i] === 1) { hrs[i] = 65535; continue; }         // land
        const h = time[i] / 3600;
        hrs[i] = isFinite(h) ? Math.min(65534, Math.round(h)) : 65535; // 65535 = unreachable
      }
      fs.writeFileSync(here(`../docs/data/fields/${p.id}_${v.id}_${s.id}.bin`), Buffer.from(hrs.buffer));
      done++;
    }
  }
  process.stdout.write(`\r  ${done}/${total} fields  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
console.log('');

const manifest = {
  grid: { res: GRID.res, lon0: GRID.lon0, lat0: GRID.lat0, cols: GRID.cols, rows: GRID.rows },
  units: 'Uint16 little-endian hours per ocean cell; 65535 = land or unreachable',
  filePattern: 'data/fields/{port}_{vessel}_{season}.bin',
  seasons: SEASONS.map(s => ({ id: s.id, label: s.label })),
  vessels: vessels.map(v => ({ id: v.id, name: v.name })),
  isoDays: ISO_DAYS,
  ports,
  calibration: cal,
  validation,
  method: 'Hybrid parametric wind/current climatology (CLIWOC/pilot-chart regimes) + square-rigger polars, least-time routed, calibrated to recorded at-sea durations.'
};
fs.writeFileSync(here('../docs/manifest.json'), JSON.stringify(manifest, null, 2));

// Copy display coastline for the front-end.
fs.copyFileSync(here('../data-raw/ne_50m_land.geojson'), here('../docs/assets/land.geojson'));

const bytes = fs.readdirSync(fieldDir).reduce((a, f) => a + fs.statSync(here(`../docs/data/fields/${f}`)).size, 0);
console.log(`wrote ${total} fields (${(bytes / 1e6).toFixed(1)} MB), manifest.json, land.geojson`);
