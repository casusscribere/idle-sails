// PLAN-3 R2 — flow-matrix validator (see research/flows/_schema.md).
// Structural checks are hard errors; historical cross-checks are reported.
//   node research/tools/validate-flows.mjs

import { readFileSync, readdirSync } from "node:fs";
const ROOT = "/home/kirk/REPOS_LINUX/idle_sails";
const load = (p) => JSON.parse(readFileSync(`${ROOT}/${p}`, "utf8"));
const DEC = []; for (let d = 1550; d <= 1850; d += 10) DEC.push(d);

const cargoIds = new Set(load("data-src/cargo.json").cargo.map(c => c.id));
const shipIds = new Set(load("data-src/ship-types.json").shipTypes.map(s => s.id));
const simIds = new Set(load("data-src/ports.json").ports.map(p => p.id));
const EVIDENCE = new Set(["counted", "proxied", "reconstructed", "asserted"]);
const errs = [], notes = [];

const basins = readdirSync(`${ROOT}/research/flows`).filter(f => f.endsWith(".json") && f !== "silences.json");
let nSystems = 0, nDecades = 0;
const basinData = {};
const proxyOf = {};   // port id → simProxy, must agree across basins

for (const file of basins) {
  const B = load(`research/flows/${file}`); basinData[B.basin] = B;
  const ctx = B.basin;
  const portIds = new Set();
  for (const p of B.ports || []) {
    if (portIds.has(p.id)) errs.push(`${ctx}: duplicate port ${p.id}`);
    portIds.add(p.id);
    if (p.simProxy !== null && !simIds.has(p.simProxy)) errs.push(`${ctx}: port ${p.id} simProxy '${p.simProxy}' is not a sim port`);
    if (p.id in proxyOf && proxyOf[p.id] !== p.simProxy) errs.push(`${ctx}: port ${p.id} simProxy '${p.simProxy}' conflicts with another basin's '${proxyOf[p.id]}'`);
    proxyOf[p.id] = p.simProxy;
  }
  const sysIds = new Set();
  for (const s of B.systems || []) {
    nSystems++;
    const sc = `${ctx}/${s.id}`;
    if (sysIds.has(s.id)) errs.push(`${sc}: duplicate system id`); sysIds.add(s.id);
    if (!EVIDENCE.has(s.evidence)) errs.push(`${sc}: bad evidence '${s.evidence}'`);
    if (!s.basis || s.basis.length < 10) errs.push(`${sc}: basis is required (source or reasoning)`);
    for (const c of s.cargo || []) if (!cargoIds.has(c)) errs.push(`${sc}: unknown cargo '${c}'`);
    for (const t of s.shipTypes || []) if (!shipIds.has(t)) errs.push(`${sc}: unknown shipType '${t}'`);
    // PLAN-3 §1 rule 6: coerced human movement carries the sober framing block, always.
    if ((s.cargo || []).includes("enslaved-people") && !(s.framing && s.framing.sober === true))
      errs.push(`${sc}: carries enslaved-people but lacks a framing{sober:true} block (charter rule 6)`);
    let shareSum = 0;
    for (const l of s.lanes || []) {
      if (!portIds.has(l.from)) errs.push(`${sc}: lane from '${l.from}' not in ports[]`);
      if (!portIds.has(l.to)) errs.push(`${sc}: lane to '${l.to}' not in ports[]`);
      if (l.from === l.to) errs.push(`${sc}: lane from==to`);
      shareSum += l.share;
    }
    if (Math.abs(shareSum - 1) > 0.02) errs.push(`${sc}: lane shares sum to ${shareSum.toFixed(3)}`);
    // decade coverage: every grid decade within era, no gaps, no strays
    const want = DEC.filter(d => d >= Math.floor(s.era.from / 10) * 10 && d <= s.era.to);
    const have = Object.keys(s.byDecade).map(Number).sort((a, b) => a - b);
    nDecades += have.length;
    for (const d of want) if (!s.byDecade[d]) errs.push(`${sc}: missing decade ${d}`);
    for (const d of have) if (!want.includes(d)) errs.push(`${sc}: stray decade ${d} outside era`);
    for (const d of have) {
      const v = s.byDecade[d].voyagesPerYear;
      if (!Array.isArray(v) || v.length !== 2 || !(v[0] > 0) || !(v[1] >= v[0])) errs.push(`${sc} ${d}: bad range ${JSON.stringify(v)}`);
      // asserted entries default to ±60% (R3 decision) — flag suspiciously tight bounds
      if (s.evidence === "asserted" && v[1] / v[0] < 2.33)
        notes.push(`  ⚠ ${sc} ${d}: asserted bounds tighter than ±40% (${v[0]}–${v[1]}) — justify in basis or widen`);
    }
  }
}

// ---- silences register ----
const S = load("research/flows/silences.json");
const REASON = new Set(["excluded-by-basis", "unrecorded", "evasion", "fishery-not-trade", "not-yet-reconstructed", "no-port-node"]);
const TREAT = new Set(["asserted", "excluded", "gestured"]);
const allSys = new Set(Object.values(basinData).flatMap(B => B.systems.map(s => s.id)));
for (const e of S.silences) {
  if (!REASON.has(e.reason)) errs.push(`silences/${e.id}: bad reason '${e.reason}'`);
  if (!TREAT.has(e.treatment)) errs.push(`silences/${e.id}: bad treatment '${e.treatment}'`);
  if (e.treatment === "asserted" && !allSys.has(e.pointer)) errs.push(`silences/${e.id}: asserted but pointer '${e.pointer}' names no system`);
}

// ---- historical cross-checks: declared per basin as crossChecks[] ----
// { id, source, systems: {sysId: factor}, decades: {d: [lo,hi]} } — the factored
// sum of system ranges must overlap the expected band within ±35%.
for (const B of Object.values(basinData)) {
  for (const chk of B.crossChecks || []) {
    notes.push(`${B.basin} cross-check — ${chk.id} (${chk.source}):`);
    for (const [d, [slo, shi]] of Object.entries(chk.decades)) {
      let lo = 0, hi = 0;
      for (const s of B.systems) {
        const f = chk.systems[s.id]; if (!f || !s.byDecade[d]) continue;
        lo += s.byDecade[d].voyagesPerYear[0] * f; hi += s.byDecade[d].voyagesPerYear[1] * f;
      }
      const overlap = !(hi < slo * 0.65 || lo > shi * 1.35);   // ±35% tolerance on range overlap
      notes.push(`  ${d}s: systems ${Math.round(lo)}–${Math.round(hi)} vs expected ${slo}–${shi} ${overlap ? "✓" : "✗ OUT OF BAND"}`);
      if (!overlap) errs.push(`${B.basin}/${chk.id} ${d}s: system sum ${Math.round(lo)}–${Math.round(hi)} outside band ${slo}–${shi} ±35%`);
    }
  }
}

// ---- derived prominence (output, not input): top ports per sample decade, worldwide ----
{
  const prom = {};
  for (const B of Object.values(basinData))
    for (const s of B.systems) for (const [d, v] of Object.entries(s.byDecade)) {
      const mid = (v.voyagesPerYear[0] + v.voyagesPerYear[1]) / 2;
      for (const l of s.lanes) for (const pid of [l.from, l.to]) {
        prom[pid] = prom[pid] || {}; prom[pid][d] = (prom[pid][d] || 0) + mid * l.share;
      }
    }
  notes.push("derived WORLD port prominence (flow touches/yr, midpoints) — an output, not an input:");
  for (const d of [1590, 1690, 1790]) {
    const top = Object.entries(prom).map(([p, m]) => [p, m[d] || 0]).sort((a, b) => b[1] - a[1]).slice(0, 10);
    notes.push(`  ${d}s: ${top.map(([p, v]) => `${p}:${Math.round(v)}`).join("  ")}`);
  }
}

if (errs.length) { console.error(`✗ ${errs.length} error(s):\n` + errs.map(e => "  - " + e).join("\n")); console.log(notes.join("\n")); process.exit(1); }
console.log(`✓ flows valid: ${basins.length} basin(s), ${nSystems} systems, ${nDecades} system-decades, ${S.silences.length} silences registered`);
console.log(notes.join("\n"));
