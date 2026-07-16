# Feature-ideas ranking — feasibility × performance (2026-07-15)

Ranks the 14 sketches in `ideas.txt` against the codebase as of PLAN-3
completion, and records the **performance-slider architecture** (idea #2) that
now frames all of them. Passes 0–3 of the sequencing below have shipped
(0–1 on 2026-07-15, 2–3 on 2026-07-16).

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
| 6 | **#13 Easter eggs** — Aubrey vessels | A– | 0 | open — scheduled deterministic spawns outside the Poisson stream |
| 7 | **#2 Performance slider** | B | n/a | ✅ built — Low/Medium/High, Medium = pre-slider behaviour |
| 8 | **#8 Layers panel** — per-category flow toggles | B | ++ (mitigable) | ✅ built — per-basin toggles on a cached overlay canvas (5 Hz refresh) |
| 9 | **#5 Statistics panel** | B | + (save growth) | ✅ built — aggregates + tier-capped port histories |
| 10 | **#6 Tracker panel** — pinned vessels | B | + (capped) | built, **disabled until #11 persistence** (world API + tests live; UI greyed) |
| 11 | **#1 Regional views** | B | + | ✅ built — four preset plates (world / Europe & Med / Caribbean / East Indies) |
| 12 | **#4 Documentation page** | A tech, big content | 0 | ✅ built — `research/about.html` (sources, evidence classes, divergences, legend docs) |
| 13 | **#12 Ship flows** | B→C | + → +++ | open — fishing/patrol loops are Pass 4.5, research-gated on TASKS.md T4; spawn-time route variants ride Pass 4; chases break fate-at-spawn (defer) |
| 14 | **#11 Ship generation** | C | +++ | decomposed: ✅ captains + longer name pools built (own RNG sub-stream); unique-active-names + retirement are Pass 3.5, research-gated on TASKS.md T5 (no fleet model needed); persistence/capture still need one (defer; world-level opt-in) |

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

**Pass 3.5 — Unique active names + name retirement (#11's middle pieces).**
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

**Pass 4 — Special voyages: easter eggs (#13).** Builds the new machinery
both this pass and 4.5 ride on: a second spawn channel outside the Poisson
lane-weighted stream — fixed sim-date **scripted spawns with custom
itineraries** (Aubrey's commissions at historically-appropriate dates), keyed
to sim-time crossings for determinism, plus spawn-time route variants
(seasonal/wartime detours from the vessel's own RNG). Pass 1's tracker pays
off: pin the *Surprise*.

**Pass 4.5 — Ambient flows (#12's easy half).** Split out of Pass 4
(2026-07-16): the scripted-voyage channel is the shared machinery, but
ambient flows are **research-gated** — they represent real, sourced movement
patterns, not flavour, so they wait on `research/TASKS.md` **T4** (the
deep-research catalog of fisheries-as-grounds, naval patterns, scheduled
services, and local metabolisms, each with an evidence class and a sim-shape
verdict). Build after T4 lands: recurring local circuits (fishing, patrols)
on the pass-4 channel; may touch the bake pipeline for short local circuits —
read `pipeline/README.md` first. Gates to the High performance tier. Patterns
that answer a gestured silence (the herring buss fleet, Banks cod) update the
silences register when they ship.

**Pass 5 — deferred sim redesign: persistence / name retirement / capture
(#11 hard) + chases (#12 hard).** Ship–ship interaction breaks
fate-rolled-at-spawn — a real architecture change needing its own design doc
(PLAN-5 material), a `datasetVersion` bump, and a save reset. Nothing above
depends on it; it must never block the rest.
