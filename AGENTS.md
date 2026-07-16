# AGENTS.md — Idle Sails

Orientation for a fresh session. Read this first, then `PLAN.md`.

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

> This file is a mirror of **`CLAUDE.md`** for non-Claude agents — edit both
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
   The charter (full form in `PLAN-3-flows.md` §1):
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

## Current state (as of 2026-07-13)

- **Phase: PLAN.md M1–M6 complete (M7 mostly) + PLAN-2 Phase A, Phase C, and
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
  `feature-ideas/ideas.txt` ranked in `feature-ideas/RANKING.md` (feasibility ×
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
  per port/name/ownership combination, charter register).
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
  (`feature-ideas/RANKING.md` Pass 2 — both `render.js` work, sim untouched).
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
CLAUDE.md            this file
PLAN.md              full rebuild design — the source of truth
README.md            short project intro + target layout
.gitignore
archive/isochrone-v1/   the previous project (see its ARCHIVE-NOTE.md)
```

## Key documents

- **`PLAN.md`** — the design: assumed decisions (§0), reused assets (§1),
  architecture (§2), the six historical datasets (§3), the procedural generator
  (§4), the sim loop + idle mechanics (§5), offline route baking (§6), rendering
  & UI (§7), tech/layout (§8), milestones (§9), open questions (§10).
- **`PLAN-2-flowing-era.md`** — the flowing-clock design (built: Step 1–2,
  Phase A, Phase C): a decade-weighted 1550–1815 sim looping via a 5-year
  reset, plus the minor-ports diversity layer (§5). Its Phase B and §7 are
  re-scoped by PLAN-3.
- **`PLAN-4-expansion.md`** — **drafted 2026-07-14, awaiting adoption**: the
  wider-world expansion from the deep-research sweep
  (`research/port-flow-candidates-2026-07.md`) — five Tier-1 counted-series
  candidates (Montevideo/Río de la Plata, Basra+Bandar Abbas, a whaling
  grounds node, Hudson Bay, Port Louis/Mascarenes), Tier-2 (Jeddah, caravane
  maritime, Ragusa, Callao, Mozambique I.), silences-register actions, and
  per-candidate E-R1→E-S2 phases riding PLAN-3's machinery unchanged. Four
  adoption decisions flagged in its §3.
- **`PLAN-3-flows.md`** — **the completed architecture** (adopted 2026-07-13,
  complete): replaces
  rankings→weights with an evidence-classed **trade-system flow matrix**
  (counted/proxied/reconstructed/asserted; per-basin assembly; a silences
  register; port prominence as an *output*). Carries the sensitization
  charter (§1) and the phase/decision ledger (§3): R1 rankings fixes → R2
  schema + Baltic proof → R3 basin authoring → S1 sim swap → S2 bake → S3
  surfacing.
- **`archive/isochrone-v1/ARCHIVE-NOTE.md`** — what the old project was and
  exactly which of its assets the rebuild reuses.
- **`archive/isochrone-v1/SOURCES.md`** — historical sourcing + calibration
  report grounding the datasets.

## Reused from the archive (do not delete without porting forward)

- `archive/isochrone-v1/pipeline/ports.json` — 15 georeferenced historical ports.
- `archive/isochrone-v1/docs/data/fields/*.bin` + `pipeline/router.mjs` — the
  wind/current/polar least-time engine. Run **once, offline** to bake curved
  route polylines (`PLAN.md §6`); the 31 MB fields are **not** shipped at runtime.
- `archive/isochrone-v1/docs/app.js → routeFrom()` — downhill route-walk to port,
  to be ported into the offline route baker.
- `archive/isochrone-v1/docs/assets/land.geojson` — coastline for the map.

## Decisions assumed (chosen while the user was away — NOT yet confirmed)

See `PLAN.md §0`. Flag these for confirmation before deep work depends on them:

1. **Movement:** bake route polylines offline from the archived fields; ship only
   the polylines (not the 31 MB fields).
2. **Persistence:** persist to `localStorage` with offline-accrual fast-forward.
3. **Era scope:** lock to ~1700–1815 (matches the calibrated data).

Still open (`PLAN.md §10`): renderer choice (canvas — recommended — vs. MapLibre,
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
