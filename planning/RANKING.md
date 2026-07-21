# RANKING.md — the live work queue

**Renumbered 2026-07-21.** The old scheme (Pass 0–6 with a "3.5", Phase RA–RD
for research, Phase 1–6 for builds, Batch P/R/S/E/G/Z for the backlog, T1–T15
for research tasks, plus each PLAN's own E-R1/X-S1 phases) had five overlapping
alphanumeric namespaces and two different meanings for the word "phase". It is
replaced by **one flat ID space and one ordering axis**.

The shipped record moved to **[SHIPPED.md](SHIPPED.md)** — it keeps the old
identifiers verbatim as the build record. The old→new map is §3 below.

---

## 1. The nomenclature

**Every item has one permanent ID.** IDs are never reused and never renumbered;
only an item's *wave* changes as priorities move.

| Prefix | Meaning |
|---|---|
| **F-nn** | Feature / build task — code, data, or bake work |
| **R-nn** | Research task — evidence work that lands in `research/` |
| **D-nn** | Decision the user must make before the dependent item can proceed |
| **L-nn** | Locked — needs its own design doc, or is user-gated, or is out of scope |

**Ordering is by wave, W1 → W6.** A wave is a delivery group, not a milestone:
items inside a wave may run in any order or in parallel; the wave boundary is
where a dependency or a philosophy change sits.

Waves are ordered **fidelity first, then efficiency** (the user's stated
priority, and `research_addenda.txt`'s standing instruction):

| Wave | Name | Why it sits here |
|---|---|---|
| **W1** | Corrections & verification | The chart currently asserts things that are wrong or unverified. Fidelity debt outranks new fidelity. |
| **W2** | Fidelity data & rules | Research that changes *what the sim claims*. Must land before the movement build spends it. |
| **W3** | Movement patterns | The big build. Grouped so ONE re-bake and ONE new spawn channel serve every item in it. |
| **W4** | Legibility | Render/observation only, sim untouched. Floats — but reads better once W2/W3 have given it real content. |
| **W5** | The sim redesign | Breaks fate-at-spawn. `datasetVersion` bump + save reset. Kept late so nothing waits on it. |
| **W6** | Capstone | Deliberately last so its content can use the full vocabulary of W3 + W5. |
| **LOCKED** | — | Not in the queue. Each entry names what unlocks it. |

**Efficiency rules applied when grouping** (secondary to fidelity):
- All baker-touching items collect in one wave so the world is re-baked **once**.
- Research tasks that read the same archives run as one campaign (the argument
  that grouped T1+T2+T3, and that groups R-07+R-08 here).
- All menu/legend/icon work collects in one pass so the disclosure idiom is
  designed once.

**Sync directive (unchanged, retargeted).** This file is the single
cross-queue order. Any edit to a document in `planning/`, to
`research/TASKS.md`, or to an adoption status must update the relevant wave
table **in the same change**. `research/TASKS.md` now carries the *content* of
each R-item; this file carries its *position*.

---

## 2. The architectural constraint that shapes everything

Unchanged, and still the reason W5 is last. The sim is seed-deterministic three
ways: per-vessel fate rolled entirely at spawn (`world.js generateVessel`),
spawns keyed to absolute sim-time, and the spawn-RNG word held as explicit
state. Same seed + sim-time ⇒ identical world at any tick granularity — the
invariant behind offline accrual. Features divide into three layers, and the
performance slider may only ever touch two:

1. **Sim layer** — what the world computes (spawns, fates, movement,
   interactions). NEVER varies with the slider. Heavyweights that change it
   (vessel persistence, capture, chases) are world-level opt-ins that bump
   `datasetVersion`.
2. **Observation layer** — what the world *records* (log length, wreck linger,
   stats, histories). Safe to tune; the cost is save-payload growth. Exposed as
   `createWorld({tuning})` / live `world.tuning`.
3. **Render layer** — what is drawn and how richly. Free. Ship density is
   deterministic render-thinning (`world.snapshot({density})`, stable per-id
   hash): the same world at every setting.

`test/settings.test.mjs` holds the line: same seed, any tuning ⇒ identical
fingerprints.

**Tier table (auto defaults)**

| Knob | Low | Medium (default = pre-slider) | High |
|---|---|---|---|
| Ships drawn | ~50 % (stable hash thin) | 100 % | 100 % |
| Wakes | off | 14 pts | 14 pts |
| Event-log cap | 50 | 200 | 500 |
| Wreck linger | 90 d | 1 sim-yr | 1 sim-yr |

Settings live in `settings.js` under their own localStorage key
(`idle-sails-settings`) — a device preference, deliberately outside the save,
surviving every `datasetVersion` reset.

---

## 3. Old → new ID map

Feature identifiers:

| Old | New |
|---|---|
| Pass 0, 1, 2, 3, 3.5 | shipped — [SHIPPED.md](SHIPPED.md) |
| Pass 4 (scripted channel + ambient flows) | **F-14** (channel) + **F-15** (ambient flows) |
| Pass 5 (persistence / capture / chases) | **F-36** + **F-37** + **F-38**, gated on **D-14** / PLAN-5 |
| Pass 6 (Aubrey) | **F-39** |
| Phase 1 (World Build), Phase 4 (per-port docs) | shipped — [SHIPPED.md](SHIPPED.md) |
| Phase 2 (Movement patterns) | wave **W3** |
| Phase 3 (Threads & polish) | wave **W4** |
| Phase 5 (sim redesign) | wave **W5** |
| Phase 6 (Aubrey capstone) | wave **W6** |
| Batch P (polish) | F-08, F-24, F-27, F-31 |
| Batch R (routing residuals) | F-06, F-07, F-10 |
| Batch S (sim refinements) | F-13, F-19, R-03 |
| Batch E (easter eggs) | F-20, F-39 |
| Batch G (roster gaps) | shipped, except **R-04** |
| Batch Z (big modes) | L-03, L-04 |
| Convoys (outside the ladder) | **F-12** |
| Seasonal departure windows | **F-10** (monsoon half; ice half shipped) |
| Steam layer | **L-05** |
| Trade-goods threads | **F-25** |

Research identifiers:

| Old | New | State |
|---|---|---|
| T1, T2, T3 | — | done (Phase RC) |
| T4, T5, T8, T9, T10, T12 | — | done |
| T6 (Aubrey canon + fiction catalog) | **R-09** | open |
| T7 (vessel lifecycle & prize practice) | **R-07** | open |
| T11 (steam) | **L-05** | locked |
| T13 (imbricate vessel identity) | **R-08** | open |
| T14 (waystops) | waystations half done; remainder → **R-04** | part open |
| T15 (national port access rules) | **R-03** | open |
| *(new 2026-07-21)* | **R-01, R-02, R-05, R-06, R-10** | open |

Phase RA/RB/RC/RD are retired. `research/TASKS.md` now groups research tasks by
the same waves as this file.

---

## 4. W1 — Corrections & verification

*No gates. Cheap. Everything here is the chart currently saying something false
or unverified — under the charter that outranks new content. Several are
verification-only and may close in minutes.*

| ID | Item | Src | Feas | Note |
|---|---|---|---|---|
| **F-01** | **Porto and Rotterdam have ZERO lanes** — neither can ever receive a ship | ideas §12 (Porto); found 2026-07-21 | A→B | Verified 2026-07-21: of 112 ports, exactly these two appear in no `routes.json` entry as from/to/via. This is a **silent zero** in the charter's exact sense — Porto's wine trade to Britain (the Methuen Treaty) and Rotterdam's Rhine-mouth carriage both existed. Either fold flows onto them or register them as declared silences; drawing an eternally idle dot is the one option the charter forbids. Blocked on **D-04** |
| ~~**F-02**~~ | ~~York Factory rate~~ | ideas §12 | A | ✅ **MEASURED 2026-07-21 — D-15 answered: cause (b).** New reusable tool `research/tools/port-traffic.mjs`. Seeds 42/7 over 1700–1790: **1.30 ships/yr — inside the historical 1–2**, so the floor is right. But **52% of years see no arrival at all**, worst gap **6 years**. The HBC ship was an ANNUAL SCHEDULED SAILING, not a Poisson draw — the fix is a scheduled sailing on F-14's channel, NOT a bigger floor. Requirement handed to **F-14** |
| **F-03** | **Port dot positions off on close views** (Banda Neira &c.) | ideas §12 | B | Residual after the 2026-07-19 coastline snap; the snap used the fine coastline, so the offenders are likely islands smaller than the snap's search radius. Audit all 112 display coords against the 50 m coastline and list the outliers |
| ~~**F-04**~~ | ~~China coast absent from the Pacific plate~~ | ideas §12 | B | ✅ **FIXED 2026-07-21.** Root cause was NOT `normLon` but ring UNWRAPPING, which anchors to a ring's first point: Eurasia's outer ring (10,297 pts) starts near Portugal, so in the Pacific frame it unwrapped to **342..540** — entirely outside the plate window 105..292 — and drew off the right edge, while its port dots (`project()`, no unwrapping) stayed put. `drawGeom` now slides each polygon by whole revolutions into the plate window and draws it once per revolution that overlaps. Verified: China/Korea/Siberia LAND, open Pacific sea, American rim unaffected, all 7 plates clean |
| **F-05** | **Great Lakes drawn coarse** — match the coastline's precision | ideas §12 | A | Currently a hand-cut inland-water approximation of Superior/Michigan/Huron/Erie/Ontario. Cosmetic; swap for real geometry from the same source as the coastline |
| **F-06** | Residual **land-clipping + oddly-square / zigzag legs** on close views | ideas §1b, §12 | B | The 1°-routing-grid vs the 50 m display coastline. Known-irreducible cases are documented in SHIPPED.md (Zealand cannot be sealed without severing the Baltic; Cuba's tip-grazes are inherent). What remains is per-offender `ISLAND_SEAL` / de-tack work. **ideas §1b asks the underlying question — "is this historical or an artifact?" The answer is: artifact, and the root cause is grid resolution.** See **D-03** |
| **F-07** | Closeup routes **terminate mid-screen** — draw through/past plate edges | ideas §12 (implied by §1b) | B | Re-verify against the fill-viewport change; clip-to-edge for off-plate destinations |
| ~~**F-08**~~ | ~~Name-list QA~~ | ideas §12 | A | ✅ **DONE 2026-07-21 — nothing was wrong.** All **127 pools** scanned for duplicates, stray whitespace, mojibake, and stubs: **0 issues**. `'t Vergulde Draeck` is CORRECT — `'t` is the Dutch contraction of *het*, and the Gilded Dragon was a real VOC retourschip wrecked off Western Australia in 1656, as are her poolmates (`'t Vliegend Hart` 1735, *Batavia* 1629, *Duyfken*, *Halve Maen*, *Witte Leeuw*, *De Liefde*, *Meermin*, *Goude Buys*). Recorded in `names.json`'s note so it is not "fixed" later. **L-01 §1b's full pass is still a separate, deeper ask** |
| **R-02** | **Port-event vocabulary** — "founded" is wrong for most events | ideas §12 | R (small) | The events log says *founded* for what are really re-openings, conquests, and grants of trade. Research a historically nuanced vocabulary ("opens to trade", "becomes active", "is granted a factory", "is refounded as…") and a per-event rule for choosing among them; **present the suggestions to the user before applying** (the user asked for this explicitly). Feeds `world.portEventsSince` display strings only — no sim change |

**Verified already fixed (2026-07-21) — no action, listed so they are not
re-opened:** Masulipatnam is `golconda` to 1638 then `britain`; Jayakarta is
`banten` to 1618 then `dutch`; `portHistoryOf` is cycle-clamped, so "Lately
called" already hides prior-cycle calls; the run-log export already covers the
whole retained history, not just the displayed cycle.

---

## 5. W2 — Fidelity data & rules

*Research-led. Each item changes what the sim asserts about the past. These
land before W3 spends them.*

| ID | Item | Src | Note |
|---|---|---|---|
| **R-01** | **Japan & sakoku — the full review** | addenda R1a | The largest single fidelity question in the inputs, and it has four parts the user raised separately: (a) **Portuguese naus are still sailing into Nagasaki in 1627** — verify what Portuguese traffic sakoku actually permitted and when it ended (the 1639 expulsion is the obvious boundary, but the 1620s–30s were a ratchet, not a switch); (b) **Ryukyu/Naha drops out of the later decade tranches** — is that real (the 1609 Satsuma invasion, the tribute trade's decline) or a gap in our matrix?; (c) **did the Chinese junk trade actually reach Japan in the 1500s–1600s?** — the user doubts it, given "Japan was closed"; the honest answer involves the Chinese quarter at Nagasaki continuing throughout, which the current model may or may not represent; (d) a general sakoku review that **suggests features** back to this queue. Extends T12's Japan strand rather than repeating it |
| **R-03** | **National port access rules** | ideas §8 | *(was T15)* Which ports refused ships of certain flags in certain periods, and which imposed class/tonnage limits (draft-limited roadsteads, galley-only harbours). **Scope carefully — much is already implicit in the flow matrix** (a lane that never existed is already absent); the task is to find cases where the sim WOULD generate an ahistorical call the matrix does not forbid. Evidence-classed; "usually refused" is not a hard block |
| **R-04** | **Korea / Russian-Pacific / Alaska** — promote-or-register verdicts | addenda R1f | *(the open half of T14)* Per port: Korean ports under the Joseon maritime-restriction boundary declared honestly; Okhotsk/Kamchatka and the RAC's Alaskan stations beyond the existing Sitka/Kodiak treatment. Expect silences-register entries |
| **R-05** | **Standing region re-review** — Indonesia · Caribbean · India–Arabia–E Africa · cross-Pacific & around-SA | addenda R1b, R1d, R1e, R1c | These four strands were all answered by T12 (2026-07-18), yet the user has **re-listed them in the reorganized addenda**. Either they are carried-over text or the T12 answers were insufficient. Blocked on **D-05** before any source work |
| **R-06** | **Blockade catalog** | ideas §6a | The historical blockades worth modelling (the Continental System, the 1793–1815 British blockades of France and the Baltic, the American 1812 blockade, earlier Dutch/Spanish cases), with dates, the ports/straits affected, and — critically — **what traffic actually did**: rerouted, ran the blockade, switched to neutral flags, or stopped. Gates **F-17**. Overlaps R-08 (neutral-flag transfer is the same evidence) |
| **R-10** | **Port supply & demand** — what each port bought and sold | ideas §7, §8 | The data behind **F-26**. Per port, the cargoes it produced/consumed at documentation depth, evidence-classed. **This is the same body of work as the locked refinement track's §1e.** Blocked on **D-01** |
| **F-09** | **Nagasaki / Dejima — one node or two?** | ideas §12 | Currently ONE node, `dejima`, displayed as "Nagasaki (Dejima)", `power: japan`, active 1571–1850, with an explicit `note` arguing the merge (a kilometre apart is one dot at chart scale; the separation is carried in the flow matrix and the ledger). ideas §12 asks to separate them and spawn Dejima independently. This is a **live design conflict, not a bug** — see **D-02** |
| **F-10** | **Monsoon seasonal-window narrowing** | internal (Phase-1 debt) | The baker already bakes {lane × routeClass × season} and `buildItinerary` breaks when no leg exists for the departure season — which is exactly how Arkhangelsk has no winter departures. The ICE half shipped (`SEASONAL_ICE`, Hudson Bay). The MONSOON half — narrowing `bantam-pepper`, `dutch-japan`, and the two convoy lanes to their real months — is still a data-and-baker change. **Do it in W3's re-bake.** Verify against the ANNUAL figure: concentrating the same volume into fewer months raises in-flight density in the window, which is correct |
| **F-11** | **`egypt` power + its two Mediterranean wars** | internal (Phase-1 debt) | Needs name + captain pools before it can be added (build-data validates that every `themesByPower` culture has a well-formed pool) |
| **F-40** | **Epilogue spawn-taper** | internal (Phase-1 debt) | The designed 1850→1860 epilogue decade shipped its blend + HUD note; the spawn *taper* across it did not |

---

## 6. W3 — Movement patterns

*The big build. Grouped for efficiency: everything here that touches the baker
runs in ONE re-bake, and everything that needs a second spawn channel shares
F-14's. Hard research gate T4 is **open** (`research/ambient-flows.md`), and its
engineering conclusion stands: **one new primitive — the grounds node —
unlocks six ambient patterns**; everything else rides existing machinery.*

| ID | Item | Src | Feas | Note |
|---|---|---|---|---|
| **F-12** | **Convoys** | `PLAN-convoys.md`; ideas §6c | B | Drafted, unbuilt, and **fate-at-spawn-safe** — the lowest-risk starting point in this wave. Inherits R-9/T9's evidence-classed rates for free. ideas §6c adds a requirement the plan should absorb: **correlated loss risk** — if one convoy vessel is taken, the others' odds must rise for the same event, which is exactly what a convoy action was |
| **F-13** | **Region/route-aware sinking** | ideas §6c | B | Losses at plausible points (hazard-zone ∩ route) instead of anywhere along the polyline. Loss location computed deterministically AT SPAWN, so fingerprint-safe. **The standout cheap fidelity win in this wave** — do it with F-12 |
| **F-14** | **The scripted-spawn channel** + `scriptedOnly` ports + probabilistic specials | Pass 4; addenda R1a, R2 | B | The second spawn channel outside the Poisson lane-weighted stream: fixed sim-date spawns with custom itineraries, keyed to sim-time crossings for determinism. Carries three requirements: **`scriptedOnly` ports** (Dejima the exemplar — 1–2 ships/yr under the Nagasaki registers, where a Poisson draw misrepresents it; also the Manila galleon pair); **per-seed firing probability** so rare voyages don't appear in every run (the 28-item specials catalog from T12); and the itinerary vocabulary F-16/F-20/F-39 all build on |
| **F-15** | **Ambient flows** — the grounds-node primitive + the six patterns | ideas §6a | B→C | Build the grounds node once (it also serves the E3 whaling nodes), then the six loitering patterns from `ambient-flows.md`. ideas §6a asks specifically for **fishing that wanders** rather than travelling to a zone and stopping, and for **naval patrols** — both are grounds-node consumers. Gates to the High performance tier. Patterns that answer a gestured silence (the herring buss fleet, Banks cod) must update the silences register when they ship |
| **F-16** | **Route variants** — blown off course · navigation error · wartime reroute · seasonal & bad-year variation | ideas §6b | B | Drawn from the vessel's OWN RNG at spawn, so fate-at-spawn holds. Note this also **unblocks the `johanna-inner-route-silence`**: a per-voyage route variant can send *some* Indiamen up the Mozambique Channel, which a per-lane `via` cannot |
| **F-17** | **Blockades** — famous historical blockades reroute or stop traffic | ideas §6a | B | Gated on **R-06**. Likely shape: a war-scoped lane override (blocked / rerouted / attrition-uplifted) rather than a new sim mechanic — cheaper and more honest, since the evidence is about *what traffic did*, not about individual ships |
| **F-19** | **Multi-leg cargo changes recorded in histories** | ideas §7 | B | Cargo per leg on the itinerary + an observation-layer note. Rides F-14's itinerary work. The user frames it as a **test** — so the deliverable includes an assertion that a multi-leg voyage's ledger shows the cargo *changing*, not one cargo for the whole trip |
| **F-20** | **Easter-egg channel demos** — HMS HMS *Bom Jesus* · the cat | ideas §10 | A / B | *Bom Jesus* is one scripted spawn once F-14 exists (the doubled "HMS HMS" is the joke). **The cat** is harder than it looks: a single persistent token riding vessels, hopping at ports, with fallbacks for being trapped by a port closing and for being aboard a sinking ship (nine lives). Needs cross-vessel state that stays granularity-independent. See **D-10** |
| **F-06/F-07** | *(routing residuals — listed in W1, but **execute them in this wave's re-bake**)* | — | — | Never re-bake just for them |

---

## 6b. W3R — The routing rebuild programme  ·  `planning/PLAN-7-routing.md`

*Drafted 2026-07-21 at user request; supersedes **L-02** and unlocks **L-01 §1c**.
Read the plan before touching any item here — it corrects three beliefs the queue
had been carrying.*

> ⏸️ **HELD PENDING INSTRUCTION (2026-07-21).** Scope is settled — **D-18**:
> routing + the lane → bake → itinerary layer, with the PLAN-3 flow matrix as a
> **fixed input**; **D-21**: unevidenced lanes stay unfitted, are reported
> *unverified*, and the coverage fraction is published, with silent extension of
> a fit **rejected on the record**. **D-19/D-20 are deliberately open** until the
> Phase-0 baseline exists. **Nothing here is to be built until the user says so;
> the next action when released is F-41 and nothing else.**

**What the investigation found** (source read 2026-07-21):
- The wind field is **not data**. `windfield.mjs` is ~15 hardcoded constants over
  six regimes; currents are **10 hardcoded lat-lon boxes**. The whole physics
  layer is `asserted` with no evidence class, no bounds, and no sources — the
  largest undeclared assertion in the project.
- The **oddly-square legs are 8-neighbour connectivity**, not grid resolution.
  A finer grid gives smaller staircases, not smoother tracks. **This re-frames
  D-03 and makes the fix cheaper than the resolution rebuild it was weighing.**
- **A whole voyage is routed in its departure season's wind.** A six-month
  London→Canton passage crosses two or three seasons and is sailed as though the
  departure month held throughout. Previously unrecorded.
- The archived **31 MB of `.bin` files are OUTPUTS** (precomputed travel-time
  surfaces) and are read by nothing. **L-04 is far cheaper than recorded.**

| ID | Item | Gate | Note |
|---|---|---|---|
| **F-41** | **The route-verification harness** — build it against the CURRENT engine | ⏸️ held | PLAN-7 Phase 0, and the highest-value item here. Metrics tier from categorical to quantitative so the early tiers cannot manufacture precision: **T1** waypoint/corridor recall · **T2** passage duration vs an observed RANGE · **T3** directional asymmetry (the volta do mar is binary-testable) · **T4** seasonal response · **T5** track geometry (Fréchet + cross-track) only where positional data exists. **No single global score** — one number over 414 unevenly-evidenced lanes is itself false precision. Survives the rebuild; becomes the regression gate |
| **R-11** | **The historical route corpus** | F-41 schema | Find, do NOT generate. CLIWOC · Maury · sailing directions · prescribed routes (Brouwer, Carrera, the Urdaneta return) · wreck positions. `prescribed-route` ≠ `logbook-track` and the suite must never average them. Declares what it does not cover — most of 1550–1700 |
| **R-12** | **Programmatic best practices** | none | Any-angle planning (Theta*/ANYA/Field D*) · fast-marching · time-dependent shortest path · grid choice incl. DGGS · obstacle representation · trajectory metrics · **determinism as a hard constraint** · baking/caching · validation methodology |
| **F-42** | **Physics honesty** — wind + current fields | R-11, **D-20** | Calibrate-and-declare, replace with a real climatology, or hybrid. Two fixes ship regardless: currents are added as a **scalar projection** rather than composed as vectors, and the 0.4 m/s floor is an undocumented magic number |
| **F-43** | **Algorithm & geometry** | R-12, **D-19** | Kill the 45° staircase first (connectivity or any-angle) — visible, cheap, resolution-independent. Then coastal resolution, measured by how many `ISLAND_SEAL`/`STRAIT_CARVE` entries can be DELETED |
| **F-44** | **Time-dependent routing** | R-12 | Cost as a function of arrival time, so a long passage sails the seasons it crosses. Interacts with F-10 (monsoon windows) and seasonal departure gating |
| **F-45** | **Calibration under holdout discipline** | F-41, R-11 | `research/routes/parameters.json`: every tunable carries an evidence class AND the scope it claims. **Tuning granularity may never exceed evidence granularity.** Stratified calibration/validation split; unevidenced scopes stay `tunable:false`; every move logged. Guards against a global fit that scores well on the North Atlantic while silently degrading the Indian Ocean |
| **F-46** | **Re-bake + regression gate** | F-42–45 | Runs in **C2's single bake** with F-01/F-03/F-06/F-07/F-10. `datasetVersion` bump; harness subset joins `npm test` |

**Sequencing — and the one thing not to do.** F-41 → {R-11 ‖ R-12} → **re-read
the baseline and decide whether a rebuild is warranted at all** (D-19/D-20) →
F-42–46. Step 3 is a real decision point: the harness may show durations are
broadly defensible and only the geometry is ugly, in which case the honest work
is the connectivity fix plus a declared-limitations page, not a physics rebuild.
**Do not tune before the harness exists** — that is how false precision enters.

---

## 7. W4 — Legibility

*Render + observation only; the sim is untouched, so this wave can float
anywhere. It is placed after W2/W3 because most of these panels get their
content from those waves — a port-type legend is more useful once port types
mean something, and a goods overlay is more useful once cargo changes per leg.*

### 7a. Port identity & iconography (design the classification once)

| ID | Item | Src | Feas | Note |
|---|---|---|---|---|
| **F-21** | **Port classification + icon set + legend entries** | ideas §4b, §8 | B | The roster already carries a role vocabulary — `home` 37 · `colonial` 40 · `naval` 14 · `station` 13 · `factory` 10 · `slaving` 4 · `embarkation` 2 — but the chart draws nearly all of them as the same dot, and the legend documents none of it. Design ONE classification, give each class a mark, document each mark in the legend. The whaling-ground zone and the ruins mark are the two precedents |
| **F-22** | **Inactive vs ruined** — distinct markers + descriptions | ideas §8 | B | Today a port is drawn, greyed, or ruined. The user wants a third state: **hardcoded-inactive** — a port that exists but receives no traffic for a long defined period (possibly to the end of the run). Both states need a mark AND a panel description explaining which it is |
| **F-23** | **Port subtype / ranking in the UI** | ideas §8 | B | Surface the port's class and its standing (the flow matrix already computes prominence as an *output* — `research/flow-prominence.html`). Must not fabricate precision: presence-without-rank is a valid state |
| **F-24** | **Co-located ports share one icon**, panel lists both | ideas §9 | B | Detect coincident display coords; merge dot + pick + panel. **Interacts with F-09/D-02** — if Nagasaki and Dejima split into two nodes, this is what redraws them as one mark |
| ~~**F-34**~~ | ~~Debug overlay for port lifecycle~~ | ideas §3 | A | ✅ **DONE 2026-07-21 (D-13: `#debug=1` only).** Not-yet-founded ports draw as a red dashed ring labelled with their founding year; a red caret + year marks any port whose name, allegiance, or existence changes within 25 sim-years. Reads the same `active`/`eraNames`/`eraPowers` windows the sim does, so it cannot drift from them. Verified present under `#debug=1` and absent without it |

### 7b. Goods & flows

| ID | Item | Src | Feas | Note |
|---|---|---|---|---|
| **F-25** | **Trade-goods threads** — follow a commodity across the world | ideas §7 | B | The global silver circuit (Potosí→Carrera, Acapulco→Manila, the Dejima silver leg, the Red Sea bullion counterflow), the Middle Passage, and whaling as followable threads. Shape: a "follow the cargo" research page in the `silences.html` idiom and/or a chart layer highlighting lanes by carried good. Research (T12's goods-thread lens) is **done**. **The Middle-Passage thread keeps the exact sober register — no value tier, no profit framing, factual, never a reward — and needs charter review as authored** |
| **F-26** | **Port buy/sell display** — what each port is buying and selling | ideas §7, §8 | B | A statistics-panel or port-panel view. Gated on **R-10** for real data — and R-10 is gated on **D-01**. A cheaper interim exists: derive it from the cargoes already carried on the lanes we model, which is honest (it says "what moved", not "what the port wanted") |
| **F-27** | **Overlay taxonomy by movement TYPE** | old tweaks 9 | B | Sub-toggles by arterial / coasting / coerced / fisheries / naval-state instead of by basin. A design change to the layer categories plus a build-data lane-type tag. **This item is NOT in the reorganized input files** — see the dropped-items list, **D-06** |

### 7c. Menu & chrome

| ID | Item | Src | Feas | Note |
|---|---|---|---|---|
| ~~**F-28**~~ | ~~Chart view above Popular trade routes~~ | ideas §12 | A | ✅ **DONE 2026-07-21.** Heading order is now Chart view · Overlays · Port names · Panels · Performance · Reference |
| ~~**F-29**~~ | ~~Collapse child controls when the parent is unchecked~~ | ideas §12 | A | ✅ **DONE 2026-07-21.** A shared `collapseSubtree()` hides `#layer-subs` (+ its line-weight note), `#events-subs`, and `#legend-subs` with their parents; children keep their disabled state, so nothing is keyboard-reachable while hidden. Verified in both directions |
| ~~**F-30**~~ | ~~Hide the Tracked-vessels row~~ | ideas §12 | A | ✅ **DONE 2026-07-21.** The row and its "awaits vessel persistence" note are both `hidden`; the wiring is intact, so F-38 un-hides by deleting two attributes |
| **F-31** | **Chart art** top/bottom for tall/wide framings | ideas §9 | B | "Here be dragons", gridline ornament, historically-grounded marginalia — fills the empty sea on unusual aspect ratios |
| **F-32** | **Convoy/flotilla UI** — ship icons to the LEFT of their names | ideas §12 | A | Small layout fix; lands with F-12's convoy ledger |
| ~~**F-33**~~ | ~~Plate-view review~~ | ideas §12 | A | ✅ **DONE 2026-07-21 (D-05b).** `na-northeast` CUT — already hidden, 5 ports, and its Grand-Banks justification waits on F-15; its test pin went with it. **7 plates remain**: world, europe, caribbean, east-indies, arabia-india, australasia, pacific |

---

## 8. W5 — The sim redesign

*Breaks fate-at-spawn. Needs PLAN-5, a `datasetVersion` bump, and a save reset.
Highest risk; nothing above depends on it.*

| ID | Item | Src | Note |
|---|---|---|---|
| **R-07** | **Vessel lifecycle & prize practice** | *(was T7)* | Service lifespans by rig/role/era; capture and prize volumes in the modelled wars; prize renaming practice. **Run as ONE campaign with R-08** — a captured ship re-flagged and renamed under its captor is literally one event on both task lists, and both read prize courts, Lloyd's Register, and registry law |
| **R-08** | **Imbricate vessel identity** — hull / flag / owner / master / crew | *(was T13)* | Build origin vs ownership vs registry vs flag vs master nationality vs crew composition, each of which moved independently in history and is fused into one attribute today. Expect **silences-register entries**, not just fields — flags of convenience exist precisely to defeat the record. Overlaps **R-06** (wartime neutral-flag transfer). **Not present in the reorganized inputs** — see **D-07** |
| **F-35** | **Draft PLAN-5** | — | Receives R-07 + R-08. The number 5 is reserved for it |
| **F-36** | **Vessel persistence, retirement, capture, prize pooling** | ideas §5 | Vessels persist for a historically relevant period and run routes until retired / captured / sunk; prizes are renamed into the captor's pool; **vessels retain their histories through capture and across routes** |
| **F-37** | **Ship-to-ship interaction** — encounters, avoidance, chases, piracy | ideas §6a | Pirate vessels that spawn and pursue; vessels that encounter, avoid, or chase each other. This is the item that breaks fate-at-spawn outright. See **D-09** — a cheaper non-interacting pirate *presence* is buildable in W3 |
| **F-38** | **Enable the tracker panel** | ideas §4a | The world-side pin API and its tests are already live and proven sim-inert; only the UI is greyed. Unblocks the moment F-36 lands |

---

## 9. W6 — Capstone

| ID | Item | Src | Note |
|---|---|---|---|
| **R-09** | **Aubrey canon + the wider historical-fiction catalog** | ideas §10; *(was T6)* | Per commission: vessel, rig, window, itinerary expressible on baked lanes, **and the events** — convoy/escort legs, prize-takings, engagements, chases — plus a suggested per-seed firing probability. Then the wider sweep: other age-of-sail historical fiction (novels, film, stage) ranked as candidates, same schema; only the top few need a full itinerary |
| **F-39** | **The commissions** | ideas §10 | Scripted spawns on F-14's channel. Deliberately last so each itinerary sails the full vocabulary: convoy legs (F-12), ambient backdrop (F-15), prizes and chases (F-37) — and the tracker (F-38) is live by then, so the *Surprise* can be pinned and followed |

---

## 10. LOCKED — not in the queue

| ID | Item | Src | What unlocks it |
|---|---|---|---|
| **L-01** | **The research refinement track** | `feature-ideas/research_refinements` | Mirrored as [REFINEMENTS.md](REFINEMENTS.md). Its own header says: *do not add these to the general to-do or feature lists until unblocked or specifically requested*. **It is therefore NOT folded into the waves above — but four of its five sections overlap live items** (see **D-01**), which is the single biggest scheduling question in this reorganization |
| ~~**L-02**~~ | ~~Routing / wind-chart engine rebuild~~ | ideas §1a | ➡️ **SUPERSEDED 2026-07-21 by [PLAN-7-routing.md](PLAN-7-routing.md)** and wave **W3R** above. It now has the design doc it was waiting for, and the investigation corrected its premise: the squareness is 8-neighbour connectivity, not grid resolution. **L-01 §1c is unlocked** as R-11 |
| **L-03** | **Fully-ahistorical mode** | ideas §11 | Needs its own design doc. Philosophically orthogonal to the charter — it must be a clearly-labelled separate mode that cannot muddy the sober register. See **D-11** |
| **L-04** | **Prune the archive from the repo** | ideas §2 | **CHEAPER THAN RECORDED (verified 2026-07-21).** The baker does NOT depend on the 31 MB of `.bin` fields — those are precomputed travel-time OUTPUTS (`<port>_<vessel>_<season>.bin`, 360×180 Uint16) and `bake-routes.mjs` says so and reads none of them. It imports four small `.mjs` modules (`router`, `config`, `geo`, + transitively `windfield`/`polar`). Port those forward, re-bake to prove it, then the 31 MB can go. See **D-12** |
| **L-05** | **Steam layer** | *(was T11)* | v1 is a **sail chart, declared** (steam is a silences entry + a divergences paragraph). A future steam layer — P&O/Cunard mail as a distinct movement class, great-circle legs and coaling calls, which the wind engine cannot produce — needs its own plan and its own research pass |
| **L-06** | **The procgen variant** | `feature-ideas/procgen_variant.txt` | Explicitly out of scope by its own header — ideas for a *future version* of the sim, never to be folded into this backlog. Listed only so it is never re-swept in by mistake |

---

## 11. Execution chunks

Waves (§4–§10) say **what matters most**. Chunks say **what to do in one
sitting**. They cross waves deliberately: a chunk is a unit of *shared setup* —
one re-bake, one archive reading, one design decision, one render session — so
the expensive thing happens once.

| Chunk | Name | Gated on | Touches the sim? | Size |
|---|---|---|---|---|
| ~~**C1**~~ | ~~The clean sweep~~ | — | no | ✅ **DONE 2026-07-21** |
| **C2** | The one re-bake | D-04 | data + baker | 1–2 |
| **C3** | The fidelity reading | D-05 (part) | no (research) | 3–4 |
| **CR** | **The routing programme** (PLAN-7) | ⏸️ **held** — D-18 ✅ / D-21 ✅; D-19/D-20 open by design | eventually, via re-bake | many |
| **C4** | Movement: the safe half | R-06 for F-17 | yes, fate-safe | 2–3 |
| **C5** | Movement: the channel | C4 | yes, fate-safe | 3–5 |
| **C6** | Port identity | D-02 | no | 2 |
| **C7** | Goods | D-01, D-06 | no | 2 |
| **C8** | The sim redesign | D-14, PLAN-5 | **breaks fate-at-spawn** | many |
| **C9** | Capstone | C5, C8 | no | 2 |

---

### C1 — The clean sweep ·  ✅ **COMPLETE 2026-07-21**

*Every item that needed **no research, no sim change, no re-bake, and no
architectural decision**. Both gating decisions were answered (**D-05b** cut
`na-northeast`; **D-13** put the debug overlay behind `#debug=1`) and the chunk
shipped in one sitting: **72 tests green · 0 console errors · all 7 plates
verified headless.** Two items produced findings rather than code:*

- ***F-02 answered D-15.*** York Factory runs at **1.30 ships/yr** — inside the
  historical 1–2, so the visibility floor is correct — but **52% of years are
  empty**, worst gap 6 years. It is a DISTRIBUTION problem, not a rate problem:
  the HBC ship was an annual scheduled sailing. Requirement handed to **F-14**.
- ***F-08 found nothing wrong.*** 127 pools, 0 mechanical issues, and
  `'t Vergulde Draeck` is a real 1656 VOC wreck, correctly spelled. The verdict
  is recorded in `names.json` so it is not "corrected" later.

*One bug was deeper than filed: **F-04** was not a `normLon` failure but a
ring-unwrapping anchor problem that hid the ENTIRE Eurasian landmass on the
Pacific plate.*

| ID | Item | Where | Why it's here |
|---|---|---|---|
| **F-28** | Chart view heading above Popular trade routes | `index.html` | Move one block; routes sit at line 31, chart view at 39 |
| **F-29** | Collapse children when the parent is unchecked (routes, events, legend) | `index.html`, `main.js`, `style.css` | The `menu-sub` + disabled-child idiom already exists; this changes disable→hide across all three trees |
| **F-30** | **Hide** the Tracked-vessels row (not disable) | `index.html` | One line — it is `class="menu-item is-disabled"` today |
| **F-33** | Prune / confirm the chart plates | `render.js REGIONS` | Deleting a plate is deleting one entry + its test pin. **Needs D-05b** |
| **F-04** | China coast on the Pacific plate | `render.js` | Self-contained: ports normalize through `normLon`, the coastline geometry evidently does not. One projection path, no data change |
| **F-34** | Debug overlay — ports that will change name / appear / disappear, and unappeared ports in red | `render.js`, `main.js` | All the data exists (`active`, `eraNames`, `eraPowers`); this is a draw pass. **Needs D-13** |
| **F-08** | Name-list QA (`'t Vergulde Draeck` &c.) | `data-src/names.json` | Data review, no code. **Note D-01** — the locked track wants a full pass; this is the one known-wrong list |
| **F-02** | York Factory rate — **measure and report** | `research/tools/` | Measurement only, no code change. Produces the number that settles **D-15** |
| — | Close the four verified-fixed reports | docs | Masulipatnam, Jayakarta, cycle-scoped "Lately called", whole-history export — already correct, verified 2026-07-21 |

**Optional stretch, same chunk:** **F-05** Great Lakes. Cheap *if* the asset is
obtainable — verified 2026-07-21 that `data/land.geojson` is `ne_50m_land` with
exactly one interior ring and none near the lakes, so the current lakes are
hardcoded polygons in `render.js` and real geometry means fetching
`ne_50m_lakes`. If the download isn't available, it drops to C2.

**Deliberately NOT in C1, with reasons:**
- **F-32** (convoy ship-icons left of names) — verified 2026-07-21: `flotilla`
  and `convoy` have **zero** hits in `ui.js`, `main.js`, `index.html`, and
  `style.css`. **That UI does not exist yet.** It is a requirement on F-12's
  convoy ledger → moved to **C4**.
- **F-03** (port dot positions, Banda Neira &c.) — needs an audit of all 112
  display coords and probably a change to the snap radius, which is a
  build-data change → **C2**, where the build runs anyway.
- **F-31** (chart art) — an art asset, not a tweak → **C6**.
- **F-01** (Porto/Rotterdam) — needs flows authored and a re-bake → **C2**.

### C2 — The one re-bake
*Rule: the world is re-baked **once**. Nothing here is worth a bake on its own;
everything here rides the same one.*
**F-01** Porto/Rotterdam flows (needs **D-04**) · **F-06** land-clipping and
oddly-square/zigzag residuals · **F-07** closeup routes drawn past plate edges ·
**F-10** monsoon seasonal-window narrowing (the ice half already shipped) ·
**F-03** port display-coord audit (rides the same `build-data` run).
Read `pipeline/README.md` before touching the baker. Verify F-10 against the
**annual** figure — concentrating volume into fewer months raises in-flight
density in the window, which is correct.

### C3 — The fidelity reading
*Research only; nothing ships. Grouped so each body of sources is read once.*
- **C3a — R-01 Japan & sakoku** (Portuguese naus, Ryukyu/Naha, the junk trade,
  other Japanese ports + a features verdict). The deepest fidelity question in
  the inputs, and it may hand features back to this queue.
- **C3b — R-02 port-event vocabulary.** Small, self-contained, and it ends in
  a **presentation to the user**, not an edit.
- **C3c — R-03 access rules + R-04 Korea/Russian-Pacific together.** Both ask
  "what could legitimately call where" over the same regime and roster sources.
- **C3d — R-05** only if **D-05** says the T12 answers were too thin.

### CR — The routing programme  ·  `planning/PLAN-7-routing.md`
*A programme, not a sitting. Ordered so the expensive, irreversible step (a
re-bake) comes last and only if the evidence asks for it.*
**CR-0** F-41 the harness, against the current engine — ships alone, useful alone
· **CR-1** R-11 ‖ R-12 in parallel · **CR-2** *the decision point*: re-read the
baseline with the corpus in hand and decide whether to rebuild, and how deep
(D-19, D-20) · **CR-3** F-42/F-43/F-44 as the evidence directs · **CR-4** F-45
calibration under holdout discipline · **CR-5** F-46 re-bake — **folded into
C2's single bake**, never its own.

### C4 — Movement: the safe half
*Fate-at-spawn holds throughout; no new spawn channel needed.*
**F-12** convoys — including **F-32** (ship icons left of names) and ideas §6c's
**correlated convoy loss** — · **F-13** region-aware sinking (cheap, rides the
same hazard data, the standout fidelity win) · **R-06** blockade catalog →
**F-17** blockades as war-scoped lane overrides (**D-08**).

### C5 — Movement: the channel
**F-14** the scripted-spawn channel + `scriptedOnly` ports + per-seed
probabilistic specials · **F-15** the grounds-node primitive and the six ambient
patterns · **F-16** route variants (which also unblocks the
`johanna-inner-route-silence`) · **F-19** multi-leg cargo in histories ·
**F-20** *Bom Jesus* + the cat (**D-10**).

### C6 — Port identity
*One classification, designed once, then drawn and documented.*
**F-09/D-02** Nagasaki–Dejima · **F-21** port classification + icon set + legend
entries (the roster already carries `home`/`colonial`/`naval`/`station`/
`factory`/`slaving`/`embarkation` — the chart draws them all the same) ·
**F-22** inactive vs ruined · **F-23** subtype/ranking in the UI · **F-24**
co-located icons · **F-31** chart art (same render/art session).

### C7 — Goods
**R-10** port supply & demand (**D-01**) → **F-26** port buy/sell · **F-25**
trade-goods threads (the Middle-Passage thread keeps the exact sober register
and needs charter review as authored) · **F-27** overlay taxonomy (**D-06**).

### C8 — The sim redesign
**R-07 + R-08 as one campaign** → **F-35** PLAN-5 → **F-36** persistence and
capture · **F-37** chases and piracy pursuit · **F-38** enable the tracker.
Breaks fate-at-spawn; `datasetVersion` bump + save reset.

### C9 — Capstone
**R-09** the Aubrey canon + the wider fiction catalog → **F-39** the commissions.

---

### Decisions by chunk

| Chunk | Blocking decisions |
|---|---|
| ~~C1~~ | ✅ D-05b + D-13 answered 2026-07-21 |
| C2 | D-04 |
| CR | ✅ D-18 + D-21 answered 2026-07-21; D-19/D-20 held until the Phase-0 baseline. **Build held pending instruction.** |
| C3 | D-05 (C3d only) |
| C4 | D-08 |
| C5 | D-10 |
| C6 | D-02 |
| C7 | D-01, D-06 |
| C8 | D-07, D-14 |
| C9 | — |

Full text in **[OPEN-QUESTIONS.md](OPEN-QUESTIONS.md)**. D-03, D-11, D-12 gate
locked items only; D-15/D-16/D-17 are verification and confirmation.
