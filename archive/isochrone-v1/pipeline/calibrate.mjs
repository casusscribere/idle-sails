// Phase 2: calibrate each vessel's speed scalar against recorded voyage
// durations, then report residual error (the validation report).
//
// Targets are AT-SEA sailing durations (days) — they deliberately exclude port
// calls, convoy waits and monsoon layovers that inflate the familiar
// "total voyage" figures (e.g. the ~6-month East Indies passage included weeks
// at the Cape). Modeled value = mean of the best two seasonal departures
// (well-timed but not cherry-picked). Each vessel's scalar is FIT only on its
// class-defining, best-documented route(s); other legs are independent CHECKS.
import fs from 'node:fs';
import { GRID, VESSELS } from './config.mjs';
import { makeGridIndex } from './geo.mjs';
import { route, snapToOcean } from './router.mjs';

const grid = JSON.parse(fs.readFileSync(new URL('./build/grid.json', import.meta.url)));
const mask = Uint8Array.from(grid.mask);
const gi = makeGridIndex(GRID);

const P = {
  london: [1.2, 51.4], nyc: [-74, 40.6], kingston: [-76.8, 17.9],
  capetown: [18.4, -34.0], batavia: [106.9, -5.9], canton: [114.2, 22.2],
  whydah: [2.1, 6.2], bahia: [-38.5, -13.0]
};

// leg: [from, to, targetDays, role 'fit'|'check', sourceNote]
const ANCHORS = {
  frigate: [
    ['london', 'kingston', 40, 'fit', 'Naval/packet Atlantic averages (~5-6 wk)'],
    ['london', 'nyc', 36, 'check', 'Fast westbound naval passage']
  ],
  brig: [
    ['london', 'kingston', 52, 'fit', 'Merchant Atlantic outbound ~7-8 wk'],
    ['london', 'nyc', 45, 'check', 'Merchant westbound ~6-7 wk']
  ],
  indiaman: [
    ['london', 'batavia', 135, 'fit', 'England->Batavia at-sea via Cape (excl. stops)'],
    ['london', 'canton', 135, 'fit', 'England->Canton at-sea via Cape (excl. stops)'],
    ['london', 'capetown', 90, 'fit', 'England->Cape at-sea ~13 wk']
  ],
  slaver: [
    ['whydah', 'kingston', 62, 'fit', 'SlaveVoyages: mid-18thc Middle Passage ~2 mo'],
    ['bahia', 'whydah', 45, 'check', 'S-Atlantic Brazil-Mina outbound (against wind/current)']
  ]
};

const bestTwoMean = arr => { const b = [...arr].sort((x, y) => x - y); return (b[0] + b[1]) / 2; };
const median = a => { const b = [...a].sort((x, y) => x - y); return b[(b.length - 1) >> 1]; };

function modeledDays(vessel, fromKey, toKey) {
  const [sc, sr] = snapToOcean(mask, ...P[fromKey]);
  const [dc, dr] = snapToOcean(mask, ...P[toKey]);
  const per = [];
  for (let s = 0; s < 4; s++) {
    const { time } = route(mask, vessel, s, sc, sr);
    const d = time[gi.idx(dc, dr)] / 86400;
    per.push(isFinite(d) ? d : 1e9);
  }
  return bestTwoMean(per);
}

const calibration = {}, report = [];
for (const v of VESSELS) {
  const rows = ANCHORS[v.id].map(([f, t, tgt, role, src]) => {
    const mdl = modeledDays(v, f, t);
    return { leg: `${f}->${t}`, target: tgt, role, modeledRaw: +mdl.toFixed(1), ratio: mdl / tgt, src };
  });
  const k = median(rows.filter(r => r.role === 'fit').map(r => r.ratio)); // scalar *= k
  calibration[v.id] = +k.toFixed(4);
  for (const r of rows) {
    r.modeledCal = +(r.modeledRaw / k).toFixed(1);
    r.errPct = +((r.modeledCal - r.target) / r.target * 100).toFixed(1);
  }
  report.push({
    vessel: v.id, k: calibration[v.id],
    fitErrPct: median(rows.filter(r => r.role === 'fit').map(r => Math.abs(r.errPct))),
    legs: rows
  });
}

fs.writeFileSync(new URL('./build/calibration.json', import.meta.url), JSON.stringify(calibration, null, 2));
fs.writeFileSync(new URL('./build/validation.json', import.meta.url), JSON.stringify(report, null, 2));

console.log('\n=== CALIBRATION & VALIDATION REPORT (at-sea, best-2-season days) ===\n');
for (const rep of report) {
  console.log(`${rep.vessel}: k=${rep.k}  fit median|err|=${rep.fitErrPct}%`);
  for (const l of rep.legs)
    console.log(`   [${l.role}] ${l.leg.padEnd(18)} target ${String(l.target).padStart(3)}d  modeled ${String(l.modeledCal).padStart(5)}d  err ${l.errPct > 0 ? '+' : ''}${l.errPct}%`);
  console.log('');
}
console.log('wrote build/calibration.json, build/validation.json');
