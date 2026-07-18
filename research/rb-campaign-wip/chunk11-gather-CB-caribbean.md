# Chunk 11 gather CB — Caribbean deep search (T12 strand #5, raw, pre-refutation)

**The Caribbean already has 8 sailable nodes (Havana, Kingston, Cap-Français,
Portobelo, Bridgetown, Cartagena, Veracruz, St Eustatius) + Curaçao as a
flow-node folding to st-eustatius + New Orleans staged in the 1815–1850/PLAN-6
files. `caribbean-sugar`, `caribbean-smuggling` (ASSERTED ±60%, St-Eustatius-
anchored), `new-england-caribbean`, and the `middle-passage`/`guinea-outward`
slave systems are authored; `caribbean-smuggling-silence` points to
caribbean-smuggling. Recommend: PROMOTE Curaçao to its own dot; NEW nodes
St Thomas, Paramaribo, Belize; St Barthélemy node-or-fold; a `logwood-mahogany`
system; a `caribbean-golden-age-piracy` HAZARD ZONE (1716–1726, decay from
1718); turtling/wrecking/Mosquito-Shore as register/gestured; strict
double-count guard on caribbean-smuggling + caribbean-sugar.**

## Prior art / existing state (verified in-repo)
- [CB-01] ports.json sailable Caribbean dots: `kingston` 17.9/−76.8 {1655,1815}; `havana` 23.1/−82.2; `veracruz` 19.2/−96.0; `cartagena` (Cartagena de Indias) 10.4/−75.5; `portobelo` 9.6/−79.6 {1597,1815}; `bridgetown` 13.1/−59.6 {1628,1815}; `cap-francais` 19.8/−72.2 {1670,1815}; `st-eustatius` 17.5/−63.0 {1636,1815}. So the brief's "existing = Havana/Kingston/Cap-Français/Portobelo/New Orleans" UNDERCOUNTS — Cartagena, Veracruz, Bridgetown, St Eustatius already sail. class=counted(repo) conf=high.
- [CB-02] `curacao` exists in atlantic.json ONLY as a flow-node with `simProxy: st-eustatius` (no own lat/lon, no sailable dot). Promoting it to its own dot is a real, unmet recommendation. conf=high.
- [CB-03] New Orleans lives in flows/atlantic-1815-1850.md + new-ports-wars + PLAN-6 (the 1815–1850/PLAN-6 layer), NOT in ports.json for the 1550–1815 base. conf=high.
- [CB-04] Existing Atlantic systems touching the Caribbean: `caribbean-sugar`, `caribbean-smuggling` (asserted ±60%, St-Eustatius 3,000+ calls anchor), `new-england-caribbean`, `carrera-chaunu` (Carrera de Indias), `slavevoyages-decades` (middle-passage), plus the Brazil systems. `caribbean-smuggling-silence` (reason=evasion, pointer→caribbean-smuggling) already registers the free-port/asiento-shadow contraband. conf=high.

---

## Candidate PORT NODES

### A. Curaçao (Willemstad) — **PROMOTE to its own dot** (currently a fold)
- [CB-05] Coords Willemstad/Sint Anna Bay **12.11, −68.94** (Leeward Antilles, ~65 km off the Venezuelan coast — Spanish-Main-facing, distinct from St Eustatius up in the Windward/Leeward-Islands arc). class=asserted(geo) conf=high.
- [CB-06] WIC seized Curaçao **1634**; declared an open/free port **1675** (curacaohistory.com — variant dates 1674/1680 in circulation; RECORD THE SPREAD, prefer 1675). class=counted conf=med (date variance).
- [CB-07] WIC granted the **asiento in 1662**; first slave ship *Bontekoe* into St Anna Bay **1657 with 191 Africans**. class=counted conf=med.
- [CB-08] Slave-depot magnitude: **1667–1674 avg ~3,000/yr**; **1674–1713 fluctuating 200–4,400/yr**; after Spain **withdrew the asiento in 1713**, ~**500–600/yr**. (History of Curaçao, Wikipedia.) class=counted/reconstructed conf=med. **COERCED — sober pattern; cross-ref middle-passage/coerced-flows.**
- [CB-09] Function: the primary Dutch **transshipment/entrepôt + contraband gate to the Spanish Main** (mule trade, sloops to Cuba/PR/Santo Domingo; Spanish authorities named Curaçao + Colônia do Sacramento the two main smuggling gates). class=reconstructed conf=high. **Contraband share OVERLAPS caribbean-smuggling — do NOT re-count.**
- **Sim shape:** PROMOTE node `curacao`, allegiance **Dutch (WIC)**, `active {1634, 1815}`, own dot (drop the simProxy). Legitimate/counted traffic = the slave-depot landings (sober) + WIC entrepôt re-export; the contraband stays inside `caribbean-smuggling`. Sugar/produce folds into caribbean-sugar. **Guard: its smuggling is already in caribbean-smuggling's ±60% band.**

### B. St Thomas (Charlotte Amalie) — **NEW NODE**
- [CB-10] Coords Charlotte Amalie **18.34, −64.93**. class=asserted(geo) conf=high.
- [CB-11] Danish settlement **1672** (Glückstadt Co. → Danish West India Co.); first slave ships **1673**; became a slave market. class=counted conf=high.
- [CB-12] **Free port declared 1764** by Frederick V → "busiest harbour in the Caribbean," **>2,000 ship calls/yr**. class=counted/reconstructed conf=med (the "busiest" superlative + 2,000 figure are secondary-source, re-source Hall/Gøbel). **A neutral-flag entrepôt — the register's neutral-carrier parallel (Ostend/St-Barth precedent).**
- [CB-13] Danes carried ~**3,000 Africans/yr** to the DWI by 1778. class=reconstructed conf=med. **COERCED — sober pattern.**
- **Sim shape:** NODE `st-thomas`, allegiance **Danish** (Denmark power exists? — verify powers.json; if not, add), `active {1672, 1815}` (entrepôt function ramps hard from 1764). Entrepôt re-export + slave-market (sober) are its counted traffic; its contraband overlaps caribbean-smuggling → guard.

### C. St Barthélemy (Gustavia) — **NODE-or-FOLD (lean fold/thin node)**
- [CB-14] Coords Gustavia **17.90, −62.85**. class=asserted(geo) conf=high.
- [CB-15] France ceded to Sweden by treaty **1 July 1784**; handover **7 March 1785**; tax-free trading 16 Apr 1785; **free port declared 7 Sept 1785**; Le Carénage → Gustavia. class=counted conf=high.
- [CB-16] **~1,330 ships/yr** at Gustavia by century's end; Swedish West India Company **1786–1805** (royal monopoly, 3/4 profits to company). class=counted/reconstructed conf=med.
- [CB-17] Peak = the **neutral-carrier moment 1793–1815** (Itinerario, "Contraband Trade under Swedish Colours: St. Barthélemy's Moment in the Sun, 1793–1815") — American + belligerent-neutral trade routed under Swedish colours during the Revolutionary/Napoleonic wars. class=reconstructed conf=high.
- **Sim shape:** SHORT WINDOW (1785–1815), function almost entirely the neutral-flag CONTRABAND re-export → **strongest double-count risk with caribbean-smuggling.** Recommend either (i) a thin node `st-barthelemy` `active {1785,1815+}` allegiance **Swedish**, with its traffic tagged as a LATE neutral-carrier strand INSIDE caribbean-smuggling (not a new smuggling volume), or (ii) FOLD entirely into caribbean-smuggling as a dated Swedish-flag sub-strand + a register note. **Ostend-style hard clamp (1785–1815) either way.**

### D. Paramaribo (Surinam) — **NEW NODE + Guianas plantation system**
- [CB-18] Coords Paramaribo **5.87, −55.17** (Suriname River, ~15 km upstream). class=asserted(geo) conf=high.
- [CB-19] Dutch colony from **26 Feb 1667** (captured from the English, confirmed at Breda). class=counted conf=high.
- [CB-20] Sugar early → **coffee the leading export by the 18th c**; coffee peaked **7,615 metric tons 1772–1776**; ~**275,000 enslaved imported 17th–19th c**. 1783 Surinamese won own-shipping rights; 1789 Dutch dropped privileged slave-market access. class=counted/reconstructed conf=med. **COERCED — sober pattern.**
- **Sim shape:** NODE `paramaribo`, allegiance **Dutch**, `active {1667, 1815}`. This is GUIANA (S. American shoulder), not strictly Caribbean — its sugar/coffee is a plantation-return flow to Amsterdam that is NOT in caribbean-sugar (which is Jamaica/Barbados/Saint-Domingue). Author a `guianas-plantations` strand (Paramaribo + Demerara/Essequibo/Berbice feeders) OR fold Paramaribo→Amsterdam into the Dutch Atlantic return lanes. Coffee 1772–76 is a genuinely counted anchor. **No caribbean-sugar double-count.**

### E. Belize / Bay of Honduras — **NEW NODE + logwood/mahogany system** (see Trades §C1)
- [CB-21] Coords Belize Town (Belize River mouth) **17.50, −88.20**. class=asserted(geo) conf=high.
- [CB-22] First British settlement at the Belize River mouth traditionally **1638**; the "Baymen" logwood cutters expanded later 17th c → 18th c despite repeated Spanish expulsions; mahogany transition from the **1770s**. class=counted/reconstructed conf=med.
- **Sim shape:** NODE `belize` allegiance **British**, `active {1638|1660s, 1815}` (settlement contested-early; use ~1660s for the sustained cutter economy, note 1638). Anchor of the logwood-mahogany system.

### F. Nassau / New Providence (Bahamas) — **HAZARD-ZONE anchor + optional wrecking micro-node**
- [CB-23] Coords Nassau **25.08, −77.35**. class=asserted(geo) conf=high.
- [CB-24] The "Republic of Pirates," Nassau, **~1706–1718**, up to **~1,000 pirates** at peak; fed by plunder of the wrecked **1715 Spanish treasure fleet** (Jennings/Vane salvage-camp raids). Woodes Rogers arrived **1718 with 7 ships + royal pardon**, hanged 8 pirates Dec 1718 — ended the republic. class=counted/reconstructed conf=high.
- **Sim shape:** the pirate republic → the HAZARD ZONE (§Piracy). Wrecking economy → register/gestured; a Nassau dot is OPTIONAL/low-priority (thin legitimate trade pre-1718; a British colonial port after Rogers).

### G. Mosquito Coast (Black River) — **FOLD / register (thin)**
- [CB-25] Black River (Río Tinto/Sico mouth) **~15.95, −84.95**; est. **1732 by William Pitt** (Bermudian, via Belize); Anglo-Miskito Treaty of Friendship **1740**, superintendent John Hodgson, British protectorate; **evacuated 1787** per the Anglo-Spanish Convention of 1786. class=counted conf=high.
- [CB-26] Traded logwood/mahogany, turtles, tortoiseshell, sarsaparilla; **Miskito slave-raiding** sold captives to Jamaica (from ~1720 also Maroon-hunting). class=reconstructed conf=med. **COERCED (indigenous captive-raiding) — sober register.**
- **Sim shape:** FOLD into the logwood-mahogany system as a Black-River→Jamaica feeder + a register entry for Miskito raiding; NOT its own dot (thin, evacuated 1787).

### Already-sailing nodes reaffirmed (no action, refreshed anchors)
- [CB-27] **Cartagena de Indias** — the **largest single African entry point into Spanish America** (Plaza de los Coches market by the 17th c; provenance-zone series 1570–1640, Wheat); Tierra Firme galleon terminus; 1713 Utrecht asiento = 5,000 slaves/yr to the South Sea Co. class=counted/reconstructed conf=high. Its slave-import weight should be reflected (sober) if not already.
- [CB-28] **Veracruz** — New Spain flota terminus; fleet 10–90 ships (avg ~25 by mid-17th c); only **six flotas to Veracruz across the 1760s–70s** (irregularity anchor); naos 100–500 t. class=counted conf=high. Already a node; the flota cadence informs carrera-chaunu weighting.

---

## Golden-Age piracy — **HAZARD ZONE** (Pirate-Round precedent), not lanes

- [CB-29] Two distinct phases: **(1) the buccaneering era ~1650–1688** (Tortuga + Port Royal; Anglo-French flibustiers/privateers vs Spanish colonies; Henry Morgan at Port Royal from ~1660, sacked Panamá 1670/71) — largely STATE-SANCTIONED privateering, not a diffuse hazard; **(2) the post-Utrecht "golden age" ~1716–1726** (Nassau republic; Blackbeard, Bellamy, Vane, Rackham, Bartholomew Roberts). class=counted/reconstructed conf=high.
- [CB-30] Decay markers: **Woodes Rogers 1718** (Nassau suppression), **Blackbeard killed Nov 1718**, **Bartholomew Roberts killed 10 Feb 1722** (Battle of Cape Lopez, off Gabon — his range spanned Caribbean/Atlantic/W-Africa, so the Caribbean intensity is already falling by 1722), **William Fly hanged Boston 1726** (conventional end marker). class=counted conf=high.
- **Sim shape:** a HAZARD ZONE `caribbean-golden-age-piracy`, **window 1716–1726**, intensity **peak 1716–1718 → sharp decay from the 1718 Rogers suppression → residual to 1726**. Bounds: elevated-loss multiplier on Bahamas Channel / Windward Passage / Leeward-Islands approaches (asserted, cite the Pirate-Round hazard idiom). The **buccaneer era (1650–1688) is BETTER left as privateering colouring on the war/guarda-costas layer** than a second hazard zone (it was sanctioned and O-D-directed at Spanish targets, unlike diffuse predation) — flag for the refuter. Guarda-costas + 1818–25 piracy already handled in chunks 1/5 → do NOT overlap those windows.

---

## Distinctive trades — mappable lanes vs register

### C1. Logwood & mahogany — **MAPPABLE SYSTEM `logwood-mahogany`**
- [CB-31] Campeche (Yucatán) shipping ~**200 tonnes/yr logwood by the 1570s** (via Campeche); by the 18th c Bay-of-Honduras/Campeche cutters exported **up to ~13,000 tons in a peak year** to Britain; Jamaica (Black River, St Elizabeth) a transshipment centre from ~1715/1773. Mahogany displaced logwood from the 1770s (mahogany volume peaks 1846, out of the 1550–1815 base era). class=counted/reconstructed conf=med (the 13,000-ton peak is a secondary "single year" figure — re-source Bolland/Naylor; treat as a hi-bound, not a mean).
- **Sim shape:** SYSTEM `logwood-mahogany` — lanes Campeche + Bay-of-Honduras (Belize) + Black River(Mosquito/Jamaica) → **Britain** (and a Jamaica re-export leg). Evidence counted-pending on the Campeche/Bay tonnage series. Coerced cutter labour (enslaved Africans + Miskito) → a sober evidence note, NOT a value tier. **Guard: this is a distinct commodity — no overlap with caribbean-sugar or caribbean-smuggling.**

### C2. Curaçao/Jamaica ↔ Spanish-Main contraband — **ALREADY caribbean-smuggling (register only)**
- [CB-32] The asiento's shadow (mule trade, dry-goods + slaves into Cartagena/Portobelo/Caracas territory), the **Free Port Act of 1766** (opened **6 British free ports: 4 in Jamaica + 2 in Dominica**), and the Danish/Swedish/Dutch free ports are the SAME contraband complex already carried by `caribbean-smuggling` (asserted ±60%). class=reconstructed conf=high. **Do NOT author new smuggling lanes — the 1766 act + free ports are DRIVERS to note inside caribbean-smuggling / its silence entry, not new volume.** The node promotions (Curaçao/St Thomas/St Barth) must route only their COUNTED strata (depot landings, entrepôt re-export), leaving contraband in the existing band.

### C3. Turtling — **REGISTER / gestured**
- [CB-33] The Cayman/Miskito-Cays green-turtle fishery provisioned Port Royal/Jamaica and passing ships (a protein staple); no isolable voyage series. class=reconstructed conf=med. **Sim shape:** a `caribbean-turtling` gestured/register entry (provisioning, not a trade lane), cross-ref the ambient-flows fisheries pattern.

### C4. Wrecking — **REGISTER / gestured (optional thin Nassau lane)**
- [CB-34] The Bahamas/Florida-Keys wrecking economy (salvage of vessels on the reefs; the 1715 fleet the exemplar) → Nassau, later Key West. class=reconstructed conf=med. **Sim shape:** register/gestured; optionally a thin Bahamas-banks hazard/salvage colouring, but not a trade lane. Overlaps the piracy-hazard window at Nassau.

### C5. Free-port acts — **CONTEXT / register, not lanes**
- [CB-35] British free ports 1766 (above); Dutch Willemstad/St Eustatius (1675/1756), Danish St Thomas (1764), Swedish Gustavia (1785) — an emulation chain. class=counted conf=high. **Sim shape:** a note in the caribbean-smuggling silence entry + the relevant node blurbs; no new lanes.

---

## Coerced-flow handling (sober pattern)
Curaçao [CB-08], St Thomas [CB-13], Cartagena [CB-27], Paramaribo [CB-20] are all
slave-entry/depot hubs; Miskito captive-raiding [CB-26]. ALL under the
Middle-Passage sober pattern — no value tier, no profit framing, factual —
folded into / cross-referenced with `middle-passage`, `guinea-outward`, and
`coerced-flows-beyond-atlantic`. The depot function (Curaçao/St Thomas
re-exporting captives onward to the Spanish Main) is the intra-Caribbean coerced
leg; record it, do not double-count against the transatlantic middle-passage
landings.

## Silences-register entries (staged — DRAFT, apply with promotions)
```jsonc
{ "id": "caribbean-golden-age-piracy", "scope": "Bahama Channel · Windward Passage · Leeward approaches (1716–1726)",
  "reason": "predation-not-trade", "treatment": "register",
  "note": "The post-Utrecht 'golden age' of Caribbean piracy (Nassau republic ~1706–1718; Blackbeard, Bellamy, Vane, Roberts) preyed on shipping until the 1718 Woodes Rogers suppression and the deaths of Blackbeard (1718) and Bartholomew Roberts (1722) broke it (conventional end 1726, William Fly). Predation, not a lane: a register entry + a decaying hazard zone (peak 1716–18, residual to 1726). The earlier buccaneering era (~1650–1688, Tortuga/Port Royal, Henry Morgan) was largely sanctioned privateering and belongs to the war/guarda-costas colouring, not this hazard. Guarda-costas and the 1818–25 piracy revival are handled separately." }

{ "id": "caribbean-turtling-wrecking", "scope": "Cayman/Miskito turtle fishery · Bahamas–Florida Keys wrecking",
  "reason": "fishery-not-trade", "treatment": "gestured",
  "note": "Green-turtle fishing (Cayman/Miskito cays) provisioned Port Royal and passing fleets; the Bahamas/Florida-Keys wrecking economy salvaged vessels off the reefs (the 1715 Spanish fleet the exemplar). Neither isolates into a voyage series → gestured; provisioning and salvage, not trade lanes." }

{ "id": "miskito-captive-raiding", "scope": "Mosquito Shore (indigenous captive-raiding sold to Jamaica)",
  "reason": "not-yet-reconstructed", "treatment": "register",
  "note": "Miskito raiders sold captives (and, from ~1720, hunted Maroons) to English merchants for the Jamaica plantations. A coerced human flow recorded under the sober pattern (no value tier), cross-ref coerced-flows-beyond-atlantic; the Mosquito Shore's logwood/turtle traffic folds into logwood-mahogany." }
```
(new reason string `predation-not-trade` — shared with the Barbary chunk MA;
confirm `register`/`gestured` treatments at authoring.)

## Flags / could-not-verify
- [CB-06] Curaçao free-port date 1674 vs 1675 vs 1680 — sources disagree; refuter to pin.
- [CB-12] St Thomas "busiest harbour in the Caribbean" + ">2,000 ships/yr" are secondary-source superlatives — re-source Gøbel / N. A. T. Hall, *Slave Society in the Danish West Indies*.
- [CB-31] logwood "13,000 tons in a single year" — single secondary figure; treat as hi-bound, re-source O. N. Bolland; Campeche 200 t/1570s is order-of-magnitude.
- [CB-22] Belize 1638 first-settlement date is traditional/contested — some place sustained settlement ~1660s.
- [CB-08] Curaçao asiento import bands (200–4,400/yr) from Wikipedia synthesis — re-source Postma, *The Dutch in the Atlantic Slave Trade 1600–1815*.
- powers.json: confirm **Danish** and **Swedish** flags exist as Atlantic-usable powers (Sweden is a Baltic power; Denmark may need adding); new Caribbean powers re-raise T5 name-pressure → re-gate at X-S2.
- Whether Paramaribo/Guianas warrants its own `guianas-plantations` system vs folding to Dutch Atlantic returns — a design call for the refuter/synthesis.

## Sources (author/title/year)
- J. Postma, *The Dutch in the Atlantic Slave Trade, 1600–1815* (1990); *Dutch Atlantic Connections, 1680–1800* (2003, ed. Postma & Enthoven).
- W. Klooster, *Illicit Riches: Dutch Trade in the Caribbean, 1648–1795* (1998); "Curaçao as a Transit Center to the Spanish Main…" (KNAW chapter).
- D. Wheat, *Atlantic Africa and the Spanish Caribbean, 1570–1640* (2016); Wheat, "The First Great Waves: African Provenance Zones… Cartagena de Indias, 1570–1640," *J. African History*.
- N. A. T. Hall, *Slave Society in the Danish West Indies* (1992); E. Gøbel, *The Danish Slave Trade and Its Abolition* (2016).
- V. Wilson (ed.), *Sweden and the Caribbean* / Itinerario, "Contraband Trade under Swedish Colours: St Barthélemy's Moment in the Sun, 1793–1815."
- K. J. Fatah-Black, *White Lies and Black Markets: Evading Metropolitan Authority in Colonial Suriname, 1650–1800* (2015).
- O. N. Bolland, *The Formation of a Colonial Society: Belize, from Conquest to Crown Colony* (1977); "From Piracy to Mechanization: The Atlantic Logwood Trade, 1550–1775," *Itinerario*.
- F. G. Dawson / "William Pitt's Settlement at Black River on the Mosquito Shore… 1732–87," *HAHR* 63:4 (1983).
- C. Woodard, *The Republic of Pirates* (2007); M. Rediker, *Villains of All Nations* (2004); D. Cordingly, *Under the Black Flag* (1995).
- F. Armytage, *The Free Port System in the British West Indies… 1766–1822* (1953); F. W. Pitman, *Development of the British West Indies*; "Contraband Trade between Jamaica and the Spanish Main, and the Free Port Act of 1766," *HAHR* 22:2 (1942).
- P. & H. Chaunu, *Séville et l'Atlantique* (carrera cadence, already in-repo); C. H. Haring, *Trade and Navigation between Spain and the Indies* (1918).
- Wikipedia (orientation only): History of Curaçao, Danish West Indies, Swedish colony of Saint Barthélemy, Surinam (Dutch colony), History of Belize, Mosquito Coast, Republic of Pirates, Spanish treasure fleet, Bartholomew Roberts.
