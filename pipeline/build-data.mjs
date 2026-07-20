#!/usr/bin/env node
// build-data.mjs — validate the hand-authored data-src/*.json datasets, run a
// procedural-generation plausibility self-check, and bundle everything into a
// single versioned data/datasets.json. Also copies the coastline into place.
//
//   node pipeline/build-data.mjs
//
// Exit 0 on success; non-zero with a report of every error found (it collects
// ALL problems before failing, so one run surfaces the whole list).

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const SRC = join(ROOT, 'data-src');
const OUT = join(ROOT, 'data');
const ARCHIVE_FIELDS = join(ROOT, 'archive', 'isochrone-v1', 'docs', 'data', 'fields');
const LAND_SRC = join(ROOT, 'archive', 'isochrone-v1', 'docs', 'assets', 'land.geojson');

const DATASET_VERSION = 5;              // v5: era extended 1550→1850 (PLAN-6); 310-yr cycle — invalidates v4 saves
const ERA = { from: 1550, to: 1850 };   // flowing-clock scope (Phase-1 X-S1: 1815→1850)
const ROUTE_CLASSES = ['frigate', 'indiaman', 'brig', 'slaver', 'junk', 'dhow'];   // junk/dhow: own polars since S2
const SEASONS = ['djf', 'mam', 'jja', 'son'];
const REGIONS = new Set(['britain', 'lowlands', 'france', 'iberia', 'baltic', 'caribbean',
  'brazil', 'west-africa', 'east-indies', 'china', 'india', 'japan', 'north-america', 'europe',
  // diversity-layer regions (PLAN-2 §5): in the cargo/power vocabulary now,
  // gaining ports when Phase B bakes the minor-port routes.
  'east-asia', 'indian-ocean', 'arabia', 'persian-gulf', 'east-africa',
  'arctic', 'mediterranean', 'black-sea', 'north-pacific', 'south-pacific']);
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
// convoys (movement-realism branch, PLAN-convoys.md): optional — the classic
// build has no convoys.json, so tolerate its absence.
let convoys = null;
try { convoys = load('convoys.json'); } catch { convoys = null; }

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
  // port lifecycle window (optional; absent = the port existed all era)
  if (p.active !== undefined) inEra(p.active, `port ${p.id} active`);
  // era names (optional): when the dot stands for different dominant ports
  // across the era (Louisbourg=St John's, Kingston=Port Royal…), eraNames must
  // tile the port's ACTIVE window exactly — contiguous, ordered, no gaps — so
  // the chart always has exactly one honest name to show.
  if (p.eraNames !== undefined) {
    const w = p.active || ERA;
    if (!Array.isArray(p.eraNames) || !p.eraNames.length) err(`port ${p.id}: eraNames must be a non-empty array`);
    let expect = w.from;
    for (const en of p.eraNames || []) {
      if (!en.name) err(`port ${p.id}: eraNames entry missing name`);
      inEra({ from: en.from, to: en.to }, `port ${p.id} eraNames '${en.name}'`);
      if (en.from !== expect) err(`port ${p.id}: eraNames '${en.name}' starts ${en.from}, expected ${expect} (must tile the window)`);
      expect = en.to + 1;
    }
    if (expect !== w.to + 1) err(`port ${p.id}: eraNames end ${expect - 1}, must reach the window end ${w.to}`);
  }
  // era powers (optional): when the flag over a dot changes mid-era (Algiers to
  // France in 1830, Callao to Peru, Valparaíso to Chile). Validated on the same
  // terms as eraNames — known power, in era, tiling the active window exactly —
  // because nothing CONSUMES this field yet, and an unvalidated field is one
  // that rots silently until the day something finally reads it.
  if (p.eraPowers !== undefined) {
    const w = p.active || ERA;
    if (!Array.isArray(p.eraPowers) || !p.eraPowers.length) err(`port ${p.id}: eraPowers must be a non-empty array`);
    let expect = w.from;
    for (const ep of p.eraPowers || []) {
      if (!powerById.has(ep.power)) err(`port ${p.id}: eraPowers unknown power '${ep.power}'`);
      inEra({ from: ep.from, to: ep.to }, `port ${p.id} eraPowers '${ep.power}'`);
      if (ep.from !== expect) err(`port ${p.id}: eraPowers '${ep.power}' starts ${ep.from}, expected ${expect} (must tile the window)`);
      expect = ep.to + 1;
    }
    if (expect !== w.to + 1) err(`port ${p.id}: eraPowers end ${expect - 1}, must reach the window end ${w.to}`);
  }
}
// The port-lifecycle window a lane must respect (default: the whole era).
const portWindow = (id) => portById.get(id)?.active || ERA;

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
  // Port-lifecycle invariant: a lane may only sail while BOTH its endpoints
  // exist — no vessel may ever be scheduled to a not-yet-founded or destroyed
  // port. (Spawning, chaining, and fades are all lane-era-gated in world.js,
  // so this data invariant IS the behavioral guarantee.)
  for (const pid of [r.from, r.to]) {
    const w = portWindow(pid);
    if (r.era.from < w.from || r.era.to > w.to)
      err(`route ${r.id}: era ${r.era.from}-${r.era.to} outside port ${pid}'s lifecycle ${w.from}-${w.to}`);
  }
}

// ---- validate: port feasibility (S2) ---------------------------------------
// The baker computes fields per destination at bake time (no archived .bin
// needed), so feasibility = every port snaps to an ocean cell of the 1° grid
// within a sane distance. Uses the archive's grid mask directly.
let missingFields = 0;
{
  const gridPath = join(ROOT, 'archive', 'isochrone-v1', 'pipeline', 'build', 'grid.json');
  if (!existsSync(gridPath)) { err(`archive grid not found: ${gridPath}`); missingFields++; }
  else {
    const g = JSON.parse(readFileSync(gridPath, 'utf8'));
    const gmask = g.mask;
    const colOf = (lon) => Math.max(0, Math.min(359, Math.floor(((lon + 180) % 360 + 360) % 360)));
    const rowOf = (lat) => Math.max(0, Math.min(179, Math.floor(lat + 90)));
    for (const p of ports) {
      let ok = false;
      for (let dr = -2; dr <= 2 && !ok; dr++) for (let dc = -2; dc <= 2 && !ok; dc++) {
        const r = rowOf(p.lat) + dr, c = (colOf(p.lon) + dc + 360) % 360;
        if (r >= 0 && r < 180 && gmask[r * 360 + c] === 0) ok = true;
      }
      if (!ok) { err(`port ${p.id}: no ocean cell within 2° of (${p.lon}, ${p.lat}) — cannot snap for routing`); missingFields++; }
    }
  }
}

// ---- validate: wars ------------------------------------------------------
uniq(wars, 'id', 'wars');
for (const w of wars) {
  inEra({ from: w.from, to: w.to }, `war ${w.id}`);
  if (!w.hazard && (!Array.isArray(w.belligerents) || !w.belligerents.length || w.belligerents.length !== 2 || !w.belligerents[0].length)) err(`war ${w.id}: belligerents must be two opposing sets (or set hazard:true for flag-agnostic risk)`);
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
// captains (feature pass 3): every naming culture needs a shipmaster pool of a
// valid shape — either a `full` list, or `given` (with optional `surname`,
// `prefix`/`suffix` title carried in the name, and `order:'sf'` surname-first).
for (const [cid, c] of Object.entries(names.captains || {})) {
  if (!names.themesByPower[cid]) err(`names.captains: '${cid}' is not a naming culture (no themesByPower entry)`);
  const okShape = (Array.isArray(c.full) && c.full.length) ||
    (Array.isArray(c.given) && c.given.length && (!c.surname || (Array.isArray(c.surname) && c.surname.length)));
  if (!okShape) err(`names.captains.${cid}: needs a non-empty 'full' list or 'given' (+optional 'surname') lists`);
  if (c.order === 'sf' && !(Array.isArray(c.surname) && c.surname.length)) err(`names.captains.${cid}: order 'sf' needs surnames`);
}
for (const cid of Object.keys(names.themesByPower || {})) {
  if (!(names.captains || {})[cid]) err(`names.captains: no shipmaster pool for naming culture '${cid}'`);
}

// ---- fold the flow matrix onto the baked lanes (PLAN-3 S1) -----------------
// Each flow lane folds via its ports' simProxy onto a (from,to) sim pair; the
// folded share is distributed across the baked trade lanes of that pair in
// proportion to their static weights. Naval lanes are excluded (state voyages
// sit outside the commercial flow matrix; world.js gives them a fixed pool).
// Unfoldable volume — null proxies, self-pairs, pairs with no baked lane — is
// DROPPED for Phase A and reported as coverage: the record keeps the trade,
// the 15-port world simply can't sail all of it yet (S2's job).
const FLOWS_DIR = join(ROOT, 'research', 'flows');
const flowSystems = [];
const laneEvidenceVotes = {};   // laneId → {evidence: volume} → dominant class per lane
let covReport = '';
{
  if (!existsSync(FLOWS_DIR)) err(`flows dir not found: ${FLOWS_DIR} (PLAN-3 R2/R3)`);
  else {
    const files = readdirSync(FLOWS_DIR).filter(f => f.endsWith('.json') && f !== 'silences.json');
    const proxy = {};
    const basinsRaw = files.map(f => JSON.parse(readFileSync(join(FLOWS_DIR, f), 'utf8')));
    for (const B of basinsRaw) for (const p of B.ports || []) proxy[p.id] = p.simProxy;
    // baked-pair index over TRADE lanes only
    const pairIdx = new Map();
    for (const r of routes) {
      if (r.naval) continue;
      const k = `${r.from}->${r.to}`;
      if (!pairIdx.has(k)) pairIdx.set(k, []);
      pairIdx.get(k).push(r);
    }
    const covByDec = {};   // decade → { folded, total } (midpoint-volume weighted)
    for (const B of basinsRaw) for (const s of B.systems || []) {
      const folded = {};
      let foldedShare = 0;
      for (const l of s.lanes || []) {
        const pf = proxy[l.from], pt = proxy[l.to];
        if (!pf || !pt || pf === pt) continue;
        // A flow system may only fold onto lanes that were actually sailing while it
        // ran: endpoint identity is not enough. Batavia->Amsterdam is sailed by the
        // VOC lane (dead 1795) AND the post-1824 Netherlands lane; without this gate
        // the NHM's volume pours into a route no ship has taken for thirty years.
        const se = s.era || ERA;
        const cands = (pairIdx.get(`${pf}->${pt}`) || [])
          .filter((r) => r.era.from <= se.to && r.era.to >= se.from);
        if (!cands.length) continue;
        const wsum = cands.reduce((x, r) => x + (r.weight || 1), 0);
        for (const r of cands) folded[r.id] = (folded[r.id] || 0) + l.share * (r.weight || 1) / wsum;
        foldedShare += l.share;
      }
      for (const [d, v] of Object.entries(s.byDecade)) {
        const mid = (v.voyagesPerYear[0] + v.voyagesPerYear[1]) / 2;
        covByDec[d] = covByDec[d] || { folded: 0, total: 0 };
        covByDec[d].folded += mid * foldedShare; covByDec[d].total += mid;
      }
      if (Object.keys(folded).length) {
        const byDecade = {};
        for (const [d, v] of Object.entries(s.byDecade)) byDecade[d] = v.voyagesPerYear;
        flowSystems.push({ id: s.id, basin: B.basin, evidence: s.evidence, byDecade, lanes: folded });
        // accumulate per-lane evidence votes (weighted by folded share x mean volume)
        const decsAll = Object.keys(s.byDecade);
        const meanMid = decsAll.reduce((a, d) => a + (s.byDecade[d].voyagesPerYear[0] + s.byDecade[d].voyagesPerYear[1]) / 2, 0) / decsAll.length;
        for (const [lid, sh] of Object.entries(folded)) {
          laneEvidenceVotes[lid] = laneEvidenceVotes[lid] || {};
          laneEvidenceVotes[lid][s.evidence] = (laneEvidenceVotes[lid][s.evidence] || 0) + sh * meanMid;
        }
      }
    }
    for (const [lid] of pairIdx) void lid;
    covReport = [1550, 1650, 1750, 1810, 1850].map(d => `${d}s ${covByDec[d] ? Math.round(100 * covByDec[d].folded / covByDec[d].total) : 0}%`).join(' · ');
    if (!flowSystems.length) err('flows: no system folds onto any baked lane');
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

// ---- port panel blurbs (Phase-4 T2) --------------------------------------
// research/port-docs.json carries a `blurb` per port — a string, or an array of
// {from,to,text} windows validated to tile the active window (name/ownership
// changed the port's character). Injected onto the emitted port so the panel
// shows the era-appropriate sentence; the fuller `doc` + `sources` stay in
// port-docs.json for research/ports.html.
const DOCS_SRC = join(ROOT, 'research', 'port-docs.json');
if (existsSync(DOCS_SRC)) {
  const docs = JSON.parse(readFileSync(DOCS_SRC, 'utf8')).ports || {};
  let blurbed = 0;
  for (const p of ports) {
    const d = docs[p.id]; if (!d || d.blurb == null) continue;
    if (Array.isArray(d.blurb)) {
      const w = p.active || ERA; let expect = w.from;
      for (const b of d.blurb) {
        if (!b.text) err(`port-docs ${p.id}: a blurb window is missing text`);
        if (b.from !== expect) err(`port-docs ${p.id}: blurb window starts ${b.from}, expected ${expect} (must tile the active window)`);
        expect = b.to + 1;
      }
      if (expect !== w.to + 1) err(`port-docs ${p.id}: blurb windows end ${expect - 1}, must reach the window end ${w.to}`);
    }
    p.blurb = d.blurb; blurbed++;
  }
  console.log(`  port blurbs: ${blurbed}/${ports.length} ports carry a panel blurb (research/port-docs.json)`);
}

// ---- convoy rules (movement-realism branch, PLAN-convoys.md §5) -----------
if (convoys) {
  const laneSystems = new Set(routes.map(r => r.system).filter(Boolean));
  const excludedSystems = new Set(routes.filter(r => r.middlePassage || r.framing).map(r => r.system).filter(Boolean));
  const rp = convoys.reprieve;
  if (!rp || typeof rp.q !== 'number' || rp.q < 0 || rp.q > 1) err('convoys.json: reprieve.q must be a number in [0,1]');
  if (!rp || !Array.isArray(rp.causes) || !rp.causes.length) err('convoys.json: reprieve.causes must be a non-empty array');
  if (!Array.isArray(convoys.rules)) err('convoys.json: rules must be an array');
  for (const [i, rule] of (convoys.rules || []).entries()) {
    const tag = `convoys rule ${i}`;
    if (!rule.match || typeof rule.match !== 'object') { err(`${tag}: missing match`); continue; }
    if (rule.match.system !== undefined) {
      if (!laneSystems.has(rule.match.system)) err(`${tag}: match.system '${rule.match.system}' is not a flow system on any lane`);
      // charter: convoys never grace a coerced-flow lane
      if (excludedSystems.has(rule.match.system)) err(`${tag}: '${rule.match.system}' is a coerced-flow (middlePassage/framing) system — no convoy there`);
    } else if (rule.match.war !== true) {
      err(`${tag}: match must carry a system or war:true`);
    }
    if (rule.match.flags !== undefined) {
      if (!Array.isArray(rule.match.flags) || !rule.match.flags.length) err(`${tag}: match.flags must be a non-empty array`);
      else for (const f of rule.match.flags) if (!powerById.has(f)) err(`${tag}: match.flags unknown power '${f}'`);
    }
    if (typeof rule.rate !== 'number' || rule.rate < 0 || rule.rate > 1) err(`${tag}: rate must be a number in [0,1]`);
    if (!Array.isArray(rule.size) || rule.size.length !== 2 || !(rule.size[0] >= 2) || !(rule.size[1] >= rule.size[0])) err(`${tag}: size must be [min>=2, max>=min]`);
    if (!['always', 'war', 'never'].includes(rule.escort)) err(`${tag}: escort must be always|war|never`);
    if (rule.era !== undefined) inEra(rule.era, `${tag} era`);
    if (!rule.class) err(`${tag}: missing evidence class (charter: no undeclared sim rules)`);
    if (!rule.note) err(`${tag}: missing note`);
  }
}

// ---- report / emit -------------------------------------------------------
if (errors.length) {
  console.error(`\n✗ build-data: ${errors.length} problem(s):\n`);
  for (const e of errors) console.error('  - ' + e);
  console.error('');
  process.exit(1);
}

// Port DISPLAY coordinates (Phase-3 tweak): a port's routing coord may sit a few
// km offshore so it snaps to an ocean cell (Newcastle in the North Sea roads;
// Portobelo nudged N in Phase 1). Snap the DISPLAY dot to the nearest point on the
// fine coastline (land.geojson) so the dot sits on the shore — routing is
// UNCHANGED (the sim still sails to lon/lat). Skip grounds-node stations and snaps
// beyond 60 km (tiny islands absent from the 50m coastline, e.g. Banda Neira).
if (existsSync(LAND_SRC)) {
  const land = JSON.parse(readFileSync(LAND_SRC, 'utf8'));
  const hkm = (ax, ay, bx, by) => { const Rk = 6371, D = Math.PI / 180, dLa = (by - ay) * D, dLo = (bx - ax) * D; const x = Math.sin(dLa / 2) ** 2 + Math.cos(ay * D) * Math.cos(by * D) * Math.sin(dLo / 2) ** 2; return 2 * Rk * Math.asin(Math.min(1, Math.sqrt(x))); };
  const nearestCoast = (lon, lat) => {
    let best = Infinity, bp = null;
    for (const f of land.features) { const bb = f.bbox; if (bb && (lon < bb[0] - 1.2 || lon > bb[2] + 1.2 || lat < bb[1] - 1.2 || lat > bb[3] + 1.2)) continue;
      const g = f.geometry, polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
      for (const poly of polys) for (const ring of poly) for (let i = 1; i < ring.length; i++) {
        const a = ring[i - 1], b = ring[i], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
        let t = l2 ? ((lon - a[0]) * dx + (lat - a[1]) * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
        const px = a[0] + t * dx, py = a[1] + t * dy, d = hkm(lon, lat, px, py); if (d < best) { best = d; bp = [px, py]; } } }
    return { d: best, p: bp };
  };
  let snapped = 0;
  for (const p of ports) {
    if (p.roles && p.roles.includes('station')) continue;
    const n = nearestCoast(p.lon, p.lat);
    if (n.p && n.d > 6 && n.d < 60) { p.displayLon = +n.p[0].toFixed(3); p.displayLat = +n.p[1].toFixed(3); snapped++; }
  }
  console.log(`  display coords: ${snapped} port dots snapped to the coastline (routing unchanged)`);
}

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const bundle = {
  version: DATASET_VERSION,
  era: ERA,
  routeClasses: ROUTE_CLASSES,
  seasons: SEASONS,
  ports, powers, shipTypes, cargo, routes, wars, names,
  flows: { note: 'PLAN-3 S1: flow systems folded onto the baked lanes; [lo,hi] voyage ranges realized per-seed by world.js. laneEvidence = each lane\'s dominant evidence class (S3: surfaced in the ledger).', systems: flowSystems,
    laneEvidence: Object.fromEntries(Object.entries(laneEvidenceVotes).map(([lid, v]) => [lid, Object.entries(v).sort((a, b) => b[1] - a[1])[0][0]])) },
  // movement-realism branch: convoy rules (absent on classic main → key omitted)
  ...(convoys ? { convoys } : {})
};
writeFileSync(join(OUT, 'datasets.json'), JSON.stringify(bundle));
if (existsSync(LAND_SRC)) copyFileSync(LAND_SRC, join(OUT, 'land.geojson'));

const kb = (Buffer.byteLength(JSON.stringify(bundle)) / 1024).toFixed(1);
console.log('✓ build-data: all datasets valid.');
console.log(`  ports ${ports.length} · powers ${powers.length} · ship-types ${shipTypes.length} · cargo ${cargo.length} · routes ${routes.length} · wars ${wars.length}`);
console.log(`  port feasibility: all ${ports.length} ports snap to ocean cells`);
console.log(`  plausibility self-check: ${generated} vessels generated, ${contradictions} contradictions`);
console.log(`  flow systems folded onto baked lanes: ${flowSystems.length} · volume coverage ${covReport}`);
console.log(`  → data/datasets.json (${kb} KB)${existsSync(LAND_SRC) ? ' + land.geojson' : ''}`);
