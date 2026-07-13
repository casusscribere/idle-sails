# CLAUDE.md — Idle Sails

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
  draw, systems + lane shares; `research/flows/` holds the Baltic proof basin
  — 13 systems × 27 decades, Sound Toll cross-check ✓ — and the silences
  register). **Next: PLAN-3 Phase R3** (basin authoring: Atlantic,
  Mediterranean, Indian Ocean, Bengal–SE Asia, East Asia), then S1 (sim swap),
  S2 (bake), S3 (surfacing). Each phase pauses on its decision list (PLAN-3 §3).

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
- **`PLAN-3-flows.md`** — **the active plan** (adopted 2026-07-13): replaces
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
