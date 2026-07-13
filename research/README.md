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
- **`port-rankings-1550-1815.json`** — canonical: `metrics.{ships,tonnage,value}.topByDecade` (1–10) and `.tier2ByDecade` (11–20), plus sources/caveats, a **declared boundary** (the European-commercial-record scope; Istanbul as exemplar), and a `changelog`.
- **`port-top20-1550-1815.csv`** — the full top-20 (decade · metric · tier · rank · port).
- **`ports-1550-1815.html`** — reference page with a metric switcher; the grid shows the ranked top-10 (solid) and the second tier (faint outline).
- Port universe: **60** ports (35 ever-top-10 + 25 mid-tier).
- Anchors: Sound Toll Registers, Dutch-Asiatic Shipping, the Carrera de Indias (Lamikiz), English customs, van Tielhof, Kaukiainen.
- **PLAN-3 R1 corrections applied (2026-07-13, 168 edits — see the JSON changelog):**
  basis clarified (*ships = foreign-going clearances*; the collier silence declared);
  promotions **Goa** (value T1 1550s–80s), **Cap-Français** (value T1 1770s–80s,
  ends 1791), **Rio de Janeiro** (value T1 1740s–60s gold peak), **Kingston**
  (value T2 1740s+); de-truncations (Rotterdam, Venice, Genoa, Livorno, Lübeck,
  Emden), St Petersburg into value, the American ramp (Boston/Philadelphia/New
  York), Bahia 1600s–80s, Nagasaki 1600s–30s, Porto. Slot-budget caps are
  documented in the changelog rather than silently absorbed. Rebuild tools live
  in **`tools/`** (`apply-r1.mjs`, `build-rankings-page.mjs`, `build-era-weights.mjs`).

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
The 33 minor ports — **plus Istanbul**, added at PLAN-3 R1 as the
declared-boundary exemplar (present, never ranked) — authored into **sim-ready
staged definitions** (34 total): coordinates, polity/flag mappings, numeric era
windows, cargo, proposed lanes, bake risks — ordered in three tranches by
diversity-value ÷ bake-cost. The supporting vocabulary (18 cargoes, 19
polities/flags, junk & dhow + 16th-c rigs, 9 regions) is already in
`data-src/`; a port is promoted (copied into the sim + its routes baked) in
PLAN-3 Phase S2.
- **`minor-ports-promotion.json`** — the queue (tranches 12 / 12 / 10).
- **`CURATION.md`** — the growth rubric: four diversity axes, hard rules
  (era honesty, sober slave-trade framing, weight band, baked-or-doesn't-sail),
  and the open flag decisions (china-junk-trade, tsushima, golconda…).

### 6. The flow matrix (PLAN-3) — `flows/`
The evidence-classed **trade-system flow matrix** that will replace port
rankings as the sim's weight source (PLAN-3 §2; schema in
[`flows/_schema.md`](flows/_schema.md), decisions fixed at R2 2026-07-13:
voyage **ranges** `[lo,hi]`, **per-seed draw** realization, **systems + lane
shares**). Port prominence becomes an *output*.
- **`flows/baltic-north-sea.json`** — the proof-of-shape basin: 13 systems ×
  27 decades (grain, timber, iron, the return trade, St Petersburg, Norway,
  the coal trades incl. the collier system that answers the R1-declared
  silence, Arkhangelsk, Spitsbergen whaling, intra-Baltic, the short-haul).
  Counted systems cross-check against the Sound Toll series (±35% band, all
  anchor decades ✓). Authored as anchor curves in
  `tools/build-baltic-flows.mjs` — the anchors carry the historical claims.
- **`flows/silences.json`** — the silences register: known flows we do not or
  cannot quantify, each with reason + treatment (asserted / gestured /
  excluded). Rendered as "The chart's silences" at S3.
- **`tools/validate-flows.mjs`** — structural checks (hard errors) +
  historical cross-checks (reported).
- Remaining basins (Atlantic, Mediterranean, Indian Ocean, Bengal–SE Asia,
  East Asia) are Phase R3.

## Reproducing / extending
The rankings (1 & 2) were authored from the sources above; the derived artefacts
(3's computed fields, 4's aggregation) are produced by small Node builders. The
raw per-decade top-10 matrices live in `port-rankings-1550-1815.json`; everything
else is derived from them plus hand-authored port/route profiles.
