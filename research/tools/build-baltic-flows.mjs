// PLAN-3 R2 — the Baltic–North Sea basin, the flow matrix's proof of shape.
//
// Volumes are authored as ANCHOR CURVES ([decade, lo, hi] control points,
// linearly interpolated to the decade grid) and emitted as explicit per-decade
// ranges. The anchors — not the interpolation — carry the historical claims;
// each system's `basis` names its source. Counted systems are anchored to the
// Sound Toll series; the validator cross-checks their sum against it.
//
//   node research/tools/build-baltic-flows.mjs   → research/flows/baltic-north-sea.json

import { writeFileSync } from "node:fs";
const DEC = []; for (let d = 1550; d <= 1810; d += 10) DEC.push(d);
const r = (x) => Math.round(x);

// Interpolate anchor rows [decade, lo, hi] onto the decade grid. A system whose
// era starts mid-decade (Arkhangelsk, 1584) is active in that decade, so the
// grid includes floor(from/10); decades outside the anchor span clamp to the
// nearest anchor rather than extrapolating.
function curve(anchors, from, to) {
  const out = {};
  const first = Math.floor(from / 10) * 10;
  for (const d of DEC) {
    if (d < first || d > to) continue;
    let a, b;
    if (d <= anchors[0][0]) { a = b = anchors[0]; }
    else if (d >= anchors[anchors.length - 1][0]) { a = b = anchors[anchors.length - 1]; }
    else for (let i = 0; i < anchors.length - 1; i++)
      if (anchors[i][0] <= d && d <= anchors[i + 1][0]) { a = anchors[i]; b = anchors[i + 1]; break; }
    const t = a[0] === b[0] ? 0 : (d - a[0]) / (b[0] - a[0]);
    out[d] = { voyagesPerYear: [r(a[1] + (b[1] - a[1]) * t), r(a[2] + (b[2] - a[2]) * t)] };
  }
  return out;
}
const sys = (id, name, evidence, basis, era, cargo, shipTypes, lanes, anchors, notes) =>
  ({ id, name, evidence, basis, era, cargo, shipTypes, lanes, byDecade: curve(anchors, era.from, era.to), ...(notes ? { notes } : {}) });

// ---- port registry (simProxy = nearest BAKED sim port; null = unsailable until S2) ----
const ports = [
  ["danzig", "Danzig (Gdańsk)", "danzig"], ["konigsberg", "Königsberg", "danzig"],
  ["riga", "Riga", "riga"], ["stettin", "Stettin", "danzig"], ["memel", "Memel", "riga"],
  ["stockholm", "Stockholm", "stockholm"], ["gothenburg", "Gothenburg", "gothenburg"],
  ["lubeck", "Lübeck", "hamburg"], ["copenhagen", "Copenhagen", "copenhagen"],
  ["st-petersburg", "St Petersburg", "st-petersburg"], ["bergen", "Bergen", "gothenburg"],
  ["christiania", "Christiania (Oslo)", "gothenburg"],
  ["amsterdam", "Amsterdam", "amsterdam"], ["rotterdam", "Rotterdam", "rotterdam"],
  ["hamburg", "Hamburg", "hamburg"], ["bremen", "Bremen", "hamburg"],
  ["london", "London", "london"], ["hull", "Hull", "newcastle"],
  ["newcastle", "Newcastle", "newcastle"], ["sunderland", "Sunderland", "newcastle"],
  ["rouen", "Rouen", "bordeaux"], ["bordeaux", "Bordeaux", "bordeaux"],
  ["lisbon", "Lisbon", "lisbon"],
  ["arkhangelsk", "Arkhangelsk", "arkhangelsk"], ["smeerenburg", "Smeerenburg (Spitsbergen)", "smeerenburg"]
].map(([id, name, simProxy]) => ({ id, name, simProxy }));

const L = (from, to, share) => ({ from, to, share });

const systems = [
  sys("baltic-grain-west", "Baltic grain, westbound", "counted",
    "Sound Toll Registers (grain cargoes westbound; Danzig staple); van Tielhof, The 'Mother of All Trades'.",
    { from: 1550, to: 1815 }, ["grain"], ["fluyt", "brig", "merchantman"],
    [L("danzig", "amsterdam", .40), L("konigsberg", "amsterdam", .15), L("riga", "amsterdam", .10),
     L("danzig", "london", .10), L("danzig", "lisbon", .10), L("stettin", "hamburg", .08), L("konigsberg", "london", .07)],
    [[1550, 220, 380], [1590, 350, 600], [1620, 280, 500], [1650, 250, 450], [1700, 150, 300], [1710, 120, 260], [1730, 200, 380], [1760, 250, 480], [1790, 600, 1100], [1810, 350, 800]],
    "The 'mother trade'. Peak Amsterdam dependence c.1590–1650; the late-18th-c surge feeds Britain."),

  sys("baltic-timber-naval-west", "Baltic timber & naval stores, westbound", "counted",
    "Sound Toll Registers (timber, masts, pitch, tar, hemp, flax westbound); Åström; Kaukiainen.",
    { from: 1550, to: 1815 }, ["timber", "naval-stores"], ["fluyt", "brig", "snow"],
    [L("riga", "london", .25), L("riga", "amsterdam", .15), L("memel", "london", .15), L("memel", "amsterdam", .10),
     L("danzig", "amsterdam", .10), L("danzig", "london", .15), L("riga", "bordeaux", .10)],
    [[1550, 80, 160], [1600, 120, 220], [1650, 150, 280], [1700, 200, 380], [1750, 350, 650], [1780, 550, 950], [1800, 700, 1300], [1810, 500, 1100]],
    "Rises all era with navies and cities; Riga masts were strategic goods."),

  sys("swedish-iron-west", "Swedish bar iron, westbound", "proxied",
    "Swedish export statistics (oregrounds iron) + Sound Toll for the Stockholm share; Gothenburg exports bypass the Sound.",
    { from: 1550, to: 1815 }, ["iron"], ["brig", "snow", "fluyt"],
    [L("stockholm", "london", .40), L("stockholm", "amsterdam", .20), L("gothenburg", "london", .30), L("gothenburg", "amsterdam", .10)],
    [[1550, 40, 90], [1600, 60, 130], [1650, 120, 240], [1700, 180, 330], [1730, 250, 450], [1760, 300, 550], [1790, 320, 600], [1810, 250, 550]],
    "Britain's steel industry ran on it until Russian iron competes late in the era."),

  sys("baltic-general-west", "Baltic general cargoes, westbound", "counted",
    "Sound Toll Registers — the westbound residue beyond the named staples: flax, hemp, potash, wax, hides, linens.",
    { from: 1550, to: 1815 }, ["naval-stores", "grain", "trade-goods"], ["brig", "fluyt", "snow"],
    [L("danzig", "amsterdam", .25), L("konigsberg", "amsterdam", .20), L("riga", "london", .15),
     L("stettin", "hamburg", .15), L("konigsberg", "london", .15), L("danzig", "hamburg", .10)],
    [[1550, 150, 300], [1650, 250, 500], [1750, 500, 1000], [1790, 900, 1700], [1810, 600, 1400]],
    "Keeps the counted stratum honest: the Sound total is more than grain + timber + iron."),

  sys("baltic-return-east", "Return trade into the Baltic (salt, herring, cloth, colonial goods)", "counted",
    "Sound Toll Registers (eastbound passages); Setúbal/Bay salt series.",
    { from: 1550, to: 1815 }, ["salt", "trade-goods", "wine"], ["fluyt", "brig", "merchantman"],
    [L("amsterdam", "danzig", .35), L("lisbon", "danzig", .12), L("london", "danzig", .10),
     L("amsterdam", "riga", .12), L("amsterdam", "konigsberg", .10), L("hamburg", "danzig", .08),
     L("london", "stockholm", .08), L("amsterdam", "stockholm", .05)],
    [[1550, 350, 600], [1590, 500, 850], [1650, 450, 800], [1700, 380, 700], [1750, 700, 1300], [1790, 1800, 3200], [1810, 1000, 2400]],
    "The eastbound half of every Baltic round trip; salt is its backbone."),

  sys("petersburg-west", "St Petersburg trade, westbound", "counted",
    "Sound Toll Registers + Russian port books after 1713; hemp, flax, iron, tallow.",
    { from: 1710, to: 1815 }, ["naval-stores", "iron", "timber"], ["merchantman", "brig"],
    [L("st-petersburg", "london", .55), L("st-petersburg", "amsterdam", .25), L("st-petersburg", "hamburg", .20)],
    [[1710, 60, 140], [1730, 150, 300], [1760, 400, 750], [1790, 800, 1400], [1810, 700, 1500]],
    "Peter's window opens 1703 and by 1800 carries more than the whole 16th-c Sound."),

  sys("norway-timber-fish-west", "Norwegian timber & fish, westbound", "proxied",
    "Norwegian toll books & English port books; deals from the fjords, stockfish/klippfisk from Bergen.",
    { from: 1550, to: 1815 }, ["timber", "cod"], ["brig", "snow", "fluyt"],
    [L("bergen", "london", .30), L("bergen", "amsterdam", .30), L("christiania", "london", .25), L("bergen", "hamburg", .15)],
    [[1550, 150, 300], [1650, 250, 450], [1750, 350, 650], [1810, 300, 650]],
    "Does not cross the Sound — invisible to the toll series, hence proxied."),

  sys("english-coal-foreign", "English coal, foreign-going", "proxied",
    "English customs (overseas coal exports); Nef, The Rise of the British Coal Industry.",
    { from: 1550, to: 1815 }, ["coal"], ["brig", "snow"],
    [L("newcastle", "amsterdam", .30), L("newcastle", "hamburg", .25), L("newcastle", "rouen", .20),
     L("sunderland", "amsterdam", .15), L("sunderland", "hamburg", .10)],
    [[1550, 60, 120], [1600, 120, 240], [1650, 180, 350], [1700, 250, 450], [1750, 400, 700], [1780, 550, 950], [1810, 500, 1000]],
    "The overseas fraction of the coal trade — the part the ships-ranking basis can see."),

  sys("english-coastal-colliers", "The collier coastal trade (Newcastle–London)", "reconstructed",
    "Nef; Hatcher, History of the British Coal Industry — London imports ÷ ~250-ton collier lading. THE R1-declared silence, answered here: excluded from the ships rankings by their foreign-going basis, asserted in the flow matrix so it is never silently zero.",
    { from: 1550, to: 1815 }, ["coal"], ["brig", "snow"],
    [L("newcastle", "london", .75), L("sunderland", "london", .25)],
    [[1550, 120, 250], [1600, 300, 550], [1650, 500, 900], [1700, 1800, 3000], [1750, 2500, 4200], [1780, 3200, 5200], [1810, 3800, 6500]],
    "By 1800 the largest single generator of ship movements in Europe. Coastal: enters the sim only when Newcastle is baked (S2), and its on-screen share is governed by the evidence-band visibility decision."),

  sys("white-sea-west", "The White Sea trade (Arkhangelsk)", "reconstructed",
    "Muscovy Company records; Dutch notarial acts; Veluwenkamp. Russia's only sea door before 1703, kept open after.",
    { from: 1584, to: 1815 }, ["furs", "naval-stores", "timber"], ["merchantman", "fluyt"],
    [L("arkhangelsk", "london", .45), L("arkhangelsk", "amsterdam", .45), L("arkhangelsk", "hamburg", .10)],
    [[1590, 25, 60], [1650, 40, 90], [1700, 30, 70], [1720, 15, 45], [1780, 20, 60], [1810, 25, 80]],
    "Dips after Petersburg opens; never closes. Rounds North Cape — the S2 ice-mask exception."),

  sys("svalbard-whaling", "The Spitsbergen whale fishery", "reconstructed",
    "Noordsche Compagnie records; de Jong, Geschiedenis van de oude Nederlandse walvisvaart — Dutch fleet 100–260 ships/yr at peak.",
    { from: 1610, to: 1800 }, ["whale-oil"], ["fluyt", "merchantman"],
    [L("amsterdam", "smeerenburg", .55), L("hamburg", "smeerenburg", .20), L("hull", "smeerenburg", .15), L("bremen", "smeerenburg", .10)],
    [[1610, 30, 80], [1630, 120, 250], [1660, 150, 280], [1700, 130, 260], [1750, 80, 180], [1780, 40, 120], [1800, 20, 70]],
    "Seasonal (summer only). After the 1660s increasingly pelagic — 'Smeerenburg' stands for the grounds."),

  sys("baltic-intra", "Intra-Baltic carrying trade", "reconstructed",
    "Hanseatic and Danish toll fragments; port-book studies (Lübeck, Danzig, Copenhagen). Does not cross the Sound; systematically under-recorded.",
    { from: 1550, to: 1815 }, ["grain", "salt", "trade-goods"], ["brig", "snow", "fluyt"],
    [L("lubeck", "danzig", .20), L("danzig", "stockholm", .15), L("stockholm", "lubeck", .15),
     L("danzig", "copenhagen", .15), L("copenhagen", "danzig", .13), L("riga", "lubeck", .12), L("konigsberg", "copenhagen", .10)],
    [[1550, 300, 600], [1650, 350, 700], [1750, 400, 800], [1810, 350, 750]],
    "The sea's short-haul metabolism — the kind of traffic toll series at a single strait cannot show."),

  sys("north-sea-shorthaul", "North Sea short-haul (London–Amsterdam–Hamburg)", "proxied",
    "English port books; Amsterdam galjootsgeldregisters. Cloth out, everything back.",
    { from: 1550, to: 1815 }, ["trade-goods", "wine"], ["brig", "sloop", "snow"],
    [L("london", "amsterdam", .30), L("amsterdam", "london", .30), L("london", "hamburg", .20), L("hamburg", "london", .20)],
    [[1550, 250, 500], [1650, 350, 700], [1750, 500, 950], [1810, 400, 900]],
    "Dense, routine, and mostly beneath the notice of the ranking sources.")
];

const out = {
  basin: "baltic-north-sea",
  note: "PLAN-3 R2 proof-of-shape basin. Volumes authored as anchor curves (see research/tools/build-baltic-flows.mjs — the anchors carry the historical claims) and emitted as explicit per-decade [lo,hi] voyage ranges. Realization rule: per-seed draw within bounds (R2 decision). Counted systems cross-check against the Sound Toll series in validate-flows.mjs.",
  anchors: [
    "Sound Toll Registers / STRO — the anchoring series for every 'counted' system",
    "M. van Tielhof, The 'Mother of All Trades' (Baltic grain)",
    "J. U. Nef / J. Hatcher (the coal trades); Y. Kaukiainen (Baltic shipping)",
    "C. de Jong (Dutch whaling); J. W. Veluwenkamp (Arkhangelsk)"
  ],
  crossChecks: [
    { id: "sound-passages", source: "STRO annual passages, both directions",
      systems: { "baltic-grain-west": 1, "baltic-timber-naval-west": 1, "baltic-general-west": 1, "baltic-return-east": 1, "petersburg-west": 1, "swedish-iron-west": 0.6 },
      decades: { 1550: [900, 1600], 1590: [1400, 2400], 1650: [1100, 1900], 1700: [900, 1700], 1750: [2400, 4200], 1790: [7000, 10500], 1810: [2500, 6500] } }
  ],
  ports, systems
};
writeFileSync("/home/kirk/REPOS_LINUX/idle_sails/research/flows/baltic-north-sea.json", JSON.stringify(out, null, 1) + "\n");
console.log(`✓ baltic-north-sea.json: ${systems.length} systems, ${ports.length} ports, ${systems.reduce((s, x) => s + Object.keys(x.byDecade).length, 0)} system-decades`);
