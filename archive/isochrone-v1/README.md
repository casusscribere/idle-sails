# Age of Sail — Isochronic Passage Chart (18th c.)

An isochronic map of voyage times under sail, c. 1750–1800. Pick a port, vessel
class, and season to see colored isochrone bands (equal-passage-time zones) and
best-fit routes across the world's oceans — or switch to destination mode to
rank passage times to any sea point from every port.

Built for **static GitHub Pages** hosting: the `docs/` folder is the whole site
(no backend, no build step at serve time). All routing is precomputed offline.

## Structure

```
docs/                 # the deployable static site (GitHub Pages: serve from /docs)
  index.html, app.js
  manifest.json       # ports, vessels, seasons, calibration, validation
  data/fields/*.bin   # 240 Uint16 "hours-to-reach" fields (port x vessel x season)
  assets/land.geojson # display coastline
pipeline/             # offline Node pipeline that generates docs/data
  config, geo, windfield, polar, router, build-grid, calibrate, build-all
SOURCES.md            # citations, method, and the calibration/validation report
PLAN.md               # full project plan (incl. later phases)
```

## Run locally

```
node serve-preview.mjs      # serves docs/ on $PORT (default 3210)
# or: python -m http.server 5179 --directory docs
```

## Regenerate the data

```
cd pipeline
node build-grid.mjs && node calibrate.mjs && node build-all.mjs
```

## Status

Phases 1–4 complete: data sourcing + grid, model + calibration, full field
generation, and the interactive front-end (port-set toggle, four vessel
classes, four seasons, isochrones, hover routes, destination lookup).

Planned next (see PLAN.md): **Phase 6 risk layer** (composite loss/premium,
peacetime↔wartime toggle) and **Phase 8 round-trip + seasonal layover**.

## Method

Hybrid parametric wind/current climatology (CLIWOC/pilot-chart regimes) →
square-rigger polars → least-time routing → calibrated to recorded at-sea
durations. See [SOURCES.md](SOURCES.md).
