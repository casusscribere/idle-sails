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

## Current state (as of 2026-07-12)

- **Phase: Milestones 1–3 complete + a working parchment display.** The three
  PLAN §0 defaults and the sober slave-trade treatment are user-confirmed.
- **Milestone 3 (headless world):** `app/world.js` — seeded, deterministic,
  DOM-free. Procedurally generates plausible vessels (PLAN §4), rolls each
  voyage's fate at spawn, and advances them along the baked polylines. Spawns and
  fates are driven off sim-time so big-step fast-forward == many small steps
  (offline accrual). `test/world.test.mjs` (run `npm test`) covers determinism,
  granularity-independence, plausibility + the Middle-Passage invariant, bounded
  population, and calendar cycling — **7 passing**.
- **Display layer (spans M4/M5/M7):** `app/{render,ui,main}.js` + `index.html` +
  `style.css` — a canvas **parchment sea chart** (blank-sea portolan style: rhumb
  web, wind roses, engraved coastlines, allegiance-tinted ship glyphs), a speed
  instrument, click→vessel **ledger** (the five required fields + itinerary +
  sober Middle-Passage note), ambient counters, and a ship's-log ticker. Verified
  rendering via headless Chromium screenshot.
- **Deploy:** `.github/workflows/pages.yml` publishes `app/` on push to `main`
  (needs Settings→Pages→Source→"GitHub Actions", one-time). Static; serve over
  HTTP, not `file://`. `#seed=<n>` loads a specific world.
- **Renderer choice (PLAN §10.4 / M4): settled on canvas** — no MapLibre.
- Next: **Milestone 6** (persistence + offline accrual via `app/persist.js`) then
  **M7** polish. `world.js` already fast-forwards deterministically, so persist is
  mostly wiring localStorage + a catch-up cap.
- **Milestone 1 (data):** `data-src/` holds the six datasets + `ports.json` +
  `_schema.md`. `pipeline/build-data.mjs` validates cross-refs, enforces the
  Middle-Passage invariant, and runs a ~2000-vessel plausibility self-check
  (0 contradictions) → `app/data/datasets.json` (32 KB).
- **Milestone 2 (routes):** `pipeline/bake-routes.mjs` reuses the archived engine
  to bake **208 route polylines** → `app/data/routes.json` (78 KB). See
  `pipeline/README.md` for the three engine corrections it applies (Arctic ice
  cap, Panama/Suez seals, Drake-Passage cap) — **read that before touching the
  baker.** The archived `.bin` fields are left untouched.
- **Git:** branch `main`; remote **`https://github.com/casusscribere/idle-sails`
  (private)**, token-free HTTPS. The M1/M2 work (`data-src/`, `pipeline/`,
  `app/data/`) is **uncommitted** as of this writing.
- Still no `app/*.js` (world/render/ui/persist) — those are Milestone 3+.

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
