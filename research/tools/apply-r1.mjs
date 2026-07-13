// PLAN-3 Phase R1 — corrections to the counted stratum (the tiered rankings).
//
// Applies the user-approved decisions of 2026-07-13:
//   basis:  ships = FOREIGN-GOING clearances (documented; Newcastle stays a
//           tonnage-tier port and the coastal-collier silence is declared);
//   T1:     Goa↔Lübeck/Marseille swap (value, 1550s–80s); Cap-Français → value
//           T1 1770s–80s (ends 1791); Rio de Janeiro → value T1 1740s–60s
//           (gold peak, displacing Havana to T2);
//   T2:     Kingston (value, 1740s+); plus the reviewed gap fixes — Rotterdam,
//           Porto, Venice/Genoa/Livorno & Lübeck de-truncations, Emden's
//           1560s–80s boom, St Petersburg into value, the American ramp
//           (Boston/Philadelphia/New York), Bahia 1600s–80s, Rio 1700s+,
//           Nagasaki 1600s–30s;
//   bounds: an explicit boundary statement (Istanbul as the exemplar of a
//           port real history puts near the top that the *European commercial
//           record* cannot rank — present in the tier-3 queue, never ranked).
//
// Tier-2 is a 10-member unranked set, so every addition names its displaced
// port; each displacement below is a judgment call recorded in the changelog.
// Where the 10-slot budget ran out (e.g. Porto after the 1750s, Rotterdam's
// mid-18th-c tonnage), the cap is documented rather than silently absorbed —
// that scarcity is itself part of the argument for the PLAN-3 flow matrix.
//
//   node research/tools/apply-r1.mjs      (idempotent: refuses to run twice)

import { readFileSync, writeFileSync } from "node:fs";
const P = "/home/kirk/REPOS_LINUX/idle_sails/research/port-rankings-1550-1815.json";
const J = JSON.parse(readFileSync(P, "utf8"));
if ((J.changelog || []).some(c => c.phase === "R1")) {
  console.error("R1 already applied (see changelog) — refusing to run twice."); process.exit(1);
}
const log = [];
const t1 = (m, d) => J.metrics[m].topByDecade[d];
const t2 = (m, d) => J.metrics[m].tier2ByDecade[d];

// replace `out` with `inn` in list (exact position for T1; membership for T2)
function swap(list, out, inn, ctx) {
  const i = list.indexOf(out);
  if (i < 0) { console.error(`✗ ${ctx}: '${out}' not present`); process.exit(1); }
  if (list.includes(inn)) { console.error(`✗ ${ctx}: '${inn}' already present`); process.exit(1); }
  list[i] = inn;
}
function T1(m, d, out, inn, why) { swap(t1(m, d), out, inn, `${m} ${d} T1`); log.push(`${m} ${d}s T1: ${out} → ${inn} (${why})`); }
function T2(m, d, out, inn) { swap(t2(m, d), out, inn, `${m} ${d} T2`); log.push(`${m} ${d}s T2: ${out} → ${inn}`); }
const each = (ds, f) => ds.forEach(f);

// ═══ VALUE — tier 1 ═══
T1("value", 1550, "Lübeck", "Goa", "Estado da Índia at peak; Euro-centrism fix inside T1");
each([1560, 1570, 1580], d => T1("value", d, "Marseille", "Goa", "Estado da Índia; Marseille dips in the Wars of Religion"));
each([1740, 1750, 1760], d => T1("value", d, "Havana", "Rio de Janeiro", "Brazilian gold fleets at their height"));
T1("value", 1770, "Lisbon", "Cap-Français", "Saint-Domingue boom; ends 1791");
T1("value", 1780, "Lisbon", "Cap-Français", "Saint-Domingue exports exceed the British West Indies");
// keep Cap-Français above Havana in the 1780s (approved rank detail)
{ const l = t1("value", 1780); const cf = l.indexOf("Cap-Français"), hv = l.indexOf("Havana");
  if (cf > hv) { l.splice(cf, 1); l.splice(hv, 0, "Cap-Français"); log.push("value 1780s T1: Cap-Français ranked above Havana"); } }

// ═══ VALUE — tier 2 ═══
T2("value", 1550, "Goa", "Lübeck");
each([1560, 1570, 1580], d => T2("value", d, "Goa", "Marseille"));
each([1600, 1610], d => { T2("value", d, "Nantes", "Nagasaki"); T2("value", d, "Bilbao", "Bahia"); });
each([1620, 1630], d => { T2("value", d, "Bilbao", "Nagasaki"); T2("value", d, "Málaga", "Bahia"); });
each([1640, 1650, 1660], d => T2("value", d, "Bilbao", "Bahia"));
each([1670, 1680], d => T2("value", d, "Málaga", "Bahia"));
each([1700, 1710, 1720], d => T2("value", d, "Malacca", "Rio de Janeiro"));
T2("value", 1730, "Surat", "Rio de Janeiro");
each([1740, 1750, 1760], d => { T2("value", d, "Surat", "Kingston"); T2("value", d, "Rouen", "Havana"); });
T2("value", 1770, "Surat", "Kingston"); T2("value", 1770, "Rouen", "Lisbon"); T2("value", 1770, "Manila", "Rio de Janeiro");
T2("value", 1780, "Surat", "Kingston"); T2("value", 1780, "Rouen", "Lisbon"); T2("value", 1780, "Manila", "Rio de Janeiro"); T2("value", 1780, "Naples", "St Petersburg");
each([1790, 1800], d => { T2("value", d, "Cap-Français", "Rio de Janeiro"); T2("value", d, "Nantes", "St Petersburg"); });
T2("value", 1810, "Cap-Français", "St Petersburg");

// ═══ SHIPS — tier 2 (T1 unchanged; basis clarified below) ═══
each([1560, 1570, 1580], d => { T2("ships", d, "Stockholm", "Emden"); T2("ships", d, "Palermo", "Lübeck"); });
each([1590, 1600, 1610, 1620, 1630, 1640, 1650], d => T2("ships", d, "Málaga", "Lübeck"));
each([1640, 1650], d => T2("ships", d, "Bilbao", "Venice"));
each([1660, 1670, 1680, 1690, 1700, 1710, 1720], d => { T2("ships", d, "La Rochelle", "Rotterdam"); T2("ships", d, "Bilbao", "Venice"); });
each([1700, 1710, 1720], d => { T2("ships", d, "Málaga", "Genoa"); T2("ships", d, "Naples", "Porto"); });
each([1730, 1740], d => { T2("ships", d, "Málaga", "Rotterdam"); T2("ships", d, "Bilbao", "Genoa"); T2("ships", d, "Naples", "Livorno"); T2("ships", d, "Rouen", "Boston"); T2("ships", d, "Barcelona", "Porto"); });
each([1750], d => { T2("ships", d, "Málaga", "Rotterdam"); T2("ships", d, "Bilbao", "Philadelphia"); T2("ships", d, "Naples", "Livorno"); T2("ships", d, "Rouen", "Boston"); T2("ships", d, "Barcelona", "Porto"); });
each([1760, 1770, 1780], d => { T2("ships", d, "Málaga", "Rotterdam"); T2("ships", d, "Bilbao", "Philadelphia"); T2("ships", d, "Naples", "Livorno"); T2("ships", d, "Rouen", "Boston"); T2("ships", d, "Barcelona", "New York"); });
each([1790, 1800, 1810], d => T2("ships", d, "Rouen", "Rotterdam"));

// ═══ TONNAGE — tier 2 (T1 unchanged) ═══
each([1560, 1570, 1580], d => T2("tonnage", d, "Palermo", "Lübeck"));
each([1590, 1600], d => T2("tonnage", d, "Málaga", "Lübeck"));
each([1610, 1620, 1630, 1640, 1650], d => { T2("tonnage", d, "Málaga", "Venice"); T2("tonnage", d, "Bilbao", "Lübeck"); });
each([1660, 1670, 1680, 1690, 1700, 1710, 1720], d => { T2("tonnage", d, "Málaga", "Venice"); T2("tonnage", d, "Bilbao", "Genoa"); T2("tonnage", d, "Bergen", "Rotterdam"); });
each([1730, 1740, 1750, 1760, 1770, 1780], d => { T2("tonnage", d, "Bilbao", "Genoa"); T2("tonnage", d, "Barcelona", "Livorno"); });
T2("tonnage", 1790, "Nantes", "Rotterdam");
T2("tonnage", 1800, "Marseille", "Rotterdam");
T2("tonnage", 1810, "Nantes", "Rotterdam");

// ═══ basis & boundary statements ═══
J.metrics.ships.basis = (J.metrics.ships.basis ? J.metrics.ships.basis + " " : "") +
  "BASIS (R1): counts FOREIGN-GOING clearances/passages, commensurable with the anchoring series (Sound Toll, customs, Carrera registers). Coastal shipping is excluded by construction — which is why Newcastle (whose collier trade was Britain's largest generator of ship movements) ranks under tonnage but not here. That exclusion is a declared silence, carried to the silences register (PLAN-3 R2).";
J.boundary = "DECLARED BOUNDARY (PLAN-3 §1): these rankings order ports within the EUROPEAN COMMERCIAL RECORD — the toll, customs, and company series that survive. Ports whose traffic that record cannot measure are not ranked here regardless of their real size: Istanbul, by any physical measure among the great ports of this whole period, is the exemplar (present, unranked, in the tier-3 promotion queue). Absence from these tables is a statement about the archive, not about the sea.";
J.changelog = (J.changelog || []).concat([{ date: "2026-07-13", phase: "R1", decisions: "ships basis = foreign-going; promotions: Goa (value T1 1550s-80s), Cap-Français (value T1 1770s-80s), Kingston (value T2 1740s+), Rio de Janeiro (value T1 1740s-60s)", capped: "Porto ships-T2 ends 1750s (slot budget); Rotterdam tonnage-T2 gap 1730s-80s (slot budget); both documented rather than silently absorbed", changes: log }]);

// ═══ validate ═══
const errs = [];
for (const m of ["ships", "tonnage", "value"]) for (const d of J.decades) {
  const a = t1(m, d), b = t2(m, d);
  if (new Set(a).size !== 10) errs.push(`${m} ${d} T1 != 10 unique`);
  if (new Set(b).size !== 10) errs.push(`${m} ${d} T2 != 10 unique`);
  const ov = b.filter(p => a.includes(p)); if (ov.length) errs.push(`${m} ${d} overlap: ${ov}`);
}
if (errs.length) { console.error("VALIDATION FAILED:\n" + errs.join("\n")); process.exit(1); }
writeFileSync(P, JSON.stringify(J, null, 2));

// ═══ regenerate the top-20 CSV ═══
const rows = ["decade,metric,tier,rank,port"];
for (const m of ["ships", "tonnage", "value"]) for (const d of J.decades) {
  t1(m, d).forEach((p, i) => rows.push(`${d},${m},top10,${i + 1},"${p}"`));
  t2(m, d).forEach(p => rows.push(`${d},${m},tier2,,"${p}"`));
}
writeFileSync("/home/kirk/REPOS_LINUX/idle_sails/research/port-top20-1550-1815.csv", rows.join("\n") + "\n");

// ═══ regenerate the persistence synthesis CSV ═══
const per = {};
for (const m of ["ships", "tonnage", "value"]) for (const d of J.decades)
  t1(m, d).forEach(p => { per[p] = per[p] || { ships: 0, tonnage: 0, value: 0 }; per[p][m]++; });
const syn = Object.entries(per).map(([p, c]) => ({ p, ...c, total: c.ships + c.tonnage + c.value }))
  .sort((a, b) => b.total - a.total || a.p.localeCompare(b.p));
writeFileSync("/home/kirk/REPOS_LINUX/idle_sails/research/port-persistence-synthesis.csv",
  "rank,port,ships_decades,tonnage_decades,value_decades,total,metrics_present\n" +
  syn.map((r, i) => `${i + 1},"${r.p}",${r.ships},${r.tonnage},${r.value},${r.total},${[r.ships, r.tonnage, r.value].filter(x => x > 0).length}`).join("\n") + "\n");

const uni = new Set(); for (const m of ["ships", "tonnage", "value"]) for (const d of J.decades) { t1(m, d).forEach(p => uni.add(p)); t2(m, d).forEach(p => uni.add(p)); }
console.log(`✓ R1 applied: ${log.length} edits; universe now ${uni.size} ports; T1 synthesis rows ${syn.length}`);
console.log("  new T1 ports:", syn.filter(r => ["Goa", "Cap-Français", "Rio de Janeiro"].includes(r.p)).map(r => `${r.p}(${r.total})`).join(", "));
