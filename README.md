# Idle Sails

A browser **idler** for the age of sail. Leave it open and a procedurally
generated, historically-grounded world sails itself: plausible vessels — names,
rigs, tonnages, flags, cargoes — set out on realistic wind-and-current routes
between historical ports, cross the world, and are lost or arrive over time.

The only controls: a **speed** slider, and **click a vessel** for a sidebar
(tonnage · ship type · allegiance · cargo · itinerary).

## Status

**Milestones 1–3 done; live display running.** See [PLAN.md](PLAN.md) for the
full design and [CLAUDE.md](CLAUDE.md) for current state. Built so far: the six
historical datasets, the offline route baker, the headless deterministic
simulation (`world.js`, tested), and the parchment sea-chart display that
runs it in the browser. Still to come: persistence / offline-accrual (M6) and
final polish (M7).

This is a ground-up rebuild. The previous project — an isochronic passage-*chart*
(a static travel-time map) — is preserved under
[`archive/isochrone-v1/`](archive/isochrone-v1/ARCHIVE-NOTE.md). The rebuild
reuses its wind/current routing engine, its 15 historical ports, and its
coastline data to power vessel movement.

## Layout

The deployable site lives at the repository root (so `index.html` is served
directly by GitHub Pages):

```
index.html    the page
main.js       bootstrap + animation loop
world.js      headless, seeded, deterministic simulation (no DOM)
render.js     the canvas sea chart
ui.js         speed instrument + vessel + port ledger
style.css     parchment styling
data/         generated: datasets.json, routes.json, land.geojson
data-src/     hand-authored historical datasets (ships, names, powers, cargo, routes, wars)
pipeline/     offline builders: build-data.mjs (datasets) + bake-routes.mjs (routes) — see pipeline/README.md
test/         node tests for world.js (determinism, plausibility, offline accrual)
archive/      the previous isochronic-chart project
```

## Build & run

```
npm run build        # regenerate data/ (build-data + bake-routes)
npm test             # node --test: world determinism & plausibility
npm run serve        # serve the repo root at http://localhost:8000  (any static server works)
```

The site is fully static and needs no backend. It must be served over HTTP (not
opened as a `file://` URL), because the browser blocks ES-module and JSON loads
from the filesystem. `#seed=<number>` in the URL loads a specific world.

Regenerating `data/` (`npm run build`) needs the archived engine's gitignored
build artifacts (`archive/isochrone-v1/pipeline/build/`); the committed
`data/*.json` let the site run without them. See
[pipeline/README.md](pipeline/README.md).

## Deploy (GitHub Pages)

`.github/workflows/pages.yml` stages the site files (`index.html`, the modules,
`style.css`, `data/`) into `_site` and publishes that on every push to `main` —
so the archive, pipeline, and source docs are not exposed. One-time setup:
**Settings → Pages → Source → "GitHub Actions"**.

Prefer zero-config? Since `index.html` is at the root, you can instead set
**Source → "Deploy from a branch" → `main` / `/ (root)`** and delete the
workflow — but that serves the *entire* repo (including `archive/`) publicly.
