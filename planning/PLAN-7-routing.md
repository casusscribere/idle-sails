# PLAN-7 — The routing rebuild and its verification suite

**Status: 📋 DRAFTED 2026-07-21, unadopted.** Supersedes `L-02` (the locked
"routing/wind-chart engine rebuild") and unlocks `L-01 §1c` (the refinement
track's "find, NOT generate, real route data and compare"), which the user
opened by requesting this plan.

**Scope decision pending — D-18.** This plan covers the **routing engine and the
lane → bake → itinerary layer**. It treats the PLAN-3 flow matrix's *outputs*
(which lanes exist, at what volume, in which era) as fixed inputs. See §8.

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

## 8. Scope: what "trade flows" means here — D-18

The brief says "routing/trade flows system". Two readings:

- **(a) Routing + the lane/bake/itinerary layer** — how a flow becomes a track
  on the chart. The flow matrix's outputs (which lanes, what volume, which era)
  stay fixed. **This is what the plan above assumes**, and it is the
  recommendation: the flow matrix is PLAN-3's completed, evidence-classed,
  charter-central work, and it is *not* the weak part. The routing physics is.
- **(b) That, plus re-opening the flow matrix itself.** A much larger
  undertaking that would re-derive volumes and lane structure. It would need its
  own plan and a very specific reason.

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
