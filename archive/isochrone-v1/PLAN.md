# Age of Sail Isochronic Passage Chart — Plan

A static, GitHub Pages–hosted single-page map in the isochronic tradition
(Galton 1881 → the reference chart at
<https://isochronic-passage-chart.netlify.app/#nyc>), showing 18th-century
voyage times and best-fit historical routes for four vessel classes, across two
curated port collections, with a seasonal model, a composite risk layer, and a
Phase-2 round-trip extension.

---

## 1. Interaction (two modes, shared data)

- **Port mode** — pick port + vessel + season → colored **isochrone bands**
  radiate over the ocean; hover any sea point for its route line + passage time.
- **Destination mode** — click/search any navally-accessible coast → rays from
  all ports, each labeled and ranked ("how far is everywhere from here").
- Both modes read one build-time travel-time field, so they can never disagree.
- State lives in the URL hash, e.g. `#london/east-indiaman/summer/setA`.

## 2. Ports (toggle between two sets)

**Set A — Dominant powers (10):** London, Amsterdam, Bordeaux, Nantes,
Liverpool, Cádiz, Lisbon, Canton (Guangzhou), Batavia (Jakarta), Kingston
(Jamaica).

**Set B — History from below (5 deep case studies):**

| Port | Why it matters | Data anchor |
|---|---|---|
| **Dejima/Deshima (Nagasaki)** | Dutch–Japan; ~1–2 ships/yr — the low-volume exemplar | *The Deshima Diaries* / dagregisters (Brill); 606 arrivals 1641–1847 |
| **Gothenburg** | Swedish East India Company | 132 expeditions, 37 ships |
| **Tranquebar** | Danish Asiatic Company, India | Danish Asiatic voyages to China 1732–1833 |
| **Whydah/Ouidah** | Centers the African embarkation side | SlaveVoyages (embarkations, mortality) |
| **Salvador da Bahia** | Direct S. Atlantic Brazil↔Africa trade (bypassing Lisbon) | SlaveVoyages |

Set B ports get a richer annotated panel telling the story their constrained
isochrones reveal — Dejima's single monsoon-gated thread to Batavia vs. London's
ocean-spanning fan.

## 3. Vessels (four calibrated polars)

Naval frigate/warship · East Indiaman · Merchant brig/sloop · Slave ship.

## 4. Method — hybrid, records-calibrated (all offline, pre-baked to static JSON)

1. Navigable-ocean grid + land mask (Natural Earth) → defines
   "navally-accessible."
2. **4 seasonal wind fields** from **CLIWOC (1750–1854)** logbook data +
   **ICOADS** gap-fill (trades, westerlies, doldrums, monsoon reversal).
3. Prevailing surface currents from historical pilot/current charts.
4. Per-class sailing polars (square-riggers point only ~67° off the wind;
   leeway; reduced close-hauled speed).
5. Time-dependent least-time router → travel-time field per
   `port × vessel × season` → marching-squares isochrone GeoJSON + route
   polylines.
6. **Calibration & validation** against recorded durations (SlaveVoyages
   Middle-Passage medians; East Indiaman / company logs; Lloyd's & naval
   passages). Residual error published in-app.

## 5. Time of year

**4-season (quarterly) model** — captures monsoon reversal and trade-wind
seasonality while keeping data size modest.

## 6. Risk layer (composite; peacetime baseline + wartime toggle)

- **Composite basis:** empirical loss/mortality (**SlaveVoyages**) where it
  exists; **insurance-premium proxy** (Clark, *Insurance as an Instrument of War
  in the 18th Century*; Kingston, Philadelphia marine insurance) elsewhere;
  seasonal weather-hazard windows (hurricane season, monsoon, Cape passages).
- **Rendering:** **iso-risk bands** in the same visual language as the
  isochrones; a **layer toggle** switches time ↔ risk.
- **War state:** **peacetime↔wartime toggle** applies a generic wartime uplift
  (premiums 3% → 40–80%) rather than blending, keeping war vs. weather risk
  legible. Per-source labeling; model-only cells marked.

## 7. Phase-2 extension — round-trip + seasonal layover

Outbound (season S) + layover-until-favorable-window + return (season S′),
minimizing total elapsed time. A **risk-sensitivity slider** can lengthen the
layover to avoid dangerous windows (the historical "winter at Canton"). Built on
the same seasonal + risk fields — no rework.

## 8. Tech & deployment

- Static site, no runtime backend — all computation pre-baked to static JSON.
- **MapLibre GL JS** (no API token) with a custom antique style; translucent
  isochrone fills; styled route lines.
- Minimal front-end JS (vanilla or Preact/Svelte).
- Deploy from `/docs` via GitHub Pages.
- For cartographic/legend best practices during the front-end phase, consult the
  `visualize` MCP `read_me` (`data_viz` / `chart` modules) + `design:accessibility-review`
  for color-contrast on the time/risk ramps. (No dedicated data-viz-best-practices
  skill exists in this environment.)

```
/pipeline    offline model, calibration, risk generator (Node or Python)
/data-raw    CLIWOC, SlaveVoyages, coastlines (gitignored if large)
/docs        deployed site  →  /docs/data (generated JSON/GeoJSON)
SOURCES.md   full citations + validation report
```

## 9. Scholarly integrity

`SOURCES.md` + an in-app "Sources & Method" panel citing CLIWOC, SlaveVoyages,
ICOADS, Natural Earth, the Deshima Diaries, Swedish/Danish/Ostend company
records, and Clark/Kingston. Each port flagged **record-anchored vs.
model-only**; calibration error shown; "climatological averages, not
single-voyage predictions" caveat stated.

## 10. Phased milestones

1. **Data sourcing & sign-off** — pull datasets; finalize both port sets with
   citations; build the ocean grid. *(→ SOURCES.md + grid)*
2. **Model + calibration** — polars, router, validate against records; emit one
   proof `port × vessel × season` set. *(→ validation report)*
3. **Full generation** — all ports × 4 vessels × 4 seasons → `/docs/data`.
4. **Front-end** — MapLibre, isochrones, route lines, antique styling.
5. **Both modes + toggles** — port/destination, Set A/B, hash state.
6. **Risk layer** — composite risk fields + iso-risk rendering + wartime toggle.
7. **Deploy v1** — sources panel, legend, GitHub Pages.
8. **Phase-2** — round-trip + layover + risk-sensitivity slider.

## 11. Known caveats (surfaced in-app)

- CLIWOC coverage is Euro-lane-biased; Pacific/Indian-Ocean gaps filled by
  ICOADS/pilot charts.
- Insurance premiums conflate war + weather + season and are war-year-specific.
- "Best-fit route" = calibrated least-time path, **not** a specific documented
  voyage.
- Several Set B routes (and any thin-data port) are **model-only** — physically
  modeled but not record-validated.

---

## Key data sources

- **CLIWOC** — Climatological Database for the World's Oceans 1750–1854.
  <https://link.springer.com/article/10.1007/s10584-005-6952-6> ·
  hosted: <https://www.historicalclimatology.com/cliwoc.html>
- **SlaveVoyages** — Trans-Atlantic & Intra-American Slave Trade Databases
  (durations, mortality, vessel loss). <https://www.slavevoyages.org>
- **ICOADS** — International Comprehensive Ocean-Atmosphere Data Set (gap-fill).
- **Natural Earth** — coastlines / land mask. <https://www.naturalearthdata.com>
- **The Deshima Diaries** (Brill) — Dutch factory at Nagasaki records.
- **Swedish East India trade** value-added analysis (c. 1730–1800), *Scand. Econ.
  Hist. Review*.
- **Danish Asiatic Company's Voyages to China, 1732–1833**, *Scand. Econ. Hist.
  Review*.
- **Geoffrey Clark**, *Insurance as an Instrument of War in the 18th Century*.
  <https://link.springer.com/content/pdf/10.1111/j.1468-0440.2004.00285.x.pdf>
- **Christopher Kingston**, *Marine Insurance in Philadelphia during the
  Quasi-War with France, 1795–1801*.
  <https://users.nber.org/~confer/2007/si2007/DAE/kingston.pdf>
- Port-activity scholarship: EHNE *European Commercial Ports*; IEG-EGO *Early
  Modern Ports*; *Journal of Economic History* — 18th-c shipping tonnage.
