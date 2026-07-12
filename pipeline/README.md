# `pipeline/` — offline build (Milestones 1 & 2)

Two Node scripts turn the hand-authored `data-src/` datasets and the archived
routing engine into the small static JSON the app ships. Both run **offline**,
once, and require no network. Node ≥ 18 (developed on v25).

```
node pipeline/build-data.mjs     # data-src/*.json  → app/data/datasets.json (+ land.geojson)
node pipeline/bake-routes.mjs    # data-src + archived fields → app/data/routes.json
```

Neither the 31 MB of archived binary fields nor `data-src/` is shipped at
runtime — only `app/data/{datasets.json, routes.json, land.geojson}`.

## `build-data.mjs` — validate + bundle (Milestone 1)

Loads the six `data-src` datasets, then:

- **Cross-reference validation** — every port/power/ship-type/cargo/route/war id
  reference resolves; eras fall inside 1700–1815; tonnages satisfy min≤mode≤max;
  each `ship-types.routeClass` is one of the four baked classes.
- **Middle-Passage invariant (PLAN §10.5)** — `enslaved-people` appears only on
  lanes flagged `middlePassage`, and such lanes carry *only* that cargo.
- **Baked-field availability** — for every lane, asserts the archived field
  `{dest}_{routeClass}_{season}.bin` exists for all 4 seasons (ties M1 to M2).
- **Plausibility self-check** — generates ~2000 vessels via a seeded miniature of
  the PLAN §4 pipeline and asserts zero contradictions (wrong-era type, cargo off
  its route, inactive flag, out-of-range tonnage, etc.).

Emits `app/data/datasets.json` (versioned) and copies the coastline.

## `bake-routes.mjs` — bake route polylines (Milestone 2)

Reuses the archived least-time engine (`archive/isochrone-v1/pipeline/`) directly:
for each lane it runs Dijkstra with the **destination** port as source, then
reconstructs the exact origin→destination path from the parent pointers (`prev`),
simplifies it (land-aware Douglas–Peucker), and records sailing hours =
`time[originCell]`. Output: `app/data/routes.json` (208 polylines, ~78 KB).

### Why it recomputes fields instead of reading the shipped `.bin` files

The archived `docs/data/fields/*.bin` model a climatology with **no sea ice and a
1° coastline**, which produces three artifacts on long routes. The baker fixes
all three by adjusting the *routing mask* before running Dijkstra — the archived
fields themselves are left untouched:

1. **North-Pole shortcut.** With an ice-free Arctic, the least-time path from
   Europe to East Asia crosses the North Pole (a shorter great circle) — a grid
   singularity the walker can't traverse. Fix: **ice cap** at `lat > 66°` (Arctic
   Circle). Europe↔Asia now rounds the Cape of Good Hope, as it must.
2. **Panama / Suez leaks.** At 1° the ~50–80 km isthmuses fall between cells,
   leaving a false sea passage (Canton→London tried to cut Pacific→Caribbean
   through Panama). Fix: **seal** both as land (`ISTHMUS_CLOSE`). Safe — Idle
   Sails has no Pacific or Red Sea ports.
3. **Cape Horn / Drake Passage detour.** In the summer SW monsoon the model finds
   it "faster" to reach Canton the wrong way round Cape Horn (a 250-day Southern
   Ocean run). Fix: **southern cap** at `lat < -50°`, closing Drake Passage. Every
   real leg here (Good Hope 34.5°S, the Brouwer easting ~35–45°S) stays north of it.

A land-crossing sanity pass then asserts no simplified segment cuts across a
continent (using a coastline-only mask, ice caps excluded so genuine high-latitude
open-ocean legs aren't misread as land). The build fails loudly if any does.

### Inputs it depends on (present, but gitignored in the archive)

`archive/isochrone-v1/pipeline/build/{grid.json, calibration.json}` — the 1° ocean
mask and the fitted per-class speed scalars. They exist on disk; if a fresh clone
lacks them, regenerate with the archive's `node build-grid.mjs` and
`node calibrate.mjs` (see `archive/isochrone-v1/SOURCES.md`).
