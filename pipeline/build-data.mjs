#!/usr/bin/env node
// build-data.mjs — validate the hand-authored data-src/*.json datasets, run a
// procedural-generation plausibility self-check, and bundle everything into a
// single versioned data/datasets.json. Also copies the coastline into place.
//
//   node pipeline/build-data.mjs
//
// Exit 0 on success; non-zero with a report of every error found (it collects
// ALL problems before failing, so one run surfaces the whole list).

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const SRC = join(ROOT, 'data-src');
const OUT = join(ROOT, 'data');
const ARCHIVE_FIELDS = join(ROOT, 'archive', 'isochrone-v1', 'docs', 'data', 'fields');
const LAND_SRC = join(ROOT, 'archive', 'isochrone-v1', 'docs', 'assets', 'land.geojson');

const DATASET_VERSION = 1;
const ERA = { from: 1550, to: 1815 };   // flowing-clock scope (PLAN-2 Phase A)
const ROUTE_CLASSES = ['frigate', 'indiaman', 'brig', 'slaver'];
const SEASONS = ['djf', 'mam', 'jja', 'son'];
const REGIONS = new Set(['britain', 'lowlands', 'france', 'iberia', 'baltic', 'caribbean',
  'brazil', 'west-africa', 'east-indies', 'china', 'india', 'japan', 'north-america', 'europe',
  // diversity-layer regions (PLAN-2 §5): in the cargo/power vocabulary now,
  // gaining ports when Phase B bakes the minor-port routes.
  'east-asia', 'indian-ocean', 'arabia', 'persian-gulf', 'east-africa',
  'arctic', 'mediterranean', 'black-sea', 'north-pacific']);
const SELFCHECK_N = 2000;

const errors = [];
const err = (msg) => errors.push(msg);
const load = (name) => JSON.parse(readFileSync(join(SRC, name), 'utf8'));

// ---- load ----------------------------------------------------------------
const ports = load('ports.json').ports;
const powers = load('powers.json').powers;
const shipTypes = load('ship-types.json').shipTypes;
const cargo = load('cargo.json').cargo;
const routes = load('routes.json').routes;
const wars = load('wars.json').wars;
const names = load('names.json');
const eraWeights = load('era-weights.json');

const portById = new Map(ports.map(p => [p.id, p]));
const powerById = new Map(powers.map(p => [p.id, p]));
const shipById = new Map(shipTypes.map(s => [s.id, s]));
const cargoById = new Map(cargo.map(c => [c.id, c]));

const inEra = (e, ctx) => {
  if (!e || typeof e.from !== 'number' || typeof e.to !== 'number') return err(`${ctx}: missing era{from,to}`);
  if (e.from > e.to) err(`${ctx}: era.from ${e.from} > era.to ${e.to}`);
  if (e.from < ERA.from || e.to > ERA.to) err(`${ctx}: era ${e.from}-${e.to} outside scope ${ERA.from}-${ERA.to}`);
};
const uniq = (arr, key, ctx) => {
  const seen = new Set();
  for (const x of arr) { if (seen.has(x[key])) err(`${ctx}: duplicate ${key}=${x[key]}`); seen.add(x[key]); }
};

// ---- validate: ports -----------------------------------------------------
uniq(ports, 'id', 'ports');
for (const p of ports) {
  if (typeof p.lon !== 'number' || typeof p.lat !== 'number') err(`port ${p.id}: lon/lat must be numbers`);
  if (p.lon < -180 || p.lon > 180 || p.lat < -90 || p.lat > 90) err(`port ${p.id}: lon/lat out of range`);
  if (!powerById.has(p.power)) err(`port ${p.id}: unknown power '${p.power}'`);
  if (!REGIONS.has(p.region)) err(`port ${p.id}: unknown region '${p.region}'`);
}

// ---- validate: powers ----------------------------------------------------
uniq(powers, 'id', 'powers');
for (const p of powers) {
  inEra(p.era, `power ${p.id}`);
  for (const hp of p.homePorts || []) if (!portById.has(hp)) err(`power ${p.id}: unknown homePort '${hp}'`);
  for (const r of p.rivals || []) if (!powerById.has(r)) err(`power ${p.id}: unknown rival '${r}'`);
  if (p.kind === 'company' && !powerById.has(p.parent)) err(`power ${p.id}: company missing valid parent`);
}

// ---- validate: ship-types ------------------------------------------------
uniq(shipTypes, 'id', 'ship-types');
for (const s of shipTypes) {
  if (!ROUTE_CLASSES.includes(s.routeClass)) err(`ship-type ${s.id}: routeClass '${s.routeClass}' not in ${ROUTE_CLASSES.join('/')}`);
  const t = s.tonnage || {};
  if (!(t.min <= t.mode && t.mode <= t.max)) err(`ship-type ${s.id}: tonnage must satisfy min<=mode<=max`);
  inEra(s.era, `ship-type ${s.id}`);
  if (s.powers !== '*') for (const pw of s.powers) if (!powerById.has(pw)) err(`ship-type ${s.id}: unknown power '${pw}'`);
  if (!Array.isArray(s.roles) || !s.roles.length) err(`ship-type ${s.id}: needs roles[]`);
}

// ---- validate: cargo -----------------------------------------------------
uniq(cargo, 'id', 'cargo');
for (const c of cargo) {
  for (const o of c.origins || []) if (o !== '*' && !REGIONS.has(o)) err(`cargo ${c.id}: unknown origin region '${o}'`);
  if (c.middlePassageOnly && c.id !== 'enslaved-people') err(`cargo ${c.id}: middlePassageOnly is reserved for enslaved-people`);
}
if (!cargoById.has('enslaved-people')) err('cargo: enslaved-people entry is required (sober representation, PLAN §10.5)');
else if (!cargoById.get('enslaved-people').framing) err('cargo enslaved-people: missing framing{} block (PLAN §10.5)');

// ---- validate: routes ----------------------------------------------------
uniq(routes, 'id', 'routes');
for (const r of routes) {
  if (!portById.has(r.from)) err(`route ${r.id}: unknown from '${r.from}'`);
  if (!portById.has(r.to)) err(`route ${r.id}: unknown to '${r.to}'`);
  if (r.from === r.to) err(`route ${r.id}: from === to`);
  inEra(r.era, `route ${r.id}`);
  if (r.flag && !powerById.has(r.flag)) err(`route ${r.id}: unknown flag '${r.flag}'`);
  if (!Array.isArray(r.shipTypes) || !r.shipTypes.length) err(`route ${r.id}: needs shipTypes[]`);
  for (const st of r.shipTypes || []) if (!shipById.has(st)) err(`route ${r.id}: unknown shipType '${st}'`);
  if (!Array.isArray(r.cargo) || !r.cargo.length) err(`route ${r.id}: needs cargo[]`);
  for (const c of r.cargo || []) if (!cargoById.has(c)) err(`route ${r.id}: unknown cargo '${c}'`);
  // Middle-Passage invariant (PLAN §10.5): enslaved-people ONLY on middlePassage lanes,
  // and such lanes carry ONLY enslaved-people.
  const hasEnslaved = (r.cargo || []).includes('enslaved-people');
  if (hasEnslaved && !r.middlePassage) err(`route ${r.id}: carries enslaved-people but is not flagged middlePassage`);
  if (r.middlePassage && !(r.cargo.length === 1 && hasEnslaved)) err(`route ${r.id}: middlePassage lane must carry exactly [enslaved-people]`);
  // Era coherence: at least one shipType must overlap the lane's era window.
  for (const st of r.shipTypes || []) {
    const s = shipById.get(st); if (!s) continue;
    if (s.era.to < r.era.from || s.era.from > r.era.to) err(`route ${r.id}: shipType ${st} era ${s.era.from}-${s.era.to} never overlaps lane era ${r.era.from}-${r.era.to}`);
  }
}

// ---- validate: routes ↔ baked fields (ties M1 to M2 feasibility) ----------
// The baker keys polylines to the DESTINATION port's field per routeClass/season.
const neededFields = new Set();
for (const r of routes) {
  const classes = new Set((r.shipTypes || []).map(st => shipById.get(st)?.routeClass).filter(Boolean));
  for (const rc of classes) for (const sn of SEASONS) neededFields.add(`${r.to}_${rc}_${sn}`);
}
let missingFields = 0;
if (existsSync(ARCHIVE_FIELDS)) {
  for (const key of neededFields) {
    if (!existsSync(join(ARCHIVE_FIELDS, `${key}.bin`))) { err(`baked field missing for a referenced lane: ${key}.bin`); missingFields++; }
  }
} else {
  err(`archive fields dir not found: ${ARCHIVE_FIELDS}`);
}

// ---- validate: wars ------------------------------------------------------
uniq(wars, 'id', 'wars');
for (const w of wars) {
  inEra({ from: w.from, to: w.to }, `war ${w.id}`);
  if (!Array.isArray(w.belligerents) || w.belligerents.length !== 2) err(`war ${w.id}: belligerents must be two opposing sets`);
  for (const side of w.belligerents || []) for (const pw of side) if (!powerById.has(pw)) err(`war ${w.id}: unknown belligerent '${pw}'`);
  for (const th of w.theatres || []) if (!REGIONS.has(th)) err(`war ${w.id}: unknown theatre region '${th}'`);
}

// ---- validate: names -----------------------------------------------------
for (const pid of Object.keys(names.themesByPower || {})) {
  if (!powerById.has(pid)) err(`names.themesByPower: unknown power '${pid}'`);
}
for (const pw of powers) {
  // Nations declare their own name themes; companies inherit their parent nation's;
  // shore 'powers' (african, qing) never spawn vessels, so need none.
  if (pw.kind !== 'nation') continue;
  if (!names.themesByPower[pw.id]) err(`names: no themesByPower entry for spawning nation '${pw.id}'`);
}

// ---- validate: era-weights (PLAN-2 flowing-clock spawn weights) -----------
// Every sim port must have a weight in every decade of the flowing window, and
// every listed port must be a real sim port. Weights must be finite and positive.
{
  const byDecade = eraWeights.byDecade || {};
  const wPorts = eraWeights.ports || [];
  for (const pid of wPorts) if (!portById.has(pid)) err(`era-weights: unknown port '${pid}'`);
  for (const p of ports) if (!wPorts.includes(p.id)) err(`era-weights: missing port '${p.id}' from ports[]`);
  const decades = Object.keys(byDecade).map(Number).sort((a, b) => a - b);
  if (!decades.length) err('era-weights: byDecade is empty');
  else {
    if (decades[0] > ERA.from + 5) err(`era-weights: first decade ${decades[0]} starts after ${ERA.from}`);
    if (decades[decades.length - 1] < ERA.to - 15) err(`era-weights: last decade ${decades[decades.length - 1]} ends before ${ERA.to}`);
    // decades must be a contiguous 10-year grid (so midpoint interpolation has no gaps)
    for (let i = 1; i < decades.length; i++) if (decades[i] - decades[i - 1] !== 10) err(`era-weights: non-contiguous decades ${decades[i - 1]}→${decades[i]}`);
    for (const d of decades) {
      const row = byDecade[d];
      for (const p of ports) {
        const w = row ? row[p.id] : undefined;
        if (typeof w !== 'number' || !(w > 0) || !Number.isFinite(w)) err(`era-weights ${d}s: port ${p.id} weight must be a finite positive number (got ${w})`);
      }
    }
  }
}

// ---- plausibility self-check (a miniature of PLAN §4 generation) ---------
// Deterministic PRNG so the check is reproducible.
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rnd = mulberry32(0x1D_5A11 >>> 0);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const weightedRoute = (yr) => {
  const active = routes.filter(r => yr >= r.era.from && yr <= r.era.to);
  const total = active.reduce((s, r) => s + (r.weight || 1), 0);
  let x = rnd() * total;
  for (const r of active) { x -= (r.weight || 1); if (x <= 0) return r; }
  return active[active.length - 1];
};

let generated = 0, contradictions = 0;
if (missingFields === 0 && errors.length === 0) {
  for (let i = 0; i < SELFCHECK_N; i++) {
    const yr = ERA.from + Math.floor(rnd() * (ERA.to - ERA.from + 1));
    const route = weightedRoute(yr);
    if (!route) continue;
    // ship-type compatible with {route, year}
    const candidates = route.shipTypes.map(id => shipById.get(id)).filter(s => s && yr >= s.era.from && yr <= s.era.to);
    if (!candidates.length) continue; // year has no valid type for this lane; generator would reroll
    const type = pick(candidates);
    const power = powerById.get(route.flag);
    const cargoId = pick(route.cargo);
    const tonnage = Math.round(type.tonnage.min + rnd() * (type.tonnage.max - type.tonnage.min));
    generated++;

    // assertions — every field shown in the sidebar must have a plausible origin
    const problems = [];
    if (yr < route.era.from || yr > route.era.to) problems.push('year outside route era');
    if (yr < type.era.from || yr > type.era.to) problems.push('year outside ship-type era');
    if (!power) problems.push(`route flag '${route.flag}' not a power`);
    else if (yr < power.era.from || yr > power.era.to) problems.push(`flag ${power.id} inactive in ${yr}`);
    if (!route.cargo.includes(cargoId)) problems.push('cargo not on route');
    if (cargoId === 'enslaved-people' && !route.middlePassage) problems.push('enslaved-people off a Middle-Passage lane');
    if (tonnage < type.tonnage.min || tonnage > type.tonnage.max) problems.push('tonnage out of range');
    if (!ROUTE_CLASSES.includes(type.routeClass)) problems.push('type has no baked route class');
    if (problems.length) { contradictions++; if (contradictions <= 10) err(`self-check vessel #${i} (${route.id}/${type.id}/${yr}): ${problems.join('; ')}`); }
  }
}

// ---- report / emit -------------------------------------------------------
if (errors.length) {
  console.error(`\n✗ build-data: ${errors.length} problem(s):\n`);
  for (const e of errors) console.error('  - ' + e);
  console.error('');
  process.exit(1);
}

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const bundle = {
  version: DATASET_VERSION,
  era: ERA,
  routeClasses: ROUTE_CLASSES,
  seasons: SEASONS,
  ports, powers, shipTypes, cargo, routes, wars, names, eraWeights
};
writeFileSync(join(OUT, 'datasets.json'), JSON.stringify(bundle));
if (existsSync(LAND_SRC)) copyFileSync(LAND_SRC, join(OUT, 'land.geojson'));

const kb = (Buffer.byteLength(JSON.stringify(bundle)) / 1024).toFixed(1);
console.log('✓ build-data: all datasets valid.');
console.log(`  ports ${ports.length} · powers ${powers.length} · ship-types ${shipTypes.length} · cargo ${cargo.length} · routes ${routes.length} · wars ${wars.length}`);
console.log(`  baked-field references: ${neededFields.size} (all present)`);
console.log(`  plausibility self-check: ${generated} vessels generated, ${contradictions} contradictions`);
console.log(`  → data/datasets.json (${kb} KB)${existsSync(LAND_SRC) ? ' + land.geojson' : ''}`);
