# Project Status — Age of Sail Isochronic Passage Chart

**Paused:** 2026-07-01
**State:** Phases 1–4 complete and serving end-to-end. Core app is functional.
**One thing unconfirmed:** live MapLibre visual rendering (see "Verification").

See also: [PLAN.md](PLAN.md) (full plan), [SOURCES.md](SOURCES.md) (citations +
validation report), [README.md](README.md) (how to run/regenerate).

---

## What is done

| Phase | Deliverable | Location |
|---|---|---|
| 1 | 1° ocean/land grid (straits carved), two port sets, citations | `pipeline/build-grid.mjs`, `pipeline/ports.json`, `SOURCES.md` |
| 2 | Wind/current climatology, polars, least-time router, calibration | `pipeline/{windfield,polar,router,calibrate}.mjs`, `build/validation.json` |
| 3 | 240 passage fields (15 ports × 4 vessels × 4 seasons, 31 MB) + manifest | `docs/data/fields/*.bin`, `docs/manifest.json` |
| 4 | Interactive front-end: isochrones, hover routes, destination lookup, set/vessel/season toggles | `docs/index.html`, `docs/app.js` |

Ports: **Set A** London, Amsterdam, Bordeaux, Nantes, Liverpool, Cádiz, Lisbon,
Canton, Batavia, Kingston. **Set B** Dejima, Gothenburg, Tranquebar, Whydah,
Salvador da Bahia. Vessels: frigate, East Indiaman, merchant brig, slave ship.
Seasons: DJF/MAM/JJA/SON.

## Verification status

Verified **headless** (browser unavailable this session — preview harness port
held by another chat; no Chrome extension connected):
- ✅ All assets serve with correct content-types (html/js/json/octet-stream).
- ✅ Client algorithms on real data: d3-contour → 14 bands / 618 rings;
  downhill route London→Kingston = 81 hops ending on London's source cell,
  56.3 d.
- ✅ JS syntax clean; manifest parses (10 + 5 ports, 4 vessels, 4 seasons).

**Not yet confirmed:** the actual MapLibre map drawing (isochrone fills, route
lines, markers, tooltip, destination rays). **Resume action:** open a browser
path (free port 3210, or connect the Chrome extension), run the server, and do a
visual pass + screenshot; fix any rendering issues.

## Key decisions (with rationale)

- **Wind model = hybrid** (parametric backbone tuned to CLIWOC-documented
  regime values) — chosen over raw-CLIWOC ingest (too sparse) and pure
  parametric (less grounded).
- **Calibrate to at-sea sailing time, not total voyage** — the famous
  "6-month East Indies" figures include weeks of port calls / monsoon waits a
  pure router doesn't model. Documented as such.
- **Best-two-season calibration basis** + **fit/check split** (fit on each
  class's defining route; hold others out) — honest, avoids over-fitting a
  single global scalar.
- **Ship only the Uint16 time grid; reconstruct routes client-side by walking
  downhill** on the time surface — halves data, no back-pointer grid.
- **1° grid with hand-carved straits** (Gibraltar, Dover, Malacca, Sunda,
  Taiwan, Kattegat) — fast routing without sealing vital narrows.
- **Light-air working floor (~0.8 kn)** — fixes a doldrum-crossing artifact
  where no-go-angle headings collapsed to ~0 speed.

## Known limitations / residuals

- Westbound-against-the-westerlies (England→New York) ~+15–20% slow (partly real).
- Equatorial eastbound (Bahia→Whydah) ~+80% — the model's weakest case (coarse
  climatology misses local seasonal/Guinea-Current knowledge). Shown but flagged.
- Isochrones are climatological averages, not single voyages.
- Some Set B routes are model-only (not record-anchored) — **not yet visually
  flagged in the UI** (backlog item).
- Contours crossing the antimeridian are clipped at ±180° (backlog).

---

## Planned future stages

### Immediate on resume
- **Visual verification pass** (needs a browser path) — confirm MapLibre
  rendering; screenshot; fix visual issues. *No code known-broken; unverified.*

### Phase 6 — Risk layer
- Composite basis: empirical loss/mortality (SlaveVoyages) where available;
  insurance-premium proxy (Clark, Kingston) elsewhere; seasonal weather-hazard
  windows.
- **Peacetime ↔ wartime toggle** (generic wartime uplift; keep war vs. weather
  risk legible rather than blended).
- Build: a `pipeline/build-risk.mjs` emitting per-port×season (×war-state) risk
  fields; a front-end **layer toggle** (time ↔ risk) reusing the same iso-band
  rendering. Iso-risk choropleth.

### Phase 7 — Deploy
- GitHub Pages from `/docs`. Confirm repo size (31 MB fields) is acceptable;
  rely on server gzip. Add a repo, push, enable Pages.

### Phase 8 — Round-trip + seasonal layover
- Outbound (season S) + layover-until-favorable-window + return (season S′),
  minimizing total elapsed time on the existing seasonal fields.
- **Risk-sensitivity slider** that can lengthen the layover to avoid dangerous
  windows (the "winter at Canton" behavior).
- Front-end round-trip panel: recommended departure/return, days at sea each
  way, layover, total, cumulative risk.

### Backlog / possible enhancements
- Flag model-only ports/routes visibly in the UI.
- Richer Set B annotations (the "constrained isochrone" story per port).
- Optional overlay of documented historical reference routes (Brouwer route,
  Spanish *flota* tracks).
- Real CLIWOC ingest to nudge the parametric field (upgrade of the hybrid).
- Finer grid / more straits; fix antimeridian contour clipping; mobile layout.

## Open questions for resume
1. Risk layer: confirm the peacetime baseline + generic wartime uplift (vs.
   named wars) when we get there.
2. Deploy target: which GitHub account/repo; is 31 MB of committed field data
   acceptable, or downsample/quantize first?
3. Set B #10-equivalent: keep 5 deep case studies, or expand later?

## How to resume

```
# serve locally
node serve-preview.mjs            # docs/ on $PORT (default 3210)

# regenerate data if pipeline changed
cd pipeline
node build-grid.mjs && node calibrate.mjs && node build-all.mjs
```
