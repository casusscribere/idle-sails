# `research/` — historical port & route reference data

Scholarly syntheses that ground the Idle Sails world. **None of this feeds the
live simulation** — the game's 15-port world (`data/`, `data-src/`, `world.js`)
is unchanged. These are reference datasets and self-contained reference pages
(deployed alongside the site; linked from the in-game menu → *Reference*, and
from [`index.html`](index.html)).

All of it is **best-effort historical reconstruction, not a census** — anchored
to hard regional series where they exist and flagged as estimate elsewhere. Each
page carries its own sources and caveats.

## Datasets

### 1. Busiest ports, 1550–1815 — three metrics
Per-decade top-10 ports (27 decades) ranked three ways, each with a persistence
ranking (decades-in-top-10) and a presence grid.
- **`port-rankings-1550-1815.json`** — the canonical data: `metrics.{ships,tonnage,value}.topByDecade`, plus sources and per-metric caveats.
- **`ports-1550-1815.html`** — reference page with a metric switcher.
- Anchors: Sound Toll Registers, Dutch-Asiatic Shipping, the Carrera de Indias (Lamikiz), English customs, van Tielhof, Kaukiainen.

### 2. Combined persistence synthesis
Each port's decades-in-top-10 **summed across all three metrics** (max 81).
- **`port-persistence-synthesis.csv`** — rank · port · ships · tonnage · value · total · metrics-present.
- **`port-synthesis.html`** — reference page (stacked composition bars).
- Yields the 33 "major" ports used downstream.

### 3. Thirty-three MINOR ports, c.1500–1830
The long tail: ports significant for **function, monopoly, chokepoint, or an
excluded polity** rather than volume — curated for diversity of geography, cargo
and polity, with **Dejima** as the exemplar. Excludes the 33 volume-ranked ports
and the game's Dejima/Kingston/Tranquebar/Whydah.
- **`minor-ports-1500-1830.json`** — 33 ports with region, polity, era, cargo/function, significance, diversity axis, and `research_verified` (10 of 33 confirmed in an adversarial research pass; ◆ on the page).
- **`minor-ports-1500-1830.csv`**, **`minor-ports-1500-1830.html`** (region-grouped gazetteer).

### 4. Route persistence, 1550–1815 — a structural trade-lane model
Per-decade **combined** top-10 ports × each port's principal trade lanes,
activated by decade and ranked by staying power. **Structural, not empirical** —
no source records ranked top-10 routes per port per decade.
- **`routes-by-decade.csv`** — the full 1,818-row dataset (decade · port rank · port · route rank · destination · cargo).
- **`route-persistence.csv`** / **`route-persistence.json`** — 165 distinct lanes ranked by decades active.
- **`route-persistence.html`** — filterable reference page.

## Reproducing / extending
The rankings (1 & 2) were authored from the sources above; the derived artefacts
(3's computed fields, 4's aggregation) are produced by small Node builders. The
raw per-decade top-10 matrices live in `port-rankings-1550-1815.json`; everything
else is derived from them plus hand-authored port/route profiles.
