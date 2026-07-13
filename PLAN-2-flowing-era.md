# PLAN 2 — A flowing, decade-weighted 1550–1815 world

**Status:** planning (not yet started). Extends `PLAN.md`; does not replace it.
**Prerequisites for Phase 1:** (a) the tiered top-20 per-decade port dataset, and
(b) the minor-ports / diversity-layer integration planned in §5 below.

---

## 0. Intent

Turn Idle Sails from its current model (each vessel samples an *independent*
era-year) into a **flowing simulation**: the global clock advances continuously
through 1550→1815, and at any instant the **spawn distribution** — which ports,
lanes, ship-types, cargoes, and flags appear — reflects the historical weighting
of the *current* decade, **blended smoothly** between decades, then **resets over
5 "fake" years (1815→1820)** back to the 1550 distribution and loops.

The bar is *statistically weighted around* historical accuracy, **not strict**
accuracy: early years dominated by 16th-century flows, gradually shifting to
later-century weightings, with no sharp change at any decade boundary.

---

## 1. The governing constraint (read first)

**Movement is baked.** Vessels can only sail between ports with baked
wind/current route polylines. Today that's the **15** sim ports, calibrated
~1700–1815. The historical distributions for 1550–1815 — and the minor-ports
diversity layer — involve dozens more ports (Antwerp, Danzig, Venice, Seville,
Naha, Mocha, Makassar…). **Any port we want to spawn from must first have baked
routes.** The archived climatology is a global 1° grid, so a route field can be
generated from *any* coastal cell — the pipeline supports it — but each added
port costs one Dijkstra field per routing-class × season (16 fields/port). So the
work splits into a cheap mechanic-first phase and an expensive coverage phase.

---

## 2. Architecture — four layers

1. **Time model** *(world.js, small).* Sim-clock → a looping historical year:
   1550→1815 (265 yr), then a 5-yr reset ramp 1815→1820 interpolating the 1810s
   weights back to the 1550s, then loop (period **270 yr**). `weightsAt(year)`
   finds the two bracketing decade anchors (1555, 1565, … 1815, + the reset
   segment) and **linearly interpolates the weight vectors** — piecewise-linear,
   smooth, no boundary jump. A pure function of sim-time ⇒ **determinism and
   offline-accrual are preserved**.
2. **Weight tables** *(data, medium).* The tiered top-20 becomes
   `data-src/era-weights.json`: per-decade **port** weights (rank→weight; the
   unranked 11–20 tier → a lower band; the minor/diversity layer → a small band).
   Per-decade **lane** weight = origin-port weight × lane era-activity. Ship-type,
   cargo, and flag **follow from the lane** (as today) — the whole vessel is drawn
   from one interpolated lane distribution.
3. **Spawn engine** *(world.js, small).* Replace "independent per-vessel era-year
   + static lane weight" with: at spawn time, interpolate the current decade
   weights, sample a lane ∝ interpolated weight, then type/cargo/flag as now. The
   vessel's era-year = the **current flowing year**. Population/spawn-rate may
   drift up over the era.
4. **World coverage** *(the expensive layer — see Phases A/B).*

Rendering *(small):* surface the flowing year + an era label; the routes overlay
already colours by flag, so **national dominance visibly rotates** over time;
optional timeline scrubber. Tests: determinism & granularity-independence hold; a
distribution check (sampled spawns over a decade ≈ target weights); a smoothness
check (no discontinuity at decade boundaries or the reset seam); a loop check
(1815→1820→1550 continuous, population stable across the seam).

---

## 3. Phased sequence

- **Step 1 — Tiered top-20 dataset.** Per-decade top-10 ranked + 11–20 as an
  unranked tier, across the three metrics; the weight source. *(option one)*
- **Step 2 — Minor-ports & diversity integration.** Extend the datasets and the
  port roster with the diversity layer; define era windows, weights, routes, and
  a curation framework. **See §5.** *(done before Phase 1 so the datasets are
  extended once.)*
- **Phase A — Flowing mechanic, no re-baking.** Layers 1–3 over the **existing
  15 ports** (map historical flows onto the nearest available ports); extend the
  clock to 1550 + the loop; push the datasets (ship-types, powers, cargoes) back
  to 1550 so early vessels look right. Delivers the whole mechanic immediately.
  *Limitation, stated plainly:* the 1550s can't show Antwerp/Danzig/Venice, so
  early-period fidelity is coarse. Minor ports already in the 15 (Dejima,
  Kingston, Tranquebar, Whydah) work here; the rest wait for Phase B.
- **Phase B — Coverage expansion + re-bake.** Add the backbone hubs **and** the
  minor-ports diversity layer (§5); regenerate wind-fields (`build-grid` →
  `build-all`) and re-bake routes. Now the map genuinely shifts across centuries.
- **Phase C — UI / polish.** Timeline, era labels, ambient historical framing.

---

## 4. The smoothness knob

Interpolating between **decade midpoints** gives gentle ~10-year ramps. If that
still reads as "steppy," anchor finer (per-5-years) or ease the interpolation
(smoothstep). Cheap to tune; decide by feel during Phase A.

---

## 5. Minor-ports & diversity-layer integration

*(Extends the `research/minor-ports-1500-1830` effort into the simulation.)*

### 5.1 Why
A world that is only the top-20 European hubs is impoverished. The diversity
layer gives the sea its texture — a Dutch ship clearing **Dejima** once a year, a
coffee cargo out of **Mocha**, cloves from **Makassar**, sea-otter furs from
**Sitka**, cowries from **Malé**. Low volume, high memorability.

### 5.2 The diversity layer as a first-class concept
Every port carries a **tier**: `major` (ranked), `mid` (11–20), `minor`
(diversity). Minor ports get a **small fixed spawn weight**, are **era-windowed**
to their real period, and are chosen to fill diversity axes — so they appear
rarely but authentically, each sighting distinctive.

### 5.3 Data extensions the minor ports force *(one authoring pass, Step 2)*
- **Polities / flags:** Ryukyu, Gowa, Omani, Safavid, Golconda/Mughal, Ottoman,
  Zamorin, Maldive & Aceh sultanates, the Efik states, the Crimean Khanate, the
  Russian-American Company, and the small European carriers (Denmark, Sweden,
  Courland, Brandenburg-Prussia, Ragusa, Tuscany/Papal States).
- **Cargoes:** cowries, cloves, nutmeg & mace, pearls, coffee, frankincense, furs
  (sea-otter / beaver), whale oil, cod, gum arabic, ivory, porcelain, cinnamon,
  saltpetre, gold-dust, salt — extending `data-src/cargo.json`.
- **Rigs / ship-types:** junk (East/SE Asia), dhow/baghlah (Indian Ocean/Arabia),
  plus 16th-c European types (carrack, galleon, caravel, fluyt, galley). For
  **movement**, non-European rigs map onto the 4 routing polars (junk≈indiaman,
  dhow≈brig) unless we author new polars — a modeling choice, fine for
  "weighted-around-historical."
- **Lanes:** the minor ports' principal routes (already modeled in
  `research/route-persistence`): e.g. Dejima↔Batavia (copper/silver), Mocha↔Surat
  (coffee/pilgrims), Makassar↔spice-islands (contraband), Sitka↔Canton (furs),
  Malé↔Bengal (cowries), Kaffa↔Istanbul (enslaved people).

### 5.4 Routing / coverage
Each minor port needs baked routes from its location. Global wind-fields support
any coastal cell, so all are feasible; cost = 16 fields/port. Prioritise by
**diversity value ÷ bake cost**; cluster regionally (spice islands, Persian Gulf,
Swahili coast) to share coverage. Bake in the same Phase B pass as the backbone.

### 5.5 Era-windowing & weighting
The flowing clock naturally gates each minor port to its era (Dejima 1641+, Sitka
1799+, Louisbourg 1713–58, Makassar 1613–69, Banda's monopoly to the 1770s…).
Weight = a small `diversity` band, well below `mid`, so the top hubs still
dominate traffic while the tail supplies flavour.

### 5.6 Curation framework — extending beyond the 33
A repeatable loop so the roster grows without lopsiding:
1. **Diversity rubric.** Score each candidate on four axes — *region, cargo/
   function, route-type, polity* — where a candidate's **interest score** = how
   much it fills an *under-covered* axis in the current roster.
2. **Research pass** (as with the 33) → verify → **add the highest
   diversity-gain candidates** → re-bake. Still-thin axes to target next: Korea,
   Vietnam, Coromandel/Malabar/Bengal, the Swahili coast, the Baltic micro-
   carriers, the American silver termini, whaling & cod stations, frankincense,
   and porcelain entrepôts.
3. **Storage.** Candidates live and grow in `research/minor-ports-*`; a port is
   **promoted** into `data-src/` (and its routes baked) only when it enters the
   sim. This keeps the research roster extensible and the sim roster deliberate.

### 5.7 Where it lands in the sequence
- **Step 2 (before Phase 1):** the data extensions (§5.3) + the curation rubric
  (§5.6). One authoring pass so cargoes/flags/rigs are extended once.
- **Phase B:** bake the selected minor ports' routes alongside the backbone;
  switch on their (low, era-gated) spawn weights.

---

## 6. Tradeoffs & risks

- **Fidelity vs. effort:** Phase A is cheap but early-period is coarse; Phase B
  (backbone + diversity) is faithful but a real re-bake.
- **Bake cost scales with total ports:** 15 → ~40–55 ports ⇒ ~640–880 fields
  (from 240). Offline, one-time, but a chunk; do backbone + minor in one pass.
- **Wind calibration:** the archived climatology is 18th-c-tuned; reusing it for
  1550s and for exotic locations is "roughly right" (wind belts ~stationary) —
  exactly the "weighted-around-historical" bar.
- **Non-European polars:** map (junk≈indiaman, dhow≈brig) vs. author new polars.
- **Diversity-weight tuning:** minor ports must appear often enough to be seen,
  rarely enough not to distort the historical mix — a single tunable band.
- **Data volume:** extending ship-types/powers/cargoes/lanes to 1550 + the
  diversity layer is a Milestone-1-scale authoring pass (front-loaded at Step 2).

---

## 7. Open decisions (resolve before Phase B)

1. **Backbone-first vs. backbone+diversity together** in Phase B (recommend
   together, to bake wind-fields once).
2. **How many minor ports** to promote into the sim (the 33 + how many more), and
   the target size of the full port universe.
3. **Non-European rigs:** map to existing polars or author new ones.
4. **Diversity-layer weight:** how visible the minor ports are in traffic.
5. **Movement fidelity floor:** accept 18th-c wind fields for all eras, or
   attempt era-adjusted climatology (likely out of scope).
