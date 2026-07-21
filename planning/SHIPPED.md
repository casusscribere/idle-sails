# Shipped ledger — the build record

Moved out of `RANKING.md` on **2026-07-21** when the queue was renumbered, so
the live queue reads as a queue. Nothing here is work; it is the record of what
was built, why, and what was verified. Entries keep their original wording and
their **old** identifiers (Pass 0–3.5, Phase 1/4, Batch P/R/S/E/G/Z, T1–T15) —
the old→new ID map lives in `RANKING.md`.

---

## The pass ladder (old numbering)

**Pass 0 — ✅ shipped 2026-07-15.** Settings + performance tier (#2), menu
rework (#10), legend (#9), events log (#7), debug export (#3), port
click-priority (#14).

**Pass 1 — ✅ shipped 2026-07-15. Observation layer: statistics (#5) +
tracker (#6).** The same pattern twice: bounded recorded data in world state
(per-lane spawn/arrive/loss tallies + cargo counts in `state.stats`;
tier-capped per-port call histories in `state.portHistory`, surfaced as
"Lately called" in the port panel; pins + a `tracked.archive` that keeps a
pinned vessel's record when the cull would drop her — the vessels array stays
identical to an unpinned world's, so fingerprints never move). Statistics
recorded at spawn/resolution — granularity-independent by the same argument
as portCalls. Pin cap and history depth are `world.tuning` knobs (0/40/200
and 3/10/25 by tier). Save payload after a full sim-year: 34/110/148 KB by
tier. `test/observation.test.mjs` (5 tests) holds reconciliation with the
counters, granularity independence, pin sim-inertness, cap enforcement, and
save round-trips.

**Pass 2 — ✅ shipped 2026-07-16. Render/viewport: regional views (#1) +
layers panel (#8).** `render.js` bounds are mutable (`setRegion`), with preset
plates exported as `REGIONS` — world (data-fit crop), Europe & the
Mediterranean, the Caribbean, the East Indies & China — chosen by a "Chart
view" radiogroup in the menu and persisted as `settings.region`. Regional
plates contain on both axes, keep the readability floor, and rebuild
base/labels/overlay through the new projection (wakes drop rather than
streak); the graticule tightens 15°→5° on regional crops. Then the layers
panel: the routes overlay moved to a cached offscreen canvas refreshed on the
existing 5 Hz HUD throttle (per frame it costs one blit), and the overlay
boolean gained per-BASIN toggles — the six flow-matrix basins + "Naval & other
voyages" — as a menu-sub tree under the master toggle (children disable while
it's off, the legend-tree idiom). `build-data.mjs` carries `basin` on each
folded flow system (additive, datasetVersion stays 4); main.js votes each
lane's basin by folded share. Brightness normalizes within the visible set, so
an isolated basin reads its own hierarchy. Off basins persist sparsely
(`settings.layers`, absent = on). Verified headless (Playwright): plate
switching, filter isolation, sparse persistence across reload, zero console
errors. 41 tests green (`test/regions.test.mjs`).

**Pass 3 — ✅ shipped 2026-07-16. Vocabulary: captains + longer name pools
(#11's easy pieces) + the docs page (#4).** Every vessel sails under a named
shipmaster from `hashSeed('captain', seed, id)` — her OWN sub-stream, so no
draw was inserted into the vessel RNG sequence: name-stripped fingerprints
verified IDENTICAL against pre-pass HEAD on a fixed seed. `names.captains`
gives all 27 naming cultures a pool (build-data-validated): European cultures
compose given+surname; the title travels IN the name where that's the
historical usage (Nakhoda … for the Indian-Ocean shipowner-master, … Reis for
Ottoman masters with Greek kapetans alongside, Daeng … at Makassar;
China/Ryukyu surname-first). The ledger labels the role (Captain for naval,
Master for merchant); wreck records keep her master; a pre-captain save
backfills the exact same master on restore (pure function of seed+id+power).
Ship-name pools extended ~1.5–2× across all themes. #4:
`research/about.html` — "How this chart is made". `#debug=1` exposes
`window.__is` for headless verification. 46 tests green.

**Pass 3.5 — ✅ shipped 2026-07-16. Unique active names + name retirement
(#11's middle pieces).** Candidate #0 still comes from the vessel stream
(burning the draws makeName always burned), so an UNBLOCKED name is
byte-identical to the pre-pass world — no reshuffle; only blocked names
redraw, from `hashSeed('name', seed, id)`, K=8 then accept-the-duplicate.
`state.nameLedger` (name → blocked-until) is written at spawn AFTER every
reschedule-return, pruned lazily, serialized, and backfilled from surviving
vessels+archive on pre-3.5 saves (presence checked on the RAW save object).
Measured: live-duplicate samples 97% → ~1.6%; refractory violations ~0.1% of
spawns (the designed accept-the-duplicate tail). Verified fate-inert by the
pass-3 method on seeds 42/7/23 over 20 mixed-granularity years. 52 tests
green. A lost name rests `fate.atSec + 5 sim-years`; arrivals release at
voyageEnd; retirement is NEVER sourced from wrecks (`wreckLingerDays` is a
tuning knob — the sim must not read it). **Research gate T5** (name-pool
expansion to <70% peak pressure per culture/role pool) was satisfied first;
the standing re-gate is to re-run `research/tools/name-pressure.mjs` whenever
the cycle length or the power roster changes.

---

## Phase completions (old numbering)

### Phase 1 — The World Build · ✅ COMPLETE + MERGED + LIVE 2026-07-19
PLAN-4 E-S + PLAN-6 X-S, delivered across increments 1–8 (tracker
`planning/PHASE-1-build.md`). The world runs **1550→1850** (designed 10-year
epilogue decade, 310-yr loop), **105 ports · 414 routes · 82 folded systems ·
95% 1850s coverage**, `datasetVersion 5`, **55 tests green**, 0 console errors,
deployed. The eight approved framing texts are enforced; the seven orphan ports
(Singapore, Hong Kong, Sydney, Montevideo, New Orleans, York Factory, the
whaling grounds — + Basra/Bandar Abbas) each shipped with a
`research/flows/<port>-authoring.md` dossier. Baker infra: Panama seal→land-wall,
a destination-aware Cape-Horn cap, a sub-66 Hudson-Bay `SEASONAL_ICE` seal. The
name-pressure re-gate ran (china-junk-trade pool 16→44).

**Debts carried forward** (now tracked as live items in `RANKING.md`): the
`egypt` power + its 2 Mediterranean wars; the designed epilogue **spawn-taper**;
the **monsoon** half of seasonal departure windows (the ice half shipped);
`scriptedOnly` ports (Dejima).

### Phase 4 — Per-port documentation · ✅ COMPLETE + LIVE 2026-07-19
**Phase RC — T1+T2+T3 done for all 105 ports** (9 parallel region-batched
research subagents, assembled + validated). Each port carries its 1550→1850
name/ownership timeline (`ports[].eraNames` + `ports[].eraPowers`, 39 with
multi-window timelines, all tiling their active window — build-data-validated),
a port-panel blurb (era-resolved, `research/port-docs.json` → injected into
datasets), and a documentation entry with real citations on
**`research/ports.html`** (105 cards / 23 regions, headless-verified). New:
`world.js portPowerAt`, the port panel shows the ALLEGIANCE OF THE TIME, five
display-only independence powers (haiti/mexico/brazil/gran-colombia/dahomey),
and the name/ownership tweaks fixed (Masulipatnam=Golconda, Jayakarta=Banten,
Nagasaki=Japan, Bombay/Calcutta, "est." only for real in-sim foundings).
Charter held (slave-trade/coerced-labour ports named soberly; Indigenous
sovereignty at Sydney/Sitka/Nootka/Banda named honestly). 55 tests green.

---

## Cross-cutting features shipped outside the ladder

- **Cycle-scoped histories (2026-07-17).** At every 1550 wrap the displayed
  histories reset to the CURRENT iteration of the loop — earlier cycles are
  retained in state, only hidden (a display filter, never a sim input).
  Statistics bucketed per cycle keyed by each EVENT's own sim-time;
  `snapshot()` counters, log, wrecks, `world.stats`, `portHistoryOf`, and
  `warEventsSince` all filter to the current cycle. Lifetime `state.counters`
  untouched (fingerprint unchanged ⇒ sim-inert). 53 tests green.
- **New chart views (2026-07-16).** `arabia-india` and `na-northeast` plates;
  menu rows auto-generate from `REGIONS`; containment pinned in
  `test/regions.test.mjs`. Dormant-port greying window extended to 3 sim-years
  as DISPLAY policy in main.js (`world.activePortsSince` keeps its 1-yr
  contract).
- **UI overhaul (2026-07-15).** Corner docks, uniform disclosure headers,
  mobile bottom sheets, 44px coarse-pointer targets, safe-area insets, Escape
  handling, reduced-motion. Verified headless with programmatic no-overlap
  rect asserts down to 320px.

---

## The 2026-07-19 backlog sweep — batch tables as they stood

A full re-read of the input files against the shipped state. The T12 geographic
nodes (Callao, Guayaquil, Nootka, Curaçao, Algiers/Tunis/Tripoli/Alexandria,
Ostend, Bantam) were confirmed all built. Batches below record what shipped.

### Batch P — Polish & render
| Item | Src | Outcome |
|---|---|---|
| Full-Mediterranean `europe-med` plate (N. African coast) | tweaks 21 | ✅ 2026-07-20 — latMin 33→29; Algiers/Tunis/Tripoli/Alexandria in frame |
| Pacific plate (W NA/SA ↔ E Asia) | ideas 15 | ✅ 2026-07-20 — new `pacific` plate; antimeridian-aware projection (`normLon`) |
| Toggle-all-port-names button | tweaks 24 | ✅ 2026-07-20 — shipped as the 3-way **Port names** radio (Default/None/Most active) |
| Two-stage dormancy (grey → name hidden; start fresh greyed) | tweaks 22,23 | ✅ 2026-07-20 — 10-yr name window separate from the 3-yr grey, both cycle-clamped |
| Cursor lat/long readout (toggle) | ideas 16 | ✅ 2026-07-20 — trailing readout plate (`renderer.unproject`). The water-body/continent NAME stayed deferred (needs named-seas polygons) |

### Batch R — Routing/baker
| Item | Src | Outcome |
|---|---|---|
| Cape Horn wrong-way wrap | tweaks 13,14 | ✅ 2026-07-20 — the Horn-open (−58) mask was keyed only on the DESTINATION, so Pacific→Atlantic eastbound legs fled the wrong way around the globe (lon −400). Mask now opens when EITHER endpoint is a Pacific-coast-Americas port; re-baked; London→Canton stays capped |
| Boats sailing across Cuba | tweaks | ✅ 2026-07-19 — `ISLAND_SEAL` in `bake-routes.mjs` seals an island's false-ocean spine cells; Cuba's central-western spine sealed (7 cells), passages verified open, 0 lanes unsailable |
| Port dots in the sea | tweaks | ✅ 2026-07-19 — build-data computes a display coord per port (nearest point on the fine coastline); 38 dots snapped. Routing unchanged |
| Regional plates fill the viewport | tweaks | ✅ 2026-07-19 — a plate expands its authored crop to the screen aspect (no letterbox mat) |
| Zealand / the Danish straits seal | tweaks | ⛔ **CANNOT be safely sealed** (verified 2026-07-19 by flood-fill + reroute): the southern-isles route is the ONLY 1° connection into the Baltic — any Zealand-area seal severs the entire Sound-Toll trade (riga→amsterdam went UNREACHABLE). An irreducible 1°-grid limit, left as-is |

### Batch S — Sim refinements
| Item | Src | Outcome |
|---|---|---|
| Small-trade visibility floor | — | ✅ 2026-07-20 — York Factory &c. were drawn ~once a DECADE (a tiny realized flow drowned by proportional sampling against a ~16,000-ship world total — a false zero). `spawnLaneWeights` now floors each active trade lane to a minimum share of the spawn budget (rides eraFade). Measured: York 0.06 → ~1.1 ships/yr; busiest lane −15%, still dominant |

### Batch G — Roster gaps
| Item | Src | Outcome |
|---|---|---|
| Cape Town + critical waystops | addenda 10 | ✅ 2026-07-20 — Cape Town as a station node (Kaapstad→Cape Town 1806; VOC 1652 → British 1795 → Batavian 1803 → British 1806). A `via` mechanism rerouted the 22 Europe↔Asia round-the-Cape lanes through Table Bay; refreshment call + dwell from the 1652 founding. Flow volume unchanged |
| The waystations build (T14 sweep) | T14 | ✅ 2026-07-21 — `route.via` became an ordered CHAIN: the baker bakes `from→v1→…→vn→to` (hop-wise simplify so every call is a guaranteed vertex; per-hop longitude re-framing for the antimeridian), the sim splits the leg into one segment per hop with a dwell, each call gated to its station's founding — a chain **degrades hop by hop** as the era rolls back. 6 new station nodes (St Helena 1659 · Anjer 1682 · Umatac/Guam 1668 · Funchal · Santa Cruz de Tenerife · Angra; new `atlantic-islands` region); **54 lanes with a via** (was 22). Nationality honoured: no St Helena for Dutch/Swedish homeward, no Madeira for the VOC. **Johanna deliberately NOT built** → `johanna-inner-route-silence`. 64 tests green |

### Other direct-request fixes (2026-07-20)
- **Events-log category tree** — losses / wars / port foundings-captures-
  abandonment (a new `world.portEventsSince` deriving foundings from
  `active.from`, abandonments from `active.to`, allegiance changes from
  `eraPowers` transitions; cycle-clamped, granularity-independent) + a
  **Sunken ships** chart toggle (`renderer.setWrecks`, gates draw + pick).
- **Independence dates** — Boston/Philadelphia/Chesapeake flip to the US flag
  in **1776** (British evacuation / Patriot control); New York stays 1783
  (occupied).
- **Whaling grounds as zones** — `davis-strait` + `pacific-grounds` render as a
  dashed oval with a fluke, ellipse-picked, instead of a harbour dot;
  Smeerenburg (a real settlement) stays a dot.
- **Ruins icon** — a broken dashed ring struck by a small cross.
- **Great Lakes** cut as inland water (coarse Superior/Michigan/Huron/Erie/
  Ontario). **`na-northeast`** chart view hidden. **"Naval & other voyages"** →
  "Naval & state voyages".

---

## Research tasks completed

- **T1 + T2 + T3** — the per-port sweep (2026-07-19, Phase RC). See Phase 4 above.
- **T4 — ambient flows & naval movement patterns (2026-07-17).**
  `research/ambient-flows.md` §§1–4: naval patterns · fisheries & whaling ·
  scheduled/state services · local metabolisms — 286 claims under
  full-adversarial verification (229 ✅ / 56 ⚠ / 1 ✂). Cross-cutting
  conclusion: the **grounds-node** primitive is the one new movement primitive
  the program needs (six patterns wait on it); everything else rides existing
  machinery.
- **T5 — name-pool expansion (2026-07-16).** Eight failing pools expanded
  (Portugal 12→44, Hansa 10→28, Mughal 9→20, Ottoman 10→20, Britain merchant
  66→90, junk-trade 11→16, Gowa 8→12, Spain 12→16); gate green on seeds
  42/7/23 (worst pool 64%). Note: `research/name-pressure-2026-07-16.md`.
- **T8 — the 2026-07 sweep's declared silences (2026-07-18).** All five
  declared gaps answered. Two new ports (Ostend 1715–1745, Bantam 1550–1685),
  two folds, three silences answered.
- **T9 — convoy institutions & rates (2026-07-16).** 84 claims, every one
  independently attacked — 62 verified, 22 corrected, 0 refuted. Output:
  `research/ambient-flows.md` §1 + a refreshed `PLAN-convoys.md` §1 table.
  Findings: the caravane maritime is NOT a convoy institution; galeones END
  1739 with sueltos at 79.5–87% after; Brazil frotas 1649–1765 added; the
  British convoyed-trade share stays `asserted` 0.75–0.95.
- **T10 — the 1815–1850 campaign (2026-07-18, PLAN-6 X-R1).** Six basin
  extensions + five new-port dossiers + the full 1815–50 wars set; 384 claims
  at 322 ✅ / 59 ⚠ / 3 ✂.
- **T12 — the addenda sweep (2026-07-18).** Eight strands in
  `port-flow-candidates-T12-addenda.md`. Japan: no new sailable node (sakoku
  boundary), Dejima `scriptedOnly`, 2 silences, the Kanagawa-1854 correction.
  Pacific: Callao + `pacific-colonial-spanish`, Guayaquil + `guayaquil-cacao`,
  a Pacific whaling grounds-node, the Nootka→Canton fur system. Med-African:
  Algiers/Tunis/Tripoli/Alexandria nodes, `barbary-concessions` +
  `barbary-regency-exports`. Caribbean: Curaçao own dot, St Thomas/Paramaribo/
  Belize nodes, the golden-age-piracy hazard zone. Plus the 28-item **specials
  catalog** and the **goods-thread** display-feature spec.
- **T14 (waystations half) — 2026-07-20/21.**
  `research/port-flow-candidates-waystations-2026-07-20.md`: three basin
  gather-agents + synthesis cross-check. Verdicts: St Helena, Anjer/Sunda
  Strait (Europe↔Canton ran via Sunda, NOT Malacca), Guam (westbound only),
  Madeira/Canaries (outbound, split by nation), the Azores (Portuguese
  homeward), Johanna/Anjouan (EIC secondary). Ilha de Moçambique = the
  Portuguese Cape Town; Port Louis = the universal French waystop. NOT vias:
  Malacca (terminus), Cape Verde (slave terminus + framing),
  Galle/Trincomalee/Bourbon (full-port candidates), Ascension/Socotra/Aden/
  Pulo Condore (silences). **Korea / Russian-Pacific / Alaska remains open.**
