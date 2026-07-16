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

*(queued — chunk 2)*

## §3 — Scheduled & state services (T4 + E6 + T10 packet lines)

*(queued — chunk 3)*

## §4 — Local metabolisms (T4)

*(queued — chunk 4)*
