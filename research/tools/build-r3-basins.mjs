// PLAN-3 R3 — the four remaining basins: Atlantic, Mediterranean, western
// Indian Ocean, Bengal–SE Asia, East Asia (emitted as four files; the Indian
// Ocean pair are separate basins). Same authoring discipline as the Baltic:
// volumes as ANCHOR CURVES → explicit per-decade [lo,hi] ranges; the anchors
// carry the historical claims; every system names its basis. R3 decisions
// (2026-07-13): 46 systems as proposed; asserted entries default ±60% around
// the stated central guess; Caribbean smuggling and China coastal grain are
// ASSERTED (answered silences); coerced flows are quantified with the sober
// framing block (validator-enforced).
//
//   node research/tools/build-r3-basins.mjs

import { writeFileSync } from "node:fs";
const DEC = []; for (let d = 1550; d <= 1810; d += 10) DEC.push(d);
const r = (x) => Math.round(x);
function curve(anchors, from, to) {
  const out = {}; const first = Math.floor(from / 10) * 10;
  for (const d of DEC) {
    if (d < first || d > to) continue;
    let a, b;
    if (d <= anchors[0][0]) a = b = anchors[0];
    else if (d >= anchors[anchors.length - 1][0]) a = b = anchors[anchors.length - 1];
    else for (let i = 0; i < anchors.length - 1; i++)
      if (anchors[i][0] <= d && d <= anchors[i + 1][0]) { a = anchors[i]; b = anchors[i + 1]; break; }
    const t = a[0] === b[0] ? 0 : (d - a[0]) / (b[0] - a[0]);
    out[d] = { voyagesPerYear: [r(a[1] + (b[1] - a[1]) * t), r(a[2] + (b[2] - a[2]) * t)] };
  }
  return out;
}
const sys = (id, name, evidence, basis, era, cargo, shipTypes, lanes, anchors, extra) =>
  ({ id, name, evidence, basis, era, cargo, shipTypes, lanes, byDecade: curve(anchors, era.from, era.to), ...(extra || {}) });
const L = (from, to, share) => ({ from, to, share });
const P = (id, name, simProxy) => ({ id, name, simProxy });
// The sober framing block required by charter rule 6 wherever coerced human
// movement is represented (validator-enforced).
const SOBER = (description) => ({
  sober: true,
  label: "coerced human movement — recorded, not celebrated",
  description,
  rule: "No value framing, no profit framing, never a reward. Sim-side representation waits for S2's generalization of the Middle-Passage invariant; until then these flows exist as historical record only."
});
const emit = (file, data) => { writeFileSync(`/home/kirk/REPOS_LINUX/idle_sails/research/flows/${file}`, JSON.stringify(data, null, 1) + "\n"); console.log(`✓ ${file}: ${data.systems.length} systems, ${data.ports.length} ports`); };

// ═══════════════════════════════ ATLANTIC ═══════════════════════════════
emit("atlantic.json", {
  basin: "atlantic",
  note: "PLAN-3 R3. Anchors: Chaunu & García-Baquero (Carrera); the SlaveVoyages Trans-Atlantic Database (the best-counted trade of the era); Brazilian frota records; English/French customs & port books; Pope & Cell (Newfoundland).",
  anchors: ["P. & H. Chaunu, Séville et l'Atlantique; A. García-Baquero (Cádiz)", "SlaveVoyages / Trans-Atlantic Slave Trade Database", "J. H. Parry; R. Davis, The Rise of the English Shipping Industry", "P. Pope (Newfoundland); K. Morgan (Bristol/Atlantic)"],
  crossChecks: [
    { id: "slavevoyages-decades", source: "SlaveVoyages DB, voyages per decade ÷ 10",
      systems: { "middle-passage": 1 },
      decades: { 1600: [25, 50], 1700: [100, 190], 1760: [230, 350], 1780: [240, 400] } },
    { id: "carrera-chaunu", source: "Chaunu tonnage/ship series, both directions",
      systems: { "carrera-de-indias": 1 },
      decades: { 1590: [110, 220], 1650: [35, 95], 1780: [110, 270] } }
  ],
  ports: [
    P("cadiz", "Cádiz", "cadiz"), P("seville", "Seville", "cadiz"), P("lisbon", "Lisbon", "lisbon"),
    P("bordeaux", "Bordeaux", "bordeaux"), P("nantes", "Nantes", "nantes"), P("la-rochelle", "La Rochelle", "nantes"),
    P("london", "London", "london"), P("bristol", "Bristol", "liverpool"), P("liverpool", "Liverpool", "liverpool"),
    P("glasgow", "Glasgow", "liverpool"), P("amsterdam", "Amsterdam", "amsterdam"), P("hull", "Hull", "london"),
    P("veracruz", "Veracruz", "kingston"), P("portobelo", "Portobelo", "kingston"), P("cartagena", "Cartagena", "kingston"),
    P("havana", "Havana", "kingston"), P("kingston", "Kingston", "kingston"), P("bridgetown", "Bridgetown (Barbados)", "kingston"),
    P("cap-francais", "Cap-Français", "kingston"), P("st-eustatius", "St Eustatius", "kingston"), P("curacao", "Curaçao", "kingston"),
    P("bahia", "Salvador da Bahia", "bahia"), P("rio", "Rio de Janeiro", "bahia"), P("pernambuco", "Pernambuco (Recife)", "bahia"),
    P("whydah", "Whydah (Ouidah)", "whydah"), P("elmina", "Elmina", "whydah"), P("old-calabar", "Old Calabar", "whydah"),
    P("luanda", "Luanda", "whydah"),
    P("boston", "Boston", null), P("new-york", "New York", null), P("philadelphia", "Philadelphia", null),
    P("chesapeake", "The Chesapeake (Norfolk/Annapolis)", null), P("newfoundland", "Newfoundland (St John's & the Banks)", null),
    P("davis-strait", "Davis Strait (the whaling grounds)", null), P("nantucket", "Nantucket", null),
    P("madeira", "Funchal (Madeira)", "lisbon"), P("tenerife", "Santa Cruz (Tenerife)", "cadiz")
  ],
  systems: [
    sys("carrera-de-indias", "The Carrera de Indias", "counted",
      "Chaunu, Séville et l'Atlantique; García-Baquero for the Cádiz century; both directions loaded (goods out, silver home). Seville and Cádiz lanes carried at constant shares — the 1717 transfer is smeared, noted.",
      { from: 1550, to: 1815 }, ["wine", "trade-goods", "specie", "indigo"], ["galleon", "merchantman", "frigate"],
      [L("cadiz", "veracruz", .14), L("cadiz", "portobelo", .10), L("cadiz", "cartagena", .08), L("seville", "veracruz", .08),
       L("veracruz", "cadiz", .14), L("portobelo", "cadiz", .10), L("cartagena", "cadiz", .08), L("havana", "cadiz", .14), L("cadiz", "havana", .14)],
      [[1550, 80, 140], [1590, 120, 200], [1620, 100, 170], [1650, 40, 90], [1680, 30, 70], [1700, 25, 60], [1730, 40, 90], [1760, 60, 120], [1780, 120, 260], [1800, 80, 220], [1810, 40, 160]],
      { notes: "Convoyed flotas → register ships → comercio libre (1778 boom) → wars and independence." }),

    sys("brazil-fleets", "The Brazil fleets (sugar → gold → the court)", "counted",
      "Portuguese frota records and Bahia/Rio port studies; sugar boom c.1600, gold era 1700s–60s, the court at Rio and open ports after 1808.",
      { from: 1550, to: 1815 }, ["sugar", "tobacco", "specie", "wine", "salt", "trade-goods"], ["carrack", "merchantman", "east-indiaman", "caravel"],
      [L("lisbon", "bahia", .16), L("bahia", "lisbon", .16), L("lisbon", "rio", .13), L("rio", "lisbon", .13),
       L("lisbon", "pernambuco", .10), L("pernambuco", "lisbon", .10), L("bahia", "rio", .11), L("rio", "bahia", .11)],
      [[1550, 60, 110], [1600, 100, 180], [1650, 80, 150], [1700, 100, 180], [1730, 120, 200], [1760, 100, 180], [1790, 120, 220], [1810, 150, 300]]),

    sys("middle-passage", "The Middle Passage", "counted",
      "SlaveVoyages — the Trans-Atlantic Slave Trade Database: ~36,000 documented voyages; the era's best-counted trade, because people were cargo in its ledgers. Counted here as embarkation legs.",
      { from: 1550, to: 1815 }, ["enslaved-people"], ["slave-ship"],
      [L("whydah", "kingston", .16), L("whydah", "bahia", .12), L("whydah", "cap-francais", .10), L("old-calabar", "kingston", .14),
       L("elmina", "kingston", .08), L("luanda", "bahia", .22), L("luanda", "rio", .18)],
      [[1550, 15, 30], [1600, 25, 50], [1650, 40, 80], [1680, 60, 110], [1700, 110, 180], [1730, 150, 250], [1760, 230, 340], [1780, 250, 400], [1800, 200, 350], [1810, 150, 300]],
      { framing: SOBER("Human beings trafficked against their will across the Atlantic — the largest forced migration in history. The flow is recorded at full documented scale; mortality, not profit, is its measure. The sim's existing Middle-Passage invariant (sober ledger framing, no value tier, elevated attrition) applies to every lane this system feeds.") }),

    sys("guinea-outward", "The Guinea outward legs", "counted",
      "The same database, outward-leg side: European and Brazilian barter cargoes to the African coast. The African merchant polities (Efik houses, Dahomey, the Gold Coast states) set the terms of this exchange — see powers.json.",
      { from: 1550, to: 1815 }, ["trade-goods", "tobacco", "rum"], ["slave-ship"],
      [L("liverpool", "whydah", .16), L("liverpool", "old-calabar", .14), L("london", "whydah", .09), L("bristol", "whydah", .09),
       L("nantes", "whydah", .14), L("bordeaux", "whydah", .05), L("amsterdam", "elmina", .06), L("bahia", "whydah", .15), L("rio", "luanda", .12)],
      [[1550, 15, 30], [1600, 25, 50], [1650, 40, 80], [1680, 60, 110], [1700, 110, 180], [1730, 150, 250], [1760, 230, 340], [1780, 250, 400], [1800, 200, 350], [1810, 150, 300]]),

    sys("wine-salt-north", "Iberian & Gascon wine and salt, northbound", "proxied",
      "English and Dutch port books; the Bordeaux wine fleets and the Lisbon/Cádiz trades to northwest Europe (the Baltic salt run is carried in the Baltic basin).",
      { from: 1550, to: 1815 }, ["wine", "salt", "specie"], ["brig", "snow", "merchantman"],
      [L("bordeaux", "london", .20), L("bordeaux", "amsterdam", .15), L("lisbon", "london", .15), L("cadiz", "london", .12),
       L("lisbon", "amsterdam", .10), L("cadiz", "amsterdam", .10), L("la-rochelle", "amsterdam", .08), L("madeira", "london", .05), L("tenerife", "london", .05)],
      [[1550, 200, 400], [1650, 300, 550], [1750, 400, 700], [1810, 350, 700]]),

    sys("newfoundland-cod", "The Newfoundland fishery and the sack trade", "proxied",
      "Cell & Pope; English West Country, French, and Basque fleets to the Banks; the 'sack ships' carrying cod direct to Iberia and the Mediterranean.",
      { from: 1550, to: 1815 }, ["cod", "salt", "wine"], ["brig", "snow", "merchantman"],
      [L("bristol", "newfoundland", .20), L("london", "newfoundland", .15), L("nantes", "newfoundland", .15),
       L("newfoundland", "lisbon", .20), L("newfoundland", "cadiz", .10), L("newfoundland", "london", .10), L("newfoundland", "bordeaux", .10)],
      [[1550, 250, 450], [1600, 350, 600], [1650, 300, 550], [1700, 350, 600], [1750, 400, 700], [1780, 450, 800], [1810, 300, 650]]),

    sys("caribbean-sugar", "The West India sugar trades", "counted",
      "English and French customs: the sugar fleets from Jamaica, Barbados, and Saint-Domingue that remade Atlantic Europe.",
      { from: 1640, to: 1815 }, ["sugar", "rum", "coffee", "cotton", "trade-goods"], ["merchantman", "brig", "snow"],
      [L("kingston", "london", .15), L("bridgetown", "london", .15), L("kingston", "liverpool", .10), L("kingston", "bristol", .08),
       L("cap-francais", "nantes", .12), L("cap-francais", "bordeaux", .13), L("london", "kingston", .12), L("bordeaux", "cap-francais", .08), L("st-eustatius", "amsterdam", .07)],
      [[1650, 100, 200], [1700, 200, 350], [1750, 350, 600], [1780, 450, 800], [1810, 400, 800]],
      { notes: "Cap-Français lanes effectively end 1791 — the constant shares smear this; the rankings carry the event." }),

    sys("chesapeake-tobacco", "The Chesapeake tobacco trade", "counted",
      "English customs and the Glasgow tobacco lords' records.",
      { from: 1620, to: 1815 }, ["tobacco", "trade-goods"], ["merchantman", "brig"],
      [L("chesapeake", "london", .35), L("chesapeake", "glasgow", .25), L("london", "chesapeake", .25), L("glasgow", "chesapeake", .15)],
      [[1620, 20, 50], [1680, 80, 150], [1720, 100, 180], [1760, 150, 250], [1790, 100, 200], [1810, 80, 180]]),

    sys("new-england-caribbean", "The New England–Caribbean provisioning triangle", "proxied",
      "Colonial naval office lists: cod, lumber, and horses south; rum, sugar, and molasses north — the trade that built the North American ports.",
      { from: 1640, to: 1815 }, ["cod", "timber", "rum", "molasses", "sugar"], ["brig", "sloop", "snow"],
      [L("boston", "kingston", .20), L("boston", "bridgetown", .15), L("new-york", "kingston", .15), L("philadelphia", "bridgetown", .10),
       L("kingston", "boston", .20), L("bridgetown", "new-york", .10), L("philadelphia", "kingston", .10)],
      [[1650, 60, 120], [1700, 150, 280], [1750, 250, 450], [1770, 300, 550], [1790, 350, 650], [1810, 300, 650]]),

    sys("caribbean-smuggling", "The Caribbean inter-island contraband trade", "asserted",
      "ASSERTED (R3 decision) — silent BY EVASION: unrecorded because recording was the danger. Central guesses from the free-port scholarship (St Eustatius's 3,000+ annual ship calls at its 1770s peak, Curaçao, Monte Cristi, the asiento's shadow); bounds ±60%.",
      { from: 1650, to: 1815 }, ["sugar", "trade-goods", "specie", "rum"], ["sloop", "brig"],
      [L("st-eustatius", "boston", .15), L("st-eustatius", "new-york", .10), L("st-eustatius", "cap-francais", .15),
       L("havana", "kingston", .15), L("kingston", "cartagena", .15), L("curacao", "cartagena", .15), L("kingston", "havana", .15)],
      [[1650, 50, 190], [1700, 80, 320], [1750, 100, 400], [1780, 120, 480], [1810, 80, 320]],
      { notes: "The register's own entry: this trade is in the record chiefly as seizures and complaints." }),

    sys("davis-strait-whaling", "The Davis Strait & Greenland whale fishery", "proxied",
      "British bounty records and Dutch Groenlandvaart lists — the Arctic fishery's 18th-c westward shift.",
      { from: 1720, to: 1815 }, ["whale-oil"], ["merchantman", "brig"],
      [L("london", "davis-strait", .35), L("hull", "davis-strait", .30), L("amsterdam", "davis-strait", .20), L("nantucket", "davis-strait", .15)],
      [[1720, 20, 60], [1750, 60, 130], [1780, 120, 220], [1810, 80, 180]])
  ]
});

// ═══════════════════════════ MEDITERRANEAN ═══════════════════════════
emit("mediterranean.json", {
  basin: "mediterranean",
  note: "PLAN-3 R3. The inland sea's traffic is dense, short-haul, and mostly outside the northern toll series — hence the high share of reconstructed/asserted systems. Includes the Black Sea slave trade under the charter's sober-framing rule (R3 decision 4).",
  anchors: ["F. Braudel, La Méditerranée (the structural picture)", "Levant Company records; the French échelles du Levant series (Marseille chamber of commerce)", "D. Sella, R. Rapp (Venice); F. W. Carter (Ragusa)", "Ottoman provisioning studies (Istanbul's grain lifeline)"],
  crossChecks: [
    { id: "french-levant-peak", source: "Marseille échelles series, 18th-c peak",
      systems: { "levant-trade": 0.6 /* the French share */ },
      decades: { 1750: [180, 380], 1780: [200, 420] } }
  ],
  ports: [
    P("marseille", "Marseille", "bordeaux"), P("barcelona", "Barcelona", "cadiz"), P("cadiz", "Cádiz", "cadiz"),
    P("genoa", "Genoa", null), P("livorno", "Livorno", null), P("venice", "Venice", null), P("naples", "Naples", null),
    P("palermo", "Palermo", null), P("messina", "Messina", null), P("ragusa-port", "Ragusa (Dubrovnik)", null),
    P("smyrna", "Smyrna (İzmir)", null), P("istanbul", "Istanbul (Constantinople)", null), P("alexandria", "Alexandria", null),
    P("scanderoon", "Scanderoon (İskenderun, for Aleppo)", null), P("kaffa", "Kaffa (Feodosia)", null),
    P("london", "London", "london"), P("amsterdam", "Amsterdam", "amsterdam")
  ],
  systems: [
    sys("levant-trade", "The Levant trade", "counted",
      "French échelles series (the dominant carrier by the 18th c) + Levant Company and Dutch directie records; silk, mohair, cotton, and drugs against cloth and silver.",
      { from: 1550, to: 1815 }, ["silk", "cotton", "trade-goods", "specie"], ["merchantman", "brig"],
      [L("marseille", "smyrna", .20), L("smyrna", "marseille", .20), L("marseille", "alexandria", .08), L("alexandria", "marseille", .08),
       L("london", "smyrna", .08), L("smyrna", "london", .08), L("venice", "smyrna", .07), L("smyrna", "venice", .07),
       L("scanderoon", "marseille", .10), L("marseille", "scanderoon", .04)],
      [[1550, 80, 160], [1600, 100, 200], [1650, 120, 220], [1700, 150, 300], [1750, 300, 550], [1780, 350, 650], [1800, 150, 400], [1810, 100, 350]]),

    sys("italian-grain", "The Italian grain redistribution", "reconstructed",
      "Braudel and the annona studies: Sicilian and Puglian wheat feeding the Italian cities, with Egyptian grain north in dearth years.",
      { from: 1550, to: 1815 }, ["grain", "salt"], ["merchantman", "brig"],
      [L("palermo", "naples", .20), L("palermo", "genoa", .15), L("palermo", "livorno", .15), L("messina", "livorno", .10),
       L("naples", "genoa", .10), L("palermo", "barcelona", .10), L("alexandria", "livorno", .10), L("naples", "barcelona", .10)],
      [[1550, 250, 500], [1600, 300, 600], [1650, 250, 500], [1700, 200, 450], [1750, 250, 500], [1810, 200, 450]]),

    sys("venice-adriatic", "Venice and the eastern sea", "reconstructed",
      "Sella, Rapp, Tenenti: the Serenissima's long decline from spice emporium to regional carrier — visible here as a falling curve, not a disappearance.",
      { from: 1550, to: 1815 }, ["trade-goods", "wine", "silk", "grain"], ["merchantman", "brig"],
      [L("venice", "istanbul", .20), L("istanbul", "venice", .20), L("venice", "ragusa-port", .15), L("ragusa-port", "venice", .15),
       L("venice", "alexandria", .15), L("alexandria", "venice", .15)],
      [[1550, 200, 400], [1600, 180, 350], [1650, 120, 250], [1700, 100, 200], [1750, 80, 180], [1810, 60, 150]]),

    sys("ragusa-carrying", "The Ragusan carrying trade", "reconstructed",
      "Carter; the neutral argosies at their 16th-c peak, broken by the 1667 earthquake, reviving under 18th-c neutrality.",
      { from: 1550, to: 1808 }, ["trade-goods", "grain", "salt", "wine"], ["merchantman"],
      [L("ragusa-port", "messina", .15), L("ragusa-port", "barcelona", .15), L("ragusa-port", "alexandria", .15), L("ragusa-port", "istanbul", .15),
       L("istanbul", "ragusa-port", .10), L("barcelona", "ragusa-port", .10), L("ragusa-port", "cadiz", .10), L("ragusa-port", "livorno", .10)],
      [[1550, 60, 140], [1580, 70, 150], [1620, 40, 100], [1670, 15, 50], [1750, 40, 100], [1800, 30, 90]]),

    sys("marseille-trade", "Marseille and the western basin", "proxied",
      "Marseille chamber of commerce series: the coasting and Spanish/Italian exchange beneath the Levant headline.",
      { from: 1550, to: 1815 }, ["wine", "salt", "trade-goods", "grain"], ["brig", "sloop", "merchantman"],
      [L("marseille", "genoa", .15), L("genoa", "marseille", .12), L("marseille", "livorno", .13), L("livorno", "marseille", .10),
       L("marseille", "barcelona", .13), L("barcelona", "marseille", .10), L("marseille", "naples", .10), L("naples", "marseille", .07), L("marseille", "cadiz", .10)],
      [[1550, 150, 350], [1650, 250, 450], [1750, 400, 700], [1790, 450, 800], [1800, 150, 450], [1810, 100, 400]]),

    sys("ottoman-provisioning", "The provisioning of Istanbul", "reconstructed",
      "The capital's grain lifeline — Egyptian wheat and Black Sea grain into the largest city of Europe and the Near East. The system the European commercial record cannot rank (the R1 declared boundary), quantified here from Ottoman provisioning scholarship.",
      { from: 1550, to: 1815 }, ["grain", "salt", "trade-goods"], ["merchantman", "dhow", "brig"],
      [L("alexandria", "istanbul", .30), L("kaffa", "istanbul", .30), L("istanbul", "kaffa", .15), L("istanbul", "alexandria", .15), L("smyrna", "istanbul", .10)],
      [[1550, 300, 700], [1650, 350, 750], [1750, 350, 750], [1810, 300, 700]]),

    sys("greek-ottoman-coasting", "Greek and Ottoman coasting", "asserted",
      "ASSERTED — the record's blind spot: the caïques and polaccas of Greek, Armenian, and Turkish shippers who carried the eastern basin's daily exchange under flags no western customs house logged. Central guesses scale with the known ports' consumption; bounds ±60%. By the 1780s the Greek merchant marine is large enough to enter western records — the curve rises accordingly.",
      { from: 1550, to: 1815 }, ["grain", "wine", "salt", "trade-goods", "cotton"], ["brig", "sloop", "dhow"],
      [L("smyrna", "istanbul", .20), L("istanbul", "smyrna", .15), L("alexandria", "smyrna", .15), L("smyrna", "alexandria", .10),
       L("kaffa", "smyrna", .10), L("messina", "smyrna", .10), L("smyrna", "ragusa-port", .10), L("istanbul", "messina", .10)],
      [[1550, 120, 480], [1650, 140, 560], [1750, 180, 720], [1810, 200, 800]]),

    sys("habsburg-genoa-route", "The Habsburg silver route (Barcelona–Genoa)", "reconstructed",
      "Braudel's 'Spanish road' at sea: silver, troops, and credit between Iberia and Habsburg Italy, ending with the dynasty's Mediterranean system.",
      { from: 1550, to: 1714 }, ["specie", "trade-goods", "wine"], ["galleon", "merchantman"],
      [L("barcelona", "genoa", .40), L("genoa", "barcelona", .30), L("cadiz", "genoa", .15), L("genoa", "naples", .15)],
      [[1550, 50, 120], [1600, 60, 130], [1650, 40, 100], [1710, 20, 60]]),

    sys("black-sea-slave-trade", "The Black Sea slave trade (Kaffa)", "reconstructed",
      "The Crimean Khanate's raiding economy shipped captives from Kaffa to Ottoman markets for two centuries — a coerced flow the charter forbids leaving silently zero (R3 decision 4). Volume reconstructions from Ottoman customs studies; declines with the raids and ends with Russian annexation (1783).",
      { from: 1550, to: 1783 }, ["enslaved-people"], ["dhow", "merchantman"],
      [L("kaffa", "istanbul", 1.0)],
      [[1550, 60, 140], [1650, 50, 120], [1700, 30, 90], [1770, 15, 60]],
      { framing: SOBER("Captive people carried across the Black Sea to Ottoman slave markets — the northern counterpart of the trans-Saharan routes, and for the 16th–17th centuries among the largest coerced flows anywhere. Recorded at documented scale; no value framing.") })
  ]
});

// ═══════════════════════ WESTERN INDIAN OCEAN ═══════════════════════
emit("indian-ocean-west.json", {
  basin: "indian-ocean-west",
  note: "PLAN-3 R3. The monsoon world west of Ceylon: almost none of it generated European-style toll series, so the basin leans on reconstruction (Chaudhuri, Das Gupta) — exactly the Euro-centrism corrective the flow matrix exists for. Includes the Indian Ocean slave trades under the sober-framing rule.",
  anchors: ["K. N. Chaudhuri, Trade and Civilisation in the Indian Ocean", "A. Das Gupta (Surat); S. Subrahmanyam (the Portuguese Estado)", "Disney (the Carreira); R. J. Barendse, The Arabian Seas", "G. Campbell, E. Alpers (Indian Ocean slavery)"],
  ports: [
    P("goa", "Goa", "tranquebar"), P("surat", "Surat", "tranquebar"), P("bombay", "Bombay", "tranquebar"),
    P("calicut", "Calicut", "tranquebar"), P("cochin", "Cochin", "tranquebar"), P("madras", "Madras", "tranquebar"),
    P("hugli", "Hugli (Bengal)", "tranquebar"),
    P("mocha", "Mocha", null), P("jedda", "Jedda", null), P("muscat", "Muscat", null),
    P("bandar-abbas", "Bandar Abbas", null), P("basra", "Basra", null),
    P("mombasa", "Mombasa", null), P("zanzibar", "Zanzibar", null), P("mozambique", "Mozambique Island", null),
    P("male", "Malé (Maldives)", null), P("ile-de-france", "Île de France (Mauritius)", null),
    P("lisbon", "Lisbon", "lisbon"), P("lorient", "Lorient", "nantes")
  ],
  systems: [
    sys("carreira-da-india", "The Carreira da Índia", "counted",
      "Disney; the Lisbon–Goa naus, from five-plus a year at the 16th-c peak to a trickle by 1800.",
      { from: 1550, to: 1815 }, ["pepper", "spices", "textiles", "specie", "wine"], ["carrack", "east-indiaman"],
      [L("lisbon", "goa", .5), L("goa", "lisbon", .5)],
      [[1550, 5, 9], [1590, 4, 8], [1630, 3, 6], [1700, 2, 4], [1750, 2, 4], [1810, 1, 3]]),

    sys("gujarat-red-sea", "The Gujarat–Red Sea trade (Surat, Mocha, the hajj)", "reconstructed",
      "Das Gupta; Chaudhuri. Surat's own merchant fleet — India's greatest port for a century and a half, carrying textiles and pilgrims west, coffee and silver east. Declines with Mughal authority after 1700.",
      { from: 1550, to: 1815 }, ["textiles", "coffee", "specie", "trade-goods"], ["dhow", "merchantman"],
      [L("surat", "mocha", .30), L("mocha", "surat", .25), L("surat", "jedda", .20), L("jedda", "surat", .15), L("calicut", "jedda", .10)],
      [[1550, 40, 90], [1620, 60, 120], [1690, 50, 110], [1730, 30, 70], [1780, 20, 50], [1810, 15, 45]]),

    sys("persian-gulf-trade", "The Persian Gulf exchange", "reconstructed",
      "Barendse; Hormuz's inheritance — Bandar Abbas, Basra, and Muscat against the Indian coast; silk, dates, pearls, horses.",
      { from: 1550, to: 1815 }, ["silk", "pearls", "frankincense", "textiles", "specie"], ["dhow", "merchantman"],
      [L("bandar-abbas", "surat", .25), L("surat", "bandar-abbas", .20), L("basra", "surat", .15),
       L("muscat", "bandar-abbas", .15), L("muscat", "basra", .15), L("bombay", "basra", .10)],
      [[1550, 30, 70], [1630, 35, 80], [1700, 30, 70], [1750, 25, 60], [1810, 25, 65]]),

    sys("swahili-coast", "The Swahili coast trade", "reconstructed",
      "Alpers; ivory and gold from Mombasa, Kilwa, and Mozambique into the Arabian and Indian circuits — Portuguese, then Omani after 1698, with Zanzibar rising at the era's end.",
      { from: 1550, to: 1815 }, ["ivory", "gold-dust", "textiles", "frankincense"], ["dhow", "carrack"],
      [L("mombasa", "muscat", .20), L("zanzibar", "muscat", .25), L("muscat", "zanzibar", .20),
       L("mozambique", "goa", .15), L("zanzibar", "surat", .10), L("goa", "mozambique", .10)],
      [[1550, 20, 50], [1650, 20, 55], [1700, 25, 60], [1780, 35, 80], [1810, 40, 90]]),

    sys("indian-ocean-slave-trades", "The Indian Ocean slave trades", "reconstructed",
      "Campbell, Alpers, Allen: the East African trades to Arabia, the Gulf, India, and — growing sharply in the 18th c — the French Mascarenes. Older and longer-lived than the Atlantic system it is too often reduced to a footnote of (R3 decision 4: quantified, sober).",
      { from: 1550, to: 1815 }, ["enslaved-people"], ["dhow", "merchantman"],
      [L("zanzibar", "muscat", .25), L("mozambique", "ile-de-france", .30), L("zanzibar", "bandar-abbas", .15),
       L("mozambique", "goa", .10), L("zanzibar", "jedda", .20)],
      [[1550, 10, 30], [1700, 15, 40], [1770, 30, 80], [1810, 40, 100]],
      { framing: SOBER("Captive people carried from East Africa into Arabian, Persian, Indian, and Mascarene bondage — a coerced flow spanning this whole era and beyond it at both ends. Recorded at reconstructed scale; no value framing.") }),

    sys("malabar-pepper-coastal", "The Malabar pepper coast", "reconstructed",
      "Chaudhuri; Calicut and Cochin's coastal circuits feeding Gujarat, Goa, and the ocean trades — the Zamorin's two-century resistance to monopoly runs through it.",
      { from: 1550, to: 1815 }, ["pepper", "cinnamon", "textiles"], ["dhow", "brig"],
      [L("calicut", "surat", .25), L("cochin", "surat", .15), L("calicut", "goa", .15), L("goa", "calicut", .10),
       L("surat", "calicut", .15), L("calicut", "male", .10), L("male", "calicut", .10)],
      [[1550, 50, 120], [1650, 60, 130], [1750, 60, 140], [1810, 50, 130]]),

    sys("cowrie-maldives", "The Maldive cowrie trade", "reconstructed",
      "Hogendorn & Johnson, The Shell Money of the Slave Trade: Malé's shell money to Bengal, and through European holds to West Africa.",
      { from: 1550, to: 1815 }, ["cowries", "textiles", "grain"], ["dhow"],
      [L("male", "hugli", .40), L("hugli", "male", .20), L("male", "calicut", .25), L("calicut", "male", .15)],
      [[1550, 8, 25], [1750, 10, 30], [1810, 8, 25]]),

    sys("mascarenes-french", "The French Mascarenes", "proxied",
      "Compagnie des Indes and colonial records: Île de France as France's Indian Ocean pivot — Lorient's arterial, coffee from Mocha, and the corsair base of the wars.",
      { from: 1720, to: 1815 }, ["coffee", "trade-goods", "spices"], ["east-indiaman", "merchantman"],
      [L("lorient", "ile-de-france", .30), L("ile-de-france", "lorient", .25), L("ile-de-france", "mocha", .15),
       L("mocha", "ile-de-france", .10), L("ile-de-france", "calicut", .20)],
      [[1720, 8, 25], [1750, 25, 60], [1780, 35, 80], [1810, 20, 60]]),

    sys("country-trade-west", "The western country trade", "proxied",
      "Company records' private-trade margins: European and Parsi shippers working Bombay against Mocha, Muscat, and the Gulf — Europe's ships inside Asia's exchange.",
      { from: 1600, to: 1815 }, ["cotton", "textiles", "coffee", "specie"], ["merchantman", "brig", "dhow"],
      [L("bombay", "mocha", .20), L("bombay", "muscat", .15), L("bombay", "bandar-abbas", .15), L("madras", "basra", .10),
       L("bombay", "jedda", .15), L("mocha", "bombay", .15), L("muscat", "bombay", .10)],
      [[1600, 20, 50], [1700, 40, 90], [1780, 60, 130], [1810, 60, 140]])
  ]
});

// ═══════════════════════ BENGAL & SOUTHEAST ASIA ═══════════════════════
emit("bengal-se-asia.json", {
  basin: "bengal-se-asia",
  note: "PLAN-3 R3. The Bay of Bengal and the archipelago: the European arterials are superbly counted (DAS), the indigenous carrying trades are not — the Bugis network is asserted at ±60% precisely so it is never silently zero.",
  anchors: ["Dutch-Asiatic Shipping (DAS) — the VOC arterial, voyage by voyage", "EIC marine records; Chaudhuri's fleet series", "A. Reid, Southeast Asia in the Age of Commerce", "L. Blussé (Batavia and the junk connection)"],
  crossChecks: [
    { id: "voc-das", source: "Dutch-Asiatic Shipping, outward+return per decade ÷ 10",
      systems: { "voc-arterial": 1 },
      decades: { 1650: [28, 52], 1730: [42, 72], 1770: [32, 62] } }
  ],
  ports: [
    P("batavia", "Batavia", "batavia"), P("amsterdam", "Amsterdam", "amsterdam"), P("london", "London", "london"),
    P("lorient", "Lorient", "nantes"), P("copenhagen", "Copenhagen", "gothenburg"), P("tranquebar", "Tranquebar", "tranquebar"),
    P("madras", "Madras", "tranquebar"), P("bombay", "Bombay", "tranquebar"), P("calcutta", "Calcutta", "tranquebar"),
    P("masulipatnam", "Masulipatnam", "tranquebar"),
    P("aceh", "Aceh", null), P("malacca", "Malacca", null), P("makassar", "Makassar", null),
    P("banda", "Banda Neira", null), P("manila", "Manila", null), P("acapulco", "Acapulco", null), P("jedda", "Jedda", null)
  ],
  systems: [
    sys("voc-arterial", "The VOC arterial (Amsterdam–Batavia)", "counted",
      "Dutch-Asiatic Shipping: every voyage, both directions, 1595–1795 — the best-documented long-haul trade of the entire era.",
      { from: 1600, to: 1795 }, ["spices", "textiles", "coffee", "specie", "trade-goods"], ["east-indiaman", "fluyt"],
      [L("amsterdam", "batavia", .5), L("batavia", "amsterdam", .5)],
      [[1600, 15, 30], [1650, 30, 50], [1700, 40, 65], [1730, 45, 70], [1770, 35, 60], [1790, 15, 40]]),

    sys("eic-india-arterial", "The EIC India arterial", "counted",
      "EIC marine records: London against Bombay, Madras, and — increasingly everything — Calcutta.",
      { from: 1600, to: 1815 }, ["textiles", "saltpetre", "indigo", "specie", "trade-goods"], ["east-indiaman"],
      [L("london", "bombay", .15), L("london", "madras", .15), L("london", "calcutta", .20),
       L("bombay", "london", .12), L("madras", "london", .13), L("calcutta", "london", .25)],
      [[1600, 5, 12], [1650, 10, 20], [1700, 15, 30], [1750, 20, 40], [1780, 30, 60], [1810, 40, 80]]),

    sys("minor-company-arterials", "The minor company arterials (Danish, French)", "counted",
      "DAC and Compagnie des Indes records: Copenhagen–Tranquebar and Lorient–Pondicherry (Madras as proxy) — the small neutral carriers whose flags mattered most in wartime.",
      { from: 1620, to: 1815 }, ["textiles", "spices", "specie", "trade-goods"], ["east-indiaman"],
      [L("copenhagen", "tranquebar", .30), L("tranquebar", "copenhagen", .25), L("lorient", "madras", .25), L("madras", "lorient", .20)],
      [[1620, 2, 6], [1680, 3, 8], [1750, 8, 18], [1780, 10, 22], [1810, 4, 12]]),

    sys("coromandel-se-asia", "Coromandel textiles to Southeast Asia", "reconstructed",
      "Chaudhuri, Arasaratnam: painted cottons east for spices and gold — the exchange that clothed the archipelago, fading as Europeans capture the carriage after 1700.",
      { from: 1550, to: 1740 }, ["textiles", "indigo", "spices"], ["merchantman", "dhow", "brig"],
      [L("masulipatnam", "aceh", .20), L("masulipatnam", "malacca", .15), L("madras", "malacca", .15),
       L("aceh", "masulipatnam", .15), L("malacca", "madras", .15), L("masulipatnam", "makassar", .10), L("makassar", "masulipatnam", .10)],
      [[1550, 30, 70], [1620, 40, 90], [1680, 30, 70], [1740, 15, 45]]),

    sys("spice-islands", "The spice islands (Banda, the Moluccas)", "counted",
      "VOC records for the monopoly circuit; the Makassar smuggling era (to 1669) rides the same lanes — nutmeg, mace, and cloves out of the world's only sources.",
      { from: 1550, to: 1815 }, ["nutmeg-mace", "cloves", "textiles", "trade-goods"], ["east-indiaman", "junk", "brig"],
      [L("banda", "batavia", .30), L("batavia", "banda", .25), L("makassar", "banda", .15), L("banda", "makassar", .10), L("batavia", "malacca", .20)],
      [[1550, 15, 40], [1620, 20, 50], [1680, 25, 55], [1750, 20, 50], [1810, 15, 40]]),

    sys("bugis-carrying", "The Bugis–Makassar carrying network", "asserted",
      "ASSERTED (R3 decision) — Reid's synthesis documents a great indigenous carrying trade (Makassar, the Bugis diaspora after 1669, Riau) that no European series counts as such. Central guesses from port-call fragments and the VOC's own complaints; bounds ±60%.",
      { from: 1550, to: 1815 }, ["spices", "textiles", "trade-goods", "deerskins"], ["junk", "dhow"],
      [L("makassar", "batavia", .20), L("makassar", "malacca", .20), L("malacca", "makassar", .15),
       L("makassar", "manila", .15), L("aceh", "malacca", .15), L("malacca", "aceh", .15)],
      [[1550, 60, 240], [1650, 80, 320], [1750, 100, 400], [1810, 100, 400]],
      { notes: "The archipelago's own metabolism — the counterpart of Europe's coasting trades, and as invisible to the toll series." }),

    sys("manila-galleon", "The Manila galleon", "counted",
      "The Acapulco registers: one to four ships a year, and half the world's silver output moving through them at the peak.",
      { from: 1571, to: 1815 }, ["specie", "silk", "porcelain"], ["galleon"],
      [L("manila", "acapulco", .5), L("acapulco", "manila", .5)],
      [[1580, 2, 4], [1650, 1, 3], [1750, 1, 3], [1810, 1, 3]],
      { notes: "Tiny by count, enormous by value — the flow matrix records voyages; the value story lives in the rankings." }),

    sys("aceh-red-sea", "The Aceh–Red Sea pepper route", "reconstructed",
      "Reid, Subrahmanyam: the 16th-c Muslim pepper route that broke the Portuguese monopoly — Aceh to Jedda past the Estado's patrols, fading in the 17th c.",
      { from: 1550, to: 1700 }, ["pepper", "spices", "textiles"], ["dhow", "junk"],
      [L("aceh", "jedda", .55), L("jedda", "aceh", .45)],
      [[1550, 3, 10], [1600, 5, 15], [1650, 3, 10], [1700, 1, 5]]),

    sys("bengal-country-trade", "The Bengal country trade", "proxied",
      "Company shipping lists' private-trade margins: Calcutta's intra-Asian carriage — rice, saltpetre, opium late — binding Bengal to the Coromandel, the straits, and Batavia.",
      { from: 1650, to: 1815 }, ["saltpetre", "textiles", "grain", "trade-goods"], ["merchantman", "brig"],
      [L("calcutta", "madras", .20), L("madras", "calcutta", .15), L("calcutta", "bombay", .15), L("calcutta", "batavia", .15),
       L("batavia", "calcutta", .10), L("calcutta", "malacca", .15), L("malacca", "calcutta", .10)],
      [[1650, 20, 50], [1720, 30, 70], [1780, 50, 110], [1810, 60, 130]])
  ]
});

// ═══════════════════════════════ EAST ASIA ═══════════════════════════════
emit("east-asia.json", {
  basin: "east-asia",
  note: "PLAN-3 R3. The basin where the Euro-centrism corrective bites hardest: the Nagasaki registers COUNT the Chinese junk trade outnumbering the Dutch ten to one, and the Nanyang system carried tonnage rivalling all European shipping in Asian waters. China coastal grain is asserted (R3 decision) for the same reason the English colliers are.",
  anchors: ["The Nagasaki tōsen registers (Chinese arrivals, counted by the shogunate)", "L. Blussé; Ng Chin-keong (Amoy and the Nanyang)", "A. Reid; K. Sugihara (the junk trade's scale)", "EIC Canton factory records; H. B. Morse"],
  crossChecks: [
    { id: "nagasaki-registers", source: "Nagasaki tōsen counts (pre-cap peak, then the 1715 limit)",
      systems: { "china-japan-junks": 1 },
      decades: { 1690: [50, 100], 1720: [20, 45] } },
    { id: "canton-fleet", source: "EIC/Morse: European+US ships at Canton per season",
      systems: { "canton-arterial": 1 },
      decades: { 1760: [15, 40], 1800: [35, 85] } }
  ],
  ports: [
    P("canton", "Canton (Guangzhou)", "canton"), P("macau", "Macau", null), P("amoy", "Amoy (Xiamen)", null),
    P("ningbo", "Ningbo", null), P("shanghai", "Shanghai", null), P("tianjin", "Tianjin", null),
    P("nagasaki", "Nagasaki", "dejima"), P("naha", "Naha (Ryukyu)", null), P("fuzhou", "Fuzhou", null),
    P("busan", "Busan (Waegwan)", null), P("tsushima", "Tsushima", null), P("ayutthaya", "Ayutthaya", null),
    P("malacca", "Malacca", null), P("manila", "Manila", null),
    P("batavia", "Batavia", "batavia"), P("london", "London", "london"), P("gothenburg", "Gothenburg", "gothenburg"),
    P("boston", "Boston", null)
  ],
  systems: [
    sys("canton-arterial", "The Canton arterial", "counted",
      "EIC factory records and Morse's chronicles: all Europe's — and after 1784 America's — tea fleet at the single legal port. US lanes smeared across the era by constant shares; the cross-check anchors the totals.",
      { from: 1700, to: 1815 }, ["tea", "silk", "porcelain", "specie", "trade-goods"], ["east-indiaman", "merchantman"],
      [L("london", "canton", .25), L("canton", "london", .25), L("gothenburg", "canton", .08), L("canton", "gothenburg", .08),
       L("boston", "canton", .12), L("canton", "boston", .12), L("batavia", "canton", .05), L("canton", "batavia", .05)],
      [[1700, 8, 15], [1730, 10, 20], [1760, 20, 35], [1780, 30, 60], [1800, 40, 80], [1810, 40, 85]]),

    sys("nanyang-junk-trade", "The Nanyang junk trade", "reconstructed",
      "Blussé, Ng Chin-keong, Reid, Sugihara: the Fujian and Canton ocean junks to Siam, Batavia, Manila, and the straits — tonnage rivalling ALL European shipping in Asian waters into the 18th c. THE structural corrective this basin exists for; collapsed by the 1660s haijin (coastal evacuation), roaring back after 1684.",
      { from: 1550, to: 1815 }, ["silk", "porcelain", "tea", "trade-goods", "deerskins"], ["junk"],
      [L("amoy", "batavia", .15), L("batavia", "amoy", .15), L("amoy", "manila", .13), L("manila", "amoy", .12),
       L("amoy", "ayutthaya", .10), L("ayutthaya", "canton", .10), L("canton", "ayutthaya", .10),
       L("amoy", "malacca", .08), L("malacca", "amoy", .07)],
      [[1550, 80, 200], [1600, 100, 250], [1660, 40, 120], [1700, 150, 320], [1750, 180, 380], [1810, 150, 350]]),

    sys("china-japan-junks", "The China–Japan junk trade (Nagasaki)", "counted",
      "The Nagasaki tōsen registers — the shogunate counted every Chinese arrival: ~190 in the peak year 1688, capped at 70 (1689) then 30 (the 1715 Shōtoku regulations). The counted proof that European ships were a minority presence in East Asian waters.",
      { from: 1550, to: 1815 }, ["silk", "porcelain", "copper", "specie", "ginseng"], ["junk"],
      [L("ningbo", "nagasaki", .40), L("nagasaki", "ningbo", .30), L("amoy", "nagasaki", .15), L("nagasaki", "amoy", .15)],
      [[1550, 20, 60], [1640, 40, 90], [1690, 60, 90], [1720, 25, 40], [1780, 10, 25], [1810, 10, 25]]),

    sys("macau-nagasaki", "The great ship of Macau", "counted",
      "The nau do trato: one to three carracks a year carrying Chinese silk against Japanese silver, 1557 until the 1639 expulsion — for decades the most valuable single voyage afloat.",
      { from: 1557, to: 1639 }, ["silk", "porcelain", "specie"], ["carrack"],
      [L("macau", "nagasaki", .55), L("nagasaki", "macau", .45)],
      [[1560, 1, 3], [1600, 1, 3], [1630, 1, 2]]),

    sys("voc-japan", "The VOC Japan trade (Dejima)", "counted",
      "Company records: Batavia to the fan-shaped island — Japanese copper and silver against textiles and sugar, one to seven ships a year.",
      { from: 1609, to: 1795 }, ["copper", "specie", "textiles", "sugar"], ["east-indiaman"],
      [L("batavia", "nagasaki", .55), L("nagasaki", "batavia", .45)],
      [[1620, 3, 8], [1650, 4, 9], [1700, 3, 6], [1750, 1, 3], [1790, 1, 2]]),

    sys("ryukyu-tribute", "The Ryukyu tribute circuit", "counted",
      "Tribute-mission records: Naha's licensed junks to Fuzhou, and the Satsuma-managed Japan connection (Nagasaki as proxy) — the small kingdom that laundered the China–Japan exchange.",
      { from: 1550, to: 1815 }, ["copper", "pepper", "silk", "porcelain"], ["junk"],
      [L("naha", "fuzhou", .30), L("fuzhou", "naha", .25), L("naha", "nagasaki", .25), L("nagasaki", "naha", .20)],
      [[1550, 2, 6], [1810, 2, 6]]),

    sys("korea-tsushima", "The Korea–Tsushima trade (the Waegwan)", "reconstructed",
      "Records of the Japan House at Busan: the Sō domain's licensed vessels — ginseng and Chinese silk against Japanese silver and copper; Korea's single sanctioned sea door.",
      { from: 1607, to: 1815 }, ["ginseng", "silk", "specie", "copper"], ["junk"],
      [L("busan", "tsushima", .55), L("tsushima", "busan", .45)],
      [[1610, 15, 45], [1700, 20, 55], [1810, 15, 45]]),

    sys("redseal-siam-japan", "Red-seal ships and the Siam trade", "counted",
      "The shuin-sen licenses (1592–1635) and Ayutthaya's crown-junk records: Japanese silver south, deerskins and sappanwood north; after sakoku the Siamese and Chinese hulls carry it alone, until Ayutthaya falls (1767).",
      { from: 1592, to: 1767 }, ["deerskins", "silk", "specie", "trade-goods"], ["junk"],
      [L("ayutthaya", "nagasaki", .30), L("nagasaki", "ayutthaya", .20), L("ayutthaya", "canton", .30), L("canton", "ayutthaya", .20)],
      [[1600, 8, 18], [1640, 2, 8], [1700, 3, 9], [1760, 2, 6]]),

    sys("china-coastal-grain", "The Chinese coastal grain and sugar fleet", "asserted",
      "ASSERTED (R3 decision) — the coastal junk metabolism: the northern bean-and-grain fleets (Shanghai–Tianjin), Fujian sugar north, thousands of hulls provisioning the littoral of the world's largest economy. Qing-era studies (the Shanghai shachuan fleet alone counted in the thousands) support central guesses far above any European coasting trade; bounds ±60%. Included on the same consistency grounds as the English colliers.",
      { from: 1550, to: 1815 }, ["grain", "sugar", "salt", "trade-goods"], ["junk"],
      [L("shanghai", "tianjin", .30), L("tianjin", "shanghai", .20), L("amoy", "shanghai", .15),
       L("canton", "amoy", .15), L("ningbo", "tianjin", .10), L("shanghai", "ningbo", .10)],
      [[1550, 320, 1280], [1700, 400, 1600], [1810, 480, 1920]],
      { notes: "Coastal, like the colliers: enters the sailing world only when its ports exist (S2+), and its on-screen share is governed by the evidence-band visibility decision." })
  ]
});

console.log("done.");
