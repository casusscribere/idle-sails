# Feature-ideas ranking — feasibility × performance (2026-07-15)

Ranks the 14 sketches in `ideas.txt` against the codebase as of PLAN-3
completion, and records the **performance-slider architecture** (idea #2) that
now frames all of them. Passes 0–3 of the sequencing below have shipped
(0–1 on 2026-07-15, 2–3 on 2026-07-16). The **interleaved queue** at the end
of this document merges the feature passes with the research phases
(`research/TASKS.md`) and the pending adoption decisions into one recommended
order — it is the live cross-queue view, and every edit to any planning
document must keep it current (see the directive there).

## The constraint that shapes everything

The sim is seed-deterministic three ways: per-vessel fate rolled entirely at
spawn (`world.js` `generateVessel`), spawns keyed to absolute sim-time, and the
spawn-RNG word held as explicit state. Same seed + sim-time ⇒ identical world at
any tick granularity — the invariant behind offline accrual. So features divide
into three layers, and the performance slider may only ever touch two of them:

1. **Sim layer** — what the world computes (spawns, fates, movement,
   interactions). NEVER varies with the slider. Future heavyweights that change
   it (vessel persistence, capture, chases) are world-level opt-ins that bump
   `datasetVersion`, not slider stops.
2. **Observation layer** — what the world *records* (log length, wreck linger,
   stats, histories). Safe to tune freely; the cost is save-payload growth.
   Exposed as `createWorld({tuning})` / live `world.tuning`.
3. **Render layer** — what is drawn and how richly (ship density, wakes,
   overlay cadence). Completely free. Ship density is **deterministic
   render-thinning** (`world.snapshot({density})`, stable per-id hash): the
   same world at every setting, only the visible fraction changes — and the
   per-frame `positionOf` hot path is skipped for the hidden ships.

`test/settings.test.mjs` holds the line: same seed, any tuning ⇒ identical
fingerprints.

## Ranking

Feasibility: **A** trivial / scaffolding exists · **B** moderate, contained ·
**C** hard, restructures the sim. Perf cost when ON: **0 / + / ++ / +++**.

| Rank | Idea | Feas. | Perf | Status / slider role |
|---|---|---|---|---|
| 1 | **#14 UI tweaks** — port click priority | A | 0 | ✅ built — always on |
| 2 | **#9 Legend** | A | 0 | ✅ built — menu panel |
| 3 | **#3 Debug mode** — export run data | A | 0 | ✅ built — menu action |
| 4 | **#7 Events log** — wars + losses | A | 0 | ✅ built — menu panel |
| 5 | **#10 UI rework** — menu + toggleable boxes | A– | 0 | ✅ built (in the cartouche menu, not a new bar) |
| 6 | **#13 Easter eggs** — Aubrey vessels | A– | 0 | open — **Pass 6** (moved after the movement patterns 2026-07-16, so commissions can carry convoy/prize/chase events) |
| 7 | **#2 Performance slider** | B | n/a | ✅ built — Low/Medium/High, Medium = pre-slider behaviour |
| 8 | **#8 Layers panel** — per-category flow toggles | B | ++ (mitigable) | ✅ built — per-basin toggles on a cached overlay canvas (5 Hz refresh) |
| 9 | **#5 Statistics panel** | B | + (save growth) | ✅ built — aggregates + tier-capped port histories |
| 10 | **#6 Tracker panel** — pinned vessels | B | + (capped) | built, **disabled until #11 persistence** (world API + tests live; UI greyed) |
| 11 | **#1 Regional views** | B | + | ✅ built — four preset plates (world / Europe & Med / Caribbean / East Indies) |
| 12 | **#4 Documentation page** | A tech, big content | 0 | ✅ built — `research/about.html` (sources, evidence classes, divergences, legend docs) |
| 13 | **#12 Ship flows** | B→C | + → +++ | open — fishing/patrol loops and spawn-time route variants are Pass 4, research-gated on TASKS.md T4; chases break fate-at-spawn (defer) |
| 14 | **#11 Ship generation** | C | +++ | decomposed: ✅ captains + longer name pools built (own RNG sub-stream); ✅ unique-active-names + retirement shipped (Pass 3.5, 2026-07-16); persistence/capture still need a fleet model (defer; world-level opt-in) |

## Tier table (auto defaults)

| Knob | Low | Medium (default = pre-slider) | High |
|---|---|---|---|
| Ships drawn | ~50 % (stable hash thin) | 100 % | 100 % |
| Wakes | off | 14 pts | 14 pts |
| Event-log cap | 50 | 200 | 500 |
| Wreck linger | 90 d | 1 sim-yr | 1 sim-yr |
| (future) stats depth / pins / layers | minimal | bounded | deep |

Settings live in `settings.js` under their own localStorage key
(`idle-sails-settings`) — a device preference, deliberately outside the save,
surviving every `datasetVersion` reset.

## Sequencing — passes in best-practices order

Principles: infrastructure before consumers (recording seams before the panels
that read them; the viewport abstraction before more screen-space caches);
group by subsystem so each pattern is designed once; sim-layer risk last.

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
layers panel (#8).** Regional views first, exactly as planned: `render.js`
bounds are now mutable (`setRegion`), with four preset plates exported as
`REGIONS` — world (data-fit crop), Europe & the Mediterranean, the Caribbean,
the East Indies & China — chosen by a "Chart view" radiogroup in the menu and
persisted as `settings.region`. Regional plates contain on both axes, keep
the readability floor, and rebuild base/labels/overlay through the new
projection (wakes drop rather than streak); the graticule tightens 15°→5° on
regional crops. Then the layers panel: the routes overlay moved to a cached
offscreen canvas refreshed on the existing 5 Hz HUD throttle (per frame it
costs one blit), and the overlay boolean gained per-BASIN toggles — the six
flow-matrix basins + "Naval & other voyages" — as a menu-sub tree under the
master toggle (children disable while it's off, the legend-tree idiom).
`build-data.mjs` now carries `basin` on each folded flow system (additive,
datasetVersion stays 4); main.js votes each lane's basin by folded share.
Brightness normalizes within the visible set, so an isolated basin reads its
own hierarchy. Off basins persist sparsely (`settings.layers`, absent = on).
Verified headless (Playwright): plate switching, filter isolation, sparse
persistence across reload, zero console errors; port-lifecycle and era-name
behaviour carry through on every plate. Tests 41 green
(`test/regions.test.mjs` pins each plate to the ports it exists for and the
basin coverage of the fold; settings round-trip extended).

**Pass 3 — ✅ shipped 2026-07-16. Vocabulary: captains + longer name pools
(#11's easy pieces) + the docs page (#4).** Every vessel now sails under a
named shipmaster from `hashSeed('captain', seed, id)` — her OWN sub-stream,
exactly as planned, so no draw was inserted into the vessel RNG sequence:
name-stripped fingerprints verified IDENTICAL against pre-pass HEAD on a
fixed seed. `names.captains` gives all 27 naming cultures a pool
(build-data-validated): European cultures compose given+surname; the title
travels IN the name where that's the historical usage (Nakhoda … for the
Indian-Ocean shipowner-master, … Reis for Ottoman masters with Greek
kapetans alongside, Daeng … at Makassar; China/Ryukyu surname-first). The
ledger labels the role (Captain for naval, Master for merchant); wreck
records keep her master; a pre-captain save backfills the exact same master
on restore (pure function of seed+id+power). Ship-name pools extended
~1.5–2× across all themes (name strings shift per seed; fates/counters
don't). #4: `research/about.html` — "How this chart is made" — sources +
interpretation, evidence classes, port selection, movement/calibration,
legend documentation (glyphs, flags, master titles), sober treatments, and
a declared divergences list; wired into nav.js and the research hub.
`#debug=1` now exposes `window.__is` for headless verification. 46 tests
green (`test/captains.test.mjs`: pool-swap sim-inertness, granularity
independence, restore backfill, wreck records).

**Pass 3.5 — ✅ shipped 2026-07-16. Unique active names + name retirement
(#11's middle pieces).** Built exactly as designed below, with one refinement:
candidate #0 still comes from the vessel stream (burning the draws makeName
always burned), so an UNBLOCKED name is byte-identical to the pre-pass world —
no reshuffle at all; only blocked names redraw, from `hashSeed('name', seed,
id)`, K=8 then accept-the-duplicate. `state.nameLedger` (name → blocked-until)
is written at spawn AFTER every reschedule-return, pruned lazily, serialized,
and backfilled from surviving vessels+archive on pre-3.5 saves (presence
checked on the RAW save object). Measured: live-duplicate samples 97% → ~1.6%;
refractory violations ~0.1% of spawns (the designed accept-the-duplicate
tail). Verified fate-inert by the pass-3 method: name-stripped fingerprints
IDENTICAL vs pre-pass HEAD code on seeds 42/7/23 over 20 mixed-granularity
years. 52 tests green (`test/names.test.mjs`: rarity, refractory, granularity
independence, save round-trip, old-save backfill, pool-swap fate-inertness).
Original design notes (all held):
Feasibility established 2026-07-16 (it does NOT need Pass 5's fleet model):
because fates are pre-rolled at spawn, "is this name active at sim-time t"
derives from already-generated vessels, and a spawn-ordered ledger keeps it
granularity-independent. Design: sim-layer `nameBlockedUntil` map written at
each spawn (`max(existing, lost ? fate.atSec + R : voyageEnd)` — the active
window and a refractory period R after losses unify in one timestamp; R≈5
sim-years, arrivals release immediately); name drawn from a dedicated
`hashSeed('name', seed, id)` sub-stream with up to K redraws while blocked,
then accept-the-duplicate (historically defensible — real fleets ran several
*Rosários* at once); ledger pruned lazily, serialized, backfilled from
surviving vessels on old saves. Never source retirement from wrecks
(`wreckLingerDays` is a tuning knob — the sim must not read it). One-time
name reshuffle per seed; fates/counters untouched (verify with the pass-3
name-stripped-fingerprint method). **Research-gated on `research/TASKS.md`
T5**: measured peak concurrency exceeds several pools outright (Portugal
merchant 217% of pool at peak, Hansa 170%, Mughal 133%, Ottoman 120%;
a live duplicate exists in ~96% of sampled moments today) — pools must be
expanded until peak pressure sits under **70%** per (culture, role) pool
before uniqueness reads as real rather than as a near-deterministic tail of
leftover names.

**Pass 4 — Movement patterns: the scripted-spawn channel + ambient flows
(#12's easy half).** *(Reorganized 2026-07-16: the channel was formerly
bundled with the easter eggs and ambient flows were "Pass 4.5"; the easter
eggs moved to Pass 6 so Aubrey's commissions can use the full movement
vocabulary, and 4.5 is absorbed here.)* Builds the second spawn channel
outside the Poisson lane-weighted stream — fixed sim-date **scripted spawns
with custom itineraries**, keyed to sim-time crossings for determinism —
plus spawn-time route variants (seasonal/wartime detours from the vessel's
own RNG), then the ambient flows riding that channel. Ambient flows are
**research-gated** — they represent real, sourced movement patterns, not
flavour, so they wait on `research/TASKS.md` **T4** (the deep-research
catalog of fisheries-as-grounds, naval patterns, scheduled services, and
local metabolisms, each with an evidence class and a sim-shape verdict).
Build after T4 lands: recurring local circuits (fishing, patrols) on the
channel; may touch the bake pipeline for short local circuits — read
`pipeline/README.md` first. Gates to the High performance tier. Patterns
that answer a gestured silence (the herring buss fleet, Banks cod) update
the silences register when they ship.

**Pass 5 — deferred sim redesign: persistence / name retirement / capture
(#11 hard) + chases (#12 hard).** Ship–ship interaction breaks
fate-rolled-at-spawn — a real architecture change needing its own design doc
(PLAN-5 material), a `datasetVersion` bump, and a save reset. Nothing above
depends on it; it must never block the rest — only Pass 6 below deliberately
waits for it.

**Pass 6 — Aubrey easter eggs (#13).** *(Moved here from the old Pass 4,
2026-07-16 — user decision: build the content after ALL the movement
patterns exist.)* Aubrey's commissions as scripted spawns on the Pass-4
channel at historically-appropriate dates — deliberately last, so each
itinerary can express the full vocabulary: convoy and escort legs
(`PLAN-convoys.md`), ambient patterns as the sea's backdrop, and Pass-5
prize-takings and chases at book-appropriate moments (the *Sophie*'s prize,
the *Boadicea*'s Mauritius campaign). **Research-gated on `research/TASKS.md`
T6**, which catalogs the events per commission. A coherence bonus of the
late slot: the tracker panel (disabled until Pass 5's vessel persistence)
is live by now — pin the *Surprise* and follow her properly.

## Outside the ladder

- **New chart views** (planned 2026-07-16 — ✅ **built the same day**: both
  plates in `render.js` REGIONS, menu rows auto-generated, containment pinned
  in `test/regions.test.mjs`, verified headless — plate switching, settings
  persistence across reload, zero console errors) — two additions to the
  Pass-2 regional plates (`render.js` `REGIONS`; render-layer only, no
  research gate, buildable anytime):
  - **`arabia-india` — "Arabia & India".** Bounds ≈ lon 36→92, lat −2→31:
    the Red Sea mouth and the Arabian Sea through the Bay of Bengal. Covers
    seven roster ports — **Mocha**, Muscat, Surat, Bombay (era-named Goa
    pre-1661), Madras (Masulipatnam pre-1639), Tranquebar, and **Calcutta
    (era-named Hugli pre-1690)** — so the monsoon dhow lanes, the pepper and
    coffee trades, and the Europe–India arrivals read on one plate. The
    north/west margins deliberately leave headroom for PLAN-4's E2
    (Basra + Bandar Abbas, to ~30.5 N in the Gulf) and E6 (Jeddah, ~39 E in
    the Red Sea) so adoption needs no re-crop; E5 Port Louis (~20 S) is
    deliberately OUT of frame — the Mascarenes belong to the world plate
    (stretching to −22 S would flatten everything else).
  - **`na-northeast` — "Newfoundland to the Chesapeake".** Bounds ≈ lon
    −82→−49, lat 34.5→52.5: the North American northeast from the
    Newfoundland Banks down through the Chesapeake capes. Covers five roster
    ports — Louisbourg (era-named St John's outside 1713–58, carrying the
    Banks cod fishery all era), Boston, New York, Philadelphia, Chesapeake.
    The eastern margin reaches past −50 so the Grand Banks sea room is in
    frame — the plate is ready to show grounds-loitering fishery traffic if
    Pass 4 (T4) ships it.
  - **Build notes:** each plate is one `REGIONS` entry — `setRegion`,
    containment on both axes, the 5° regional graticule, label declutter,
    era names, and `settings.region` boot validation all come free by
    construction. Verify the menu "Chart view" radiogroup renders from
    `REGIONS` (if its rows are hand-written in `index.html`, add the two
    rows). Extend `test/regions.test.mjs` to pin each new plate to the port
    lists above (and keep the pins in sync if PLAN-4/PLAN-6 adoption later
    adds ports inside these frames). Names/bounds are recommendations —
    tune the margins against the readability floor at build time.
- **Convoys** (`PLAN-convoys.md`, drafted 2026-07-16) — a sim-layer feature
  that does NOT break fate-at-spawn, so it needs no pass slot: buildable
  whenever, independent of everything above. Its rules ship `asserted`;
  research task **T9** (`research/TASKS.md`, Phase RB) refines the rates and
  windows without gating the build — if Phase RB runs first, build convoys
  after it and inherit the evidence-classed numbers for free.
- **Steam layer** (queued 2026-07-16 with the PLAN-6 D1 decision) — v1 of
  the era extension is a **sail chart, declared** (steam is a
  silences-register entry + a declared-divergences paragraph), and a steam
  layer is queued as a planned future feature: the P&O/Cunard-era mail and
  packet services as their own movement class (great-circle legs, coaling
  calls — the wind engine cannot produce a steamer's track). Research-gated
  on **T11** (`research/TASKS.md`, Phase RD); needs its own plan when
  taken up. Until then the declared boundary stands.
- **Tweaks** (`ideas.txt`'s sibling `tweaks.txt`) — small render/UX
  adjustments, no research, no pass machinery; fold into whatever pass is
  in flight. ✅ Dormant-port greying threshold extended 2026-07-16: the
  window is now DISPLAY policy in main.js (3 sim-years, up from the world
  default of 1 — `world.activePortsSince` keeps its contract); sparse-but-
  real flows read as quiet, not abandoned. Queue currently empty.

## The interleaved queue — recommended order (live)

> **Maintenance directive.** This queue is the merge of the feature passes
> above, the research phases in `research/TASKS.md`, and the pending adoption
> decisions (`PLAN-4-expansion.md` §3, `PLAN-6-era-1850.md` §6). **Whenever
> any planning document, the research queue, or an adoption decision changes,
> update this section in the same edit** — it must never lag its sources.
> Mirror directives sit in `planning/README.md` (conventions),
> `research/TASKS.md` (header), and CLAUDE.md/AGENTS.md (key documents).

Tags: **[F]** feature build · **[R]** research · **[D]** user decision ·
**[B]** adopted-plan build. Hard gates are marked; everything else is
recommended order, not law.

1. ~~**[F] New chart views + tweaks**~~ — **✅ DONE 2026-07-16**: the
   `arabia-india` and `na-northeast` plates shipped (menu auto-rows, test
   pins, headless-verified); greying window extended to 3 sim-years as
   display policy in main.js.
2. ~~**[D] Adoption calls**~~ — **✅ DECIDED 2026-07-16**: PLAN-4 + PLAN-6
   adopted together; all five Tier-1 candidates; all five new ports; steam =
   declared boundary + queued feature (T11); reset ramp = a DESIGNED
   epilogue decade (new X-S1 design work); coerced flows confirmed under the
   sober pattern; grounds-node pattern approved with the Arctic fishery
   staying registered; placements by precedent. Ledgers in each plan's
   header.
3. ~~**[R] T5 — name-pool expansion**~~ — **✅ DONE 2026-07-16** (all pools
   under the 70% gate, worst 64%; note in
   `research/name-pressure-2026-07-16.md`). **Standing re-gate:** re-run
   `name-pressure.mjs` at X-S2 (310-year cycle, new powers) and before
   pass 3.5 ships.
4. ~~**[F] Pass 3.5 — unique active names + retirement**~~ — **✅ SHIPPED
   2026-07-16** (see the pass ledger above: nameLedger in world.js,
   fate-inertness proven vs HEAD, 52 tests). The step-3 re-gate note
   stands: re-run `name-pressure.mjs` when X-S lands.
5. **[R] Phase RB as ONE campaign — T4 + T8 + ~~T9~~ + T10 (X-R1)**, plus
   PLAN-4 E-R1 verification. The big source pass; the whole point of the
   phase grouping is that it runs once. Includes X-R2's charter sign-off
   texts staged for user review. **IN PROGRESS** (`research/rb-campaign.md`):
   chunks 1–3 done 2026-07-16 — **T9 complete** (+ T4's naval strand);
   T4's fisheries strand + **E3 verification passed** + two T8 items;
   T4's scheduled-services strand + **E6 verification passed** + T10's
   packet lines (§§1–3 of `ambient-flows.md` landed; one refuted claim
   caught — India mail 1815). T4 is 3/4 strands done — chunk 4 (local
   metabolisms) completes it and opens Pass 4's gate.
6. **[F] Convoys** (`PLAN-convoys.md`). Buildable any time after step 1,
   but cheapest here — it inherits T9's evidence-classed rates for free.
7. **[F] Pass 4 — the scripted-spawn channel + ambient flows.** HARD GATE:
   T4 (step 5). May touch the baker (`pipeline/README.md` first) — share
   the bake session with step 8 where possible.
8. **[B] PLAN-4 E-S + PLAN-6 X-S builds** — fold, bake, surface; one
    combined bake beats several. X-S1 now includes **designing the epilogue
    decade** (D3: the 1850→1860 ramp is a designed wind-down, not the
    stretched blend) before the clock constants are re-pinned.
9. **[R] Phase RC — the per-port sweep (T1+T2+T3, one port at a time).**
    HARD GATE: the roster and era span must be FINAL (steps 2 and 8 done
    or declined) — otherwise the sweep runs twice.
10. **[R] T7 — vessel lifecycle & prize practice** (Phase RD) + drafting
    **PLAN-5** from it.
11. **[F] Pass 5 — persistence / capture / chases.** HARD GATE: PLAN-5
    adopted; `datasetVersion` bump + save reset. Must never block anything
    above it — Pass 6 below waits for it by design.
12. **[R] T6 — Aubrey canon** (Phase RA). Deliberately this late: per
    commission, the catalog also records convoy/escort legs, historical
    prize-takings and engagements, and chase episodes, so Pass 6 can
    express them through the convoy and Pass-5 mechanics (and the E5 /
    Port Louis question for the *Boadicea* itinerary is long decided by
    now). Can run earlier at the cost of a second look once the mechanics
    exist.
13. **[F] Pass 6 — Aubrey easter eggs.** HARD GATES: T6 + the Pass-4
    channel. Deliberately after convoys and Pass 5 (user decision
    2026-07-16) so the commissions sail with the full movement vocabulary.

The only hard edges are the marked gates (T5→3.5 ✅, T4→4, roster-final→RC,
PLAN-5→5, and {T6, Pass 4, Pass 5}→6). With steps 1–4 done, the front of the
queue is **step 5 (the Phase-RB campaign: T4+T8+T9+T10 + E-R1)**, then
convoys (step 6) inheriting T9's rates. Convoys still floats anywhere at the
cost of `asserted` numbers until T9 lands; T6 may run early, but the Pass-6
build should not.
