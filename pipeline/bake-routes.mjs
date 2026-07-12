#!/usr/bin/env node
// bake-routes.mjs — bake curved, wind/current-shaped route polylines for every
// lane in data-src/routes.json by reusing the ARCHIVED least-time routing engine
// (archive/isochrone-v1/pipeline). Ships only the polylines (~tens of KB); never
// the 31 MB of fields.
//
//   node pipeline/bake-routes.mjs
//
// Method (PLAN §6):
//   1. Load the archived 1° ocean/land mask (build/grid.json) and apply an ICE
//      CAP: mark cells poleward of the Arctic/Antarctic pack-ice limits as land.
//      The archived climatology has no sea ice, so without this the least-time
//      path from Europe to East Asia crosses the NORTH POLE (a shorter great
//      circle) instead of rounding the Cape — historically impossible and a grid
//      singularity the walker can't cross. The cap restores the real Cape route.
//   2. For each lane, run the archived Dijkstra router with the DESTINATION port
//      as source, giving a time field + parent pointers (prev). Reconstruct the
//      EXACT least-time path origin→destination by following prev (no lossy
//      downhill re-walk). Sailing hours = time[originCell].
//   3. Simplify (Douglas–Peucker) and emit app/data/routes.json.
//
// The archived fields (docs/data/fields/*.bin) are left untouched; this recomputes
// the handful of fields it needs, ice-capped, at bake time.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { GRID, SEASONS, VESSELS } from '../archive/isochrone-v1/pipeline/config.mjs';
import { makeGridIndex } from '../archive/isochrone-v1/pipeline/geo.mjs';
import { route as dijkstra, snapToOcean } from '../archive/isochrone-v1/pipeline/router.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const SRC = join(ROOT, 'data-src');
const OUT = join(ROOT, 'app', 'data');
const ARCHIVE = join(ROOT, 'archive', 'isochrone-v1', 'pipeline');

const gi = makeGridIndex(GRID);
const { cols, rows } = GRID;
const SEASON_IDX = new Map(SEASONS.map(s => [s.id, s.idx]));

// Impassable-latitude caps (deg lat). North of ICE_N and south of ICE_S is
// treated as land/ice.
//   ICE_N=66 (Arctic Circle): kills the false North-Pole shortcut on Europe↔Asia
//     routes; sits well above the northernmost endpoint (Gothenburg, 57.6°N).
//   ICE_S=-50: closes the Drake Passage / high Southern Ocean. Without it the
//     summer-monsoon field routes London↔Canton the wrong way round Cape Horn
//     (an ahistorical 228-day detour). Idle Sails has no Pacific ports, so the
//     Horn is never legitimately needed. Every real leg here — the Cape of Good
//     Hope (34.5°S) and the Brouwer easting (~35-45°S) — stays north of -50°.
const ICE_N = 66, ICE_S = -50;

// Isthmuses that were solid land in the age of sail but leak a false sea passage
// at 1° rasterization (the ~50-80 km necks fall between grid cells). Sealed as
// land so no route can cut through them. Safe here because Idle Sails has no
// Pacific or Red Sea ports — nothing legitimately needs these waters.
//   Panama: opened 1914; a 1° gap lets Canton↔Europe cut Pacific→Caribbean.
//   Suez:   opened 1869; would shortcut the Mediterranean into the Indian Ocean.
const ISTHMUS_CLOSE = [
  { name: 'Panama', lon: [-82, -76], lat: [6, 10] },
  { name: 'Suez', lon: [31, 34], lat: [27, 31] }
];

const SIMPLIFY_EPS = 0.3;   // deg; Douglas–Peucker tolerance
const MAX_POINTS = 60;

// ---- mask + ice cap -------------------------------------------------------
const gridPath = join(ARCHIVE, 'build', 'grid.json');
if (!existsSync(gridPath)) {
  console.error(`\n✗ bake-routes: archived ocean mask not found at ${gridPath}`);
  console.error('  Run the archive build once: cd archive/isochrone-v1/pipeline && node build-grid.mjs\n');
  process.exit(1);
}
const grid = JSON.parse(readFileSync(gridPath, 'utf8'));
const mask = Uint8Array.from(grid.mask); // 1 = land/impassable, 0 = ocean (routing)
// Isthmus seals are true land — apply to the routing mask AND the coastline-only
// mask used later to validate that no simplified segment cuts across land.
let sealed = 0;
for (const b of ISTHMUS_CLOSE)
  for (let lat = b.lat[0]; lat <= b.lat[1]; lat++)
    for (let lon = b.lon[0]; lon <= b.lon[1]; lon++) {
      const i = gi.idx(gi.colOf(lon), gi.rowOf(lat));
      if (mask[i] === 0) { mask[i] = 1; sealed++; }
    }
const landMask = Uint8Array.from(mask); // coastline + isthmus, NO ice cap
// The ice caps are routing constraints (pack ice), not coastline — apply only to
// the routing mask, so open-ocean high-latitude legs aren't misread as land.
let iced = 0;
for (let r = 0; r < rows; r++) {
  const lat = gi.latOf(r);
  if (lat > ICE_N || lat < ICE_S) for (let c = 0; c < cols; c++) { if (mask[gi.idx(c, r)] === 0) { mask[gi.idx(c, r)] = 1; iced++; } }
}

// ---- calibrated vessels (mirror build-all.mjs) ----------------------------
const calPath = join(ARCHIVE, 'build', 'calibration.json');
const cal = existsSync(calPath) ? JSON.parse(readFileSync(calPath, 'utf8')) : {};
const vesselByClass = new Map(VESSELS.map(v => [v.id, { ...v, scalar: v.scalar * (cal[v.id] ?? 1) }]));

// ---- inputs ---------------------------------------------------------------
const ports = JSON.parse(readFileSync(join(SRC, 'ports.json'), 'utf8')).ports;
const routes = JSON.parse(readFileSync(join(SRC, 'routes.json'), 'utf8')).routes;
const shipTypes = JSON.parse(readFileSync(join(SRC, 'ship-types.json'), 'utf8')).shipTypes;
const portById = new Map(ports.map(p => [p.id, p]));
const classOf = new Map(shipTypes.map(s => [s.id, s.routeClass]));

// ---- field (Dijkstra) cache: destination × routeClass × season ------------
const fieldCache = new Map();
function fieldFor(destPort, routeClass, seasonId) {
  const key = `${destPort.id}_${routeClass}_${seasonId}`;
  if (fieldCache.has(key)) return fieldCache.get(key);
  const [sc, sr] = snapToOcean(mask, destPort.lon, destPort.lat);
  const { time, prev } = dijkstra(mask, vesselByClass.get(routeClass), SEASON_IDX.get(seasonId), sc, sr);
  const f = { time, prev, srcIdx: gi.idx(sc, sr) };
  fieldCache.set(key, f);
  return f;
}

// ---- path reconstruction from parent pointers -----------------------------
// prev[cell] points one step toward the destination (the Dijkstra source).
// Walk origin→destination, unwrapping longitude across the antimeridian.
function reconstruct(field, originIdx) {
  if (!isFinite(field.time[originIdx])) return null;
  const pts = []; let cur = originIdx, guard = 0, prevLon = null;
  while (guard++ < 40000) {
    const c = cur % cols, r = (cur / cols) | 0;
    let lon = gi.lonOf(c);
    if (prevLon !== null) { while (lon - prevLon > 180) lon -= 360; while (lon - prevLon < -180) lon += 360; }
    prevLon = lon; pts.push([lon, gi.latOf(r)]);
    if (cur === field.srcIdx) break;
    const nx = field.prev[cur];
    if (nx < 0 || nx === cur) break;
    cur = nx;
  }
  return pts;
}

// ---- Douglas–Peucker simplification (planar deg; fine at this scale) -------
function perpDist(p, a, b) {
  const [px, py] = p, [ax, ay] = a, [bx, by] = b;
  const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / len2; t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function rdp(points, eps) {
  if (points.length < 3) return points.slice();
  let maxD = 0, idxMax = 0;
  for (let i = 1; i < points.length - 1; i++) { const d = perpDist(points[i], points[0], points[points.length - 1]); if (d > maxD) { maxD = d; idxMax = i; } }
  if (maxD > eps) return rdp(points.slice(0, idxMax + 1), eps).slice(0, -1).concat(rdp(points.slice(idxMax), eps));
  return [points[0], points[points.length - 1]];
}
// Does the straight segment a→b pass over any land cell? (coastline-only mask)
function segCrossesLand(a, b) {
  const steps = Math.max(2, Math.ceil(havKm(a, b) / 40));
  for (let i = 1; i < steps; i++) {
    const f = i / steps, lon = a[0] + (b[0] - a[0]) * f, lat = a[1] + (b[1] - a[1]) * f;
    const r = gi.rowOf(lat); if (r < 0 || r >= rows) continue;
    if (landMask[gi.idx(gi.colOf(lon), r)] === 1) return true;
  }
  return false;
}
// Land-aware simplify: RDP first, then on any simplified segment that clips a
// coastline, restore detail from the raw (Dijkstra, ocean-guaranteed) path by
// splitting at the point of maximum deviation until no sub-segment crosses land.
function refineSpan(points, iA, iB) {
  if (iB - iA <= 1 || !segCrossesLand(points[iA], points[iB])) return [iB];
  let maxD = -1, mid = iA + 1;
  for (let i = iA + 1; i < iB; i++) { const dd = perpDist(points[i], points[iA], points[iB]); if (dd > maxD) { maxD = dd; mid = i; } }
  if (mid === iA || mid === iB) return [iB];
  return refineSpan(points, iA, mid).concat(refineSpan(points, mid, iB));
}
function simplify(points) {
  let eps = SIMPLIFY_EPS, keep = rdp(points, eps);
  while (keep.length > MAX_POINTS && eps < 8) { eps *= 1.6; keep = rdp(points, eps); }
  const idxs = keep.map(p => points.indexOf(p));
  const out = [points[idxs[0]]];
  for (let k = 1; k < idxs.length; k++) for (const j of refineSpan(points, idxs[k - 1], idxs[k])) out.push(points[j]);
  return out;
}

// ---- great-circle fallback (flagged low-fidelity) -------------------------
function greatCircle(a, b, n = 24) {
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const [lon1, lat1] = a.map(v => v * D2R), [lon2, lat2] = b.map(v => v * D2R);
  const h = Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2;
  const d = 2 * Math.asin(Math.min(1, Math.sqrt(h))), pts = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n, A = Math.sin((1 - f) * d) / Math.sin(d), B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    pts.push([Math.atan2(y, x) * R2D, Math.atan2(z, Math.hypot(x, y)) * R2D]);
  }
  return pts;
}
const havKm = (a, b) => { const R = 6371, D = Math.PI / 180; const dLa = (b[1] - a[1]) * D, dLo = (b[0] - a[0]) * D; const x = Math.sin(dLa / 2) ** 2 + Math.cos(a[1] * D) * Math.cos(b[1] * D) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.min(1, Math.sqrt(x))); };

// ---- bake -----------------------------------------------------------------
const baked = [], warnings = [];
let nField = 0, nFallback = 0;
for (const route of routes) {
  const from = portById.get(route.from), to = portById.get(route.to);
  const classes = [...new Set(route.shipTypes.map(st => classOf.get(st)).filter(Boolean))];
  for (const routeClass of classes) {
    for (const s of SEASONS) {
      const field = fieldFor(to, routeClass, s.id);
      const [oc, or] = snapToOcean(mask, from.lon, from.lat);
      const originIdx = gi.idx(oc, or);
      let coords = null, hours = null, method = null;
      const raw = reconstruct(field, originIdx);
      if (raw && raw.length >= 2 && isFinite(field.time[originIdx])) {
        hours = field.time[originIdx] / 3600;
        const unwrap = (lon, ref) => { while (lon - ref > 180) lon -= 360; while (lon - ref < -180) lon += 360; return lon; };
        raw[0] = [unwrap(from.lon, raw[0][0]), from.lat];
        raw[raw.length - 1] = [unwrap(to.lon, raw[raw.length - 1][0]), to.lat];
        coords = simplify(raw); method = 'field'; nField++;
      } else {
        coords = greatCircle([from.lon, from.lat], [to.lon, to.lat]); method = 'great-circle'; nFallback++;
        warnings.push(`fallback great-circle for ${route.id} [${routeClass}/${s.id}]`);
      }
      const distKm = coords.reduce((acc, p, i) => i ? acc + havKm(coords[i - 1], p) : 0, 0);
      baked.push({
        id: `${route.id}__${routeClass}__${s.id}`, route: route.id, from: route.from, to: route.to,
        routeClass, season: s.id,
        hours: hours == null ? null : Math.round(hours),
        days: hours == null ? null : +(hours / 24).toFixed(1),
        distKm: Math.round(distKm), points: coords.length, method,
        coords: coords.map(([lon, lat]) => [+lon.toFixed(3), +lat.toFixed(3)])
      });
    }
  }
}

// ---- sanity checks --------------------------------------------------------
// The Dijkstra path is guaranteed to stay on ocean; the only thing that can put
// a segment over land is Douglas–Peucker cutting a corner. So the meaningful
// check is not segment LENGTH (a straight Southern-Ocean westerly run is a real,
// long, open-ocean leg) but whether a simplified segment CROSSES land. Sample
// each segment against the coastline-only mask; a coastal corner-clip yields a
// cell or two, a through-continent shortcut yields many.
const LAND_CROSS_TOL = 3;
function landCrossings(a, b) {
  const steps = Math.max(2, Math.ceil(havKm(a, b) / 40)); // ~40 km sampling
  let hits = 0;
  for (let i = 1; i < steps; i++) {
    const f = i / steps, lon = a[0] + (b[0] - a[0]) * f, lat = a[1] + (b[1] - a[1]) * f;
    const r = gi.rowOf(lat); if (r < 0 || r >= rows) continue;
    if (landMask[gi.idx(gi.colOf(lon), r)] === 1) hits++;
  }
  return hits;
}
const problems = [];
for (const b of baked) {
  if (b.coords.length < 2) problems.push(`${b.id}: <2 coords`);
  for (const c of b.coords) if (c[1] > ICE_N + 1 || c[1] < ICE_S - 1) problems.push(`${b.id}: point beyond ice cap (lat ${c[1]})`);
  if (b.method === 'field') {
    if (!(b.hours > 0)) problems.push(`${b.id}: non-positive hours`);
    const f = portById.get(b.from), t = portById.get(b.to);
    if (havKm(b.coords[0], [f.lon, f.lat]) > 120) problems.push(`${b.id}: start not near origin`);
    if (havKm(b.coords[b.coords.length - 1], [t.lon, t.lat]) > 120) problems.push(`${b.id}: end not near destination`);
    for (let i = 1; i < b.coords.length; i++) {
      const hits = landCrossings(b.coords[i - 1], b.coords[i]);
      if (hits > LAND_CROSS_TOL) problems.push(`${b.id}: segment ${i} crosses land (${hits} cells) — RDP cut a continent`);
    }
  }
}

// ---- emit -----------------------------------------------------------------
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const out = { version: 1, grid: { res: GRID.res, lon0: GRID.lon0, lat0: GRID.lat0, cols, rows }, iceCap: { northLat: ICE_N, southLat: ICE_S }, count: baked.length, routes: baked };
writeFileSync(join(OUT, 'routes.json'), JSON.stringify(out));
const kb = (Buffer.byteLength(JSON.stringify(out)) / 1024).toFixed(1);

console.log(`✓ bake-routes: ${baked.length} polylines from ${routes.length} lanes.`);
console.log(`  ice cap: lat>${ICE_N} / lat<${ICE_S} blocked (${iced} cells) · isthmuses sealed (${sealed} cells) · fields computed ${fieldCache.size}`);
console.log(`  field walks ${nField} · great-circle fallbacks ${nFallback}`);
console.log(`  → app/data/routes.json (${kb} KB)`);
if (warnings.length) { console.log(`  ${warnings.length} fallback warning(s):`); for (const w of warnings.slice(0, 12)) console.log('    - ' + w); }
if (problems.length) { console.error(`\n✗ ${problems.length} sanity problem(s):`); for (const p of problems.slice(0, 25)) console.error('  - ' + p); process.exit(1); }
