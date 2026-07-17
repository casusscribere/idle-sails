# Ambient flows & naval movement patterns — the Phase-RB catalog

The evidence base for feature pass 4 (the scripted-spawn channel + ambient
flows) and the convoys feature — movement patterns that are **not**
port-to-port trade lanes, each assessed for what the sources support, what
shape it takes in sim terms, and whether the baked-route machinery can carry
it. Produced by the Phase-RB campaign (`research/rb-campaign.md`; tasks
T4 + T9 with T8/T10 strands landing in later sections).

**Method & verification.** Multi-agent web research; **every quantitative
claim carries an adversarial-verification stamp** from an independent refuter
pass (the full-adversarial standard chosen 2026-07-16, exceeding the R3
hand-check precedent):

- ✅ **verified** — the refuter tried to break it and failed; sources agree.
- ⚠ **contested** — sources disagree or the refuter found a real weakness;
  both readings are given, and the sim must use the hedged reading.
- ✂ **refuted** — removed from the catalog (kept in a strike list at the end
  of the section so the refutation itself is recorded).

Sim shapes vocabulary: **convoy grouping** (spawn-event grouping on existing
lanes — `planning/PLAN-convoys.md`) · **recurring local circuit** (short
baked loop, spawned like a lane) · **grounds-loitering** (out, hold a sea
area, return — needs a grounds node or new machinery) · **station-keeping**
(hold a position — cannot ride port-to-port polylines) · **scheduled line**
(fixed-date departures on an existing lane — the pass-4 scripted channel) ·
**hazard-uplift only** (real, but no visible vessels warranted).

The charter applies throughout: no fabricated precision (rates are ranges),
no silent zeros (a pattern we exclude is recorded with its reason), and
patterns answering a gestured silences-register entry say which.

---

## §1 — Convoy institutions & rates (T9) + naval patterns (T4)

*Landed 2026-07-16 (campaign chunk 1). 84 claims gathered by three agents,
every one attacked by an independent refuter: 62 ✅ confirmed, 22 ⚠ weakened
(the corrected readings are what appears below), 0 ✂ refuted. Raw claims and
verdicts are archived in the session record; each value below cites its claim
id.* **This section completes research task T9** — the convoy rule values
feed `data-src/convoys.json` (`planning/PLAN-convoys.md` §1/§5) — *and the
naval-patterns strand of T4.*

### 1.1 The Spanish flota / galeones (Carrera de Indias) — convoy grouping, counted

- **Window:** convoy compulsory by stages — 1543 ordinances, the 10 Jul 1561
  decree forbidding solo sailings, 1564–66 ordinances fixing the mature
  two-fleet system (A-01 ✅). Galeones de Tierra Firme end permanently after
  1739 (A-08 ✅); the New Spain flota limps through four more sailings
  (1757/1768/1772/1776) before the 12 Oct 1778 Reglamento closes the system
  (A-09, A-11 ✅).
- **Shape:** two annual convoys — New Spain (Spain → Veracruz, departing
  ~Mar–May) and Tierra Firme (→ Cartagena/Portobelo, ~Aug–Sep), both
  returning via a Havana rendezvous, home Oct–Nov (A-02 ✅; model months as
  ranges).
- **Sizes:** ~17 ships (1550) growing to 50+ by 1600 (A-03 ✅ reconstructed);
  peak-era homebound combined fleets up to ~90 merchantmen + ≥8 escorts — a
  ceiling, not typical (A-04 ✅). The last flota (1776) was 15 merchantmen +
  2 ships of the line (A-09 ✅) — the honest 18th-c size is ~15–20 sail.
- **Realized frequency (the number the rules must respect):** the "annual"
  convoy was not annual in the 17th c — 29 Tierra Firme sailings 1600–1650
  and **18** fleets 1650–1700 (A-07 ⚠ corrected from 19; ≈0.4–0.6 fleets/yr).
- **Convoy share of traffic:** before 1739 the convoy was the legal default
  and dominant carrier — but the popular ">90%" figure is unverifiable and
  registros sueltos were licensed from as early as 1622; keep it qualitative
  (A-05 ⚠). After 1739 the share inverts hard: registros sueltos carried
  **79.5%** of Cádiz's colonial trade 1739–1778 and **87%** of
  metropolis–colony traffic 1754–1778 (A-10 ✅ counted, García-Baquero).
- **Escort:** capitana + almiranta pair minimum from 1543; the 1564 rule
  required ≥300 tons, 12 cannon + 24 lesser pieces each; avería tax funded
  the escort; the formal Armada de la Guardia (6–8 galleons at strength)
  organized 1591 (A-06 ✅). Azogues: irregular 1–3-ship escorted mercury runs
  Cádiz→Veracruz, independent of flota years (A-12 ✅).
- **Season/risk:** homebound intent was to clear Havana by ~June; the
  documented catastrophic tail is Jul–Oct departures (1622: 8 of 28 lost;
  1715: all 11 lost) (A-13 ✅).
- **Sim shape:** convoy grouping on the existing Carrera lanes, exactly as
  PLAN-convoys specs; era-gate the rule at 1564→1739 (galeones) with the
  1739–1778 tail flipping the lane to independent sailings + rare small
  flotas. **Rule class: counted** for windows and post-1739 shares;
  **reconstructed** for sizes.

### 1.2 The Portuguese Brazil frotas — convoy grouping, counted

- **Window:** compulsory 1649 (Companhia Geral charter, 10 Mar 1649) →
  **Sept 1765** (Pombal's alvará frees Brazil navigation) (A-18, A-22 ✅);
  from 1658 only the RETURN sailing was required in one annual convoy
  (A-19 ⚠ single-sourced — keep low-medium pending a check against Costa);
  company nationalized 1663, dissolved 1720, crown escort continues to 1765
  (A-20 ✅). Pará and Pernambuco leave the system 1755/1759 (A-22 ✅).
- **Trigger context:** ~220 Portuguese ships taken by Dutch raiders in
  1647–48 alone (A-17 ⚠ corrected: ~220 total Dutch seizures, of which
  Zeeland privateers took 49 on the Brazil coast — the "mainly Zeeland"
  attribution is contested).
- **Sizes/escort:** three main annual frotas (Rio, Bahia, Pernambuco), tens
  of merchantmen each (20–100 asserted band; one documented Bahia convoy of
  70), escorted by "usually two but sometimes only one" warship; the 1720
  gold law put all gold aboard the escorts (A-21 ✅). The chartered 36-escort
  fleet never materialized: 18 at the start, under 12 by 1654, 10 by 1660
  (A-18 ✅ enriched).
- **Sim shape:** convoy grouping on Lisbon/Oporto↔Bahia/Rio/Recife lanes,
  era-gated 1649–1765, homebound-weighted after 1658, 1–2 escorts. **Rule
  class: counted** windows, **asserted** sizes (20–100 band).

### 1.3 The Carreira da Índia — departure-window grouping, NOT convoy

- One annual armada (Lisbon Feb–Apr out, India Dec–Jan home, ~6 months/leg)
  whose ships depart together and routinely SEPARATE en route — a
  departure-window cohort, not a kept formation (A-25 ✅). 1,033 Lisbon
  departures 1497–1650 ≈ 6.7/yr (A-23 ✅); 16th-c armada sizes ~15/yr
  (1500s) declining to 5–6 (1550–1600) (A-24 ✅). Losses wreck-dominated —
  captures rare (66 lost vs 4 captured of 806 naus, 1497–1612; phrase as
  "captures rare", not "exactly four") (A-26 ✅ caveated). After ~1650 the
  system withers toward 1–4 independent sailings/yr (A-27 ⚠ asserted/low —
  flag for a T. Bentley Duncan check before the number is used).
- **Sim shape:** seasonal spawn clustering on the existing Lisbon–Goa lanes;
  NO escort vessel and no convoy reprieve (the fate profile is weather, not
  capture). Arguably already served by the sim's seasonal wind-gating; a
  convoy rule is NOT recommended here.

### 1.4 The Manila galleon — scheduled singleton, counted

- Capped at two ships/yr each way by the 1593 decree (caps "never enforced"
  on tonnage — enforce the COUNT, not the tonnage) (A-14 ✅). 108 ships
  served 1565–1815; 26 lost to enemies, ~20 wrecked in the archipelago; the
  per-voyage loss rate ~8–12% is DERIVED arithmetic, not a sourced figure
  (A-15 ✅ caveated). Departure gates: Cavite late Jun–early Jul; Acapulco
  ~Feb–Mar; eastbound **5–8 months typical (4–9 extremes)** — the 4–6 band
  was too tight; 129 days is Urdaneta's 1565 outlier (A-16 ⚠ corrected);
  westbound ~3 months.
- **Sim shape:** the pass-4 scheduled-line channel fits this exactly (it is
  the sim's only true scheduled sail before the 19th-c packets); already
  partially represented by the Acapulco lanes — the scheduling and the
  asymmetric leg durations are the upgrades. No convoy rule.

### 1.5 VOC fleets — seasonal spawn clustering; escort war-gated, European legs only

- 4,722 outward / 3,359 homeward voyages 1595–1795 (B-01 ✅ counted, DAS).
  Outward: 2–3 seasonal cohorts/yr (kerstvloot Dec/Jan, Easter, fair), 5–10
  ships, Admiralty escort through the Channel (B-02 ✅); cohorts depart over
  weeks (the 1663 Easter fleet: 14 ships over two months, B-04 ✅).
  Homeward: **1–3 return fleets/yr** — "one annual retourvloot" is too
  strong; from 1742 the Heren XVII capped arrivals at two fleets/yr
  (B-03 ⚠ corrected) — dominant cohort departing Batavia Nov–Jan, all via
  the Cape. Wartime: North Sea escort rendezvous, Cape warning orders,
  north-about-Scotland routing (B-05 ✅; the achterom detail is standard
  scholarship but class it asserted in rules).
- **Sim shape:** seasonal spawn clustering + a war-gated escort on European
  legs only. **Rule class: counted** volumes, **proxied** cohort structure.

### 1.6 EIC homeward fleets — group sailing with staged escort, proxied

- ~30–45 sailings/yr at the Napoleonic peak (B-06 ⚠ corrected to a range)
  grouped by monsoon season; homeward groups of 6–16 Indiamen (up to ~29
  with country ships — Pulo Aura 1804, B-07 ✅), staged escort joining at
  chokepoints and a **St Helena rendezvous** for the Atlantic leg (B-07,
  B-08 ✅). Indiamen with letters of marque were legally EXEMPT from
  compulsory convoy (B-09 ✅ — the 1911 EB confirms the mechanism).
- **Sim shape:** convoy grouping on the India/China lanes with the escort
  attached only on the St Helena→Channel segment in war years.

### 1.7 The British compulsory convoy system — the load-bearing wartime rule

- **Statutes:** Cruisers and Convoys Act 1708 — ≥43 warships assigned to
  trade protection (6 third rates / 20 fourth / 13 fifth / 4 sixth)
  (B-10 ✅ statute text). Convoy Acts 1793 and 1798 (renewed 1803):
  unescorted foreign-trade sailing illegal; £1,000 penalty, **£1,500 when
  carrying government stores, plus forfeiture of insurance on capture**
  (B-11 ✅ enriched); exemptions: letter-of-marque ships (runners, EIC), and
  the 1799 Newfoundland/Labrador carve-out (uncontradicted).
- **Sizes:** wartime batches of "several hundred merchantmen under one or
  two escorts" are the confirmed late-war norm; the 2,210 figure is the 1809
  Baltic SEASON aggregate, not one formation; "typically 100–200" is
  unsourced; single 400–600-ship convoys stay asserted/low pending Knight or
  Ryan directly (B-13 ⚠ corrected). Representative escorted convoys:
  67 merchantmen / 2 frigates (Cork 1804), 23 / 3 (1805) — escort ratio ~1
  per 20–35 (C-31 ✅).
- **Share of trade in convoy:** NO source quantifies it — the 75–95% band is
  pure assertion with wide bounds; the penalty + insurance forfeiture argue
  high compliance, but runners, letters of marque, and the coasting trade
  are substantial carve-outs (B-24 ⚠ — verify against Knight's text; keep
  class `asserted`).
- **What convoy bought:** French raiders took >10,000 (some accounts
  ~11,000) British merchantmen 1793–1815 ≈ 2.5%/yr of a ~20,000-ship fleet
  (B-12 ✅ — state the basis when parameterizing); the Naval-Chronicle table
  from Lloyd's List gives captures 4,314 (705 recaptured) vs 2,385 sea-peril
  losses 1793–1800 — captures ≈ 1.4× weather losses (C-23 ✅ counted, with
  the intermediary provenance noted). Insurance priced convoy directly:
  a 2% premium abatement (Glasgow, 1759 — NOT the 1790s), Postlethwayt's
  ~3.5× mid-century differential, and order-10× spreads on exposed routes in
  the 1790s (B-15 ⚠ corrected). Losses concentrated on independents and
  stragglers.
- **The disaster tail (rare, individually famous):** Lagos 1693 — the
  Smyrna fleet, ~92+ of the Straits-bound ~200 lost, ~£1M insured losses,
  19–33+ underwriters broke, premiums had run 25% (B-16, B-17 ✅); Aug 1780 —
  Córdova took 55 of 63, ~£1.5M on Lloyd's + the EIC (C-32 ✅); Oct 1795
  Levant convoy — of ~31 still in company after the Gibraltar split, 30
  taken + HMS Censeur captured (B-14 ⚠ corrected); Apr 1804 — the Apollo
  convoy wrecked 25–29 of 67 on a shoal, no enemy involved (B-14 ⚠).
  Escort-fate calibration: 409 RN warships lost 1803–15, 61% wreck /
  37% enemy, 250 of them while escorting convoys (C-33, B-24 ✅).
- **Sim shape:** exactly PLAN-convoys' war-gated rule — convoyed vessels get
  the escorted reprieve on capture-class fates only (wreck risk untouched:
  Apollo), a small runner fraction sails at elevated capture rates, and the
  rare whole-convoy disaster can ride the pass-4 scripted channel.

### 1.8 Levant convoys — Dutch/English convoy; the caravane is NOT convoy

- Dutch Levant trade under compulsory convoy from 1621 (six warships ≥200
  lasts ordered; the Directie van de Levantse Handel administered convoy
  fees from 1625; Smyrna the chief destination after ~1651) (B-18 ✅).
  English/Dutch Smyrna trade moved as ~1–2 large escorted convoys/yr (the
  1693 fleet is the size datum). The Venetian **muda** galley-convoy system
  ended 1533 — Venice sails convoy-less for the sim's whole era (B-19 ✅).
- **T9's substantive correction to PLAN-convoys:** the French **caravane
  maritime was NOT a convoy institution** — it was individual-ship
  tramping/cabotage between Ottoman ports (B-20 ✅, Cairn/RHMC); French crown
  escort of Marseille convoys was wartime-only and unquantified. The
  PLAN-convoys §1 table's "caravane/Levant convoy" row is re-scoped to
  **Dutch/English Smyrna convoys**; French échelles lanes stay single-ship.
- **Sim shape:** an annual convoy pulse on Smyrna lanes for Dutch/English
  flags only, war-gated escort; Venetian and French Levant lanes individual.

### 1.9 French wartime grand convoys — occasional events, not a standing system

- No standing merchant-convoy statute; the CdI ran ~10–11 ships/yr from
  Lorient 1720–1770 (3–4/yr 1664–1719; Lorient the company port from its
  1666 founding — the "moved from Le Havre 1675" story is unsupported)
  (B-21 ⚠ corrected). Wartime grand convoys under battle-fleet escort:
  ~250 merchantmen under 8 of the line (2nd Finisterre 1747 — the escort's
  sacrifice saved the body in the action, though Pocock later intercepted
  many survivors; B-22 ✅ caveated); 1781 — 15 transports lost to Kempenfelt,
  then a gale scattered the rest (B-23 ✅).
- **Sim shape:** war-gated occasional very-large convoy events on French
  Atlantic lanes with heavy escort and correlated loss — event-grade, not a
  continuous rule.

### 1.10 Guarda-costas & revenue cruisers — hazard-uplift, order-of-magnitude only

- The Spanish Caribbean guarda-costa system: private vessels under
  governors' commissions (not a state navy), based Santiago de Cuba /
  Trinidad / Baracoa, spreading after 1720 to St Augustine and Puerto Rico
  (C-02 ✅). **No primary hull-count exists** — read "dozens, not hundreds"
  and refuse a number (C-01 ⚠). Seizures: ~150–330 British vessels
  1713–1739 (the "500+" and the garbled "200 in 1737–43" collapse into the
  same ~200-over-three-decades tradition; C-03, C-04 ⚠); claims exceeded
  £500,000 by 1731 (✅). The Armada de Barlovento was an irregular 2–12
  hulls, chronically undermanned, disbanded 1748 (C-05 ⚠ corrected).
  British revenue cruisers: 44 cutters (1784), 33 (1797) — a 20–50 band all
  era (C-06, C-07 ✅), below world-plate resolution.
- **Verdict:** hazard/seizure uplift on lanes threading the Cuba–Puerto Rico
  passages, era-gated ~1713–1739 — **no visible vessels warranted** at
  current chart resolution (the numbers would be fabricated precision).
  Revenue cutters: nothing, unless a Britain-coast plate ever exists.

### 1.11 Station-keeping — the best-evidenced pattern the engine cannot yet carry

- Blockade squadrons: the Western Squadron (formalized 1746) cruising the
  Channel approaches (C-08 ✅); Hawke 1759 — **~23–25 of the line** (not 32;
  C-09 ⚠ corrected), ~15–20 on station, six months continuous via at-sea
  victualling (C-10 ✅); Cornwallis 1803–05 — ~40 of the line at the
  command's peak, 15–25 on station off the Goulet, Ushant rendezvous /
  Cawsand stores / Torbay in heavy weather (C-11 ✅); St Vincent's paired
  inshore/offshore squadrons, monthly-scale rotation (C-12 ✅). Toulon was
  an OPEN blockade — Nelson's 8–12 of the line cruising a
  Barcelona–Balearics–Sardinia patrol BOX, ~5 months at sea at a stretch
  (C-13, C-14 ✅). Overseas stations: Jamaica/Leewards single-digit ships in
  peace (5 ships, 1816 list), 2–4× in war (C-15, C-16 ✅). Guard ships never
  move (C-17 ✅ — no vessels).
- **Verdict:** station-keeping **cannot ride port-to-port polylines** — it
  needs a station-node primitive (a held sea-point, the grounds-node pattern
  PLAN-4 E3 already approves) plus rotation legs that CAN reuse baked
  geometry (Torbay↔Ushant). War-gated to specific conflicts with excellent
  evidence-classed strengths. Recommend: build station-node + rotation-leg
  together with the E3 grounds node; until then blockades stay invisible
  (declare in the silences register when §2 lands).

### 1.12 Privateer cruising grounds — grounds-loitering; interim hazard-uplift

- British commissioning (counted, Starkey's HCA declarations): 1,191
  (1739–48), 1,679 (1756–62), 2,676 (1777–83), 1,795 (1793–1801), 1,810
  (1803–15) (C-18 ✅) — declarations, NOT active cruisers; dedicated private
  ships of war were a minority (visible fraction perhaps 10–25%). French
  gross-prize counts are real but mutually inconsistent when summed —
  Saint-Malo 3,384 (1689–97) + Dunkirk's claimed 6,436 exceed plausible
  Allied losses; they include ransoms/recaptures — **never use as net loss
  rates** (C-19 ✅ caveat load-bearing; C-20, C-21 ⚠). ~60 concurrent
  Dunkirkers in the Channel/Irish Sea at peak (low confidence). American
  privateers: ~1,700 letters / ~800 vessels / ~600 prizes (1776–83, C-24 ✅);
  ~525 privateers / ~1,300 prizes vs the USN's 254 (1812–15, C-25 ✅).
  Channel Islands ≈ £1M per major war (C-26 ⚠ attribution floats). Career
  outliers: Bart ~386, Duguay-Trouin 300+ (C-22 ✅).
- **Verdict:** grounds-loitering (sortie → cruise a ground → return) needs
  the same grounds-node machinery as whaling; sortie/return legs ride
  polylines. **Interim treatment (buildable now):** war-gated capture-hazard
  uplift on lanes crossing the Western Approaches / Channel / Caribbean
  passages, calibrated by C-23 (captures ≈ 1.4× weather losses, 1793–1800).
  Visible privateers wait for the grounds node.

### 1.13 The Pirate Round — the existing hazard is the right treatment

- Window verified: ~1693–1700 + a ~1719–1721 revival (C-27 ✅); scale tiny —
  a handful of ships at a time, a few dozen voyages ever (the "17 ships /
  1,000 pirates at St Mary's" staples are unanchored colonial exaggeration —
  dropped; C-28 ⚠). Signature prizes: Ganj-i-Sawai £325k+ (1695), Nossa
  Senhora do Cabo ~£800k (1721) (C-29 ✅).
- **Verdict:** the sim's existing hazard uplift matches the evidence;
  nothing more structural is warranted. At most, 1–2 scripted named voyages
  per seed (Tew 1693, Every 1695) on the pass-4 channel — easter-egg grade.

### T9 rule values — the `data-src/convoys.json` inputs

| Rule | Window | Rate (share of lane sailings in convoy) | Size (merchants) | Escort | Class |
|---|---|---|---|---|---|
| flota / galeones | 1564–1739 (galeones); flota tail to 1776 | dominant/default pre-1739 (qualitative; NOT "90%"); realized fleet frequency 0.4–0.6/yr in the 17th c; **0.13–0.21 post-1739** (=1−sueltos share) | 17→50+ (16th c), ~90 ceiling, 15–20 (18th c) | 2 (capitana/almiranta) → 6–8 at strength | counted windows/shares; reconstructed sizes |
| Brazil frotas | 1649–1765 (return-leg-weighted after 1658) | high (compulsory; unquantified) | 20–100 (asserted; one counted 70) | 1–2 | counted windows; asserted sizes |
| VOC cohorts | all era (company); escort war-gated, European legs | outward 2–3 cohorts/yr of 5–10; homeward 1–3 fleets/yr | 5–14 | Admiralty warships, Channel/North Sea only | counted volumes; proxied structure |
| EIC homeward | war years esp. 1793–1815 | grouped by monsoon season (default in war) | 6–16 (to ~29 w/ country ships) | staged; St Helena→Channel | proxied |
| British wartime convoy | per-war; compulsory 1793/98–1815 | **asserted 0.75–0.95** of foreign-trade sailings under the Acts (wide; verify vs Knight); voluntary/lower in earlier wars | several hundred under 1–2 escorts (late-war norm); 60–200 typical batches asserted | ~1 per 20–35 | counted statutes; asserted rates |
| Dutch/English Smyrna convoy | Dutch compulsory 1621→; English per-war | ~1–2 convoys/yr | ~30–200 (1693: ~200 Straits-bound) | ~6 warships (Dutch order); 13 close escort (1693) | reconstructed |
| French grand convoys | war events only | episodic | ~150–250 | battle-fleet detachments | reconstructed |

**Charter exclusions stand** (PLAN-convoys): no convoy grouping on
`middlePassage` or `framing`-carrying lanes; naval lanes excluded in v1.
**Removed from the table:** the caravane maritime row (not a convoy —
B-20 ✅); the Carreira and Manila runs (window-groupings/scheduled
singletons, not convoy events — §1.3, §1.4).

### Verification record — chunk 1

62 ✅ / 22 ⚠ / 0 ✂ across 84 claims (A-01..27 Iberian · B-01..24
company/British/Levant · C-01..33 naval patterns). The refuters' systemic
findings, which later chunks should watch for: season-cohort vs
sailing-formation conflation; snippet numbers carrying wrong provenance
(the "2% abatement" is Glasgow 1759, not the 1790s); popular-history
staples without archival anchor (St Mary's "17 ships"); gross prize counts
that cannot be summed (ransoms/recaptures inflate them); and
tertiary/AI-generated pages behind load-bearing numbers (the 2,210 Baltic
figure, the "30 EIC ships/season", the 75–95% convoyed share) — all such
values are classed `asserted` with wide bounds until checked against
Knight, Ryan, or Bowen directly. Flagged for one more source each: the
1658 Brazil return-only rule (Costa), the 18th-c Carreira rate (Duncan).

---

## §2 — Fisheries & whaling as grounds-traffic (T4 + E3 + T8 strands)

*Landed 2026-07-16 (campaign chunk 2). 84 claims gathered by three agents
(D herring · E cod/Iceland/stockfish · F whaling incl. PLAN-4 E3
verification), every one attacked by an independent refuter: 74 ✅, 10 ⚠
(corrected readings below), 0 ✂. This lands T4's fisheries strand, the
adversarial re-verification PLAN-4 E-R1 requires for E3, and two of T8's
declared-silences items (Iceland fisheries; Bergen/Trondheim stockfish).*

### 2.1 The grote visserij — the Dutch herring buss fleet (grounds-loitering, quantified)

- **Fleet series (safe for sim parameters):** ~500 busses averaging
  20,000–25,000 lasts/yr in the early 17th c (counted landings 25,600–32,100
  lasts/yr 1600–24; the "500–800" folk range is defensible only at its low
  end — Kranenburg consigned the pamphlet counts "to the realm of fables")
  (D-01 ✅); ~300 ships by 1736, 162 by 1779, near-stop 1795–1814, small
  persistence to 1857 (D-13 ✅); catch falling to ~6,000 lasts/yr by the
  mid-18th c (D-14 ✅). Late-era sailings ran on a 500-guilder state subsidy
  (D-24 ✅). Crew is era-dependent: ~18–20 at the 17th-c peak, ~13–15 late
  (D-04 ⚠ corrected); peak direct employment ~6,000–10,000 men (D-18 ⚠).
- **Calendar & grounds-track (safe):** season opens St John's Day, 24 June,
  enforced fleet-wide by the College van de Grote Visserij (D-05 ✅); the
  track runs Shetland/Fair Isle (late June) → Buchan Ness by September →
  south along the English coast → off Yarmouth 25 Nov–1 Jan (D-06 ✅);
  3 voyages/season, ~40–60 lasts per SEASON (the per-voyage reading is
  arithmetically refuted) (D-07 ✅ corrected); no herring traffic Feb–May
  (D-26). Home ports: Maas-mouth (Vlaardingen, Maassluis…) and Enkhuizen/
  Amsterdam — **Amsterdam is the roster proxy** (D-19 ✅).
- **Ventjagers:** fast carriers ≈1 per 10 busses racing the first maatjes
  home from 24 June, early-season only (D-08 ✅) — a seasonally-gated
  scheduled line on the same geometry, nearly free flavor.
- **Escorts & raids:** escort institutional from 1439 (lastgeld), realistic
  ratio one warship per ~160 busses (1635) (D-09 ✅). Wartime = deep
  suppression, not zero: counted landings fell ~70–80% in the WSS
  (5,089–9,228 lasts/yr 1700–14) (D-12 ⚠ corrected — and vessel counts DO
  exist for 1703: >160 busses burned in Shetland ports in June + a
  ~200-vessel fleet destroyed 10 Aug, French-side figures, reconstructed/
  low). Dated catastrophes for the scripted channel: Oct 1625 (150 vessels
  incl. 20 warships, a fortnight, D-10 ✅); Aug 1635 Collaert — 74 of 160
  burned in the first strike, ~50 more near the Dogger on 19 Aug, 975
  captives across the cruise (D-11 ⚠ corrected).
- **Foreign buss fleets (counted, palette-swap spawns):** Emden 6→55 busses
  1770–1799 (Prussian; sometimes under Dutch passports), Altona 13–29
  busses 1769–1807 (Danish; the 1783 Shetland snapshot: 29 busses × 14
  men), Nieuwpoort/Ostend ~24 (1784), the Free British Fishery Society
  1750–72 marginal (its 200–300 "busses" inflated by inshore craft)
  (D-20, D-22, D-23 ✅). Scottish/English inshore boats (~6,000 by the late
  18th c) never cross open water — a declared boundary, not chartable
  (D-21 ✅).
- **Sim shape:** the canonical grounds-node case — honest WITHOUT new dwell
  machinery as 3 round-trips/season to the month-appropriate node
  (Shetland → Fladen/Buchan → Dogger → Yarmouth Roads), the E3 precedent.
  **Register:** `north-sea-herring-fishery` graduates gestured → QUANTIFIED
  when the pattern ships.

### 2.2 Dogger Bank cod/haddock doggers — scale unquantified, stays gestured

Line-fishing at anchor on a single static ground, attested from the 14th c —
but **no fleet-size series exists in anything fetched** (the one counted
datum: a Farsund family's 12 mixed-deployment vessels, 1770s) (D-25 ✅).
Verdict: keep gestured in the register (or asserted tens-of-vessels at
most); quantify the herring fishery first.

### 2.3 The Banks cod fishery — three shapes, the sack triangle mappable now

- **Scale profile for the EXISTING lane** (the sim already sails Banks cod
  under the St John's era-name): English ~50 ships (1578, Parkhurst ✅) →
  250–300 (1615–20, ✅) → ~100 by 1660 → 43 in 1684 (official; excludes
  sacks/bye-boats) → 171 in 1700 → 20–30 in the WSS (all ✅ counted) →
  ~150–200 through the 18th c → the 1780s peak (more ships in 1783 than
  ever; ~280 bankers 1788; the 950,000-quintal glut breaking prices,
  E-17 ✅) → irreversible migratory collapse 1793–1815 (82→33 bankers;
  residents 4:1 by 1805; Ryan's *Fishery to Colony* confirmed) (E-18 ✅).
  French: 60–90 (1520s) → Turgeon's ~500 c.1550 (the eyewitness counts are
  inshore-biased lows) → 359 in 1686 (state records) → 300–400 to the
  1770s, **suspended in every Anglo-French war** — the lane must war-gate
  (E-15 ✅). Granville alone armed 80–105+ ships/yr 1750–80s (E-16 ✅
  understated if anything). The 1573 English count is contested (4 vs 30
  readings — anchor on 1578, E-04 ⚠). Season: depart early spring, fish
  Jun–Aug, home in autumn (E-20 ✅).
- **The banks WET fishery** (French morue verte to Norman ports; English
  bankers post-1713) is grounds-loitering on the Grand Banks — needs the E3
  grounds-node primitive; the na-northeast plate already leaves it sea room.
- **The sack-ship triangle is mappable TODAY** — a normal trade lane:
  London/Bristol → St John's (goods) → Lisbon/Cadiz/Livorno/Naples/
  Marseille (dried cod) → home (wine/oil/specie); ~50 English sacks in
  1700, 7 in 1708, Dutch sacks prominent 1620–60 (E-21, E-11, E-13 ✅). All
  market ports are in the roster. **The best single addition from this
  chunk — the missing half of the existing Banks lane.** Also: a distinct
  New England ↔ Newfoundland supply lane (20 vessels 1721 → 95 in 1748,
  refuse cod onward to the West Indies) (E-19 ✅).
- Beware the portal error the gatherer caught and the refuter confirmed:
  Heritage NL's "17 million tons British production 1763–1815" is wrong by
  ~an order of magnitude — direction only (E-22 ✅ as flagged).

### 2.4 Iceland fisheries — a quantified gap for the register (T8 item)

English doggers: ≥100 vessels/yr at the 15th–16th-c peak (149 counted in
1528 — of England's 440 total fishing vessels); driven from the islands by
1560; the 1630s revival hit ~160 Norfolk/Suffolk ships ("the greatest
fishing of the kingdom", exceeding Newfoundland) before collapsing to 19 by
1654, remnant to c.1702 (E-24, E-25, E-26 ✅; the 1425 mass-loss date
corrects to the Maundy Thursday gale of **1419**, E-23 ⚠). The Danish
monopoly (1602–1786/87) closed the SHORE, not the sea — Dutch offshore
fishing attested from 1655 (series 1751–86), French from Dunkirk (series
1763–92; the famous Islandais boom is post-1852 — do not backdate)
(E-27, E-28, E-29 ✅); combined landings ~34,000 t/yr 1766–72
(proxied/medium). **Verdict:** grounds-loitering at a SW-Iceland node —
needs the grounds-node primitive + a new sea node; until then a NEW
silences-register entry (declared, quantified). Weak roster proxy for the
English east-coast ports: Newcastle.

### 2.5 Bergen stockfish — a genuine trade lane; the strongest promotion candidate here

Two stages: the Lofoten→Bergen jekt feeder (~200 boats/season on two fixed
stevner, E-32 ✅) is coastal-ambient — register as context, don't sail it.
But **Bergen → Hamburg/Lübeck/Amsterdam/London (stockfish out, grain back)
is an ordinary port-to-port exchange lane** — parameterize the sim's opening
decades at **~2,000–3,000 t/yr (≈30–60 shiploads), rising** (the gatherer's
">4,500 t/yr by 1600" was uncorroborated — E-31 ⚠ corrected); counted-class
after 1731 (Bergen >70% of Norway's fishery exports — counted/medium until
the paywalled SEHR 2025 body is read, E-34 ⚠); clean institutional
era-marker (Hansa Kontor to 1754, Norwegian Kontor after, a traffic
non-event) (E-33 ✅). **Verdict: mappable with the sim's NORMAL machinery,
conditional on adding Bergen as a port — recommend Bergen to the promotion
queue** (destinations all in roster); without Bergen it is a silences entry.

### 2.6 Northern (bowhead) whaling — annual grounds-run, counted volumes

Smeerenburg 1614–~1660 exactly as the sim's port window has it (the
"10,000-man Blubber Town" is debunked myth) (F-05 ✅); the bay→pelagic
transition ~1640s–60s IS the `svalbard-offshore-whaling` silences
transition — **open the offshore grounds node ~1660 as Smeerenburg closes**
(F-06 ✅). Volumes are genuinely counted (de Jong): Dutch peak 251 ships
in 1721 (of 355 total incl. 79 German, 20 Biscayan); 1,337 Greenland +
340 Davis Strait voyages in 1749–58 (~168/yr); ~48/yr by 1789–94, dead in
the French period (F-07, F-08 ✅). Davis Strait opened 1719 (29→64→100+
ships in three years — a dated second node) (F-09 ✅). British: the bounty
statute is 1733 but **traffic ramps only from ~1750** (2 ships 1749 → 20 →
83 by 1756); peak 1786–88 at ~250 vessels from 23 ports (London 91, Hull
36); second phase 1810s–20s (Hull ~60 ~1820); English ports' trades
collapse 1823–49 (dates = effective collapse, not last voyages — F-13 ⚠),
the Scots (Peterhead/Dundee) carrying the late trade to era end
(F-11, F-12 ✅). Season: out Mar–Apr, whale May–Jul at the ice edge, home
Aug–Oct; wintering = disaster (F-14 ✅ — season-gate exactly like
Arkhangelsk). Dutch share ≈2/3 of the northern fishery (weight only, never
surfaced as precision) (F-10 ✅).
**Sim shape: HIGH mappability** — seasonal lanes to two dated grounds nodes
(Greenland Sea/Spitsbergen ~1660→; Davis Strait 1719→) with season-gated
legs; counted decade volumes ready for a flow system.

### 2.7 Southern whaling — E3's evidence base verified; honest-rendering rules

**PLAN-4 E3 verification (the E-R1 requirement): PASSED.** The BSWF
database is real and as described — 2,543 voyages / 930 vessels 1775–1859
(Jones/Richards/Chatwin; cargo returns on ~70%; the "~30/yr" is arithmetic
masking thin-pre-1815/dense-post-1815 coverage) (F-01 ✅). AOWV: 15,000+
records, coverage from 1667 — earlier than the sweep claimed (F-02 ✅).
Sanger's Scottish database confirmed (F-03 ✅). Nantucket offshore fishery
~1715 confirmed with the 1712 legend hedge (F-04 ✅).
Grounds openings (all ✅): the misnamed "Brazil Banks" are **right-whale
water off the Plata** — the node belongs beside the adopted Montevideo
complex (F-15); BSWF born 1775 from the captured Nantucket "Falklands
Fleet" (F-16); the Pacific opens with the Emilia (London, 1 Sept 1788;
first sperm whale off Chile 3 Mar 1789) (F-17); the Offshore Ground 1818
(50+ ships within two years) (F-18); the Japan Grounds 1819–20, credit
shared British/American — a both-flags lane (F-19). Voyage lengths grow
~9–12 months (Atlantic, 1770s–90s) → 2–3 yr (Pacific) → 3–4+ yr (1840s)
(F-20 ✅); the American fleet peaks 1846 at 735–736 registered vessels
(~80% of a world fleet of ~900; registered ≠ annual departures) (F-21 ✅) —
in-scope thanks to the 1850 extension. British per-decade shape stays
asserted (bounds 15–70/yr) until the downloadable BSWF CSV is tallied — an
easy counted upgrade; note the timeline reads the peak as ~1820–35
(F-22 ✅ as flagged); wartime losses cluster 1807–13 (F-23 ✅).
**Sim shape: MEDIUM** — dated grounds nodes visited in sequence with long
at-grounds dwell; NEVER draw a confident polyline across a cruising ground
(a hatched grounds region with dwelling vessels is the no-fabricated-
precision rendering).

### Verification record — chunk 2

74 ✅ / 10 ⚠ / 0 ✂ across 84 claims (D-01..26 herring · E-01..35
cod/Iceland/stockfish · F-01..23 whaling). Systemic findings: era-blending
(late-18th-c counted details projected onto 17th-c peaks — crew sizes,
employment); catastrophe narratives absorbing cruise totals into single
actions (Collaert 1635); single-portal dependence (Heritage NL — matched
wherever independently checkable); date slips (the 1419 gale; port-exit
dates meaning effective collapse); and headline statistics cited but
unverifiable (the 8.9%→0.3% GDP share — direction certain, endpoints
uncited; the >70%-Bergen share pending the paywalled body). Follow-ups
flagged: tally the BSWF CSV (upgrades British southern whaling to counted);
read SEHR 2025's body (Bergen shares); produce the van Bochove page
citation before the GDP-share figure is used anywhere.

## §3 — Scheduled & state services (T4 + E6 + T10 packet lines)

*Landed 2026-07-16 (campaign chunk 3). 73 claims gathered by three agents
(G packets · H hajj/Jeddah incl. PLAN-4 E6 verification · I caravane/
Ottoman carriage), every one attacked by an independent refuter: 59 ✅,
13 ⚠ (corrected readings below), and the campaign's first ✂ — a refuted
negative claim about India mail, recorded in full at §3.3. This lands T4's
scheduled-services strand, E6's verification, and T10's packet-lines item.*

### 3.1 The Falmouth Post Office packets — the archetype scheduled line, counted

- **Windows per route (era-gates for the scripted channel):** station
  opened 1689 (Corunna; diverted to **Lisbon 1702**, continuous to the end);
  West Indies: Dummer's contract service 1702–11 (Portsmouth/Plymouth-based,
  NOT Falmouth — G-04 ⚠) then permanent from **1744/45**; New York from
  1755 (Franklin-organized; disrupted 1775–83); **Rio 1808** (via Madeira;
  Plata extensions 1820s–30s); Gibraltar/Malta 1806, wider Med 1813;
  Admiralty transfer 1823, steam on near routes from the early 1830s,
  **disbanded 1850**, last sailing packet home 30 Apr 1851 (G-01..09,
  G-12 ✅ — every establishment count checked digit-for-digit: 18 vessels
  1744, 39 in 1827, ~40 in the 1830s on ten routes).
- **Frequency:** nominally monthly per ocean route — but "monthly" is not a
  safe blanket: the Falmouth–Kingston run at one point had **16 packets
  sailing fortnightly** (G-11 ⚠). Vessels: fast brigs ~150–230 t, ~10 guns,
  crews 28–35 (G-10 ✅ typology).
- **War:** the 1797–98 capture wave and reform crisis are attested (the
  specific "≥7 in 18 months" count is uncorroborated — G-11 ⚠); packets
  carry a capture-risk uplift 1793–1815 and famous defensive actions.
- **Sim shape:** the pass-4 scripted channel, one spawn per route per
  schedule tick. **Proxy warnings:** Falmouth is not in the roster (a
  London proxy loses the west-country identity — the whole point of
  Falmouth was avoiding the Channel); Halifax needs a proxy; Barbados/
  Antigua calls compress onto Kingston.

### 3.2 The Spanish correo marítimo — two scheduled routes, counted

Created 6 Aug 1764: monthly Coruña–Havana via San Juan/Santo Domingo
(realized **~10.4/yr** — 342 voyages 1764–96, independently confirmed) +
Coruña–Montevideo from Dec 1767, quarterly → bimonthly (the 1771-vs-1778
date split is genuinely in the sources; six-per-year firm from the 1777
Ordenanza), ~9-month Plata round trips (La Princesa's documented 9.3
months). Navy absorption 6 Apr 1802 ends the true scheduled window; the
Plata line dies with Montevideo 1814; extinct by ~1824 (G-13..17 ✅).
**Sim shape:** scheduled lines; Corunna is absent from the roster and the
Cadiz proxy genuinely distorts (it conflates the mail identity with the
flota's) — **the Plata line should ship WITH PLAN-4's Montevideo**, not
before.

### 3.3 Other state mail — including the campaign's first refutation

- **French royal packets** (Sept 1783–1793): 62 round trips ≈ 6.5/yr —
  "monthly" was aspirational (G-18 ✅). No French Atlantic roster port;
  candidate silences entry rather than a lane.
- **Portuguese mail brigs** (Mar 1798–1803): two circuits × 6/yr, 16 brigs
  (peer-reviewed match); a single scripted Lisbon–Rio route bridging into
  the Falmouth–Rio line at 1808 is the honest cheap rendering (G-19 ✅).
- **✂ REFUTED — "no scheduled India sea mail before the 1830s" (G-20).**
  The refuter found an 1814 Act of Parliament under which the Post Office
  ran **monthly packet sailings to Madras and Calcutta from 1815** (EIC
  hulls; plus the EIC's own "Suez packet" experiment from 1798). The
  corrected reading: no dedicated packet VESSELS before the 1830s, and
  pre-1814 mail rode the seasonal Indiaman fleets — but a sim era-gating
  India mail on "the 1830s" would be wrong; the 1815 service is real.
  (Recorded per the strike-list rule: the refutation is data.)

### 3.4 The American sailing packet lines, 1818–1850 (the T10 item)

The Black Ball Line: first fixed-day sailing 5 Jan 1818, four ships
NY–Liverpool monthly, semimonthly from 1822 (G-21 ✅); passages ~23 d
east / ~40 d west — the westerlies asymmetry the sim's wind-routed lanes
already produce (G-22 ✅); Red Star + Swallowtail 1821/22; by 1824–25 four
monthly Liverpool sailings + two Havre + one London from New York
(G-23 ✅); the Havre lines' 8th/16th/24th schedule verified verbatim
(G-25 ✅). Fleet growth 32 ships (1825) → ~52 (mid-1840s) ≈ three European
sailings/week — **an Albion single-source series with one corrupted
transmission; medium confidence** (G-24 ⚠). Mail leaves sail 4 Jul 1840
(Cunard, fortnightly Liverpool–Halifax–Boston) (G-26 ✅); sail packets
hold emigrant steerage + coarse freight through the 1850s — for the
1850–60 epilogue decade they still run, demoted (G-27 ✅).
**Sim shape:** the signature scheduled-line content for PLAN-6 — frequency
growth is the display story. Liverpool and Le Havre are absent from the
roster: proxy or promote (X-R1 roster question).

### 3.5 The sea hajj: India → Jeddah (E6 verification: PASSED with restatements)

- **The pulse (Burckhardt 1814, verified verbatim against the primary):**
  India fleets (Calcutta/Surat/Bombay) depart ~Mar–Apr, reach Jeddah early
  May, returns staggered June–early Aug (Bengal first), home by September;
  Muscat, Basra, and Mozambique-coast vessels arrive in the same window
  (H-05 ✅). Passage 40–60 days (H-04). Scale: order 10–25 sail/season
  era-wide; to ~1700, 1–3 outsized pilgrim ships (the Rahimi: ~1,500 t
  CAPACITY, ~700 aboard when seized 1613 — the sweep had conflated the
  two; H-01 ✅) under **royal/noble patronage** (the 1576 imperial fleet
  was Ilahi + Salimi; Rahimi/Karimi/Salari were noble-owned — H-02 ⚠);
  the 1695 convoy Every attacked was ~25 mixed trading+pilgrim ships
  (H-03 ✅). After Surat's decline the lane migrates to Bombay/Calcutta —
  English colours, "entirely manned and commanded by the people of the
  country", Muslim capital (H-20 ✅). Pilgrim volumes: sea share is
  honestly unquantifiable (assert 10–30% of a 20,000–70,000 hajj, wide;
  the remembered "Pearson 15,000/yr" could not be found and must not be
  used — H-09 ⚠, H-10 ✅). Hajj-fair economics confirmed; the India fleet
  drains silver — a bullion counterflow cargo (H-16 ✅).
- **E6 verification verdicts (all HELD under second attack):**
  (a) Jeddah's customs base is **fragmentary anchors, not a series**
  (1580s Faroqhi · 1698 tithe grant · 1770s–80s consular · 1814
  Burckhardt) — class E6 lane volumes reconstructed/asserted WITH anchors,
  not "proxied" as the sweep implied (H-17). (b) The 1785 claim restates
  safely as: Indian goods reaching the Ottoman market ~10M livres
  tournois, near parity with European imports — via BOTH Basra and Red
  Sea routes, Basra dominant only from the 1720s to 1773 (H-18).
  (c) **The "Jeddah break" is real and institutional** — India ships did
  not pass north of Jeddah, Egyptian craft not south; keep it firm to
  ~1840 (H-19). Jeddah's own fleet 1814: ~250 vessels, only the largest
  making the India run (H-14 ✅).
- **Sim shape:** highly mappable — a hard annual monsoon pulse on
  Surat/Bombay→Mocha→Jeddah legs; Jeddah needs carved Red Sea water and
  season-gated legs (the Arctic-corridor precedent). **The break means
  India→Suez must NOT exist as a through lane before ~1840: two lane
  families MEETING at Jeddah is the port's whole simulative point.** The
  lunar hajj drifts while the shipping pulse is monsoon-fixed — the fixed
  seasonal pulse is historically right; no lunar machinery.

### 3.6 Aceh, the Egyptian shuttle, East Africa

- **Aceh** ("the verandah of Mecca"): a real separate lane ~1530s–1630s —
  a few large pepper ships/yr direct to the Red Sea, 20,000–25,000
  quintals/yr by the 1560s rivalling the Cape route (Boxer's 1566 report
  confirmed, if anything conservative; H-11 ✅), pilgrims aboard as a
  ledger note. After ~1650 the stream dissolves into staged passages on
  existing India lanes — do NOT draw a dedicated lane (H-12 ✅).
- **The Egyptian Red Sea shuttle**: ~40 small Cairo-controlled ships
  Suez/Qusayr↔Jeddah (coffee/India goods north, pilgrims both ways)
  (H-13 ✅) — one short lane pair once Jeddah exists.
- **East Africa**: presence counted (Burckhardt names the Swahili and
  Mozambique-coast arrivals in the May window), scale unknowable —
  silences-register material; the Mozambique-coast vessels are slave
  ships and take the sober pattern if ever represented (H-15 ✅).
- Malabar→Red Sea sailings (25→11–12/yr, 16th c) are single-attribution
  and often terminated at Aden under Portuguese pressure (H-06 ⚠).

### 3.7 The caravane maritime & the Ottoman carrying trade (tramping, counted)

- **The caravane** (~1686–1792): Panzac's corpus — 70–80,000 surviving
  charters; ~300 French charters/yr as the mid-century AVERAGE; French
  ≈60% of documented contracts, Venetians and Ragusans 16–17% each; at
  Rhodes 1776–79 Europeans took 77.6% of calls (all ✅ verified VERBATIM
  against the openedition chapters). Hulls: small (barques ~78 t, pinques
  ~57 t, crews 9–18), from the Provençal small ports (Saint-Tropez ahead
  of Marseille); campaigns were 16–34-month tramping absences chaining
  10–14 charters — the Gironde's 10-charter Egypt–Aegean–Istanbul circuit
  at 19.9%/yr is the canonical shape (I-05..09 ✅). Dwell DOMINATES:
  2:1 to 3:1 over passage time (I-10 ⚠ corrected upward). Recomputed
  aggregate: **~500 European charters/yr ≈ order 100 European hulls**
  mid-century (I-26 ⚠ — the gatherer's 600–700 was unsupported).
  The end is exogenous and total: French flag eliminated from 1792, Venice
  abolished 1797, Ragusa 1808; **29 Tunis charters TOTAL 1815–31** — no
  revival (I-21, I-22 ✅).
- **The Greek succession**: Hydra 1 large ship (1757) → 79 (1787) → 186
  (1820); the 1813 national fleet 615 ships / ~150,000 t order (the
  "193,580" variant looks corrupted — I-20 ⚠); the Black Sea opens to the
  Russian flag 1774 (adoptable by Ottoman Greeks; Austria nominally 1784;
  Britain effectively 1802 — I-17 ⚠ refined). Flag-substitution on the
  SAME lanes: French dominant to 1790, Greek ramp 1774–90, exclusive
  1792–1815 (I-19, I-21 ✅).
- **Istanbul's grain metabolism**: 7.07M kile ≈ **181,000 t of cereals by
  sea in 1758** — 85.8% Black Sea/Marmara, 14.2% Aegean/Med (I-14 ✅
  verbatim; consistent with Aynural). The Black Sea run was an
  Ottoman-flag monopoly (1782: 146 ships, every captain Ottoman, 93%
  Muslim — I-15 ✅); Europeans could only ever carry the Aegean slice,
  surging in crises (1772: 60+ French ships chartered for Macedonia
  wheat — VERIFIED, Panzac IJMES fn.45, the E7 counted episode; 1789–91:
  178 vessels/44,160 t — I-11, I-16 ✅). **If no Black Sea port enters the
  roster, the Pontic 86% MUST be a declared silences entry — it dwarfs
  everything Europeans carried** (the existing `black-sea-after-1783`
  entry widens to the whole provisioning system).
- **Sim shape:** the sim's existing 3-leg itinerary chaining + inter-leg
  dwell carries the tramping pattern honestly as a windowed sample of a
  campaign (the evidence line should say each sim voyage is a segment of
  a longer real campaign); calibrate spawns to ~300 French charters/yr ÷
  legs-per-spawn; requires the queued Salonica + Alexandria promotions.
  Greek succession = era-gated lane-share weights, no new geometry.

### Verification record — chunk 3

59 ✅ / 13 ⚠ / 1 ✂ across 73 claims (G-01..27 packets · H-01..20
hajj/Jeddah · I-01..26 caravane). The ✂: G-20's India-mail negative
(monthly Post Office sailings to Madras/Calcutta existed from 1815).
Systemic findings: "nominally monthly" understates busy packet routes;
single-source series behind the American packet fleet counts (Albion, one
corrupted transmission); single-eyewitness dependence on Burckhardt for
the Red Sea architecture (verified verbatim, uncrosscheckable); and the
caravane corpus's single-scholar dependence — every weakened claim was a
place the gatherer went BEYOND Panzac's page, while everything ON the page
checked verbatim. Follow-ups flagged: page-level checks on Choudhury
(passage times), Das Gupta's profit shares, and the Malabar counts before
any of those set parameters.

## §4 — Local metabolisms (T4)

*(queued — chunk 4)*
