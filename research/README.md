# `research/` — historical port & route reference data

Scholarly syntheses that ground the Idle Sails world. These are reference
datasets and self-contained reference pages (deployed alongside the site;
linked from the in-game menu → *Reference*, and from [`index.html`](index.html)).
Two of them now feed the sim indirectly: the tiered top-20 rankings (1) are the
source of `data-src/era-weights.json` (the flowing clock's spawn weights), and
the minor-ports work (3) has a sim-ready **promotion queue** (5) awaiting the
Phase B route bake.

All of it is **best-effort historical reconstruction, not a census** — anchored
to hard regional series where they exist and flagged as estimate elsewhere. Each
page carries its own sources and caveats.

## Datasets

### 1. Busiest ports, 1550–1815 — three metrics, **top 20**
Per-decade rankings (27 decades) three ways, each with a persistence ranking and
a presence grid. The **top 10 are ranked**; ranks **11–20 are an unranked second
tier** (membership, not order — the evidence can't support fine rank past ~10).
This tiered top-20 is the weight source for the flowing sim (`PLAN-2` Step 1).
- **`port-rankings-1550-1815.json`** — canonical: `metrics.{ships,tonnage,value}.topByDecade` (1–10) and `.tier2ByDecade` (11–20), plus sources/caveats.
- **`port-top20-1550-1815.csv`** — the full top-20 (decade · metric · tier · rank · port).
- **`ports-1550-1815.html`** — reference page with a metric switcher; the grid shows the ranked top-10 (solid) and the second tier (faint outline).
- Port universe: **57** ports (33 ever-top-10 + 24 mid-tier).
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

### 5. Minor-ports promotion queue + curation rubric
The 33 minor ports authored into **sim-ready staged definitions** — coordinates,
polity/flag mappings, numeric era windows, cargo, proposed lanes, bake risks —
ordered in three tranches by diversity-value ÷ bake-cost. The supporting
vocabulary (18 cargoes, 19 polities/flags, junk & dhow + 16th-c rigs, 9 regions)
is already in `data-src/`; a port is promoted (copied into the sim + its routes
baked) in PLAN-2 Phase B.
- **`minor-ports-promotion.json`** — the queue (tranches 12 / 12 / 9).
- **`CURATION.md`** — the growth rubric: four diversity axes, hard rules
  (era honesty, sober slave-trade framing, weight band, baked-or-doesn't-sail),
  and the open flag decisions (china-junk-trade, tsushima, golconda…).

## Reproducing / extending
The rankings (1 & 2) were authored from the sources above; the derived artefacts
(3's computed fields, 4's aggregation) are produced by small Node builders. The
raw per-decade top-10 matrices live in `port-rankings-1550-1815.json`; everything
else is derived from them plus hand-authored port/route profiles.
