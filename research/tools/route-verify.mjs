// route-verify.mjs — the route verification harness (PLAN-7 Phase 0 / F-41).
//
// Checks the BAKED route polylines in data/routes.json against the evidence
// corpus in research/routes/corpus.json, and reports what it can and cannot say.
//
// Three things about this file are deliberate and should survive edits:
//
//   1. IT EMITS NO GLOBAL SCORE. One number over 414 lanes with wildly uneven
//      evidence would itself be false precision — a reviewer must be unable to
//      quote "the router scores X". Results are reported per tier, per basin,
//      per era band, and never pooled.
//
//   2. `unverified` IS A THIRD STATE, not a pass. A lane with no corpus entry is
//      reported as unverified and never counts toward a pass rate (PLAN-7 §1.1,
//      decision D-21). Most of the roster sits here, and publishing that
//      fraction is the point of the exercise.
//
//   3. IT IS DETERMINISTIC. Same bundle + same corpus ⇒ byte-identical report.
//      So: no timestamps, no wall-clock, no Math.random, stable key order. The
//      report identifies itself by the bundle versions and a corpus digest
//      instead of by when it ran.
//
// Usage:
//   node research/tools/route-verify.mjs                 # human-readable report
//   node research/tools/route-verify.mjs --json          # machine-readable to stdout
//   node research/tools/route-verify.mjs --json=out.json # …to a file
//   node research/tools/route-verify.mjs --strict        # exit 1 if any FAIL
//
// Verifying a candidate parameter set (PLAN-7 F-45) is a later mode and is
// deliberately not built yet: tuning must not begin before a baseline exists.

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, isAbsolute } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
// Repo-relative by default; an absolute path (the tests' temp corpora) is read
// as given.
const read = (p) => JSON.parse(readFileSync(isAbsolute(p) ? p : join(ROOT, p), 'utf8'));

// ---------------------------------------------------------------- geometry --
// Tolerances here are hundreds of km, so an equirectangular local approximation
// is far more accuracy than the evidence supports. Distances stay in km.

const R_EARTH = 6371;
const D2R = Math.PI / 180;

function havKm(aLon, aLat, bLon, bLat) {
  const dLat = (bLat - aLat) * D2R, dLon = (bLon - aLon) * D2R;
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * D2R) * Math.cos(bLat * D2R) * Math.sin(dLon / 2) ** 2;
  return 2 * R_EARTH * Math.asin(Math.min(1, Math.sqrt(s)));
}

// Longitude difference in [-180,180] — baked tracks may run past ±180 (the
// Pacific lanes are framed continuously), so raw subtraction would be wrong.
const dLon = (a, b) => { let d = (b - a) % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };

// Distance from point P to segment AB, in km.
function pointToSegKm(pLon, pLat, aLon, aLat, bLon, bLat) {
  const kx = Math.cos(((aLat + bLat) / 2) * D2R) * 111.32, ky = 110.57;
  const ax = 0, ay = 0;
  const bx = dLon(aLon, bLon) * kx, by = (bLat - aLat) * ky;
  const px = dLon(aLon, pLon) * kx, py = (pLat - aLat) * ky;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

// Closest approach of a track to a point, in km.
function minDistToTrackKm(track, lon, lat) {
  let best = Infinity;
  for (let i = 0; i < track.length - 1; i++) {
    const d = pointToSegKm(lon, lat, track[i][0], track[i][1], track[i + 1][0], track[i + 1][1]);
    if (d < best) best = d;
  }
  if (track.length === 1) best = havKm(lon, lat, track[0][0], track[0][1]);
  return best;
}

// Does the track enter an axis-aligned lon/lat box? Checks vertices, then
// samples along each segment — a simplified polyline can step clean across a
// narrow strait between two vertices, which is exactly the Malacca case.
function trackEntersBox(track, box) {
  const [lo0, la0, lo1, la1] = box;
  const inside = (lon, lat) => {
    const l = ((lon + 180) % 360 + 360) % 360 - 180;
    return l >= lo0 && l <= lo1 && lat >= la0 && lat <= la1;
  };
  for (const [lon, lat] of track) if (inside(lon, lat)) return true;
  for (let i = 0; i < track.length - 1; i++) {
    const [x0, y0] = track[i], [x1, y1] = track[i + 1];
    const segKm = havKm(x0, y0, x1, y1);
    const steps = Math.min(400, Math.max(2, Math.ceil(segKm / 25)));   // ~25 km sampling
    for (let s = 1; s < steps; s++) {
      const f = s / steps;
      if (inside(x0 + dLon(x0, x1) * f, y0 + (y1 - y0) * f)) return true;
    }
  }
  return false;
}

// How far apart are two tracks? Mean over A's vertices of the distance to B —
// asymmetric by construction, so we take the max of both directions.
function trackSeparationKm(a, b) {
  const oneWay = (from, to) => {
    let sum = 0;
    for (const [lon, lat] of from) sum += minDistToTrackKm(to, lon, lat);
    return sum / from.length;
  };
  return Math.max(oneWay(a, b), oneWay(b, a));
}

// Discrete Fréchet distance — for T5, which has no corpus entries yet. Kept
// here so R-11's positional data is drop-in rather than a new build.
function discreteFrechetKm(a, b) {
  const n = a.length, m = b.length;
  let prev = new Float64Array(m).fill(Infinity);
  let cur = new Float64Array(m).fill(Infinity);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const d = havKm(a[i][0], a[i][1], b[j][0], b[j][1]);
      if (i === 0 && j === 0) cur[j] = d;
      else if (i === 0) cur[j] = Math.max(cur[j - 1], d);
      else if (j === 0) cur[j] = Math.max(prev[j], d);
      else cur[j] = Math.max(Math.min(prev[j], prev[j - 1], cur[j - 1]), d);
    }
    [prev, cur] = [cur, prev];
    cur.fill(Infinity);
  }
  return prev[m - 1];
}

// ------------------------------------------------------------------- data ---

const argv = process.argv.slice(2);
const corpusArg = argv.find(a => a.startsWith('--corpus='));

const datasets = read('data/datasets.json');
const baked = read('data/routes.json');
// --corpus= lets the suite be run against a candidate corpus (R-11 will want
// this) and lets the tests point it at a deliberately-wrong one, which is the
// only way to prove the harness can actually FAIL something.
const corpus = read(corpusArg ? corpusArg.slice('--corpus='.length) : 'research/routes/corpus.json');

const laneById = new Map(datasets.routes.map(l => [l.id, l]));

// Baked variants per lane: one per routeClass × season that survived the bake.
const variantsByLane = new Map();
for (const r of baked.routes) {
  if (!variantsByLane.has(r.route)) variantsByLane.set(r.route, []);
  variantsByLane.get(r.route).push(r);
}
for (const [, v] of variantsByLane) v.sort((a, b) => a.id < b.id ? -1 : 1);   // stable

// Lane → basin, by folded share, the same vote main.js uses for the overlay.
const laneBasin = new Map();
{
  const votes = new Map();
  for (const s of (datasets.flows && datasets.flows.systems) || []) {
    if (!s.basin) continue;
    for (const [lid, share] of Object.entries(s.lanes)) {
      if (!votes.has(lid)) votes.set(lid, {});
      votes.get(lid)[s.basin] = (votes.get(lid)[s.basin] || 0) + share;
    }
  }
  for (const [lid, v] of votes) {
    const best = Object.entries(v).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0];
    laneBasin.set(lid, best[0]);
  }
}
const basinOf = (laneId) => laneBasin.get(laneId) || 'unfolded';

// Era bands. Deliberately coarse: the evidence does not support finer, and a
// lane's era window usually spans more than one band, so a lane can appear in
// several. Reporting per band is how the "verified only where the archive is
// thick" bias becomes visible.
const ERA_BANDS = [
  { id: '1550-1650', from: 1550, to: 1650 },
  { id: '1650-1750', from: 1650, to: 1750 },
  { id: '1750-1850', from: 1750, to: 1850 }
];
const bandsOf = (era) => ERA_BANDS.filter(b => era && era.from <= b.to && era.to >= b.from).map(b => b.id);

const overlaps = (a, b) => a && b && a.from <= b.to && a.to >= b.from;

// ---------------------------------------------------------------- metrics ---

// T1 — waypoint and corridor recall. Categorical, and the workhorse: robust to
// grid artifacts, needs no positional series, and encodes what the record is
// actually confident about.
function evalT1(entry, variant) {
  const detail = [];
  let ok = true;
  for (const w of entry.waypoints || []) {
    const d = minDistToTrackKm(variant.coords, w.lon, w.lat);
    const within = d <= w.tolKm;
    // `forbidden` inverts the test: the track must NOT approach.
    const want = w.forbidden ? !within : (w.required !== false ? within : true);
    if (!want) ok = false;
    detail.push({
      what: w.forbidden ? `avoids ${w.name}` : `calls at ${w.name}`,
      ok: want, closestKm: +d.toFixed(1), tolKm: w.tolKm
    });
  }
  for (const c of entry.corridors || []) {
    const entered = trackEntersBox(variant.coords, c.box);
    const want = c.forbidden ? !entered : entered;
    if (!want) ok = false;
    detail.push({ what: c.forbidden ? `stays out of ${c.name}` : `passes ${c.name}`, ok: want, entered });
  }
  return { ok, detail };
}

// T2 — passage duration against an observed RANGE. Scored inside/outside with
// the signed margin, never as error against a fabricated point estimate.
function evalT2(entry, variant) {
  const [lo, hi] = entry.duration.days;
  const d = variant.days;
  const ok = d >= lo && d <= hi;
  const marginDays = ok ? 0 : +(d < lo ? (d - lo) : (d - hi)).toFixed(1);
  return { ok, detail: [{ what: `passage within ${lo}–${hi} days`, ok, days: d, marginDays }] };
}

// T3 — directional asymmetry. The volta do mar and the galleon's northern
// return are the defining feature of age-of-sail routing; a symmetric
// out-and-back is wrong in a way that is trivially testable.
function evalT3(entry, variant, byLane) {
  const others = byLane.get(entry.asymmetryWith) || [];
  const mate = others.find(o => o.routeClass === variant.routeClass && o.season === variant.season) || others[0];
  if (!mate) return { ok: null, detail: [{ what: `counterpart ${entry.asymmetryWith} baked`, ok: null, note: 'no baked counterpart' }] };
  const sep = trackSeparationKm(variant.coords, mate.coords);
  const ok = sep >= entry.minSeparationKm;
  return { ok, detail: [{ what: `differs from ${entry.asymmetryWith}`, ok, separationKm: +sep.toFixed(1), minKm: entry.minSeparationKm }] };
}

// T4 — seasonal response, where the sources say the route was seasonal.
function evalT4(entry, variant, byLane) {
  const sibs = (byLane.get(variant.route) || []).filter(v => v.routeClass === variant.routeClass && v.season !== variant.season);
  if (!sibs.length) return { ok: null, detail: [{ what: 'other seasons baked', ok: null, note: 'lane has one season only' }] };
  let maxSep = 0;
  for (const s of sibs) maxSep = Math.max(maxSep, trackSeparationKm(variant.coords, s.coords));
  const need = (entry.seasonal && entry.seasonal.minSeparationKm) || 100;
  const ok = maxSep >= need;
  return { ok, detail: [{ what: 'route responds to season', ok, maxSeasonalSeparationKm: +maxSep.toFixed(1), minKm: need }] };
}

// T5 — track geometry. Only where positional data genuinely exists.
function evalT5(entry, variant) {
  const f = discreteFrechetKm(variant.coords, entry.track);
  const tol = entry.frechetTolKm || 500;
  const ok = f <= tol;
  return { ok, detail: [{ what: 'track matches the observed record', ok, frechetKm: +f.toFixed(1), tolKm: tol }] };
}

const EVAL = { T1: evalT1, T2: evalT2, T3: evalT3, T4: evalT4, T5: evalT5 };
const TIERS = ['T1', 'T2', 'T3', 'T4', 'T5'];
const TIER_NAME = {
  T1: 'waypoint & corridor recall',
  T2: 'passage duration vs observed range',
  T3: 'directional asymmetry',
  T4: 'seasonal response',
  T5: 'track geometry'
};

// ------------------------------------------------------------------- run ----

const results = [];
const coveredLanes = new Map();   // laneId → Set(tier)

for (const entry of corpus.entries) {
  const lanes = entry.lanes || [];
  for (const laneId of lanes) {
    const lane = laneById.get(laneId);
    if (!lane) {
      results.push({ entry: entry.id, tier: entry.tier, lane: laneId, verdict: 'error',
        note: 'lane id not in datasets.routes — corpus is stale', variants: [] });
      continue;
    }
    // An entry only applies where its era overlaps the lane's.
    if (!overlaps(entry.era, lane.era)) continue;

    if (!coveredLanes.has(laneId)) coveredLanes.set(laneId, new Set());
    coveredLanes.get(laneId).add(entry.tier);

    const variants = variantsByLane.get(laneId) || [];
    if (!variants.length) {
      results.push({ entry: entry.id, tier: entry.tier, lane: laneId, verdict: 'error',
        note: 'lane has no baked variants', variants: [] });
      continue;
    }
    const vres = [];
    for (const v of variants) {
      const r = EVAL[entry.tier](entry, v, variantsByLane);
      vres.push({ variant: v.id, ok: r.ok, detail: r.detail });
    }
    // A lane passes an entry only if every baked variant does. `null` (not
    // applicable — e.g. no counterpart baked) neither passes nor fails.
    const judged = vres.filter(v => v.ok !== null);
    const verdict = judged.length === 0 ? 'inapplicable'
      : judged.every(v => v.ok) ? 'pass' : 'fail';
    results.push({ entry: entry.id, tier: entry.tier, lane: laneId, verdict,
      basin: basinOf(laneId), eraBands: bandsOf(lane.era), class: entry.class, kind: entry.kind,
      variants: vres });
  }
}
results.sort((a, b) => (a.entry + a.lane) < (b.entry + b.lane) ? -1 : 1);   // stable

// -------------------------------------------------------------- coverage ----
// Reported FIRST, every run. The uncomfortable number is the point.

const allLanes = datasets.routes.map(l => l.id);
const coverage = {
  lanes: allLanes.length,
  lanesWithAnyEvidence: coveredLanes.size,
  byTier: Object.fromEntries(TIERS.map(t => [t, [...coveredLanes.values()].filter(s => s.has(t)).length])),
  byBasin: {}, byEraBand: {}
};
for (const l of allLanes) {
  const b = basinOf(l);
  coverage.byBasin[b] = coverage.byBasin[b] || { lanes: 0, covered: 0 };
  coverage.byBasin[b].lanes++;
  if (coveredLanes.has(l)) coverage.byBasin[b].covered++;
}
for (const l of allLanes) {
  for (const band of bandsOf(laneById.get(l).era)) {
    coverage.byEraBand[band] = coverage.byEraBand[band] || { lanes: 0, covered: 0 };
    coverage.byEraBand[band].lanes++;
    if (coveredLanes.has(l)) coverage.byEraBand[band].covered++;
  }
}

// Per tier / per basin / per era band. Deliberately NOT pooled into one figure.
const tally = () => ({ pass: 0, fail: 0, inapplicable: 0, error: 0 });
const byTier = {}, byBasin = {}, byEraBand = {};
for (const r of results) {
  (byTier[r.tier] = byTier[r.tier] || tally())[r.verdict]++;
  if (r.basin) (byBasin[r.basin] = byBasin[r.basin] || tally())[r.verdict]++;
  for (const b of r.eraBands || []) (byEraBand[b] = byEraBand[b] || tally())[r.verdict]++;
}

const corpusDigest = createHash('sha256')
  .update(JSON.stringify(corpus.entries)).digest('hex').slice(0, 12);

const report = {
  _doc: 'PLAN-7 F-41 route verification. NO GLOBAL SCORE is emitted by design — ' +
        'one number over unevenly-evidenced lanes would itself be false precision. ' +
        '`unverified` lanes are those with no corpus entry; they never count toward a pass rate.',
  bundle: { datasets: datasets.version, routes: baked.version, corpus: corpusDigest },
  coverage, byTier, byBasin, byEraBand, results
};

// ----------------------------------------------------------------- output ---

const args = argv;
const jsonArg = args.find(a => a === '--json' || a.startsWith('--json='));
const strict = args.includes('--strict');

if (jsonArg) {
  const out = JSON.stringify(report, null, 2) + '\n';
  const eq = jsonArg.indexOf('=');
  if (eq > -1) { const dst = jsonArg.slice(eq + 1);
    writeFileSync(isAbsolute(dst) ? dst : join(ROOT, dst), out); console.log(`→ ${dst}`); }
  else process.stdout.write(out);
} else {
  const pct = (n, d) => d ? `${(100 * n / d).toFixed(1)}%` : '—';
  const L = console.log;
  L('');
  L('  ROUTE VERIFICATION — PLAN-7 Phase 0 (F-41)');
  L(`  datasets v${datasets.version} · routes v${baked.version} · corpus ${corpusDigest}`);
  L('');
  L('  COVERAGE — what this report is able to say anything about at all');
  L('  ' + '-'.repeat(66));
  L(`  lanes in the world              ${coverage.lanes}`);
  L(`  lanes with ANY route evidence   ${coverage.lanesWithAnyEvidence}  (${pct(coverage.lanesWithAnyEvidence, coverage.lanes)})`);
  L(`  lanes UNVERIFIED                ${coverage.lanes - coverage.lanesWithAnyEvidence}  (${pct(coverage.lanes - coverage.lanesWithAnyEvidence, coverage.lanes)})`);
  L('');
  for (const t of TIERS) L(`    ${t}  ${TIER_NAME[t].padEnd(34)} ${String(coverage.byTier[t]).padStart(3)} lanes`);
  L('');
  L('  coverage by basin');
  for (const [b, c] of Object.entries(coverage.byBasin).sort())
    L(`    ${b.padEnd(20)} ${String(c.covered).padStart(3)} / ${String(c.lanes).padEnd(4)} ${pct(c.covered, c.lanes)}`);
  L('');
  L('  coverage by era band');
  for (const [b, c] of Object.entries(coverage.byEraBand).sort())
    L(`    ${b.padEnd(20)} ${String(c.covered).padStart(3)} / ${String(c.lanes).padEnd(4)} ${pct(c.covered, c.lanes)}`);
  L('');
  L('  RESULTS — per tier (no pooled figure, by design)');
  L('  ' + '-'.repeat(66));
  for (const t of TIERS) {
    const c = byTier[t];
    if (!c) { L(`    ${t}  ${TIER_NAME[t].padEnd(34)} no entries`); continue; }
    L(`    ${t}  ${TIER_NAME[t].padEnd(34)} pass ${c.pass}  fail ${c.fail}  n/a ${c.inapplicable}  err ${c.error}`);
  }
  L('');
  L('  per basin');
  for (const [b, c] of Object.entries(byBasin).sort())
    L(`    ${b.padEnd(20)} pass ${c.pass}  fail ${c.fail}  n/a ${c.inapplicable}  err ${c.error}`);
  L('');
  L('  per era band');
  for (const [b, c] of Object.entries(byEraBand).sort())
    L(`    ${b.padEnd(20)} pass ${c.pass}  fail ${c.fail}  n/a ${c.inapplicable}  err ${c.error}`);
  L('');
  const bad = results.filter(r => r.verdict === 'fail' || r.verdict === 'error');
  if (bad.length) {
    L('  FAILURES');
    L('  ' + '-'.repeat(66));
    for (const r of bad) {
      L(`    [${r.tier}] ${r.entry} · ${r.lane}${r.note ? ' — ' + r.note : ''}`);
      for (const v of r.variants) for (const d of (v.detail || []))
        if (d.ok === false) L(`        ${v.variant}: ${d.what} — ${JSON.stringify(
          Object.fromEntries(Object.entries(d).filter(([k]) => !['what', 'ok'].includes(k))))}`);
    }
    L('');
  } else {
    L('  No failures. Note this says nothing about the ' +
      `${coverage.lanes - coverage.lanesWithAnyEvidence} unverified lanes.`);
    L('');
  }
}

if (strict && results.some(r => r.verdict === 'fail' || r.verdict === 'error')) process.exit(1);
