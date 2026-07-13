#!/usr/bin/env node
// gen-lanes.mjs — PLAN-3 S2: generate the expanded lane set from the two
// authored sources, in priority order:
//   1. the promotion queue (research/minor-ports-promotion.json) — hand-quality
//      lanes for the tranche-1 + exception ports now in the sim universe;
//   2. the flow matrix (research/flows/*.json) — every flow lane whose two
//      simProxy endpoints are real, distinct sim ports and whose pair is not
//      already covered by a hand or queue lane.
// Idempotent: refuses to run if generated lanes (id prefix q-/f-) are present.
// Inserts into data-src/routes.json preserving the hand-authored section.
//
//   node pipeline/gen-lanes.mjs

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const load = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

const routesRaw = readFileSync(join(ROOT, 'data-src', 'routes.json'), 'utf8');
if (/"id": "[qf]-/.test(routesRaw)) { console.error('generated lanes already present — refusing to run twice'); process.exit(1); }
const routesJ = JSON.parse(routesRaw);
const ports = load('data-src/ports.json').ports;
const powers = load('data-src/powers.json').powers;
const ships = load('data-src/ship-types.json').shipTypes;
const queue = load('research/minor-ports-promotion.json').ports;

const portById = new Map(ports.map(p => [p.id, p]));
const powerById = new Map(powers.map(p => [p.id, p]));
const shipIds = new Set(ships.map(s => s.id));
const pairs = new Set(routesJ.routes.map(r => `${r.from}->${r.to}`));
const spawning = (id) => { const p = powerById.get(id); return p && p.kind !== 'shore'; };
const clampEraToFlag = (era, flag) => {
  const p = powerById.get(flag);
  return { from: Math.max(era.from, p.era.from, 1550), to: Math.min(era.to, p.era.to, 1815) };
};
const nameOf = (id) => (portById.get(id)?.name || id).replace(/\s*\(.*\)/, '');
const out = [];

// ---- 1. promotion-queue lanes for in-universe ports ------------------------
const MP_FRAME = 'Captive people carried against their will. Recorded, not celebrated: no value framing, elevated attrition. See cargo.enslaved-people.';
for (const q of queue) {
  if (!portById.has(q.id)) continue;
  for (const l of q.lanes || []) {
    if (!portById.has(l.with) || !l.flag || !spawning(l.flag)) continue;
    const era = clampEraToFlag(l.era || q.era, l.flag);
    if (era.from > era.to) continue;
    const types = (l.shipTypes || []).filter(t => shipIds.has(t));
    if (!types.length) continue;
    const mk = (from, to, cargo, dir) => {
      if (!cargo || !cargo.length || pairs.has(`${from}->${to}`)) return;
      pairs.add(`${from}->${to}`);
      out.push({ id: `q-${from}-${to}`, system: `q-${q.id}`, name: `${nameOf(from)} to ${nameOf(to)} (${q.name.replace(/\s*\(.*\)/, '')} trade)`,
        from, to, shipTypes: types, cargo, era, weight: l.weight || 1, flag: l.flag,
        ...(l.note ? { note: l.note } : {}) });
    };
    mk(q.id, l.with, l.out, 'out');
    mk(l.with, q.id, l.home, 'home');
  }
}

// ---- 2. flow-matrix lanes ---------------------------------------------------
// carrier flag per system; 'byOrigin'/'byDest' resolve per-lane via port powers.
const FLAG_BY_SYSTEM = {
  'carrera-de-indias': 'spain', 'brazil-fleets': 'portugal',
  'middle-passage': 'byDest', 'guinea-outward': 'byOrigin',
  'wine-salt-north': 'byOrigin', 'newfoundland-cod': 'byOrigin',
  'caribbean-sugar': 'byColony', 'chesapeake-tobacco': 'britain',
  'new-england-caribbean': 'britain', 'caribbean-smuggling': 'wic',
  'baltic-grain-west': 'dutch', 'baltic-timber-naval-west': 'dutch',
  'swedish-iron-west': 'sweden', 'baltic-general-west': 'hansa',
  'baltic-return-east': 'dutch', 'petersburg-west': 'britain',
  'norway-timber-fish-west': 'denmark', 'english-coal-foreign': 'britain',
  'english-coastal-colliers': 'britain', 'white-sea-west': 'byOrigin',
  'svalbard-whaling': 'byOrigin', 'baltic-intra': 'hansa', 'north-sea-shorthaul': 'byOrigin',
  'levant-trade': 'byOrigin', 'italian-grain': 'naples', 'venice-adriatic': 'venice',
  'ragusa-carrying': 'ragusa', 'marseille-trade': 'france',
  'ottoman-provisioning': 'ottoman', 'greek-ottoman-coasting': 'ottoman',
  'habsburg-genoa-route': 'byOrigin', 'black-sea-slave-trade': 'ottoman',
  'carreira-da-india': 'portugal', 'gujarat-red-sea': 'mughal',
  'persian-gulf-trade': 'byOrigin', 'malabar-pepper-coastal': 'mughal',
  'country-trade-west': 'eic', 'eic-india-arterial': 'eic',
  'minor-company-arterials': 'byOrigin', 'coromandel-se-asia': 'mughal',
  'spice-islands': 'voc', 'bugis-carrying': 'bugis', 'manila-galleon': 'spain',
  'bengal-country-trade': 'eic', 'canton-arterial': 'byOrigin',
  'nanyang-junk-trade': 'china-junk-trade', 'china-japan-junks': 'china-junk-trade',
  'macau-nagasaki': 'portugal', 'ryukyu-tribute': 'ryukyu',
  'china-coastal-grain': 'china-junk-trade'
};
// byOrigin/byDest/byColony resolution: the port's controlling power, folded to a
// spawning flag (colonial ports resolve to their metropole's flag already).
function resolveFlag(rule, sf, st, system) {
  // US flag for the post-1784 American China trade
  if (system === 'canton-arterial' && ['boston', 'new-york', 'philadelphia'].includes(sf === 'canton' ? st : sf)) return 'usa';
  let pick = rule;
  if (rule === 'byOrigin') pick = portById.get(sf).power;
  else if (rule === 'byDest') pick = portById.get(st).power;
  else if (rule === 'byColony') { // the colonial endpoint names the empire
    const colonial = ['kingston', 'bridgetown', 'cap-francais', 'st-eustatius', 'havana'].includes(sf) ? sf : st;
    pick = portById.get(colonial)?.power || portById.get(sf).power;
  }
  if (!spawning(pick)) pick = portById.get(st).power;   // shore-power origin (whydah…): use the other end
  if (!spawning(pick)) return null;
  return pick;
}

const basins = readdirSync(join(ROOT, 'research', 'flows')).filter(f => f.endsWith('.json') && f !== 'silences.json');
const byPair = new Map();   // "sf->st" → { vol, systems: Map(sysId→vol), cargo:Set, types:Set, eras:[], mp, frames }
for (const file of basins) {
  const B = load(`research/flows/${file}`);
  const proxy = Object.fromEntries(B.ports.map(p => [p.id, p.simProxy]));
  for (const s of B.systems) {
    const decs = Object.keys(s.byDecade).map(Number);
    const midVol = decs.reduce((a, d) => a + (s.byDecade[d].voyagesPerYear[0] + s.byDecade[d].voyagesPerYear[1]) / 2, 0) / decs.length;
    for (const l of s.lanes) {
      const sf = proxy[l.from], st = proxy[l.to];
      if (!sf || !st || sf === st || !portById.has(sf) || !portById.has(st)) continue;
      const k = `${sf}->${st}`;
      if (pairs.has(k)) continue;                        // hand/queue lane already carries this pair
      if (!byPair.has(k)) byPair.set(k, { sf, st, vol: 0, systems: new Map(), cargo: new Set(), types: new Set(), eraFrom: 9999, eraTo: 0, mp: false });
      const e = byPair.get(k);
      const v = midVol * l.share;
      e.vol += v; e.systems.set(s.id, (e.systems.get(s.id) || 0) + v);
      for (const c of s.cargo) e.cargo.add(c);
      for (const t of s.shipTypes) if (shipIds.has(t)) e.types.add(t);
      e.eraFrom = Math.min(e.eraFrom, Math.floor(s.era.from / 10) * 10 <= 1550 ? 1550 : s.era.from);
      e.eraTo = Math.max(e.eraTo, Math.min(s.era.to, 1815));
      if (s.framing && s.framing.sober) e.mp = true;
    }
  }
}
const maxVol = Math.max(...[...byPair.values()].map(e => e.vol), 1);
let skippedFlag = 0;
for (const e of byPair.values()) {
  const dom = [...e.systems.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const rule = FLAG_BY_SYSTEM[dom] || 'byOrigin';
  const flag = resolveFlag(rule, e.sf, e.st, dom);
  if (!flag) { skippedFlag++; continue; }
  const era = clampEraToFlag({ from: e.eraFrom, to: e.eraTo }, flag);
  if (era.from > era.to) { skippedFlag++; continue; }
  const lane = {
    id: `f-${e.sf}-${e.st}`, system: dom,
    name: `${nameOf(e.sf)} to ${nameOf(e.st)}`,
    from: e.sf, to: e.st,
    shipTypes: e.mp ? ['slave-ship'] : [...e.types].slice(0, 3),
    cargo: e.mp ? ['enslaved-people'] : [...e.cargo].slice(0, 4),
    era, weight: Math.max(1, Math.min(9, Math.round(9 * e.vol / maxVol))), flag
  };
  if (e.mp) { lane.middlePassage = true; lane.framing = MP_FRAME; }
  pairs.add(`${e.sf}->${e.st}`);
  out.push(lane);
}

// ---- emit -------------------------------------------------------------------
const lines = out.map(l => '    ' + JSON.stringify(l));
const marker = '\n    /*GEN*/';
const insertion = ',\n\n' + lines.join(',\n') + '\n  ]\n}';
const newRaw = routesRaw.replace(/\n  \]\n\}\s*$/, insertion);
writeFileSync(join(ROOT, 'data-src', 'routes.json'), newRaw);
const mp = out.filter(l => l.middlePassage).length;
console.log(`✓ gen-lanes: +${out.length} lanes (${out.filter(l => l.id.startsWith('q-')).length} queue, ${out.filter(l => l.id.startsWith('f-')).length} flow; ${mp} sober-framed human-cargo lanes; ${skippedFlag} pairs skipped for no spawnable flag)`);
console.log(`  total lanes now: ${routesJ.routes.length + out.length}`);
