# CLAUDE.md — Idle Sails

Orientation for a fresh session. Read this first, then `planning/README.md` (the design-document index).

## What this is

**Idle Sails** — a browser **idler** for the age of sail. Leave the tab open and
a procedurally generated, historically-grounded world sails itself: plausible
vessels (names, rigs, tonnages, flags, cargoes) set out on realistic
wind-and-current routes between historical ports, cross the world, and are lost
or arrive over accelerated time. The player is a **spectator** — the entire
control surface is a **speed slider** and **click-a-vessel → sidebar** (tonnage ·
ship type · allegiance · cargo · itinerary). Nothing to build, buy, or win.

This is a **ground-up rebuild**. The previous project was an isochronic passage
*chart* (a static travel-time map); it is archived, not deleted, because its
routing engine powers the idler's movement.

> This file is mirrored as **`AGENTS.md`** for non-Claude agents — edit both
> together (they must stay in sync).

## Project goals — twin, and co-equal

Every design decision answers to both of these:

1. **Simulative.** A zero-friction spectator idler: deterministic and seeded
   (same seed + same sim-time ⇒ same world, at any tick granularity, so
   offline accrual is exact); a flowing 1550→1815 clock that loops via a
   5-year reset ramp; traffic *statistically weighted around* historical
   accuracy, never claiming strict accuracy; a parchment canvas chart; the
   entire control surface a speed slider and click-to-inspect.

2. **Historical sensitization.** The dataset is built knowing that *the
   archive is not the past* (Trouillot, *Silencing the Past*: silences enter
   at source creation, archive assembly, retrieval, and retrospective
   significance) and that the surviving quantitative record is Euro-centric.
   The charter (full form in `planning/PLAN-3-flows.md` §1):
   - **No silent zeros** — a trade known to have existed is never implicitly
     absent; every flow is `counted`, `proxied`, `reconstructed`, or
     `asserted` (our estimate, with stated bounds and reasoning). An implicit
     zero is an active claim, and usually a false one.
   - **No fabricated precision** — rank only where sources support ranking;
     presence-without-rank is a valid state (Istanbul is the exemplar).
   - **Basin-local assembly** — no forced global commensuration between
     basins with incommensurable records.
   - **Declared boundaries** — every dataset states what it excludes and why.
   - **The silences register** — known-but-unquantifiable flows are recorded
     as data and surfaced in the UI, not dropped.
   - **Sober treatment of coerced human movement** wherever it appears — the
     Middle-Passage pattern (no value tier, no profit framing, factual, never
     a reward) extends to any promoted coerced flow (Kaffa, Indian Ocean).

## Current state (as of 2026-07-21)

- **QUEUE RENUMBERED + INPUTS RE-SWEPT (2026-07-21).** The user reorganized
  `feature-ideas/` — `tweaks.txt` emptied into `ideas.txt` (now 12 sections),
  `research_addenda.txt` regrouped into R1–R3, and a NEW `research_refinements`
  file added carrying a **standing lock** ("do not add these to the general
  to-do or feature lists until unblocked"). In response the five overlapping
  naming schemes (Pass 0–6, Phase RA–RD, Phase 1–6, Batch P–Z, T1–T15) were
  replaced by **one flat permanent ID space** — `F-` build, `R-` research, `D-`
  decision, `L-` locked — **ordered by waves W1–W6 + LOCKED**, grouped
  fidelity-first per the addenda's standing instruction. The shipped record
  moved to `planning/SHIPPED.md` (old ids kept verbatim); decisions collected in
  `planning/OPEN-QUESTIONS.md` (D-01…D-17); the locked track mirrored in
  `planning/REFINEMENTS.md`. **Two live charter violations found during the
  sweep:** **Porto and Rotterdam appear in ZERO routes** (of 112 ports) — drawn
  on the chart, unable ever to receive a ship, which is a silent zero in the
  charter's exact sense (F-01/D-04). Four reported bugs were verified
  **already fixed** and closed (Masulipatnam=Golconda, Jayakarta=Banten,
  cycle-scoped "Lately called", whole-history run export). The front of the
  queue is **W1** (corrections), then **R-01** (Japan & sakoku — the deepest
  fidelity question in the inputs), then **W3** opening with **F-12 convoys +
  F-13 region-aware sinking**.
- **PLAN-7 DRAFTED — THE ROUTING REBUILD + ITS VERIFICATION SUITE (2026-07-21,
  unadopted).** `planning/PLAN-7-routing.md`, at user request; supersedes the
  locked `L-02` and unlocks the refinement track's §1c. **Reading the engine
  corrected three things the queue believed.** (1) The wind field is **not data**
  — `windfield.mjs` is ~15 hardcoded constants over six regimes and currents are
  10 hardcoded lat-lon boxes; the whole physics layer is `asserted` with no
  evidence class, bounds, or sources, the largest undeclared assertion in the
  project, and it name-checks CLIWOC without ever having been tested against it.
  (2) The **oddly-square legs are 8-NEIGHBOUR CONNECTIVITY**, not grid
  resolution — a finer grid gives smaller staircases, not smoother tracks — which
  re-frames D-03 and makes the fix *cheaper* than the resolution rebuild it was
  weighing. (3) **A whole voyage is routed in its departure season's wind**
  (`fieldFor` builds one static field per destination×class×season), so a
  six-month London→Canton passage never sees the seasons it crosses —
  previously unrecorded. Also: the archived **31 MB of `.bin` files are OUTPUTS**
  (precomputed travel-time surfaces) that nothing reads, so **L-04 (prune the
  archive) is far cheaper than CLAUDE.md claimed** — the baker imports four small
  `.mjs` modules, not the fields. **Plan shape:** Phase 0 builds the verification
  harness against the CURRENT engine FIRST (a rebuild justified by "looks wrong"
  has no acceptance criterion), then R-11 (the historical route corpus — find,
  don't generate) ‖ R-12 (programmatic best practices: any-angle planning,
  fast-marching, time-dependent shortest path, DGGS, trajectory metrics,
  determinism as a hard constraint), then a real decision point, then physics /
  algorithm / calibration / re-bake. **The anti-false-precision rule is the
  spine:** tuning granularity may never exceed evidence granularity, holdout
  validation is stratified by basin and era, unevidenced scopes stay unfitted and
  are published as such, and there is deliberately **no single global score**.
  New queue wave **W3R** + chunk **CR**; new decisions **D-18…D-22**.
  **D-18 + D-21 ANSWERED 2026-07-21, BUILD HELD.** Scope = routing + the
  lane → bake → itinerary layer, with the PLAN-3 flow matrix a **fixed input**
  (the matrix carries bounds/classes/sources on all 82 systems; the routing
  physics carries none — they are not equally weak). Unevidenced lanes stay
  unfitted and are reported **unverified**, a third state that never counts
  toward a pass rate, with the coverage fraction published; **silently
  extending a fit is rejected on the record**. D-19/D-20 are deliberately open
  until the Phase-0 baseline exists. **Nothing is to be built until the user
  instructs; the next action when released is F-41 (the harness) and nothing
  else** — see PLAN-7 §11–§12. The corpus does not start from zero: the T14
  waystations sweep is already adversarially-verified route evidence (Sunda not
  Malacca, Table Bay from 1652, Guam westbound-only) and is F-41's first fixture.
- **PLAN-7 PHASE 0 BUILT — THE ROUTE-VERIFICATION HARNESS IS LIVE (2026-07-21).**
  **F-41 done:** `research/tools/route-verify.mjs` + `research/routes/corpus.json`
  (+ `_schema.md`) + `research/routes.html` + a committed baseline
  (`routes/baseline-2026-07-21.json`). **The headline is the coverage figure —
  10 of 414 lanes (2.4%) have ANY route evidence; 404 are `unverified`** —
  Atlantic 0/102, Mediterranean 0/48, Baltic 0/41, Indian-Ocean-west 0/25,
  Pacific 0/23, all present evidence in bengal-se-asia (6/54) + east-asia (4/42);
  1550–1650 is 4/261. All 21 evaluated claims pass, which says only that the
  engine honours the waystop constraints it was built to honour — **the suite's
  value is the 404 and the machinery that keeps it visible instead of dividing
  21 by 21.** Design invariants, each test-enforced: **no global score** (a test
  rejects any top-level key matching /score|passRate|overall|grade|accuracy/),
  **`unverified` is the ABSENCE of a result** so it cannot leak into a tally, and
  **byte-identical determinism** (no timestamps; identified by bundle versions +
  corpus digest). **Six NEGATIVE CONTROLS** prove the instrument can fail things
  — required waypoint at Reykjavik, forbidden call at Table Bay, forbidden Cape
  corridor, a 1–3 day London→Canton passage, a lane required to differ from
  itself, a stale lane id. **84 tests green.** Next: **R-11 ‖ R-12**; no engine
  change before the CR-2 decision point.
- **CONVOYS MERGED TO MAIN + CHUNK C1 COMPLETE (2026-07-21).** `movement-realism`
  (convoys + region-aware sinking) merged into `main` at user request. The two
  features had NEVER shared a tree — convoys existed only on that branch, which
  was 3 commits behind main and lacked the via-chain waystations entirely, which
  is exactly why convoys "stopped spawning": `main` never had them. Conflict
  resolution in `world.js`'s itinerary builder keeps main's via CHAIN body inside
  the branch's convoy `opts` wrapper. **The merge exposed a real bug**, caught by
  the region-aware-sinking test: the fate roll read each day's position as
  `legPointAt(legId, progress)` — 0→1 of the WHOLE leg polyline — but a
  waystop-split segment covers only `[f0,f1]` of a SHARED polyline, so a wreck
  blamed on the Florida Straits landed at −65.2°E. Segment progress is now mapped
  into `[f0,f1]` exactly as `positionOf` already did (latent on the branch's 22
  single-via lanes; exposed by main's 54 chained ones). **DATASET_VERSION 5→6**
  (the fate roll now reads geography, so v5 fates are not reproducible).
  Verified: **72 tests green**; seed 42 to 1589 → 7399 vessels, **407 convoys
  (30.7%)**, 365 escorts, 16.5% on via-split itineraries. NOT pushed.
- **C1 "the clean sweep" SHIPPED (2026-07-21)** — every no-research/no-sim/
  no-re-bake fix in one pass: **F-28** Chart view heading moved to the top ·
  **F-29** menu sub-trees now COLLAPSE with their parent instead of sitting
  greyed · **F-30** the Tracked-vessels row HIDDEN (wiring intact) · **F-33**
  the `na-northeast` plate CUT (7 plates remain) · **F-34** a `#debug=1`
  port-lifecycle overlay (red dashed ring + founding year for unborn ports, a
  red caret for any name/allegiance/existence change within 25 yr) · **F-04**
  the China coast restored to the Pacific plate. **F-04's root cause was not
  `normLon`**: ring unwrapping anchors to a ring's FIRST point, so Eurasia's
  outer ring (starting near Portugal) unwrapped to 342..540 — wholly outside the
  105..292 plate window — and drew off the right edge while its port dots stayed
  put; `drawGeom` now slides each polygon by whole revolutions into the window.
  Two items produced findings, not code: **F-02** settled D-15 — York Factory
  runs at **1.30 ships/yr** (historical 1–2, floor correct) but **52% of years
  are empty**, so it is a DISTRIBUTION problem and the fix is an annual
  scheduled sailing on F-14's channel (new tool
  `research/tools/port-traffic.mjs`); **F-08** found **0 issues across 127 name
  pools** — `'t Vergulde Draeck` is a real 1656 VOC wreck, correctly spelled,
  now recorded in `names.json` so it is not "corrected" later.
- **EXECUTION CHUNKS (2026-07-21).** RANKING §11 now groups the queue into
  **C1–C9** — a chunk is a unit of *shared setup* (one re-bake, one archive
  reading, one design decision, one render session) and deliberately crosses
  waves. **C1 "the clean sweep" is the front of the queue**: every item needing
  no research, no sim change, no re-bake, and no architectural decision —
  F-28/F-29/F-30 menu fixes, F-33 plate prune, F-04 China coast on the Pacific
  plate, F-34 debug lifecycle overlay, F-08 name-list QA, F-02 York measurement
  — gated on only **two trivial decisions, D-05b and D-13**. **C2 is "the one
  re-bake"** (F-01 Porto/Rotterdam flows + F-06/F-07 routing residuals + F-10
  monsoon windows + F-03 dot audit): the standing rule is that the world is
  re-baked ONCE and nothing rides a bake alone. Two items were verified out of
  the easy pass while sizing it: **F-32** (convoy ship-icons) — `flotilla` and
  `convoy` have ZERO hits in the UI source, so that panel does not exist and the
  item is a requirement on F-12's ledger — and **F-05** (Great Lakes), which
  needs the `ne_50m_lakes` asset, since `land.geojson` is `ne_50m_land` with one
  interior ring and none near the lakes (the lakes are hardcoded polygons in
  `render.js`).

- **THE WAYSTOPS BUILD — `via` IS NOW A CHAIN (2026-07-21, live).** The T14
  waystations sweep integrated. **The code change the sweep asked for:**
  `route.via` accepts an ORDERED LIST of ports — the baker routes
  `from→v1→…→vn→to`, simplifies each HOP separately so every call survives as a
  guaranteed vertex, records `viaIndex[]`, and re-frames each hop's longitudes
  onto the previous hop's frame before concatenating (without which the
  Acapulco→Guam→Manila join jumped a whole circumference); `world.js` splits the
  leg into one segment per hop with a refreshment dwell, gating each call to that
  station's founding, so **a chain degrades hop by hop as the era rolls back**
  while the baked polyline threads them all. **Six new station nodes**
  (`roles:["station"]`, new `atlantic-islands` region): **St Helena** 1659 ·
  **Anjer** (Sunda Strait) 1682 · **Umatac/Guam** 1668 · **Funchal/Madeira** ·
  **Santa Cruz de Tenerife** · **Angra/Azores** — the last three with NO founding
  window (old harbours), which exposed a Cape-Town-era bug: the gate required
  `port.active` to exist, so a window-less station never called. **54 lanes carry
  a via** (was 22): `china-can-lon` = **anjer→cape-town→st-helena** (the sweep's
  worked example), `china-lon-can` = madeira→cape-town→anjer, Mozambique on the
  Portuguese Asia lanes + the Azores homeward, **Tenerife outbound / Havana
  homeward** on the Carrera, **Guam westbound-only**, **Port Louis** on the French
  Nantes↔Madras lanes. Nationality is honoured, not flattened: no St Helena for
  Dutch or Swedish homeward ships, and **no Madeira for the VOC** (its standing
  orders ran direct to Table Bay — the reason Table Bay exists). **Johanna/Anjouan
  deliberately NOT built**: a via attaches to a LANE, so it would send *every*
  Company Indiaman up the Mozambique Channel — registered as
  `johanna-inner-route-silence` with the mechanism limit named (unblocked by
  per-voyage route variants). New silences for Ascension (naval) and the
  chokepoint anchorages; the Malacca correction lives in the Anjer documentation,
  not the register (a routing correction is not a silence). **64 tests green**
  (+3: the three-waystop chain in order with tiling `f0/f1` stretches and a real
  pause at each station · chain degradation across the 1652/1659 foundings · Guam
  westbound-only, never before 1668). As-shipped record: the "What was built"
  section of `research/port-flow-candidates-waystations-2026-07-20.md`.
- **CAPE TOWN — THE WAYSTOP PHASE (2026-07-20, live).** The one real roster gap
  (Batch G / T14) closed with the **full waystop reroute** (user decision). Cape
  Town added as a station node (**Kaapstad**→Cape Town 1806; eraPowers VOC 1652 →
  British 1795 → Batavian 1803 → British 1806). A new `via` mechanism reroutes the
  **22 Europe↔Asia round-the-Cape lanes** (Dutch/British/Swedish/Danish East-India
  — NOT the Portuguese Carreira, which used Mozambique) THROUGH Table Bay: the
  baker bakes `from→cape→to` + a `viaIndex`; `world.js` splits the leg into a
  **refreshment call + dwell from the 1652 founding** (before which ships round
  the Cape unstopped — historically exact; the ship pauses precisely at Table
  Bay). Flow volume unchanged (no double-count). Every Indiaman now calls at the
  Cape both ways, making it one of the busiest dots. Docs: `ports.html` card +
  citations + a `no-port-node` silence (`cape-waystops-silence`) for the lesser
  calls (St Helena/Ascension). **61 tests green.** *(NOTE: this is the classic
  `main`; the experimental `movement-realism` branch carries region-aware sinking
  + convoys and will merge this Cape Town work in.)*
- **UX + ACCURACY PASS (2026-07-20, all live).** A run of direct-request fixes on
  top of the finished world, each committed + deployed:
  - **Port names** — a 3-way menu radio (Default / None / Most active,
    `settings.portNames`). Default shows a name only while the port saw traffic in
    the past DECADE (a 10-yr window distinct from the 3-yr greying), both
    cycle-clamped so each 1550 iteration starts fresh (all ports greyed +
    nameless until called). A proper **ruins icon** (broken dashed ring + cross)
    for discontinued ports.
  - **Small-trade visibility floor** (`world.js spawnLaneWeights`) — York Factory
    &c. were drawn ~once a DECADE (a tiny realized flow drowned by proportional
    sampling of a ~16,000-ship world total); each active trade lane is now floored
    to a minimum share of the spawn budget. York 0.06→~1.1 ships/yr (its
    historical 1–2); busiest lane −15%, still dominant. Charter-aligned.
  - **Events-log category tree** — losses / wars / **port foundings-captures-
    abandonment** (a new `world.portEventsSince` deriving foundings from
    `active.from`, abandonments from `active.to`, allegiance changes from
    `eraPowers` transitions; cycle-clamped, granularity-independent) + a **Sunken
    ships** chart toggle (`renderer.setWrecks`, gates draw + pick).
  - **Cape Horn wrong-way wrap FIXED** (baker + re-bake) — the Horn-open (−58)
    mask was keyed only on the DESTINATION, so Pacific→Atlantic eastbound legs
    (Callao→Cadiz) fled the wrong way around the globe (lon −400); it now opens
    when EITHER endpoint is a Pacific-coast-Americas port. All such legs round the
    Horn (minLat −57, no wrap); London→Canton stays capped.
  - **Independence dates** — Boston/Philadelphia/Chesapeake flip to the US flag in
    **1776** (British evacuation / Patriot control), not 1783; New York stays 1783
    (occupied).
  - **Whaling grounds as zones** — `davis-strait` + `pacific-grounds` (both "not a
    port but a whaling ground") render as a dashed oval with a fluke, ellipse-
    picked, instead of a dot; Smeerenburg (a real settlement) stays a dot.
  - **59 tests green.** `planning/RANKING.md`'s backlog sweep updated: Batch-P
    toggle-names + dormancy done, Batch-R Horn done, Batch-S floor done.
- **PHASE 4 — THE PER-PORT DOCUMENTATION SWEEP IS COMPLETE + LIVE (2026-07-19).**
  Phase RC (T1+T2+T3) done for all **105 ports** via 9 parallel region-batched
  research subagents. Each port carries its 1550→1850 name/ownership timeline
  (`ports[].eraNames` + a new `ports[].eraPowers`, 39 multi-window, all tiling the
  active window — build-data-validated), an era-resolved port-panel **blurb**
  (`research/port-docs.json` → injected into the datasets), and a documentation
  entry with real citations on the new **`research/ports.html`** page (105 cards /
  23 regions). New machinery: `world.js portPowerAt(port, year)` → the port panel
  shows the **allegiance of the time**; five display-only independence powers
  (haiti/mexico/brazil/gran-colombia/dahomey) for the honest flag; the
  name/ownership tweaks fixed (Masulipatnam=Golconda, Jayakarta=Banten,
  Nagasaki=Japan/separate from Dejima, Bombay/Calcutta, "est." only for real
  in-sim foundings). Charter held throughout. **55 tests green**, deployed.
- **BACKLOG SWEEP (2026-07-19).** Re-read `feature-ideas/{ideas,tweaks,
  research_addenda}.txt` against the shipped state and folded the ~20 items with
  no plan slot into `planning/RANKING.md`'s new "2026-07-19 backlog sweep"
  section (batches P/R/S/E/G/Z, feasibility-tagged) + research tasks **T14**
  (waystops — Cape Town is ABSENT from the roster — & Korea/Russian-Pacific gaps)
  and **T15** (national port access rules); T6 extended with the wider
  historical-fiction easter-egg catalog. Confirmed all T12 geographic nodes are
  built. **Recommended next pull:** Batch-P polish (Pacific plate, full-Med plate,
  toggle-all-names, cursor lat/long) + Batch-S region-aware sinking — both cheap
  and unblocked. `procgen_variant` deliberately excluded per its own header.
- **PHASE 1 — THE WORLD BUILD IS COMPLETE (2026-07-19, merged to `main`).** The
  era now flows **1550→1850** (PLAN-4 + PLAN-6, adopted 2026-07-16) with a
  designed 10-year epilogue decade (1850→1860) and a 310-year loop. The tracker
  is `planning/PHASE-1-build.md` (increments 1–8 all ✅). The world is **105
  ports · 414 routes · 82 folded flow systems** (85 in the matrix), 1850s flow
  coverage **95%**, **55 tests green**. Increments this phase: **1** epilogue
  spec; **2** the atomic clock-flip (ERA.to→1850, CYCLE_YEARS 310,
  DATASET_VERSION 5); **3–4** the 1815–50 basin extensions + T8/T12 systems
  (7 basins); **5** 66→**105 ports** (44→54 powers); **6** the BAKE — baker
  infra (Panama seal→land-wall, a destination-aware Cape-Horn cap, a sub-66
  Hudson-Bay `SEASONAL_ICE` seal) + one full authoring increment per orphan port
  (Singapore, Hong Kong, Sydney, Montevideo, New Orleans, York Factory, the
  South-Sea whaling grounds, + Basra/Bandar-Abbas de-proxied), each with a
  dossier in `research/flows/<port>-authoring.md`; **7** surfacing — the critical
  `interpDec`/`FLOW_DEC` fix (the decade set had stopped at 1810, freezing the
  whole late era at 1810 weights), era HUD 1550→1850 + the epilogue steam-boundary
  note, a dynamic `silences.html`, an Australasia region plate, the `about` page,
  the name-pressure re-gate, and the late era's 10 wars + 2 hazard zones; **8**
  headless verify (0 console errors, all new ports sail) + merge. **The
  coerced-flow model is established**: a sober `framing{}` block on the SYSTEM +
  the volume folds onto a commercial lane (never a baked labelled slaver post-1815
  — `slave-ship` stays ≤1815); `enslaved-people` for Atlantic slave flows, a
  distinct `transported-convicts` for convict transportation. **Deferred (noted
  in the tracker):** `scriptedOnly` ports (Dejima → Pass 4), the `egypt` power +
  its 2 wars, the designed epilogue spawn-*taper* (§Epilogue fast-follow). Older
  bullets below describe the pre-Phase-1 state at 1815.

- **Phase: PLAN-1 M1–M6 complete (M7 mostly) + PLAN-2 Phase A, Phase C, and
  Step 2 done.** The three PLAN §0 defaults and the sober slave-trade treatment
  are user-confirmed. Tests: `npm test` — **18 passing**.
- **Flowing era (PLAN-2 Phase A + C):** `world.js` clock flows **1550→1815**,
  ramps a 5-year reset (1815→1820) and loops (270-yr period). Spawns weighted by
  `laneWeight × prominence(origin, flowing year)` from `data-src/era-weights.json`
  (derived from `research/port-rankings-1550-1815.json`, interpolated between
  decade midpoints). Era-label HUD; era-aware routes overlay (lanes era-gate and
  scale with origin prominence); spawn-rate drift 0.6→1.25× across the era;
  16 wars incl. eight pre-1700. The 1550s sail **galleons/carracks/caravels**
  on the Carrera & Brazil lanes (no new bake fields needed).
- **Milestone 6 (persistence):** `persist.js` — full-state localStorage save
  (spawn-RNG word is explicit state ⇒ a restored session continues IDENTICALLY),
  offline accrual capped at 30 sim-days, autosave 10 s + tab-hide/close.
  Hash params: `#seed=`, `#t=<sim-days>`, `#routes=1`, `#fresh=1` pin debug
  worlds and never clobber the save.
- **Diversity pass (PLAN-2 Step 2):** vocabulary is in `data-src/` — 18 new
  cargoes, 19 polities/flags (Ryukyu, Oman, Ottoman, Gowa, Courland… + WIC/RAC)
  with name pools, junk & dhow rigs on existing polars, 9 new regions. All 33
  minor ports are staged **sim-ready** in `research/minor-ports-promotion.json`
  (tranches 12/12/9 by diversity÷bake-cost); `research/CURATION.md` is the
  growth rubric. **Nothing sails unbaked — promotion happens in Phase B.**
- **Plan pivot (2026-07-13): `PLAN-3-flows.md` adopted.** The tier-review found
  the rankings→weights pipeline structurally inherits the archive's silences;
  the project moves to an **evidence-classed trade-system flow matrix**
  (counted/proxied/reconstructed/asserted, per basin, with a silences
  register). PLAN-2 Phase B is re-scoped as PLAN-3 Phase S2. **R1 is applied**
  (2026-07-13: ships basis = foreign-going; Goa/Cap-Français/Rio value-T1
  promotions + Kingston T2; de-truncations; universe 60; Istanbul in the queue
  as the declared-boundary exemplar; changelog in the rankings JSON; tools in
  `research/tools/`). **R2 is done** (schema fixed: voyage ranges, per-seed
  draw, systems + lane shares). **R3 is done**: all six basins authored —
  **60 systems × 1,403 system-decades** in `research/flows/`, seven
  cross-checks passing (Sound Toll, SlaveVoyages, Chaunu, DAS, the Nagasaki
  registers, Canton, the échelles), the silences register at 11 entries
  (Caribbean smuggling + China coastal grain asserted; African coastwise +
  Pacific voyaging gestured), coerced flows beyond the Atlantic quantified
  with validator-enforced sober framing. Derived world prominence (an output
  now) puts Istanbul, Shanghai, Tianjin, Alexandria, and Smyrna in the 1590s
  top-10 — ports the rankings could not represent. **S1 is done**: the sim
  spawns from the flow matrix — build-data folds the systems onto the baked
  lanes (18 fold; 25→34% of world volume = the honest Phase-A coverage), each
  world realizes every [lo,hi] range once per seed (one plausible reading of
  the evidence), spawn rate follows realized totals clamped [0.5,1.6]× the
  era mean, lanes fade ~3 yr at era boundaries and across the reset seam,
  era-weights is retired from the bundle, datasetVersion 2 resets old saves,
  and the routes overlay shows the realized per-lane flow. **S2 is done**
  (2026-07-13): the world is **66 ports** — the flow backbone (Hamburg,
  Danzig, Riga, St Petersburg, Venice, Genoa, Marseille, Boston, New York,
  Havana, Surat, Calcutta, Amoy…), the tranche-1 diversity ports, and the six
  exception ports (Istanbul, Kaffa, Arkhangelsk, Smeerenburg, Sitka,
  Acapulco). 261 lanes / 1,360 polylines; junk & dhow sail their OWN polars;
  Bosporus/Kerch/Gorlo carved; seasonal Arctic corridors with season-gated
  legs (no winter Arkhangelsk departures); the Pirate Round as a hazard;
  render bounds full-globe with label decluttering; flow coverage **76–89%**.
  The 1560s' busiest port is Istanbul — the declared-boundary claim, now
  sailable. **S3 is done — and with it PLAN-3 IS COMPLETE**: every vessel's
  ledger carries a one-line evidence note (counted / proxied / reconstructed /
  asserted / state, from `datasets.flows.laneEvidence`); `research/silences.html`
  renders "The chart's silences"; `research/flow-prominence.html` shows
  prominence as an output (unsailable ports marked °). 20 tests green.
  **Ongoing work needs no phase machinery**: tranche-2/3 port promotions, new
  basin systems, and roster growth proceed under `research/CURATION.md` and
  the promotion queue.
- **Post-PLAN-3 polish (2026-07-14):** data-fit chart crop + 8-anchor label
  declutter; dormant-port greying keyed on ACTUAL port calls; wreck markers
  (a loss marks the chart a sim-year; click → the loss ledger); windward
  "zigzag" fixed in the baker (beat-to-windward legs wind-gated — ships wait
  for the monsoon — kept legs de-tacked); **port lifecycle** — `ports[].active
  {from,to}` windows (Smeerenburg 1614–60, Kaffa –1783, Kingston 1655–…),
  build-data enforces lane-era ⊆ port windows, absent-before-founding /
  ruin-mark-after on the chart, displaced flows in the silences register
  (14 entries); **era-named ports** — `ports[].eraNames` gives the dot the
  dominant port name of the time (chart labels, panels, log all speak it via
  `world.portNameAt`): Louisbourg reads **St John's** outside 1713–58 (the
  Banks cod fishery sails the whole era under its honest name), Kingston
  reads Port Royal to 1692, Batavia=Jayakarta pre-1619, Bombay=Goa pre-1661,
  Madras=Masulipatnam pre-1639, Calcutta=Hugli pre-1690,
  Gothenburg=Älvsborg pre-1621; Gulf-of-Finland carve (St Petersburg was
  unsailable — zero baked legs — since S2). datasetVersion 4; saves gate on
  `datasets:routes` versions. 26 tests green.

- **Feature pass 1 (2026-07-15): settings, performance tier, menu.**
  `feature-ideas/ideas.txt` ranked in `planning/RANKING.md` (feasibility ×
  perf + the slider architecture: sim layer untouchable; observation/render
  layers tunable). Built: `settings.js` (device-local, own localStorage key
  `idle-sails-settings`, survives save resets); the cartouche menu unhidden —
  panel toggles (legend / events log / counters / helm), performance
  Low/Medium/High (**Medium = exactly the pre-slider behaviour**), and a debug
  run-data JSON export; legend panel (glyph shapes + allegiance colours);
  events-log panel (losses + war begin/end from `world.warEventsSince` — pure,
  display-derived); port click-priority in `pickAt` (a click on the dot beats a
  passing ship); ship-density render-thinning `world.snapshot({density})`
  (stable id-hash subset, skips `positionOf` for hidden ships — the sim
  UNDERNEATH is identical at every tier); log-cap/wreck-linger via
  `createWorld({tuning})` (live-mutable `world.tuning`); wakes a render knob;
  routes-overlay weights recomputed on the 5 Hz HUD throttle, not per frame.
  **31 tests green** — `test/settings.test.mjs` proves tier sim-inertness
  (same seed, any tuning ⇒ identical fingerprints).

- **Feature pass 1 (2026-07-15): the observation layer — statistics, port
  memory, tracker.** New serialized state (`stats`, `portHistory`, `tracked`)
  is pure accounting on top of sim events — recorded at spawn or resolution,
  granularity-independent, never read by spawns/fates/movement, invisible to
  `fingerprint()`. Statistics panel (menu): fleet totals, hardest passages
  (per-lane losses), cargo distribution. Port panel gains "Lately called" —
  the port's recorded past calls, depth by tier (0/40/200). Tracker: a
  Follow/Unfollow button in the vessel ledger pins her (cap 3/10/25 by tier);
  a pinned vessel's record MOVES to `tracked.archive` at cull instead of
  vanishing — the vessels array stays identical to an unpinned world's — and
  her kept ledger stays clickable from the tracker panel. Save payload after
  a sim-year: 34/110/148 KB by tier. **36 tests green**
  (`test/observation.test.mjs`: counter reconciliation, granularity
  independence, pin sim-inertness, cap enforcement, save round-trip +
  pre-observation-save back-fill). **Furl (same day):** clicking the cartouche
  collapses it to a small serif title plate and stows every ambient panel
  (counters, helm, legend, events, stats, tracker, hint) — the chart alone;
  click again to unfurl (settings-persisted as `furled`; menu controls keep
  their meanings; keyboard-operable). **Menu disclosure (same day):** the hamburger is
  replaced by a chevron-row disclosure at the cartouche foot — three engraved
  down-chevrons under the rule unfold the options and flip upward while open
  (same `#menu-toggle` id and wiring; aria-expanded/controls; ≥24px target;
  reduced-motion honoured). **Panel regrouping (same day):** the statistics
  panel is now a drawer folded under the counters card, opened by the same
  chevron band (state persists as `statsOpen`); the legend moved bottom-right
  (the events log took its old bottom-left slot above the helm; the hint
  yields to the legend); the menu grew a toggle tree — the legend's Ship
  types / Allegiance sections toggle independently under the parent Legend
  toggle (children disable while the parent is off; persisted as
  `legend.{ships,flags}`). **Research nav (same day):** `research/nav.js`
  — the one shared piece among the self-contained research pages — injects a
  sticky top menu bar (styled from each page's own CSS variables, so it
  follows their light/dark scheme) with links between all seven pages, an
  aria-current mark on the current one, and "⚓ Return to the chart" back to
  the sim; each page carries one `<script defer src="nav.js">` line. To add
  a page: extend PAGES in nav.js + include the script.
- **UI overhaul (2026-07-15): docks, uniform disclosure, mobile sheets.**
  Research-grounded (NN/g progressive disclosure, map-app sheet pattern,
  WCAG 2.2 §2.5.8). **Corner docks**: four fixed flex columns (tl cartouche ·
  tr ledger/counters/tracker · bl events/helm · br legend/hint) replace all
  hand-tuned card coordinates — hidden cards free their slot, the ledger
  joins the right stack instead of covering the counters, top/bottom docks
  own separate vertical territories (58/36 dvh) and cards compress+scroll
  inside a full dock (helm and counter-row never compress). **Uniform
  disclosure**: legend/events/tracker each carry a header band that
  collapses the card to its title bar in place (persisted as
  `collapsed.{…}`); counters keep the stats band, cartouche keeps furl.
  **Mobile (<720px)**: ledger/legend/events/tracker present as non-modal
  bottom sheets, one at a time (`.as-sheet` + a ~50-line manager in
  main.js); header tap dismisses (and unchecks the panel); the chart stays
  interactive; the top row auto-yields (cartouche `calc(100vw−208px)` cap,
  clean down to 320px). **Hardening**: 44px targets on coarse pointers,
  `touch-action:manipulation`, tap-highlight off, safe-area insets, every
  `vh` paired with `dvh`, `-webkit-backdrop-filter` added (app + research
  nav), the one `:has()` replaced with a JS class, Escape closes
  menu/sheets, reduced-motion honoured. Verified headless: programmatic
  no-overlap rect asserts (all panels + drawer + open ledger), sheet
  behaviour at 320–414px, target audit ≥24px (menu rows 44), collapse
  persistence across reload. 36 tests green.
- **Polish (2026-07-15 evening):** the tracker toggle + panel are DISABLED
  until vessel persistence (feature pass 5) — a one-voyage vessel makes a
  poor thing to follow; the world-side pin API and its tests stay, the menu
  row is greyed with a note, `settings.panels.tracker` is forced off at
  boot, and ledgers omit the Follow button. Fixed the "HMS HMS" doubled
  naval prefix (makeName no longer bakes the prefix into the name — v.prefix
  applies once at display; regression test in observation.test.mjs, 37 tests
  green). New `research/TASKS.md` — the non-promotion research queue — logs
  T1 (full-roster port name/ownership sweep → `research/port-eras.json`
  feeding `eraNames` + a future `eraPowers`) and T2 (one-sentence era blurb
  per port/name/ownership combination, charter register). Extended
  2026-07-16 with T3 (per-port documentation depth: paragraphs + citations
  → `research/port-docs.json` + a `research/ports.html` page, plus a
  distilled period description for the port panel) and T4 (deep-research
  catalog of ambient flows & naval movement patterns — fisheries as
  grounds-traffic, convoy/patrol/station patterns, packets and pilgrim
  shipping, local metabolisms → `research/ambient-flows.md`); the same day
  RANKING.md's Pass 4 was split — Pass 4 = easter eggs + the scripted-spawn
  channel, Pass 4.5 = ambient flows, research-gated on T4. Also added
  (2026-07-16, after a feasibility pass): **Pass 3.5** — unique active
  names + a refractory name-retirement period, feasible WITHOUT Pass 5's
  fleet model (fate-at-spawn makes "name active at t" derivable; a
  spawn-ordered `nameBlockedUntil` ledger keeps it granularity-independent;
  never source retirement from wrecks — wreckLinger is a tuning knob) —
  research-gated on **T5** (expand name pools until peak concurrent
  pressure sits under 70% per culture/role pool; several pools exceed 100%
  today). `research/tools/name-pressure.mjs` is the auditable gate: it
  measures peak pressure per pool across seeds and exits nonzero while any
  pool is over 70%.
- **Statistics panel un-drawered (2026-07-16):** the chevron band under the
  counters is gone; statistics is back to a **menu-toggled standalone card**
  in the right dock (between counters and tracker) with the uniform card-h
  disclosure, persisted as `panels.stats` + `collapsed.stats` (a legacy saved
  `statsOpen:true` migrates to `panels.stats` in settings.js); on mobile it
  presents as a bottom sheet like the other panels. The retired drawer CSS is
  archived verbatim in `archive/ui/stats-drawer-under-counters.css`.
  Verified headless (toggle, collapse, persistence, migration, sheet swap /
  dismiss, no-overlap); 37 tests green.
- **Feature pass 2 (2026-07-16): regional views + layers panel**
  (`planning/RANKING.md` Pass 2 — both `render.js` work, sim untouched).
  **Regional views (#1):** `render.js` exports `REGIONS` — four preset plates
  (world data-fit crop · Europe & the Mediterranean · the Caribbean · the East
  Indies & China); `renderer.setRegion(id)` swaps the mutable BOUNDS and
  rebuilds base/labels/overlay through the new projection (wakes drop, not
  streak; the graticule tightens 15°→5° on regional crops; regional plates
  contain on both axes with the same readability floor). Chosen via a "Chart
  view" radiogroup in the menu, persisted as `settings.region` (validated
  against the presets at boot). Port lifecycle and era names carry through on
  every plate. **Layers panel (#8):** the routes overlay now draws to a cached
  offscreen canvas refreshed on the existing 5 Hz HUD throttle (one blit per
  frame), and the master toggle gained a menu-sub tree of per-BASIN toggles —
  the six flow-matrix basins + "Naval & other voyages" — children disabled
  while the parent is off (the legend-tree idiom). `build-data.mjs` carries
  `basin` on each folded flow system (additive; datasetVersion stays 4, saves
  survive); main.js votes each lane's basin by folded share; overlay
  brightness normalizes within the visible set so an isolated basin reads its
  own hierarchy. Off basins persist sparsely as `settings.layers` (absent =
  on). Verified headless via Playwright (plate switching, filter isolation,
  persistence across reload, zero console errors). **41 tests green**
  (`test/regions.test.mjs` pins each plate to the ports it exists for + the
  fold's basin coverage; settings round-trip extended).
- **Feature pass 3 (2026-07-16): captains, longer name pools, docs page**
  (`planning/RANKING.md` Pass 3 — #11's easy pieces + #4).
  **Captains:** every vessel sails under a named shipmaster drawn in
  `world.js makeCaptain` from `hashSeed('captain', seed, id)` — her OWN
  sub-stream, never the vessel stream: name-stripped fingerprints verified
  IDENTICAL against pre-pass HEAD (fixed seed, worktree comparison).
  `data-src/names.json` gained a `captains` section covering all 27 naming
  cultures (build-data-validated: every themesByPower culture must have a
  well-formed pool): Europeans compose given+surname; the maritime title
  travels IN the name where history put it (Nakhoda … in the Indian Ocean,
  … Reis for Ottoman masters with Greek kapetans alongside, Daeng … at
  Makassar; China/Ryukyu surname-first) and stays out for Europeans, whose
  role the ledger labels (Captain naval / Master merchant). Wreck records
  carry `captain` + `isNaval`; a pre-captain save backfills the exact same
  master on restore (pure in seed+id+power). **Name pools** extended
  ~1.5–2× across all themes — name strings shift per seed, fates/counters
  verified unchanged. **Docs page (#4):** `research/about.html` ("How this
  chart is made") — the twin goals, determinism/movement + calibration
  summary, the flow matrix + anchor series, the five evidence classes, port
  selection & lifecycle, legend documentation (glyph shapes, flags, master
  titles), the sober treatments, a declared divergences list, and a cited
  further-reading list; added to `research/nav.js` PAGES and the hub.
  **Debug hook:** `#debug=1` exposes `window.__is = {world, renderer, snap}`
  for headless verification (display-only). **46 tests green**
  (`test/captains.test.mjs`: every vessel has a master, pool-swap
  sim-inertness, granularity independence, restore backfill, wreck records).

- **Docs reorganization (2026-07-16): the `planning/` directory + the phased
  research queue.** All Claude-authored plans consolidated under `planning/`
  (`PLAN.md` → `planning/PLAN-1-rebuild.md`, PLAN-2/3/4 alongside;
  `feature-ideas/RANKING.md` → `planning/RANKING.md`, now git-tracked —
  `feature-ideas/` stays untracked, human-written input only;
  `planning/README.md` is the index). `research/TASKS.md` regrouped into
  four phases so each body of sources is read once: **RA** feature gates
  (T5, T6) · **RB** movement & flows as ONE campaign (T4 + T8 + new **T9**
  convoy institutions & rates, coordinated with PLAN-4 E-R1 — the whaling /
  caravane / Jeddah / fisheries / naval-pattern sources all overlap) ·
  **RC** the per-port sweep (T1+T2+T3 together, one port at a time; fix the
  near-term roster first) · **RD** deferred design (T7 → PLAN-5).
  `planning/PLAN-convoys.md` drafted (sim-layer, does NOT break
  fate-at-spawn, buildable now; T9 refines its `asserted` rates without
  gating it). Every scheduled feature now has its research linkage:
  pass 3.5→T5, 4→T6, 4.5→T4, 5→T7, convoys→T9; RANKING.md gained an
  "Outside the ladder" section (convoys + the tweaks.txt queue). Root
  README refreshed; all cross-references repointed.

- **Pass reorg (2026-07-16, user decision): Aubrey after the movement
  patterns.** The feature passes renumbered in `planning/RANKING.md`:
  **Pass 4** is now the scripted-spawn channel + ambient flows (absorbing
  the old 4.5; still research-gated on T4), Pass 5 is unchanged, and the
  Aubrey easter eggs moved to a new **Pass 6 at the end of the ladder** —
  deliberately after convoys, ambient flows, AND Pass 5, so each commission
  can carry convoy/escort legs, prize-takings, and chases instead of sailing
  a bare lane (bonus: the tracker, disabled until Pass 5, is live in time to
  pin the *Surprise*). T6 now feeds pass 6 and its catalog gains a per-
  commission `events` field (convoy legs, prizes, engagements, chases); the
  interleaved queue is re-ordered accordingly (T6 sits at step 12, Pass 6
  at step 13). Earlier dated bullets referring to "Pass 4 = easter eggs" and
  "Pass 4.5" describe the pre-reorg numbering.

- **Adoptions + research T5 (2026-07-16, user decisions):** **PLAN-4 and
  PLAN-6 are ADOPTED together** (decision ledgers in each plan's header):
  wave 1 = all five Tier-1 candidates (E1–E5); era 1550→1850 with all five
  new ports (Singapore, Hong Kong, Valparaíso, Sydney, New Orleans);
  **steam** = declared boundary for v1 PLUS a queued steam-layer feature
  (RANKING outside-the-ladder) with research task **T11**; the 1850→1860
  reset is a **designed epilogue decade**, not the stretched blend (new
  X-S1 design work); coerced flows (illegal-era Brazil/Cuba, Plata,
  Mascarene, convict transportation) confirmed under the Middle-Passage
  sober pattern with framing texts reviewed as authored; grounds-node
  pattern approved via E3 with the Arctic fishery staying registered;
  node placements by the staging-rule precedents. PLAN-6 X-R1 is now
  research task **T10** (Phase RB). **T5 is DONE** — the first completed
  research task: all eight failing name pools expanded period-plausibly
  (Portugal 12→44, Hansa 10→28, Mughal 9→20, Ottoman 10→20, Britain
  merchant 66→90, junk-trade 11→16, Gowa 8→12, Spain 12→16; dutch/france
  padded as headroom), `name-pressure.mjs` gate green on seeds 42/7/23
  (worst pool 64%), duplicate-name samples 97%→89%, 46 tests green;
  measurement note `research/name-pressure-2026-07-16.md`. **Pass 3.5 is
  unblocked** — with a standing re-gate at X-S2 (310-yr cycle + new
  powers re-raise pressure).

- **Queue steps 1 + 4 shipped (2026-07-16): new chart views + greying
  tweak, and feature pass 3.5.** Two new regional plates in `render.js`
  REGIONS — **`arabia-india`** (lon 36→92, lat −2→31; Gulf/Red-Sea headroom
  so PLAN-4 E2/E6 need no re-crop; Mascarenes deliberately out) and
  **`na-northeast`** (lon −82→−49, lat 34.5→52.5; Grand Banks sea room in
  frame for future fishery traffic) — menu rows auto-generate from REGIONS;
  containment pinned in test/regions.test.mjs; headless-verified (plate
  switching, settings persistence, zero console errors). Dormant-port
  greying window extended to **3 sim-years as DISPLAY policy in main.js**
  (`world.activePortsSince` keeps its 1-year default contract). **Pass 3.5
  (unique active names + retirement) is built**: `state.nameLedger` (name →
  blocked-until) written at spawn after every reschedule-return, pruned
  lazily, serialized, backfilled from surviving vessels+archive on pre-3.5
  saves (presence checked on the RAW save — the state literal's fresh `{}`
  would mask absence); candidate #0 still burns the same vessel-stream
  draws (unblocked names byte-identical to pre-pass; no reshuffle), blocked
  names redraw from `hashSeed('name', seed, id)` K=8 then
  accept-the-duplicate; a lost name rests `fate.atSec + 5 sim-years`,
  arrivals release at voyageEnd; retirement NEVER sourced from wrecks.
  Live-duplicate samples 97%→~1.6%; refractory violations ~0.1% (the
  designed tail). Fate-inertness proven: name-stripped fingerprints
  IDENTICAL vs pre-pass HEAD code, seeds 42/7/23, 20 mixed-granularity
  years. **52 tests green** (`test/names.test.mjs` +2 region pins). Next
  up: the Phase-RB research campaign (T4+T8+T9+T10 + E-R1), then convoys.

- **Cycle-scoped histories (2026-07-17, user request):** at every 1550 wrap
  the chart's displayed histories reset to the CURRENT iteration of the
  270-yr loop — earlier cycles' records are **retained in state, only
  hidden** (a display filter, never a sim input). `world.js`: statistics are
  bucketed per cycle (`state.stats.byCycle[idx]` — spawned/arrived/lost +
  byLane/byCargo), keyed by each EVENT's own sim-time (spawn at / loss at /
  voyage end — granularity-independent; a ship sailing across the seam
  spawns in one cycle's books and resolves in the next's); the display
  contracts filter to `cycleIndexOf(simClock)`: `snapshot()` counters (from
  the current bucket) + log + wrecks, the `world.stats` getter (current
  bucket), `portHistoryOf` (this cycle's calls only), and `warEventsSince`
  (clamped to the cycle start — cycle two's opening years no longer read the
  previous cycle's "…Wars ended"; the prev-cycle base is gone). Lifetime
  `state.counters` are untouched (fingerprint unchanged ⇒ sim-inert).
  Ships at sea across the seam sail on: their arrivals ARE the new
  iteration's traffic, so `portCalls` greying deliberately keeps reading
  through the wrap. A flat pre-cycle save's `stats` migrates into its own
  cycle's bucket on restore. main.js/ui.js needed ZERO changes (the world's
  display contracts do the filtering). Headless-verified across a fabricated
  seam (teleported clock, all panels). **53 tests green**
  (observation.test.mjs +1 seam test; settings.test war-wrap assertion
  flipped to the new contract).

- **Addenda intake (2026-07-17):** `feature-ideas/research_addenda.txt`
  (human input) folded into the queues — **T12** (the addenda sweep:
  Japan/Dejima + Japanese ports, Indonesia [= T8's Aceh/Bantam strand],
  cross-Pacific & around-SA [w/ E9 Callao], Med African coast, Caribbean,
  India–Arabia–E-Africa lens, one-time specials catalog, goods-thread
  lens) added to Phase RB as the campaign's tail (rb-campaign chunk 11);
  Pass 4 gained two requirements — **scripted-only ports** (Dejima the
  exemplar: no Poisson draw, scripted voyages only) and **per-seed
  probabilistic specials** (rare routes need not fire every run; T6
  records a suggested probability per Aubrey commission); RANKING's
  outside-the-ladder gained **trade-goods threads** (follow silver /
  Middle Passage [sober register kept] / whaling as display threads);
  tweaks.txt's new render bugs queued (port dots in the sea on close
  views, land clipping, residual zigzags).

## Earlier state (still accurate)
- **Repo structure:** the deployable site lives at the **repo root** —
  `index.html`, `main.js`, `world.js`, `render.js`, `ui.js`, `style.css`, and
  generated `data/` (`datasets.json`, `routes.json`, `land.geojson`). (Moved out
  of the old `app/` dir so Pages serves `index.html` from the root.)
- **Milestone 1 (data):** `data-src/` holds the six datasets + `ports.json` +
  `_schema.md`. `pipeline/build-data.mjs` validates cross-refs, enforces the
  Middle-Passage invariant, and runs a ~2000-vessel plausibility self-check
  (0 contradictions) → `data/datasets.json`.
- **Milestone 2 (routes):** `pipeline/bake-routes.mjs` reuses the archived engine
  to bake **208 route polylines** → `data/routes.json`. See `pipeline/README.md`
  for the three engine corrections it applies (Arctic ice cap, Panama/Suez seals,
  Drake-Passage cap) — **read that before touching the baker.** Archived `.bin`
  fields untouched.
- **Milestone 3 (headless world):** `world.js` — seeded, deterministic, DOM-free.
  Generates plausible vessels (PLAN §4), rolls each voyage's fate at spawn, and
  advances them along the baked polylines. Spawns/fates key off sim-time so
  big-step fast-forward == many small steps (offline accrual). `test/world.test.mjs`
  (`npm test`) — **7 passing** (determinism, granularity-independence, plausibility
  + Middle-Passage invariant, bounded population, calendar cycling).
- **Display (canvas; settles M4 — no MapLibre):** `render.js` + `ui.js` +
  `main.js` + `index.html` + `style.css` — a **parchment sea chart** (blank-sea
  portolan style: graticule projection grid, engraved coastlines, allegiance-tinted
  ship glyphs; wind roses and the log ticker were later removed). Controls: speed
  instrument, click a **vessel** → ledger (five fields + itinerary + sober
  Middle-Passage note), click a **port** → its live inbound/outbound traffic
  (current-leg only), ambient counters. Verified via headless Chromium.
- **Deploy:** `.github/workflows/pages.yml` stages the root site files into
  `_site` and publishes on push to `main` (needs Settings→Pages→Source→"GitHub
  Actions", one-time). Static; serve over HTTP, not `file://`. `#seed=<n>` loads a
  specific world.
- **Git:** branch `main`; remote **`https://github.com/casusscribere/idle-sails`
  (private)**, HTTPS via the credential store (see the global CLAUDE.md).

## Repo layout right now

```
CLAUDE.md            this file (mirrored as AGENTS.md)
README.md            short project intro + layout + build/deploy
planning/            ALL design & feature plans — planning/README.md is the index
  PLAN-1-rebuild.md      the rebuild design (complete; still the architecture reference)
  PLAN-2-flowing-era.md  flowing clock + diversity (complete / partly superseded)
  PLAN-3-flows.md        the flow-matrix architecture (complete)
  PLAN-4-expansion.md    the wider-world expansion (adopted 2026-07-16, unbuilt)
  PLAN-6-era-1850.md     the temporal expansion 1550→1850 (adopted 2026-07-16, unbuilt)
  PLAN-convoys.md        convoys feature spec (drafted, unbuilt)
  RANKING.md             THE WORK QUEUE — typed IDs (F/R/D/L) in waves W1–W6 (live)
  SHIPPED.md             the build record (keeps the retired Pass/Phase/Batch/T ids)
  OPEN-QUESTIONS.md      the D-nn decisions blocking queued work (live)
  REFINEMENTS.md         the LOCKED refinement track (L-01) — not queued
research/            evidence work — TASKS.md is the phased research queue,
                     CURATION.md the promotion rubric; datasets + reference pages
feature-ideas/       the user's raw sketches (untracked; never edited by agents)
archive/isochrone-v1/   the previous project (see its ARCHIVE-NOTE.md)
```

## Key documents

- **`planning/README.md`** — the design-document index: every plan with its
  status, plus the conventions (status headers, decision ledgers, completed
  plans kept verbatim as the design record).
- **`planning/PLAN-1-rebuild.md`** (was `PLAN.md`) — the design: assumed
  decisions (§0), reused assets (§1),
  architecture (§2), the six historical datasets (§3), the procedural generator
  (§4), the sim loop + idle mechanics (§5), offline route baking (§6), rendering
  & UI (§7), tech/layout (§8), milestones (§9), open questions (§10).
- **`planning/PLAN-2-flowing-era.md`** — the flowing-clock design (built:
  Step 1–2,
  Phase A, Phase C): a decade-weighted 1550–1815 sim looping via a 5-year
  reset, plus the minor-ports diversity layer (§5). Its Phase B and §7 are
  re-scoped by PLAN-3.
- **`planning/PLAN-4-expansion.md`** — **adopted 2026-07-16 (unbuilt)**: the
  wider-world expansion from the deep-research sweep
  (`research/port-flow-candidates-2026-07.md`) — five Tier-1 counted-series
  candidates (Montevideo/Río de la Plata, Basra+Bandar Abbas, a whaling
  grounds node, Hudson Bay, Port Louis/Mascarenes), Tier-2 (Jeddah, caravane
  maritime, Ragusa, Callao, Mozambique I.), silences-register actions, and
  per-candidate E-R1→E-S2 phases riding PLAN-3's machinery unchanged. All
  five Tier-1 are wave 1; the §3 decisions are recorded in its ledger.
- **`planning/PLAN-6-era-1850.md`** — **adopted 2026-07-16 (unbuilt)**: the
  temporal expansion — era 1550→1850, a designed epilogue decade 1850→1860
  (310-yr loop), the illegal-era slave trade carried under the sober
  pattern, five new ports, steam as a declared boundary with a queued steam
  layer (T11). X-R1 is research task T10; §6 decisions in its ledger.
- **`planning/PLAN-3-flows.md`** — **the completed architecture** (adopted
  2026-07-13, complete): replaces
  rankings→weights with an evidence-classed **trade-system flow matrix**
  (counted/proxied/reconstructed/asserted; per-basin assembly; a silences
  register; port prominence as an *output*). Carries the sensitization
  charter (§1) and the phase/decision ledger (§3): R1 rankings fixes → R2
  schema + Baltic proof → R3 basin authoring → S1 sim swap → S2 bake → S3
  surfacing.
- **`planning/PLAN-convoys.md`** — **drafted 2026-07-16, unbuilt**: the
  convoys feature spec (spawn-event grouping, escorted reprieve, the convoy
  ledger UI). Does NOT break fate-at-spawn — buildable now, outside the pass
  ladder; research task T9 refines its rates without gating it.
- **`planning/RANKING.md`** — **THE WORK QUEUE** (renumbered 2026-07-21). One
  flat, permanent ID space — **F-nn** build · **R-nn** research · **D-nn** user
  decision · **L-nn** locked — ordered by **waves**: `W1` corrections &
  verification → `W2` fidelity data & rules → `W3` movement patterns → `W4`
  legibility → `W5` sim redesign → `W6` capstone, plus `LOCKED`. An item's wave
  may change; its ID never does. Also carries the three-layer slider
  architecture, the old→new ID map (§3), and the recommended pull order.
  **Sync directive: whenever you edit ANY `planning/` document,
  `research/TASKS.md`, or an adoption status, update the matching wave table in
  RANKING.md in the same change.**
- **`planning/SHIPPED.md`** — the build record, moved out of RANKING in the same
  renumbering. Keeps the **old** identifiers (Pass 0–3.5, Phase 1/4, Batch P–Z,
  T1–T15) verbatim, because that is how shipped work is cited across the repo.
- **`planning/OPEN-QUESTIONS.md`** — the **D-01…D-17** decisions blocking queued
  work, each with options and a recommendation. Items blocked on one say so in
  their RANKING row.
- **`planning/REFINEMENTS.md`** — the **locked** refinement track (L-01),
  mirroring `feature-ideas/research_refinements`: full re-review passes over
  port histories, name lists, routes-vs-real-map-data, weather, and cargo flows.
  **Not queued, by its own header** — but it records where it collides with four
  live items, which is decision D-01.
- **`research/TASKS.md`** — the research task *content* (RANKING holds the
  *position*). Renumbered to **R-nn** on 2026-07-21; the RA/RB/RC/RD phase names
  are retired. Open: R-01 Japan & sakoku · R-02 port-event vocabulary · R-03
  national port access rules · R-04 Korea/Russian-Pacific · R-05 standing region
  re-review (blocked) · R-06 blockade catalog · R-10 port supply & demand
  (blocked) · R-07 + R-08 as ONE campaign for PLAN-5 · R-09 the Aubrey canon.
- **`archive/isochrone-v1/ARCHIVE-NOTE.md`** — what the old project was and
  exactly which of its assets the rebuild reuses.
- **`archive/isochrone-v1/SOURCES.md`** — historical sourcing + calibration
  report grounding the datasets.

## Reused from the archive (do not delete without porting forward)

- `archive/isochrone-v1/pipeline/ports.json` — 15 georeferenced historical ports.
- `archive/isochrone-v1/docs/data/fields/*.bin` + `pipeline/router.mjs` — the
  wind/current/polar least-time engine. Run **once, offline** to bake curved
  route polylines (`planning/PLAN-1-rebuild.md §6`); the 31 MB fields are **not** shipped at runtime.
- `archive/isochrone-v1/docs/app.js → routeFrom()` — downhill route-walk to port,
  to be ported into the offline route baker.
- `archive/isochrone-v1/docs/assets/land.geojson` — coastline for the map.

## Decisions assumed (chosen while the user was away — NOT yet confirmed)

See `planning/PLAN-1-rebuild.md §0`. Flag these for confirmation before deep work depends on them:

1. **Movement:** bake route polylines offline from the archived fields; ship only
   the polylines (not the 31 MB fields).
2. **Persistence:** persist to `localStorage` with offline-accrual fast-forward.
3. **Era scope:** lock to ~1700–1815 (matches the calibrated data).

Still open (`planning/PLAN-1-rebuild.md §10`): renderer choice (canvas — recommended — vs. MapLibre,
settle at Milestone 4); and the sober, non-gamified treatment of the slave trade,
which is historically central to this dataset.

## Working notes

- Environment: WSL2 Linux; primary dir `/home/kirk/REPOS_LINUX/idle_sails`.
- No `gh` CLI and no passwordless sudo here. GitHub ops go through the REST API /
  HTTPS with a user-supplied PAT. The PATs used during setup should be treated as
  compromised (they appeared in a chat transcript) and rotated.
- `.gitignore` excludes `node_modules/`, `pipeline/build/`, `*.log`. The archived
  `node_modules` is correctly excluded; the 31 MB of archived field data **is**
  committed on purpose (reusable engine output).
