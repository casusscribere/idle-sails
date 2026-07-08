# Sources & Method

This project models 18th-century voyage times under sail. It is a **hybrid,
records-calibrated** model: a parametric wind/current climatology drives
square-rigger sailing polars through a least-time router, and the resulting
durations are **calibrated against recorded at-sea passage times**.

## Method summary

1. **Ocean/land grid** — 1° global grid rasterized from Natural Earth land, with
   a short list of narrow-but-vital straits force-opened (Gibraltar, Dover,
   Malacca, Sunda, Taiwan, Kattegat approaches).
2. **Seasonal wind fields (4 seasons)** — a parametric climatology encoding the
   documented regimes: NE/SE trade belts, seasonal ITCZ/doldrum migration,
   mid-latitude westerlies (incl. the Roaring Forties), the Indian-Ocean/China
   monsoon reversal, and winter-hemisphere strengthening. Regime latitudes and
   typical wind forces (≈ Beaufort 4–6) follow the pilot-chart / **CLIWOC
   1750–1854** picture (hybrid approach: parametric backbone tuned to
   CLIWOC-documented values).
3. **Surface currents** — major boundary/drift currents (Gulf Stream, North
   Atlantic Drift, Kuroshio, Agulhas, Brazil, Benguela, Canary, Humboldt, West
   Wind Drift, equatorial westward set).
4. **Sailing polars** — per class (frigate, East Indiaman, merchant brig/sloop,
   slave ship), with a no-go zone (square-riggers point ≈ 60–66° off the wind),
   best speed on a broad reach, and a light-air working floor.
5. **Least-time routing** — Dijkstra over the grid with anisotropic,
   wind/current-dependent edge costs → an "hours-to-reach" field per
   port × vessel × season. Isochrones and best-fit routes are derived from this
   field in the browser.
6. **Calibration** — each vessel's speed scalar is fit to recorded durations on
   its class-defining route(s); other legs are held out as validation checks.
   Targets are **at-sea sailing durations** (they exclude port calls, convoy
   waits and monsoon layovers that inflate familiar "total voyage" figures).

## Validation report (at-sea, best-two-season days)

`[fit]` legs are used to set the scalar; `[check]` legs are independent.

| Class | Leg | Role | Error |
|---|---|---|---|
| Frigate | London→Kingston | fit | 0% |
| Frigate | London→New York | check | +13.9% (westbound vs. westerlies) |
| Indiaman | London→Batavia | fit | 0% |
| Indiaman | London→Canton | fit | −9.4% |
| Indiaman | London→Cape Town | fit | +25.9% |
| Brig | London→Kingston | fit | 0% |
| Brig | London→New York | check | +20.2% (westbound vs. westerlies) |
| Slave ship | Whydah→Kingston (Middle Passage) | fit | −0.2% |
| Slave ship | Bahia→Whydah (Brazil–Mina) | check | +79.6% |

Fitted speed corrections `k`: frigate 0.893, indiaman 0.841, brig 0.962,
slaver 0.725.

### Known residuals / limitations
- **Westbound-against-the-westerlies** (e.g. England→New York) runs ~15–20%
  slow — a real feature of beating into the prevailing westerlies, only partly
  captured by the coarse field.
- **Equatorial eastbound** legs (Bahia→the Bight of Benin) are the model's
  weakest case: the coarse climatology can't reproduce the local seasonal wind
  and Guinea-Current knowledge that let real ships make ~40–50 d. Shown, but
  flagged.
- Isochrones are **climatological averages, not single voyages**.
- Several routes (thin-data Set B ports) are **model-only**, not record-anchored.

## Data sources

- **CLIWOC — Climatological Database for the World's Oceans 1750–1854.** García-Herrera et al.,
  *Climatic Change* (2005). <https://link.springer.com/article/10.1007/s10584-005-6952-6> ·
  data hosted at <https://www.historicalclimatology.com/cliwoc.html>
- **SlaveVoyages — Trans-Atlantic & Intra-American Slave Trade Databases**
  (voyage durations, mortality, vessel outcomes). <https://www.slavevoyages.org>
- **ICOADS — International Comprehensive Ocean-Atmosphere Data Set** (wind
  climatology corroboration). <https://icoads.noaa.gov>
- **Natural Earth** — 110m/50m land vectors (coastline & land mask).
  <https://www.naturalearthdata.com>
- **The Deshima Diaries** (Dutch factory at Nagasaki, dagregisters), Brill /
  Japan-Netherlands Institute — Set B Dejima case study.
- **Swedish East India trade, c. 1730–1800** — *Scandinavian Economic History
  Review* (Gothenburg / SOIC).
- **The Danish Asiatic Company's Voyages to China, 1732–1833** — *Scand. Econ.
  Hist. Review*.
- **Geoffrey Clark, "Insurance as an Instrument of War in the 18th Century."**
  <https://link.springer.com/content/pdf/10.1111/j.1468-0440.2004.00285.x.pdf>
  (basis for the planned risk layer.)
- **Christopher Kingston, "Marine Insurance in Philadelphia during the Quasi-War
  with France, 1795–1801."** <https://users.nber.org/~confer/2007/si2007/DAE/kingston.pdf>
- Port-activity context: EHNE *European Commercial Ports*; IEG-EGO *Early Modern
  Ports*; *Journal of Economic History*, 18th-c shipping tonnage.

## Reproducing the data

```
cd pipeline
node build-grid.mjs     # 1° ocean/land mask -> build/grid.json
node calibrate.mjs      # fit vessel scalars -> build/calibration.json + validation.json
node build-all.mjs      # 240 fields -> docs/data/fields/, docs/manifest.json
```
