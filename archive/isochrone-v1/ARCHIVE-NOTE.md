# Archived — Isochronic Passage Chart (v1)

Archived 2026-07-08. This was the previous incarnation of the project: a static
isochronic *travel-time map* (pick port + vessel + season → isochrone bands and
best-fit routes). It reached Phases 1–4 (see `STATUS.md`). Superseded by the
**age-of-sail idler** rebuild (see `/PLAN.md` at repo root).

## Reusable assets for the rebuild

The idler's movement model is built on top of this pipeline's output — do not
delete without porting these forward:

- **`pipeline/ports.json`** — 15 georeferenced historical ports (coords, power,
  notes, source-cell indices). Directly reusable as ports of origin/call.
- **`docs/data/fields/*.bin`** — 240 Uint16 "hours-to-reach" fields
  (15 ports × 4 vessels × 4 seasons, 1° grid, 31 MB). Each field is a travel-time
  surface; walking it downhill reconstructs a realistic least-time route between
  any sea cell and the port. **This is the idler's route/movement engine.**
- **`docs/app.js` → `routeFrom(field, startIdx)`** — the downhill route-walk to
  port. Port A → port B path = A's field, walk downhill from B's cell, reverse.
- **`pipeline/{windfield,polar,router,geo,config}.mjs`** — the offline model, if
  fields need regenerating or extending (more ports, more vessel polars).
- **`docs/assets/land.geojson`** + `data-raw/ne_*.geojson` — coastline / land mask
  for the map.
- **`SOURCES.md`** — historical sourcing + calibration report; feeds the new
  vessel/route/cargo databases.
