# PLAN-7 — The routing rebuild and its verification suite

**Status: 📐 SCOPED 2026-07-21 — decisions taken, BUILD NOT STARTED, held
pending the user's instruction.** Supersedes `L-02` (the locked "routing/wind-
chart engine rebuild") and unlocks `L-01 §1c` (the refinement track's "find, NOT
generate, real route data and compare"), which the user opened by requesting
this plan.

> ▶️ **RELEASED 2026-07-21. Phase 0 (F-41) is BUILT; everything after it is
> still held.** D-18 and D-21 are settled (ledger below); D-19 and D-20 remain
> deliberately open until the baseline is read against a real corpus. The next
> action is **R-11 ‖ R-12**, and no engine change before CR-2.

**Phase 0 result (2026-07-21).** The harness exists and the first baseline is
committed: `research/routes/baseline-2026-07-21.json`, rendered at
`research/routes.html`. The headline is the coverage figure, which is exactly
the number this plan was built to make visible:

> **10 of 414 lanes (2.4%) have any route evidence at all. 404 are unverified.**
> By basin: Atlantic 0/102, Mediterranean 0/48, Baltic–North Sea 0/41,
> Indian Ocean west 0/25, Pacific 0/23 — every entry so far falls in
> bengal-se-asia (6/54) and east-asia (4/42). By era band, 1550–1650 is 4/261.

All 21 evaluated claims pass, and that statement is worth almost nothing on its
own — it says the current engine honours the waystop constraints it was built to
honour. The suite's value is the 404, and the machinery that keeps the 404
visible rather than dividing 21 by 21 and reporting 100%.

## Decision ledger

| # | Decision | Taken | Outcome |
|---|---|---|---|
| **D-18** | Scope of "trade flows" | 2026-07-21 | **(a) — routing + the lane → bake → itinerary layer.** The PLAN-3 flow matrix's outputs (which lanes, what volume, which era) are **fixed inputs** and are not re-opened. Rationale in §8. |
| **D-21** | Lanes with no verification evidence | 2026-07-21 | **(a) — unfitted, marked, published.** Unevidenced parameters keep `asserted` defaults and stay `tunable: false`; unverified lanes are reported as *unverified*, never as *passing*; the coverage fraction is published. **Option (c) — extending a fit silently — is rejected on the record.** Rationale in §1.1. |
| D-19 | Grid & algorithm | — | **Deliberately open** until F-41's baseline + R-12. Answering now would commit to a rebuild shape before the evidence justifying it exists. |
| D-20 | Physics depth | — | **Deliberately open** until F-41's baseline + R-11. Two fixes ship regardless (§4). |
| D-22 | Harness as a commit gate | — | Leaning: categorical tiers only. Decide when F-41 is written. |

---

## 0. Why this exists — what the engine actually is today

Before proposing a rebuild, here is the engine as built, read out of the source
on 2026-07-21. Several widely-repeated beliefs about it are wrong, and the
corrections change what a rebuild should do.

**The router** (`archive/isochrone-v1/pipeline/router.mjs`, 82 lines) is a
**Dijkstra search with 8-neighbour connectivity over a 1° lat-lon grid**
(360 × 180 = 64,800 cells). Edge cost is distance ÷ boat speed, where boat speed
comes from a wind field, a vessel polar, and a current field.

**The wind field is not data. It is a parametric function of ~15 constants.**
`windfield.mjs` returns one of six hardcoded regimes — monsoon (two fixed
directions), doldrums, NE trades, SE trades, mid-latitude westerlies, polar
easterlies — each with a fixed direction and a fixed speed, modulated by an ITCZ
latitude that is itself four hardcoded numbers. **Currents are ten hardcoded
lat-lon boxes** with a fixed set and speed each (Gulf Stream, Kuroshio, Agulhas,
Benguela, Canary, Humboldt, Brazil, N. Atlantic Drift, West Wind Drift, and a
westward equatorial band).

Its own header says the structure "follows the pilot-chart / CLIWOC-documented
picture of the 1750-1854 sailing world." **That claim has never been tested.**
In the project's own evidence vocabulary the entire physics layer is
`asserted` — and unlike every flow system in `research/flows/`, it carries no
evidence class, no bounds, and no source list. That is the single largest
undeclared assertion in the project, and it is the reason this plan exists.

**The 31 MB of archived `.bin` files are outputs, not inputs.** They are
`<port>_<vessel>_<season>.bin`, 129,600 bytes each = 360 × 180 × Uint16 — one
precomputed travel-time surface per origin/vessel/season. `bake-routes.mjs`
says so plainly ("The archived fields are left untouched; this recomputes the
handful of fields it needs") and never reads one. The baker depends on four
small `.mjs` modules, not on the 31 MB. **This makes L-04 (prune the archive)
far cheaper than CLAUDE.md claims** — see §9.

### 0.1 Three distinct defects, previously conflated

The queue has been treating "the routes look wrong" as one problem with one
cause (1° grid vs. fine coastline). It is three problems with three causes, and
only one of them is fixed by resolution:

| Symptom | Real cause | Does higher resolution fix it? |
|---|---|---|
| **Oddly-square legs** | **8-neighbour connectivity quantizes every heading to a multiple of 45°** | **No.** A finer grid gives *smaller* 45° staircases, not smoother tracks. This needs more neighbours or an any-angle algorithm. |
| Land clipping, island crossings, tip-grazes | 1° cells vs. the 50 m display coastline; sub-cell islands | Partly — and it is why Zealand cannot be sealed without severing the Baltic |
| Implausible tracks and durations | The analytic wind/current fields, never validated | No. This is a physics problem, not a geometry problem |

The `deTack()` pass in the baker — which smooths "residual oscillation to its
made-good line" before Douglas–Peucker — is a post-hoc cosmetic repair for the
first row. It treats the symptom.

### 0.2 A fourth defect, not previously recorded

**The whole voyage is routed in its departure season's wind.** `fieldFor()`
computes one Dijkstra field per (destination × routeClass × season) and the path
is walked through that single static field. A London→Canton passage takes
roughly six months and crosses two or three seasons; it is currently sailed as
though the departure month's winds held the whole way. This is a genuine
fidelity defect, it is invisible on the chart, and it interacts directly with
the monsoon work (F-10) and seasonal departure windows. Fixing it means
**time-dependent routing**, where cost depends on arrival time at each cell.

---

## 1. What this plan will and will not claim

The user's brief contains the governing tension, and it is the same one the
sensitization charter already answers for trade volumes:

> *Prioritize alignment within historically-verifiable datasets, but do not
> generate false precision.*

Applied to routing, that means a hard rule:

> **Tuning granularity may never exceed evidence granularity.**

If the corpus supports the North Atlantic in 1780, a parameter may be tuned for
the North Atlantic in 1780. It may **not** be tuned globally and then applied to
the Indian Ocean in 1590, because that would launder a verified local fit into
an unverified global claim — precisely the move the charter forbids for trade
volumes, and precisely what a naive "fit the router to the logbooks" project
would do.

Concretely, five disciplines (detailed in §4):

1. **Every tunable parameter carries an evidence class and a scope.**
2. **Holdout validation**, stratified by basin and by era — error is reported on
   data the fit never saw.
3. **A minimum evidence threshold** before any parameter may move at all.
4. **Unevidenced scopes keep their `asserted` defaults, explicitly unfitted**,
   and are marked as such in every report.
5. **Coverage is published, not buried.** The suite states what fraction of the
   414 lanes has any verification at all. That number will be small, and saying
   so is the point.

### 1.1 The D-21 rule, as adopted

**Unevidenced scopes are never silently fitted.** Concretely, and bindingly:

- A parameter whose scope has no supporting corpus entries keeps its current
  value, is marked `tunable: false`, and is reported as *unfitted*.
- A lane with no corpus entry is reported as **unverified** — a third state,
  distinct from *passing* and *failing*. It never counts toward a pass rate.
- The **coverage fraction** — how many of the 414 lanes have any evidence at
  all, by tier — is published on the research site, not kept in a build log.
- Extending a fit beyond its evidence *with* a declaration is permitted only
  where the declaration travels with the data (a field on the parameter, not a
  sentence in a page). Extending it **without** declaration is forbidden.

This is the "no silent zeros" rule of `PLAN-3 §1`, applied to routes. The
expected consequence is an uncomfortable coverage number. Publishing it is the
point, exactly as the silences register publishes what the flow matrix cannot
say.

A corollary worth stating plainly: **the era is the binding constraint.** The
richest positional source for age-of-sail tracks covers roughly 1750–1854. The
sim runs from 1550. Track-level verification for 1550–1700 is largely
impossible, and the honest output is a declared silence, not a back-projected
parameter presented as verified.

---

## 2. Phase 0 — Build the verification suite FIRST, against the current engine

**This phase ships before any rebuild decision is taken, and it is the most
valuable single deliverable in the plan.**

The reasoning: a rebuild justified by "the routes look wrong" is a rebuild with
no acceptance criterion. Building the harness first (a) quantifies how wrong the
current engine actually is, per basin and per era; (b) may show that some
subsystems are fine and need no work; (c) gives every later phase a regression
gate; and (d) survives the rebuild — the harness is permanent infrastructure,
the engine is not.

**Deliverable:** `research/tools/route-verify.mjs` + a corpus at
`research/routes/corpus.json` + a rendered report page in the `silences.html`
idiom.

### 2.1 The corpus schema

Each entry is one *verified historical observation about a route*, evidence-
classed exactly like a flow system:

```jsonc
{
  "id": "voc-outbound-brouwer",
  "class": "counted | proxied | reconstructed | asserted",
  "kind":  "prescribed-route | logbook-track | passage-duration |
            waypoint-constraint | forbidden-corridor",
  "era":   { "from": 1611, "to": 1750 },
  "from": "amsterdam", "to": "batavia", "season": "djf",
  "duration": { "days": [180, 240], "n": 42, "basis": "…" },
  "waypoints": [
    { "name": "Table Bay", "lon": 18.4, "lat": -33.9, "tolKm": 300, "required": true }
  ],
  "corridors": [
    { "name": "Malacca Strait", "forbidden": true, "box": [98, 1, 104, 6] }
  ],
  "track": [[lon, lat], …],        // ONLY where positional data genuinely exists
  "sources": [ … ],
  "notes": "…"
}
```

The `kind` field matters more than it looks: **a prescribed route is not an
observed route.** VOC standing orders say what ships were *told* to do; logbooks
say what they did. Both are evidence; they are not the same evidence, and the
suite must never average them into one number.

### 2.2 The metrics, tiered by how much they can honestly claim

Deliberately ordered from most robust to most demanding. The early tiers are
categorical and cannot manufacture precision; the last tier is quantitative and
is only applied where positional data exists.

**T1 — Waypoint and corridor recall (categorical).** Does the generated route
pass within tolerance of each required waypoint, and stay out of each forbidden
corridor? This is the workhorse: it is robust to grid artifacts, needs no
positional series, and encodes exactly the things the historical record is
confident about — that the homeward China ships used Sunda and not Malacca, that
Indiamen watered at Table Bay, that the Carrera made its westing in the trades.

**T2 — Passage duration against an observed range.** Scored as *inside range /
outside range*, with the signed margin reported — never as error against a
fabricated point estimate. Duration is far better evidenced than track geometry:
sailing and arrival dates survive in shipping registers, the Sound Toll, and
company records for periods with no positional data at all. **This is the
primary calibration target for the early era.**

**T3 — Directional asymmetry.** Outbound and homeward tracks must *differ* where
history says they differed. The volta do mar, the Atlantic figure-of-eight, and
the Manila galleon's northern return are the defining feature of age-of-sail
routing; a system that produces symmetric out-and-back tracks is wrong in a way
that is trivially testable and historically fundamental. Pass/fail, plus the
measured separation between the two tracks.

**T4 — Seasonal response.** Where sailing directions say the route changed with
the season, the generated route must change too — and in the right direction.
This tier is what will catch the §0.2 single-season defect.

**T5 — Track geometry.** Only where positional data exists: discrete Fréchet
distance, plus median and 90th-percentile cross-track deviation. Reported per
route, never pooled into a global mean.

### 2.3 Reporting rules

- **No single global score.** One number over 414 lanes with uneven evidence
  would itself be false precision. Report per basin, per era, per tier.
- **Coverage first.** Every report opens with how many lanes have any evidence
  at all, broken down by tier.
- **Unverifiable is a result.** Lanes with no corpus entry are reported as
  *unverified*, never as *passing*.

---

## 3. Phase 1 — The two research tasks (run in parallel)

### R-11 — The historical route corpus
Detailed in `research/TASKS.md`. Finds, does **not** generate, real route
evidence, and bounds each item's reliability. Candidate sources to verify —
none of these is asserted here as fact; establishing what each actually
contains, and for which eras and basins, is the task:

- **CLIWOC** — the Climatological Database for the World's Oceans, built from
  Dutch, English, French and Spanish logbooks, roughly 1750–1854. The obvious
  anchor for positional tracks, and the source the current wind model already
  name-checks without ever having been tested against it.
- **ICOADS** early marine observations.
- **Maury's Wind and Current Charts and Sailing Directions** (from the 1840s) —
  late for our window, but they codify the routes the sailing era had settled on.
- **Admiralty and company sailing directions**; East India Company route
  instructions.
- **Prescribed routes as documents**: the VOC's Brouwer Route (1611) and its
  standing orders; the Carrera de Indias; the Manila galleon's Urdaneta return.
- **Scholarly reconstructions** in maritime history and historical geography.
- **Wreck positions** as weak point-constraints.

Deliverable: the corpus JSON above, every entry evidence-classed and bounded,
plus a declared statement of what it does **not** cover — which will be most of
the 1550–1700 window and most non-European shipping.

### R-12 — Programmatic best practices for route generation and execution
Detailed in `research/TASKS.md`. A literature and practice review whose output
is a *recommendation with trade-offs*, not a preference. Must cover:

- **Any-angle path planning** — Theta*, Lazy Theta*, ANYA, Field D* — as the
  direct answer to §0.1's heading quantization, and how each interacts with
  anisotropic (direction-dependent) cost.
- **Fast Marching / level-set methods** for optimal paths in flow fields, which
  is the other established family for exactly this problem.
- **Time-dependent shortest path** — cost as a function of arrival time at a
  cell — for the §0.2 multi-season defect.
- **Grid and discretization**: raising connectivity vs. raising resolution vs.
  adaptive/multi-resolution (coarse ocean, fine coast) vs. discrete global grids
  (H3, S2, HEALPix, icosahedral) that avoid lat-lon polar convergence and give
  uniform cell area.
- **Obstacle representation**: raster masks vs. polygon-aware visibility, and
  the sub-cell island problem that defeats the current seals.
- **Trajectory similarity metrics** — Fréchet, DTW, Hausdorff, cross-track
  error — to ground Phase 0's T5.
- **Determinism and reproducibility** under a seeded simulation: any algorithm
  adopted must be exactly reproducible, or the project's core invariant dies.
- **Baking, caching, and compression** strategies for many-to-many precomputed
  routes.
- **Validation methodology** from the operational weather-routing literature.

---

## 4. Phase 2 — Physics honesty

The wind and current fields are the least defensible part of the system and the
most consequential. Options, to be chosen with R-11/R-12 in hand (**D-20**):

- **(a) Keep the parametric model, but calibrate and declare it.** Give every
  constant an evidence class, a source, and a bound; fit only where the corpus
  supports it; publish the rest as `asserted`. Cheapest, and it makes the
  existing model honest rather than replacing it.
- **(b) Replace with a real climatology.** Ingest an actual seasonal wind and
  current climatology as gridded data. Far better physics; adds a data
  dependency and a build step; raises the anachronism question of using a modern
  climatology for a Little-Ice-Age world — which must be *declared*, not hidden.
- **(c) Hybrid.** Data where it exists and is defensible, parametric elsewhere,
  with the boundary explicit.

Whatever is chosen, two fixes are independent of it and should ship regardless:
**currents are currently added as a scalar projection onto boat speed** rather
than composed as vectors with the boat's velocity through the water, and the
0.4 m/s floor is an undocumented magic number.

---

## 5. Phase 3 — Algorithm and geometry

Gated on R-12. The candidate work, in the order the §0.1 table implies:

1. **Kill the 45° staircase.** Raise connectivity (16/32-neighbour) or adopt an
   any-angle algorithm. This is the visible win and it is independent of
   resolution.
2. **Time-dependent cost** (§0.2), so a six-month passage sails through the
   seasons it actually crosses.
3. **Coastal resolution** — adaptive refinement near land, so the sub-cell
   island problem stops requiring hand-authored seals. Success here is measured
   by how many `ISLAND_SEAL` / `STRAIT_CARVE` entries can be *deleted*.
4. **Obstacle representation**, if R-12 recommends polygon-aware work.

Each step is separately gated by Phase 0's harness: a change ships only if it
improves T1–T5 on the **holdout** set, or leaves them unchanged while fixing a
declared defect.

---

## 6. Phase 4 — Calibration, under the anti-false-precision rules

**Deliverable:** `research/routes/parameters.json` — a registry of every
tunable, and a tuning changelog in the pattern the rankings JSON already uses.

```jsonc
{
  "id": "trades.ne.speed",
  "value": 6.5, "unit": "m/s",
  "class": "asserted",
  "scope": { "basin": "*", "era": "*" },     // the scope this value CLAIMS
  "evidence": { "entries": 0, "tier": null },// what supports it
  "tunable": false,                          // false until evidence exists
  "note": "…"
}
```

The procedure:

1. **Split the corpus** into calibration and validation sets, stratified by
   basin and era so no basin is validated only against itself.
2. **Fit only parameters whose scope is covered** by ≥ N calibration entries
   (N declared, not discovered after the fact).
3. **Report validation error** per tier, per basin, per era.
4. **Freeze everything else.** An unevidenced parameter keeps its default, is
   marked `tunable: false`, and appears in the coverage report as unfitted.
5. **Record every move** with its evidence and date.

**The failure mode this is built to prevent:** a global fit that scores well
because it is dominated by the well-documented North Atlantic, silently
degrading the Indian Ocean and the Pacific while reporting an improved average.
Stratified holdout reporting makes that visible instead of invisible.

---

## 7. Phase 5 — Re-bake and regression

A re-bake changes every polyline and therefore invalidates saves
(`datasetVersion` bump, as with the convoy merge's 5→6). It also touches the
`via` chains, the seasonal gating, and the Horn/ice masks. So:

- Run C2's queued baker work (**F-01** Porto/Rotterdam flows, **F-06** clipping
  residuals, **F-07** edge-draw, **F-10** monsoon windows, **F-03** dot audit)
  **in the same bake** — the standing rule that the world is re-baked once.
- The Phase-0 harness becomes a **permanent regression gate** in `npm test`,
  running a fast subset (T1/T3 on a fixed sample) so a future change cannot
  silently un-fix a verified route.
- Keep the existing test suite green throughout; add pins for any waypoint the
  corpus establishes as required.

---

## 8. Scope — SETTLED (D-18, 2026-07-21)

**In scope:** the routing engine and the lane → bake → itinerary layer — the
Dijkstra router, the wind/current/polar physics, the grid and mask, the baker,
simplification and de-tacking, the `via` chains, and `buildItinerary`.

**Out of scope:** the PLAN-3 flow matrix. Which lanes exist, at what volume, in
which era, under which evidence class — all fixed inputs.

The asymmetry that decided it: every one of the 82 folded flow systems carries
bounds, an evidence class, sources, and adversarial verification (1,403
system-decades, seven cross-checks). The routing physics carries **none** of
that. One half of this system was built to the charter; the other was never held
to it. They are not equally weak, and a joint rebuild would spend most of its
effort on the sound half.

**Re-opening the matrix needs a trigger, not an urge.** If Phase 0 surfaces
matrix-level problems — a lane whose very existence the route evidence
contradicts — that is a reason, and it gets raised then as its own decision.

---

## 9. Corrections this investigation forces on existing queue items

- **D-03's diagnosis was half wrong.** I previously recorded the oddly-square
  routing as a 1°-grid artifact. It is an **8-neighbour connectivity** artifact.
  Raising resolution will not fix it; the option set in D-03 must be re-framed
  around connectivity and any-angle search, which is *cheaper* than the
  resolution rebuild it was weighing.
- **L-04 (prune the archive) is much cheaper than recorded.** CLAUDE.md says the
  baker depends on the 31 MB of `.bin` fields. It does not — those are
  precomputed outputs and nothing reads them. The baker imports four small
  `.mjs` modules. Porting *those* forward is a small job, and the 31 MB can go.
- **L-01 §1c is now unlocked** by this request, and R-11 is its execution.
- **F-06's ceiling is lower than assumed** — several residuals are connectivity
  artifacts that Phase 3 step 1 removes wholesale rather than per-offender.

---

## 10. Sequencing, and what NOT to do

**Do not start with the rebuild.** The order is:

1. **Phase 0** — the harness, against the current engine. Ships alone, useful alone.
2. **Phase 1** — R-11 and R-12 in parallel.
3. **Re-read the Phase-0 baseline** with the corpus in hand. *Decide then*
   whether a rebuild is warranted, and how deep (D-19, D-20).
4. Phases 2–5 as the evidence directs.

Step 3 is a real decision point, not a formality. It is entirely possible that
the harness shows the engine's *durations* are broadly defensible and only its
*geometry* is ugly — in which case the honest work is the connectivity fix plus
a declared-limitations page, not a physics rebuild. It is equally possible the
durations are badly wrong outside the North Atlantic, which would justify the
full Phase 2.

**Do not tune before the harness exists.** Tuning without holdout reporting is
how false precision enters.

**Do not let the corpus's shape become the world's shape.** The evidence is
densest for European long-haul shipping in 1750–1854. If the router is optimized
until those routes are perfect, the chart will have been quietly rebuilt around
the archive's bias — which is the exact failure the sensitization charter exists
to prevent. The stratified reporting in §6 is the guard, and it is not optional.

---

## 11. The execution breakdown — what gets built, in order

**Held. Nothing below starts without an explicit instruction.** This section
exists so that when the word comes, the first step needs no further design.

### CR-0 · F-41 — the verification harness  ·  *the only thing to do first*

The whole of the next step. Useful on its own whatever is decided later, and it
ships against the **current** engine deliberately.

**Files created**
| Path | What |
|---|---|
| `research/routes/corpus.json` | The evidence corpus, PLAN-7 §2.1 schema. Seeded by hand (below), filled by R-11. |
| `research/routes/_schema.md` | Schema doc, in the `data-src/_schema.md` idiom. |
| `research/tools/route-verify.mjs` | The runner. Two modes: verify the **baked** bundle (what the sim actually sails) and verify a **candidate parameter set** (re-routes a subset in-process, for F-45). |
| `research/routes.html` | The report page, `nav.js`-integrated, house style, in the `silences.html` idiom. |

**The corpus does not start from zero.** The T14 waystations sweep
(`research/port-flow-candidates-waystations-2026-07-20.md`) is already
adversarially-verified route evidence, and converts more or less directly into
T1 waypoint/corridor entries: Europe↔Canton ran **via Sunda, not Malacca**;
Indiamen watered at **Table Bay** from 1652; **St Helena** homeward for the
British but not the Dutch or Swedish; **no Madeira for the VOC**; the Manila
galleon watered at **Guam westbound only**; **Mozambique** for the Portuguese
Carreira. That is a real seed set with real provenance, and it should be the
harness's first fixture — it also means F-41 can be *tested* before R-11 lands.

**Acceptance criteria** — F-41 is done when:
1. It runs against `data/routes.json` and emits a per-basin, per-era, per-tier
   report with **coverage stated first**.
2. **No global score is emitted anywhere.** A reviewer must be unable to quote
   "the router scores X".
3. `unverified` is a distinct third state from pass/fail in both the data model
   and the rendered page, and never counts toward a pass rate (D-21).
4. It is deterministic: same bundle + same corpus ⇒ byte-identical report.
5. It reproduces the waystations seed set — i.e. the current engine **passes**
   the Sunda/Table Bay/Guam constraints, which we already know it should, since
   those are baked `via` chains. A harness that fails its own known-good
   fixtures is broken.
6. A baseline report is committed, so later phases have something to diff.

**Explicit non-goals for F-41:** no engine changes, no parameter changes, no
re-bake. It only measures.

### CR-1 · R-11 ‖ R-12 — the two research tasks, in parallel
No shared sources; each blocks a different half. Content in `research/TASKS.md`.
R-11 delivers the filled corpus + its declared non-coverage; R-12 delivers
`research/routing-methods.md` with a per-technique verdict including a
**determinism** column.

### CR-2 · The decision point  ·  **a real gate, not a formality**
Re-read F-41's baseline with the corpus in hand and answer **D-19** and **D-20**.

Three outcomes are genuinely possible, and they lead to very different projects:
- **Durations broadly defensible, geometry ugly** → the honest scope is the
  connectivity fix (F-43 option a) plus a declared-limitations page. No physics
  rebuild. *This is a legitimate result, not a failure to find work.*
- **Durations wrong in specific basins** → targeted physics work (F-42) in those
  basins only, under the D-21 rule.
- **Durations wrong broadly** → the full Phase 2, and a much bigger project.

### CR-3 · F-42 / F-43 / F-44 — as the evidence directs
Whatever else is decided, two fixes ship regardless because they are defects
independent of the evidence:
- **currents composed as vectors** with the boat's velocity through the water,
  not added as a scalar projection (`spd += cspd·cos θ`);
- **the 0.4 m/s speed floor** documented, bounded, and given an evidence class.

Each step is gated by F-41 on the **holdout** set: it ships only if it improves a
tier without degrading another, or fixes a declared defect while leaving the
tiers unchanged.

### CR-4 · F-45 — calibration
`research/routes/parameters.json` + a tuning changelog. Procedure in §6. Nothing
here runs before F-41 exists — tuning without holdout reporting is the exact
mechanism by which false precision enters.

### CR-5 · F-46 — re-bake, folded into C2
Never its own bake. Runs with F-01 (Porto/Rotterdam), F-03, F-06, F-07, F-10.
`datasetVersion` bump; saves discarded; the categorical harness tiers join
`npm test` per D-22.

---

## 12. State

| | |
|---|---|
| **Plan** | Scoped; D-18 + D-21 settled; D-19/D-20 deliberately open |
| **CR-0 · F-41 harness** | ✅ **BUILT 2026-07-21** — corpus + schema + runner + report page + baseline, 12 harness tests (6 of them negative controls), 84 tests green |
| **CR-1 · R-11 ‖ R-12** | ⏸️ not started |
| **CR-2 onward** | ⏸️ held — no engine change before the decision point |
| **Next action** | **R-11 ‖ R-12.** The harness is the instrument; it now needs real evidence to measure against. |

### What F-41 delivered, against its acceptance criteria (§11)

| # | Criterion | Result |
|---|---|---|
| 1 | Per-basin/era/tier report, coverage first | ✅ coverage leads both the CLI and the page |
| 2 | No global score anywhere | ✅ enforced by a test that rejects any top-level key matching `/score|passRate|overall|grade|accuracy/i` |
| 3 | `unverified` a distinct third state, never counted | ✅ modelled as the *absence* of a result, so it cannot leak into a tally; asserted by test |
| 4 | Deterministic — byte-identical reports | ✅ no timestamps; identified by bundle versions + a corpus digest; asserted by test |
| 5 | Reproduces the waystations seed set | ✅ 21/21 pass against the current bake |
| 6 | Baseline committed | ✅ `research/routes/baseline-2026-07-21.json` |

**Beyond the criteria: six negative controls.** A harness reporting "no failures"
is worthless until it has been shown capable of reporting a failure, so the tests
feed it corpora asserting things the bake demonstrably violates — a required
waypoint at Reykjavik, a forbidden call at Table Bay, a forbidden corridor at the
Cape, a 1–3 day London→Canton passage, a lane required to differ from itself, and
a stale lane id — and require it to catch each. It does.

**Two bugs the build surfaced, both fixed:** two corpus lane ids
(`gal-acapulco-manila`) did not exist, caught by validating ids before writing the
runner — precisely the silent-non-match the schema warns about; and the `--strict`
test initially passed *for the wrong reason*, because a crash also exits 1, so it
now requires a real report in stdout as well.
