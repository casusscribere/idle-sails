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
//   3. Simplify (Douglas–Peucker) and emit data/routes.json.
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
const OUT = join(ROOT, 'data');
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

// Cape Horn (increment 6): the −50° southern cap keeps Europe↔far-East lanes
// (Canton, Batavia) rounding the Cape of Good Hope instead of finding a false
// far-south easting — but it ALSO walls off Cape Horn (55.98°S), which the
// maritime fur trade (Boston↔Nootka) and the Pacific-coast Americas legitimately
// round. A single geographic corridor can't tell the two apart: once the Drake
// Passage is open, Dijkstra will also thread Europe→Asia through it in an
// adverse-monsoon season (verified empirically — every Atlantic↔Pacific corridor
// that lets Boston round the Horn also lets London→Canton cheat). The
// discriminator is the DESTINATION: the baker computes one field per destination,
// so we lower the cap to −58° ONLY in the fields of Pacific-coast-Americas ports.
// A route to Canton uses Canton's −50 field (no Horn); a route to Nootka uses
// Nootka's −58 field (Horn open). Intra-Pacific and trans-Pacific legs to these
// same ports are unaffected — the coastal / mid-latitude path stays the fastest.
const ICE_S_HORN = -58;
const HORN_DEST = new Set([
  'sitka', 'nootka', 'valparaiso', 'callao', 'guayaquil', 'panama', 'acapulco',
  // The South Sea whaling grounds off Peru/Chile — the British and American
  // sperm fishery rounded the Horn to reach it (increment 6j).
  'pacific-grounds'
]);

// PLAN-3 S2 — seasonal Arctic corridors (user-funded ice exception): the 66°N
// seal stays global, EXCEPT two summer/autumn corridors reflecting the real
// (Little-Ice-Age-era) navigation season: the North Cape → White Sea run
// (Arkhangelsk, from 1584) and the Norway → Spitsbergen whaling ground
// (Smeerenburg). Open in jja + son only — the trades' documented season —
// closed the rest of the year. This is the one era-climate signal scholarship
// supports at this resolution; per-era wind REANALYSIS does not exist and is a
// declared boundary (PLAN-3 decision, 2026-07-13).
const ICE_CORRIDORS = [
  // lon from 8°E so the corridor includes the Lofoten coastal water — the only
  // way around Norway; without it the 66°N seal cuts the route at the coast.
  { name: 'White Sea', lon: [8, 45], lat: [66, 73], seasons: ['jja', 'son'] },
  { name: 'Spitsbergen', lon: [-2, 20], lat: [66, 81], seasons: ['jja', 'son'] }
];

// Isthmuses that were solid land in the age of sail but leak a false sea passage
// at 1° rasterization (the ~50-80 km necks fall between grid cells). Sealed as
// land so no route can cut through them.
//   Panama: opened 1914; a 1° gap lets Canton↔Europe cut Pacific→Caribbean.
//           Still sealed with Pacific ports present: Sitka/Acapulco↔Atlantic
//           legitimately round the Horn... which ICE_S also blocks — so no
//           trans-basin lane between Pacific and Atlantic ports is authored
//           (none is historical at this scale except the galleon's overland
//           transshipment, which is Acapulco's POINT).
//           **A WALL, not a box (S3 / increment 6):** the earlier lon[-82,-76]×
//           lat[6,10] box separated the basins but also swallowed the Gulf of
//           Panama, so the Pacific port of Panama snapped ~500 km SW and its
//           Callao/Guayaquil coastal legs cut across the Azuero Peninsula. The
//           seal is now the single land ROW at lat 9 (cell centre 9.5) spanning
//           the isthmus longitudes — a continuous barrier from the Central-
//           American land (−83/−84) to the Colombian land (−76/−75). Because the
//           8-neighbour router cannot jump lat 10→8 without stepping on a lat-9
//           cell, one solid row blocks all Caribbean↔Pacific passage while
//           leaving the Gulf of Panama (row 98, lat 8.5) open: Panama now snaps
//           46 km from its real position, Portobelo (nudged to 10.0°N, its own
//           cell being on the wall) snaps to the Caribbean side. Flood-fill and
//           snap verified; the Canton↔London Cape route is unaffected.
//   Suez:   opened 1869; would shortcut the Mediterranean into the Indian Ocean.
const ISTHMUS_CLOSE = [
  { name: 'Panama', lon: [-82, -77], lat: [9, 9] },
  { name: 'Suez', lon: [31, 34], lat: [27, 31] }
];

// PLAN-3 S2 — strait carves (user-funded Bosporus/Kerch exception): cells
// force-opened as ocean where 1° rasterization seals a real, historically vital
// channel. Mirrors the archive's STRAIT_CARVES pattern, applied baker-side so
// the archive stays pristine. Opens the Dardanelles→Marmara→Bosporus chain
// (Istanbul, and through Kerch, Kaffa and the Black Sea).
const CHANNEL_CARVES = [
  [26.5, 40.5], [27.5, 40.5], [28.5, 40.5],   // Dardanelles → Sea of Marmara
  [29.5, 41.5], [29.5, 40.5],                 // Bosporus
  [36.5, 45.5], [36.5, 44.5],                 // Kerch Strait → Sea of Azov approach
  [39.5, 65.5], [40.5, 65.5], [40.5, 66.5],   // the Gorlo (White Sea throat) — ~50 km wide, genuinely sub-cell
  // Gulf of Finland fairway: the ~70–120 km gulf rasterizes shut east of 25°E,
  // which left St Petersburg's three lanes with ZERO baked legs (found by the
  // port-lifecycle verification, 2026-07-14 — the flow matrix carries ~7k
  // Petersburg voyages the chart could not sail). Same sub-cell-channel class
  // as the Bosporus/Gorlo carves above.
  [25.5, 59.5], [26.5, 59.5], [28.5, 59.5], [29.5, 59.5]
];

// Island seals (Phase 3 render-fidelity): long thin islands render at 50m
// (land.geojson) but rasterize at 1° into a BROKEN chain of land cells with
// false-ocean gaps — so a least-time path threads a gap and, drawn straight over
// the fine coastline, a ship appears to sail across the island. Seal an island's
// spine cells (the false-ocean gaps along its length) so routes must round it,
// exactly as they did. Cuba is the exemplar: routes to Kingston cut clean across
// its centre (~−78.7/22.3). Only the central-western spine is sealed — Cuba's
// eastern tip abuts Hispaniola sub-cell (the Windward Passage is already closed
// at 1°), so routes round the east end with at most a coastal graze, and the
// Florida Straits (N), Caribbean (S), and Yucatán Channel (W) all stay open
// (flood-fill verified).
const ISLAND_SEAL = [
  { name: 'Cuba', cells: [[-85, 22], [-84, 22], [-83, 22], [-82, 22], [-81, 22], [-80, 22], [-79, 22], [-78, 22], [-77, 22], [-77, 21], [-76, 21]] }
];

const SIMPLIFY_EPS = 0.3;   // deg; Douglas–Peucker tolerance
const MAX_POINTS = 60;

// Windward-tacking treatment (the Arabian/Mediterranean "zigzag"). The least-time
// Dijkstra path beats to windward as a grid-quantized sawtooth when a leg must
// sail against the season's wind. Two responses, both here in the baker:
//   • GATE (historical): a raw path with ≥ this many latitude-direction reversals
//     is a beat-to-windward passage no monsoon-era master would make — they
//     waited for the wind to turn. Drop the leg (the sim reschedules, exactly as
//     for the ice-locked Arctic winter). Safeguard below keeps ≥1 season/lane.
//   • SMOOTH (visual): kept legs get a land-aware de-tack pass that collapses any
//     residual oscillation to its made-good line before Douglas–Peucker.
const TACK_REVERSALS_GATE = 6;   // raw lat-reversals ⇒ wind-gate the leg
const TACK_SMOOTH_AMPL = 2.0;    // deg cross-track; collapse oscillation apexes up to this

// ---- mask + ice cap -------------------------------------------------------
const gridPath = join(ARCHIVE, 'build', 'grid.json');
if (!existsSync(gridPath)) {
  console.error(`\n✗ bake-routes: archived ocean mask not found at ${gridPath}`);
  console.error('  Run the archive build once: cd archive/isochrone-v1/pipeline && node build-grid.mjs\n');
  process.exit(1);
}
const grid = JSON.parse(readFileSync(gridPath, 'utf8'));
const baseMask = Uint8Array.from(grid.mask); // 1 = land/impassable, 0 = ocean (routing)
// Channel carves are real water the 1° raster sealed — open them everywhere
// (routing AND the coastline mask used for crossing checks).
let carved = 0;
for (const [lon, lat] of CHANNEL_CARVES) {
  const i = gi.idx(gi.colOf(lon), gi.rowOf(lat));
  if (baseMask[i] === 1) { baseMask[i] = 0; carved++; }
}
// Isthmus seals are true land — apply to the routing mask AND the coastline-only
// mask used later to validate that no simplified segment cuts across land.
let sealed = 0;
for (const b of ISTHMUS_CLOSE)
  for (let lat = b.lat[0]; lat <= b.lat[1]; lat++)
    for (let lon = b.lon[0]; lon <= b.lon[1]; lon++) {
      const i = gi.idx(gi.colOf(lon), gi.rowOf(lat));
      if (baseMask[i] === 0) { baseMask[i] = 1; sealed++; }
    }
// Island spine seals — fill the false-ocean gaps in a thin island's 1° raster so
// routes round it instead of threading a gap that renders as sailing over land.
let islandSealed = 0;
for (const isle of ISLAND_SEAL)
  for (const [lon, lat] of isle.cells) {
    const i = gi.idx(gi.colOf(lon), gi.rowOf(lat));
    if (baseMask[i] === 0) { baseMask[i] = 1; islandSealed++; }
  }
const landMask = Uint8Array.from(baseMask); // coastline + isthmus + island spines, NO ice cap
// The ice caps are routing constraints (pack ice), not coastline — applied only
// to the routing masks. One routing mask PER SEASON now: the Arctic corridors
// open only in their navigation season (jja/son), so a winter field simply
// cannot reach Arkhangelsk or the whaling grounds — which is the history.
// Two southern-cap variants (see the Cape Horn note above): the default −50 set
// for all destinations, and a −58 set that opens the Drake Passage, used ONLY
// for the fields of Pacific-coast-Americas destinations. Both share the same
// −66 Arctic seal + seasonal corridors; only the southern latitude differs.
// Seasonal ice (increment 6i): a sub-Arctic sea that FREEZES in winter but opens
// for a brief summer navigation season. It sits BELOW the 66°N cap, so the cap
// does not seal it — instead it is sealed here in its CLOSED seasons, the inverse
// of the Arctic corridors (which OPEN a 66+ region in its navigation season).
// Hudson Bay + Strait: HBC ships transited the strait Jun–Oct only, so the bay is
// sealed in djf + mam — York Factory takes no winter/spring arrivals and the sim
// reschedules to the open season (the Arkhangelsk precedent, at a sub-66 sea).
// Bounds lon[-95,-64] × lat[55,66] cover the strait mouth (~−64) and the bay
// without touching Davis Strait (67°N/−55, whaling) or the Labrador Sea (>−64°).
const SEASONAL_ICE = [
  { name: 'Hudson Bay', lon: [-95, -64], lat: [55, 66], closed: ['djf', 'mam'] }
];
let iced = 0, seasonIced = 0;
function buildMaskSet(iceSouth) {
  const bySeason = new Map();
  for (const s of SEASONS) {
    const m = Uint8Array.from(baseMask);
    for (let r = 0; r < rows; r++) {
      const lat = gi.latOf(r);
      if (lat > ICE_N || lat < iceSouth) for (let c = 0; c < cols; c++) {
        const i = gi.idx(c, r);
        if (m[i] !== 0) continue;
        const lon = gi.lonOf(c);
        const inCorridor = ICE_CORRIDORS.some(k => k.seasons.includes(s.id) &&
          lon >= k.lon[0] && lon <= k.lon[1] && lat >= k.lat[0] && lat <= k.lat[1]);
        if (!inCorridor) { m[i] = 1; if (iceSouth === ICE_S) iced++; }
      }
    }
    // Seasonal-ice seas: seal them as land in their closed seasons.
    for (const z of SEASONAL_ICE) {
      if (!z.closed.includes(s.id)) continue;
      for (let r = 0; r < rows; r++) {
        const lat = gi.latOf(r);
        if (lat < z.lat[0] || lat > z.lat[1]) continue;
        for (let c = 0; c < cols; c++) {
          const lon = gi.lonOf(c), i = gi.idx(c, r);
          if (m[i] === 0 && lon >= z.lon[0] && lon <= z.lon[1]) { m[i] = 1; if (iceSouth === ICE_S) seasonIced++; }
        }
      }
    }
    bySeason.set(s.id, m);
  }
  return bySeason;
}
const maskBySeason = buildMaskSet(ICE_S);
const maskBySeasonHorn = buildMaskSet(ICE_S_HORN);
// The Drake Passage opens (−58 cap) when EITHER endpoint is a Pacific-coast-
// Americas port — the Horn is rounded in BOTH directions. Keying only on the
// destination broke the eastbound legs: Callao→Cadiz (Atlantic destination, so
// the −50 cap) could not round the Horn and the router fled the wrong way around
// the globe (a Pacific→antimeridian wrap). London→Canton stays capped: Canton is
// not an American Pacific port, so neither endpoint opens the Horn.
const hornOpen = (a, b) => HORN_DEST.has(a.id) || HORN_DEST.has(b.id);
const masksForHorn = horn => horn ? maskBySeasonHorn : maskBySeason;
const mask = maskBySeason.get('jja'); // default mask for port snapping

// ---- calibrated vessels (mirror build-all.mjs) ----------------------------
// PLAN-3 S2 (user decision: new polars for the non-European rigs): junk and
// dhow get their OWN parametric polars instead of mapping onto indiaman/brig.
// Parameters from the sailing literature, not voyage-series calibration (none
// exists — a declared boundary): the battened lug and the lateen both point
// better than the square rig (smaller no-go), at moderate hull speeds.
const EXTRA_VESSELS = [
  { id: 'junk', name: 'Ocean junk (battened lug)', vmaxKn: 8.0, noGo: 56, scalar: 0.88 },
  { id: 'dhow', name: 'Dhow (lateen/settee)', vmaxKn: 7.0, noGo: 50, scalar: 0.85 }
];
const calPath = join(ARCHIVE, 'build', 'calibration.json');
const cal = existsSync(calPath) ? JSON.parse(readFileSync(calPath, 'utf8')) : {};
const vesselByClass = new Map([...VESSELS, ...EXTRA_VESSELS].map(v => [v.id, { ...v, scalar: v.scalar * (cal[v.id] ?? 1) }]));

// ---- inputs ---------------------------------------------------------------
const ports = JSON.parse(readFileSync(join(SRC, 'ports.json'), 'utf8')).ports;
const routes = JSON.parse(readFileSync(join(SRC, 'routes.json'), 'utf8')).routes;
const shipTypes = JSON.parse(readFileSync(join(SRC, 'ship-types.json'), 'utf8')).shipTypes;
const portById = new Map(ports.map(p => [p.id, p]));
const classOf = new Map(shipTypes.map(s => [s.id, s.routeClass]));

// ---- field (Dijkstra) cache: destination × routeClass × season ------------
const fieldCache = new Map();
function fieldFor(destPort, routeClass, seasonId, horn) {
  const key = `${destPort.id}_${routeClass}_${seasonId}_${horn ? 'H' : 'n'}`;
  if (fieldCache.has(key)) return fieldCache.get(key);
  const m = masksForHorn(horn).get(seasonId);
  const [sc, sr] = snapToOcean(m, destPort.lon, destPort.lat);
  const { time, prev } = dijkstra(m, vesselByClass.get(routeClass), SEASON_IDX.get(seasonId), sc, sr);
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

// ---- windward-tacking detection + smoothing -------------------------------
// Latitude-direction reversals in a path: 0 for a monotone (with-the-wind)
// staircase, many for a beat-to-windward sawtooth. The gate discriminator.
function latReversals(pts) {
  let rev = 0, prev = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.sign(pts[i][1] - pts[i - 1][1]);
    if (d !== 0) { if (prev !== 0 && d !== prev) rev++; prev = d; }
  }
  return rev;
}
const turnZ = (a, b, c) => (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
// Collapse windward-tacking oscillation to its made-good line: iteratively drop
// oscillation apexes — a vertex whose turn reverses a neighbour's — of small
// cross-track amplitude, whenever the straight skip stays on ocean. Monotone
// (genuine, wind-shaped) curvature is preserved: its turns don't reverse. The
// coastline is respected via segCrossesLand, so no smoothed leg cuts a shore.
function deTack(pts) {
  let p = pts.slice(), guard = 0;
  while (guard++ < 300 && p.length > 2) {
    const drop = new Array(p.length).fill(false);
    for (let i = 1; i < p.length - 1; i++) {
      const a = p[i - 1], b = p[i], c = p[i + 1];
      const tHere = Math.sign(turnZ(a, b, c));
      if (tHere === 0) continue;
      const tPrev = i >= 2 ? Math.sign(turnZ(p[i - 2], a, b)) : 0;
      const tNext = i <= p.length - 3 ? Math.sign(turnZ(b, c, p[i + 2])) : 0;
      const oscillates = (tPrev !== 0 && tPrev !== tHere) || (tNext !== 0 && tNext !== tHere);
      if (oscillates && perpDist(b, a, c) < TACK_SMOOTH_AMPL && !segCrossesLand(a, c)) drop[i] = true;
    }
    for (let i = 1; i < p.length; i++) if (drop[i] && drop[i - 1]) drop[i] = false; // no adjacent removals per pass
    if (!drop.some(Boolean)) break;
    p = p.filter((_, i) => !drop[i]);
  }
  return p;
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
let nField = 0, nFallback = 0, nWindGated = 0;
const unwrap = (lon, ref) => { while (lon - ref > 180) lon -= 360; while (lon - ref < -180) lon += 360; return lon; };
for (const route of routes) {
  const from = portById.get(route.from), to = portById.get(route.to);
  const classes = [...new Set(route.shipTypes.map(st => classOf.get(st)).filter(Boolean))];
  for (const routeClass of classes) {
    // Pass 1 — reconstruct every season's raw least-time path + its tack score.
    const perSeason = [];
    const horn = hornOpen(from, to);
    const destMasks = masksForHorn(horn);   // origin must snap in the SAME mask the field used
    for (const s of SEASONS) {
      const field = fieldFor(to, routeClass, s.id, horn);
      const [oc, or] = snapToOcean(destMasks.get(s.id), from.lon, from.lat);
      const originIdx = gi.idx(oc, or);
      const raw = reconstruct(field, originIdx);
      if (raw && raw.length >= 2 && isFinite(field.time[originIdx])) {
        raw[0] = [unwrap(from.lon, raw[0][0]), from.lat];
        raw[raw.length - 1] = [unwrap(to.lon, raw[raw.length - 1][0]), to.lat];
        perSeason.push({ s, raw, hours: field.time[originIdx] / 3600, rev: latReversals(raw) });
      } else {
        // Unreachable in this season's mask (the Arctic corridors close outside
        // jja/son): SEASON-GATE the leg — emit nothing, and world.js reschedules
        // any vessel that draws this lane in a closed season. A great-circle here
        // would sail ships across pack ice; absence is the historical truth.
        perSeason.push({ s, raw: null });
        nFallback++;
        warnings.push(`season-gated (ice-locked): ${route.id} [${routeClass}/${s.id}]`);
      }
    }
    // Gate decision — a season whose raw path beats to windward (≥ the reversal
    // gate) is a passage ships waited out, not sailed; drop it. Safeguard: never
    // gate away a lane×class's last sailable season — keep the least-tacky one so
    // the lane never goes wholly unsailable.
    const sailable = perSeason.filter(x => x.raw);
    let keep = sailable.filter(x => x.rev < TACK_REVERSALS_GATE);
    if (!keep.length && sailable.length) keep = [sailable.slice().sort((a, b) => a.rev - b.rev)[0]];
    const keepSet = new Set(keep);
    for (const x of sailable) if (!keepSet.has(x)) {
      nWindGated++;
      warnings.push(`wind-gated (beat-to-windward, ${x.rev} tacks): ${route.id} [${routeClass}/${x.s.id}]`);
    }
    // Pass 2 — de-tack (smooth) + simplify + emit the kept seasons.
    for (const x of keep) {
      const coords = simplify(deTack(x.raw));
      const distKm = coords.reduce((acc, p, i) => i ? acc + havKm(coords[i - 1], p) : 0, 0);
      baked.push({
        id: `${route.id}__${routeClass}__${x.s.id}`, route: route.id, from: route.from, to: route.to,
        routeClass, season: x.s.id,
        hours: Math.round(x.hours), days: +(x.hours / 24).toFixed(1),
        distKm: Math.round(distKm), points: coords.length, method: 'field',
        coords: coords.map(([lon, lat]) => [+lon.toFixed(3), +lat.toFixed(3)])
      });
      nField++;
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
// 5 since S2: the expanded universe adds ports in tight raster corners —
// Portobelo lives inside the Panama seal box (its own sealed-sea cells read as
// "land" here) and the Bristol Channel exit clips Cornwall's 1° corner at 4
// cells. Genuine through-continent shortcuts measure in the dozens of cells.
const LAND_CROSS_TOL = 5;
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
  // A lane with a Pacific-coast-Americas port at EITHER end legitimately rounds
  // Cape Horn to −58 (in both directions); every other lane stays north of −50.
  const southFloor = (HORN_DEST.has(b.from) || HORN_DEST.has(b.to)) ? ICE_S_HORN : ICE_S;
  for (const c of b.coords) {
    if (c[1] < southFloor - 1) { problems.push(`${b.id}: point beyond southern ice cap (lat ${c[1]})`); continue; }
    if (c[1] > ICE_N + 1) {
      const lonN = ((c[0] + 180) % 360 + 360) % 360 - 180;
      const inCorridor = ICE_CORRIDORS.some(k => lonN >= k.lon[0] - 1 && lonN <= k.lon[1] + 1 && c[1] <= k.lat[1] + 1);
      if (!inCorridor) problems.push(`${b.id}: point beyond ice cap outside any corridor (${c[0]}, ${c[1]})`);
    }
  }
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
// version 2: wind-gated + de-tacked bake (leg set changed; saves keyed on it)
const out = { version: 2, grid: { res: GRID.res, lon0: GRID.lon0, lat0: GRID.lat0, cols, rows }, iceCap: { northLat: ICE_N, southLat: ICE_S }, count: baked.length, routes: baked };
writeFileSync(join(OUT, 'routes.json'), JSON.stringify(out));
const kb = (Buffer.byteLength(JSON.stringify(out)) / 1024).toFixed(1);

console.log(`✓ bake-routes: ${baked.length} polylines from ${routes.length} lanes.`);
console.log(`  ice cap: lat>${ICE_N} / lat<${ICE_S} blocked (${iced} cells) · isthmuses sealed (${sealed} cells) · island spines sealed (${islandSealed} cells) · fields computed ${fieldCache.size}`);
console.log(`  field walks ${nField} · season-gated (ice-locked) ${nFallback} · wind-gated (beat-to-windward) ${nWindGated}`);
console.log(`  → data/routes.json (${kb} KB)`);
if (warnings.length) { console.log(`  ${warnings.length} fallback warning(s):`); for (const w of warnings.slice(0, 12)) console.log('    - ' + w); }
if (problems.length) { console.error(`\n✗ ${problems.length} sanity problem(s):`); for (const p of problems.slice(0, 25)) console.error('  - ' + p); process.exit(1); }
