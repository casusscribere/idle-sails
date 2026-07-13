// PLAN-2 Phase A, Layer 2 — the flowing-clock weight source.
//
// Turns the tiered per-decade port rankings (research/port-rankings-1550-1815.json,
// three metrics) into a per-decade PROMINENCE weight for each of the 15 sim ports.
// Historical ports are folded onto the nearest sailable sim port (PLAN-2 Phase A:
// "map historical flows onto the nearest available ports"); Mediterranean-only and
// North-American-mainland ports have no sim proxy and are dropped (a stated Phase-A
// fidelity limit). Output: data-src/era-weights.json — consumed by world.js to
// modulate lane spawn weight by origin-port × current-decade prominence.
import { readFileSync, writeFileSync } from "node:fs";

const RES = "/home/kirk/REPOS_LINUX/idle_sails/research/port-rankings-1550-1815.json";
const OUT = "/home/kirk/REPOS_LINUX/idle_sails/data-src/era-weights.json";
const J = JSON.parse(readFileSync(RES, "utf8"));
const DECADES = J.decades;                 // 1550 … 1810
const METRICS = ["ships", "tonnage", "value"];

// Historical port (as spelled in the rankings) → nearest sim port id.
// Left unmapped ⇒ intentionally dropped (no sailable proxy in the 15).
const TO_SIM = {
  // British Isles
  "London": "london", "Liverpool": "liverpool",
  "Bristol": "liverpool", "Hull": "london", "Sunderland": "london",
  "Whitby": "london", "Cork": "liverpool", "Dublin": "liverpool",
  // Low Countries — Antwerp's entrepôt role passes to Amsterdam
  "Amsterdam": "amsterdam", "Antwerp": "amsterdam", "Middelburg": "amsterdam",
  "Rotterdam": "amsterdam", "Ostend": "amsterdam", "Emden": "amsterdam", "Bruges": "amsterdam",
  // France (Atlantic + Marseille folded to the French Atlantic proxy)
  "Bordeaux": "bordeaux", "Nantes": "nantes", "Le Havre": "bordeaux",
  "Rouen": "bordeaux", "La Rochelle": "nantes", "Marseille": "bordeaux",
  // Iberia — Seville's Carrera passes to Cádiz
  "Cádiz": "cadiz", "Cadiz": "cadiz", "Seville": "cadiz",
  "Bilbao": "cadiz", "Málaga": "cadiz", "Barcelona": "cadiz",
  "Lisbon": "lisbon", "Porto": "lisbon",
  // Baltic / North-Sea Hanseatic & Scandinavian → Gothenburg
  "Danzig": "gothenburg", "Lübeck": "gothenburg", "Hamburg": "gothenburg",
  "Bremen": "gothenburg", "Copenhagen": "gothenburg", "Königsberg": "gothenburg",
  "Riga": "gothenburg", "Stockholm": "gothenburg", "Stettin": "gothenburg",
  "Memel": "gothenburg", "Reval": "gothenburg", "Bergen": "gothenburg",
  "Gothenburg": "gothenburg", "St Petersburg": "gothenburg", "Rostock": "gothenburg",
  "Stralsund": "gothenburg", "Bergen ": "gothenburg", "Danzig ": "gothenburg",
  // Caribbean & Spanish Main → Kingston
  "Kingston": "kingston", "Havana": "kingston", "Cartagena": "kingston",
  "Veracruz": "kingston", "Portobelo": "kingston", "Cap-Français": "kingston",
  "Buenos Aires": "kingston",
  // Brazil → Bahia
  "Pernambuco": "bahia", "Bahia": "bahia", "Salvador": "bahia", "Rio de Janeiro": "bahia",
  // Indian Ocean → Tranquebar (Coromandel proxy)
  "Goa": "tranquebar", "Surat": "tranquebar", "Bombay": "tranquebar",
  "Madras": "tranquebar", "Malabar": "tranquebar",
  // East Indies → Batavia
  "Batavia": "batavia", "Malacca": "batavia", "Manila": "batavia", "Makassar": "batavia",
  // China / Japan
  "Canton": "canton", "Guangzhou": "canton", "Nagasaki": "dejima", "Hirado": "dejima",
};
// Deliberately unmapped (no proxy): Venice, Genoa, Livorno, Naples, Ragusa, Palermo,
// Trieste, Smyrna, Mocha, Bandar Abbas, Boston, Philadelphia, Charleston, Baltimore,
// New York, Danzig-region micro-ports beyond the list, etc.

const SIM_PORTS = ["london","liverpool","amsterdam","bordeaux","nantes","cadiz","lisbon",
  "gothenburg","kingston","bahia","whydah","batavia","canton","tranquebar","dejima"];

// rank → raw score. Top-10 ranked steeply; the unranked 11–20 tier a low flat band.
const rankScore = (rank) => 11 - rank;   // 1→10 … 10→1
const TIER2_SCORE = 0.6;

// Intrinsic floor per sim port: keeps low-volume "flavour" ports (Dejima, Whydah,
// Tranquebar, Canton) and any port absent from a decade's European-centric rankings
// alive in the traffic mix, and prevents dead lanes. Small relative to a peak (~1.0).
const FLOOR = {
  london:0.20, liverpool:0.12, amsterdam:0.20, bordeaux:0.15, nantes:0.12,
  cadiz:0.18, lisbon:0.20, gothenburg:0.12, kingston:0.18, bahia:0.15,
  whydah:0.14, batavia:0.18, canton:0.18, tranquebar:0.12, dejima:0.08,
};

const perDecade = {};   // decade → { simPort: weight }
const dropped = {};     // unmapped historical port → count (for reporting)

for (const d of DECADES) {
  const raw = Object.fromEntries(SIM_PORTS.map(p => [p, 0]));
  for (const m of METRICS) {
    // Per metric, each sim port takes the score of its single BEST-ranked mapped
    // historical port — NOT the sum. A sim port that proxies a whole region
    // (Gothenburg ← the Baltic; Cádiz ← Seville+Bilbao+…) would otherwise absorb
    // every member's weight and swamp the mix. Max-then-average keeps each sim port
    // at the strength of its strongest historical representative.
    const best = Object.fromEntries(SIM_PORTS.map(p => [p, 0]));
    const top = J.metrics[m].topByDecade[d] || [];
    top.forEach((port, i) => {
      const sim = TO_SIM[port];
      if (!sim) { dropped[port] = (dropped[port]||0)+1; return; }
      best[sim] = Math.max(best[sim], rankScore(i + 1));
    });
    const t2 = (J.metrics[m].tier2ByDecade && J.metrics[m].tier2ByDecade[d]) || [];
    t2.forEach(port => {
      const sim = TO_SIM[port];
      if (!sim) { dropped[port] = (dropped[port]||0)+1; return; }
      best[sim] = Math.max(best[sim], TIER2_SCORE);
    });
    for (const p of SIM_PORTS) raw[p] += best[p] / METRICS.length;   // average across metrics
  }
  // Normalise the historical signal to a 0..1 share of the decade's peak sim port,
  // then add the intrinsic floor. Peak historical port ⇒ ~1.0 + floor; absent ⇒ floor.
  const peak = Math.max(1e-9, ...SIM_PORTS.map(p => raw[p]));
  const w = {};
  for (const p of SIM_PORTS) w[p] = +(FLOOR[p] + raw[p] / peak).toFixed(4);
  perDecade[d] = w;
}

const out = {
  "$schema": "./_schema.md#era-weights",
  note: "PLAN-2 Phase A flowing-clock weights. Per-decade PROMINENCE for each of the 15 sim ports, = intrinsic floor + normalised (0..1 of decade peak) historical signal aggregated across the three ranking metrics (ships/tonnage/value), with historical ports folded onto the nearest sim port. world.js interpolates these between decade MIDPOINTS (1555,1565,…,1815) and blends the 1810s→1550s vectors across the 5-year reset ramp. Derived from research/port-rankings-1550-1815.json; regenerate with tmp/build-era-weights.mjs.",
  anchorAt: "decade-midpoint (decade+5)",
  ports: SIM_PORTS,
  floor: FLOOR,
  byDecade: perDecade,
};
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");

// ---- report ----
const fmt = (d) => `${d}s  ` + SIM_PORTS.map(p => `${p.slice(0,4)}:${perDecade[d][p].toFixed(2)}`).join(" ");
console.log("wrote", OUT);
console.log("\nper-decade sim-port prominence (sample decades):");
for (const d of [1550,1600,1650,1700,1750,1800,1810]) console.log("  " + fmt(d));
console.log("\ndropped historical ports (no sim proxy), by #decade-appearances:");
console.log("  " + Object.entries(dropped).sort((a,b)=>b[1]-a[1]).map(([p,c])=>`${p}(${c})`).join(", "));
// leaders per decade
console.log("\nleading sim port per decade:");
for (const d of DECADES) {
  const top3 = [...SIM_PORTS].sort((a,b)=>perDecade[d][b]-perDecade[d][a]).slice(0,3)
    .map(p=>`${p}:${perDecade[d][p].toFixed(2)}`).join("  ");
  console.log(`  ${d}s → ${top3}`);
}
