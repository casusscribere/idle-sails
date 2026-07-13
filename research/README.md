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
- **All six basins authored (R3 complete, 2026-07-13): 60 systems ×
  1,403 system-decades.**
  - `flows/baltic-north-sea.json` (13) — grain, timber, iron, the return
    trade, St Petersburg, Norway, the coal trades (incl. the collier answer
    to R1's declared silence), Arkhangelsk, Spitsbergen, intra-Baltic.
  - `flows/atlantic.json` (11) — the Carrera, the Brazil fleets, the Middle
    Passage + Guinea legs (SlaveVoyages-anchored, sober-framed), wine & salt,
    Newfoundland, the sugar trades, tobacco, the New England triangle,
    **Caribbean smuggling (asserted — the silence-by-evasion, answered)**,
    Davis Strait whaling.
  - `flows/mediterranean.json` (9) — the Levant trade, Italian grain, Venice's
    long decline, the Ragusan argosies, Marseille, **the provisioning of
    Istanbul**, Greek/Ottoman coasting (asserted), the Habsburg silver route,
    the Black Sea slave trade (sober-framed).
  - `flows/indian-ocean-west.json` (9) — the Carreira, Gujarat–Red Sea (Surat
    and the hajj), the Gulf, the Swahili coast, **the Indian Ocean slave
    trades (sober-framed)**, Malabar pepper, the cowrie trade, the Mascarenes,
    the country trade.
  - `flows/bengal-se-asia.json` (9) — the VOC arterial (DAS-anchored), the EIC
    arterial, the minor companies, Coromandel textiles, the spice islands,
    **the Bugis carrying network (asserted)**, the Manila galleon, Aceh–Red
    Sea, the Bengal country trade.
  - `flows/east-asia.json` (9) — the Canton arterial, **the Nanyang junk trade
    (the Eurocentrism corrective — reconstructed)**, the Nagasaki junk trade
    (counted: Chinese hulls outnumbered Dutch ten to one), the great ship of
    Macau, VOC Japan, the Ryukyu circuit, Korea–Tsushima, the red-seal/Siam
    trade, **the Chinese coastal grain fleet (asserted)**.
  - **Seven cross-checks pass** against anchoring series (Sound Toll,
    SlaveVoyages, Chaunu, DAS, the Nagasaki registers, the Canton fleet, the
    French échelles), ±35% band.
- **`flows/silences.json`** — the silences register (11 entries): every known
  flow we do not or cannot quantify, with reason + treatment. Three silences
  were *answered* at R3 (Caribbean smuggling, China coastal grain, the coerced
  flows beyond the Atlantic); African coastwise trade and Pacific voyaging are
  gestured — recorded so the chart's emptiness reads as the archive's silence,
  not the ocean's. Rendered as "The chart's silences" at S3.
- **`tools/validate-flows.mjs`** — structural checks (hard errors: shares,
  grids, refs, sober-framing enforcement on coerced flows, cross-basin proxy
  consistency) + historical cross-checks and a derived world-prominence
  report. In the 1590s top-10 by flow touches: Istanbul, Shanghai, Tianjin,
  Alexandria, Smyrna — ports the ranking universe could not represent.
- Builders: `tools/build-baltic-flows.mjs`, `tools/build-r3-basins.mjs` — the
  anchor curves carry the historical claims.

### 7. The historiography, surfaced (S3)
- **`silences.html`** — *The chart's silences*: the register rendered — every
  known-but-unquantified flow with its reason and treatment, and the three
  silences answered with estimates that now sail.
- **`flow-prominence.html`** — per-decade port prominence **derived** from the
  60 flow systems (an output, not an input), unsailable ports marked °.
- In the game itself, every vessel's ledger carries a one-line evidence note —
  *"this voyage stands for a reconstructed trade"* — from its lane's dominant
  evidence class (`datasets.flows.laneEvidence`).
- Regenerate both pages with `tools/build-s3-pages.mjs`.

## Reproducing / extending
The rankings (1 & 2) were authored from the sources above; the derived artefacts
(3's computed fields, 4's aggregation) are produced by small Node builders. The
raw per-decade top-10 matrices live in `port-rankings-1550-1815.json`; everything
else is derived from them plus hand-authored port/route profiles.
