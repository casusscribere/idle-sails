# Idle Sails — Age-of-Sail Vessel Idler

A zero-friction browser **idler**: leave the tab open and a plausible age-of-sail
world sails itself. Vessels are **procedurally generated** from a curated
historical dataset — believable names, rigs, tonnages, flags, cargoes — and set
out on realistic wind-and-current routes between historical ports. Ships spawn,
cross the world, call at ports, and are lost or arrive over (accelerated) time.

The player is a **spectator**, not a manager. The entire control surface is:

1. a **Speed** slider (how fast sim-time runs), and
2. **click a vessel** → a sidebar showing its tonnage, ship type, allegiance,
   cargo (if any), and itinerary.

Nothing to build, buy, or win. The pleasure is a living, historically-textured
sea that keeps going while you're away.

---

## 0. Assumed decisions (override any of these)

These were chosen to maximize reuse of the archived engine and match the idler
genre. They are cheap to revisit — flagged here so they're easy to change.

| Decision | Chosen default | Why |
|---|---|---|
| **Movement engine** | Bake realistic route **polylines** offline from the archived time-fields; ship only the polylines (~hundreds of KB), not the 31 MB fields. | Keeps wind/current realism; tiny runtime payload; no field decoding in the browser. |
| **Persistence** | **Persist** world state to `localStorage` with an elapsed-time **offline-accrual** fast-forward on load. | An idler is defined by accruing while closed. |
| **Era scope** | **~1700–1815** (matches the calibrated data, powers, vessels, wars). | Tightest coherence with the reused engine. Broadening (galleons→clippers) is a later extension. |

---

## 1. What we reuse from the archive (`archive/isochrone-v1/`)

The previous project already solved the hard historical/physical modelling. The
idler is a new front-end + generator layered on its outputs.

- **`pipeline/ports.json`** — 15 georeferenced ports (London, Amsterdam,
  Bordeaux, Nantes, Liverpool, Cádiz, Lisbon, Canton, Batavia, Kingston, Dejima,
  Gothenburg, Tranquebar, Whydah, Salvador da Bahia) with lon/lat, controlling
  power, and source-cell indices.
- **`docs/data/fields/*.bin` + `pipeline/router.mjs`** — the wind/current/polar
  least-time model. We run it **once, offline** to bake curved routes between
  ports (see §6). We do *not* ship the fields.
- **`docs/app.js → routeFrom()`** — the downhill route-walk we port into the
  offline baker.
- **`docs/assets/land.geojson`** — coastline for the map.
- **`SOURCES.md`** — sourcing + calibration report that grounds the new
  databases and the "why these tonnages/routes are plausible" story.

---

## 2. Architecture at a glance

```
 ┌─────────────── build time (Node, offline) ───────────────┐
 │  archived router + fields  ──►  bake-routes.mjs           │
 │  curated CSV/JSON datasets ──►  build-data.mjs            │
 └───────────────┬──────────────────────────────────────────┘
                 │  emits small static JSON into /app/data
                 ▼
 ┌─────────────── runtime (browser, no backend) ────────────┐
 │  world.js      generator + simulation (the "engine")     │
 │  render.js     map + moving ship markers (the "view")    │
 │  ui.js         speed slider + click→sidebar (the "input") │
 │  persist.js    localStorage save + offline accrual        │
 └──────────────────────────────────────────────────────────┘
```

Strict separation: `world.js` is headless and deterministic given a seed; it
knows nothing about the DOM. `render.js` only reads world state. This keeps the
sim testable in Node and lets rendering be swapped freely.

---

## 3. The historical datasets (the heart of "plausible")

All curated offline into compact JSON that `build-data.mjs` validates and bundles.
Each is a **weighted vocabulary** the generator samples from, tagged so the
generator can keep a vessel internally consistent (a Bristol slaver shouldn't
carry tea from Canton).

| Dataset | Contents | Drives |
|---|---|---|
| **ship-types** | rig class (frigate, East Indiaman, brig/sloop, snow, fluyt, sloop-of-war, slaver, merchantman), tonnage range (min/mode/max), typical crew, gun range, era window, which powers used it, role tags (naval / merchant / slaver). | Type, tonnage, guns, crew. |
| **names** | Per-power vessel-name pools: naval (HMS *Victory*-style: virtues, mythology, royals, place-names), merchant (owners' wives, saints, hometowns), plus name-construction rules (prefixes HMS/USS/none, *Le/La* for France, *De* for Dutch). | Ship name + prefix. |
| **powers/allegiance** | Britain, France, Dutch Republic, Spain, Portugal, Sweden, Denmark, USA (post-1783), + private/company flags (EIC, VOC, SOIC). Home ports, era of activity, naval vs. merchant propensity, rival relations. | Flag, home port, hostility model. |
| **cargo** | Commodity list with origin regions, value tier, and legal/illicit flags: sugar, rum, tea, silk, porcelain, spices, tobacco, cotton, timber, naval stores, wine, enslaved people (Middle-Passage legs only, clearly framed), specie, mail, ballast (empty). | Cargo + whether the ship carries any. |
| **routes** | Named historical trade lanes tying origin→destination port pairs to plausible cargoes, vessel types, and eras (Middle Passage, China tea trade, Baltic timber, Carrera de Indias, Brouwer route to Batavia, Atlantic triangular trade). | Itinerary + cargo/type coherence. |
| **wars/engagements** | Dated conflicts (War of Spanish Succession … Napoleonic Wars) with belligerent pairs, theatres, and notable battles/actions (Trafalgar, the Saintes, Quiberon Bay). | Wartime risk uplift, escort/convoy behavior, loss events, and flavor in the log. |

Storage: hand-authored `data-src/*.json` (or `.csv` where tabular) → validated,
merged, and minified to `app/data/datasets.json` by `build-data.mjs`. Small
enough to inline; versioned so saves can migrate.

---

## 4. Procedural vessel generation (coherent, not random)

A vessel is assembled by a **constraint-respecting pipeline**, seeded so a given
world is reproducible:

1. **Pick an era-year** within scope (weighted toward well-documented decades).
2. **Pick a route** active in that year (weighted by historical traffic volume —
   the Atlantic triangle and China trade dominate; Dejima is rare).
3. **Derive power/allegiance** from the route's ports and era (respecting who
   controlled what, and monopoly companies).
4. **Pick a ship-type** compatible with {route, power, era} (an Indiaman on the
   China run; a brig on a Baltic hop).
5. **Roll tonnage/guns/crew** from that type's distributions (mode-weighted, not
   uniform — most ships are ordinary).
6. **Name it** from the power's pool with the right prefix/article.
7. **Assign cargo** from the route's plausible commodities (or ballast on a
   return leg); illicit cargo only where historically it occurred.
8. **Build the itinerary** — one or more legs (often out-and-back or a triangle),
   each a baked route polyline with a computed sailing duration.
9. **Apply world state** — if the era-year is a war year and the flag is a
   belligerent, raise loss risk, maybe attach to a convoy, flag hostilities.

Every field shown in the sidebar thus has a traceable, plausible origin. A small
**plausibility self-check** in `build-data.mjs` samples N generated vessels and
asserts no contradictions (wrong-era type, impossible cargo, land-locked route).

---

## 5. Simulation loop & idle mechanics

`world.js` holds `{ seed, simClock, vessels[], log[], nextSpawnAt }` and exposes
`tick(dtSimSeconds)`:

- **Spawn** — a Poisson-ish arrival process gated by `nextSpawnAt`; rate scales
  so an open tab holds a comfortable population (target ~40–120 active vessels).
  Traffic is time-weighted by route volume and season.
- **Advance** — each vessel carries `legProgress` (0–1) along its current
  polyline; `dt × vessel.speedKnots` (from tonnage/type/wind-scaled route
  duration) advances it. Position = interpolate along the polyline.
- **Events** — leg completion → port call (brief dwell, maybe swap cargo) →
  next leg. End of itinerary → arrive & retire (logged). Random loss draw per
  day-at-sea, elevated in war zones / hurricane season / Cape passages (reusing
  the archived risk rationale) → wreck/capture event.
- **Cull** — retired/lost vessels leave the active set after a fade; a rolling
  **log** keeps the last ~200 events for texture.

**Speed slider** maps to a sim-seconds-per-real-second multiplier (e.g.
0.25×–2000×, log scale; 0 = pause). It only changes `dt` fed to `tick()` —
never spawn logic — so the world stays consistent at any speed.

**Offline accrual** (`persist.js`): on load, read saved `{state, savedAt}`,
compute `elapsedReal = now − savedAt`, convert via the *last* speed setting
(capped, e.g. ≤ 30 days sim to bound catch-up cost), and run `tick()` in a few
large steps to fast-forward. Save on a timer + on `visibilitychange`/`beforeunload`.

---

## 6. Offline route baking (`pipeline/bake-routes.mjs`)

Reuse the archived engine to turn the port set into shippable routes:

1. For each `(origin, destination, vessel-class, season)` pair we actually use,
   load the destination's `hours-to-reach` field, walk **downhill from the
   origin cell** (`routeFrom`) to get the curved least-time path, reverse it.
2. **Simplify** (Douglas–Peucker) each path to ~20–60 points; store lon/lat plus
   the total sailing hours (→ base speed).
3. Emit `app/data/routes.json`: `{ id, from, to, vessel, season, coords[], hours }`.
   Only the pairs the route-dataset references — a few hundred, not 15×15×4×4.

If a needed route is missing, either add the port/leg to `ports.json` and
regenerate that field via the archived `build-all.mjs`, or fall back to a
great-circle arc (flagged lower-fidelity).

---

## 7. Rendering & UI

- **Map:** MapLibre GL JS (no token) with an antique style, OR a lighter custom
  `<canvas>` world map drawn from `land.geojson` with an equirectangular
  projection. *Lean toward canvas* for an idler — hundreds of animated markers,
  full control of the age-of-sail aesthetic (parchment, rhumb lines, sepia),
  and no heavy GL layer. Decide at Milestone 3 with a spike.
- **Vessels:** small heading-rotated sail glyphs; size hints at tonnage; tint by
  allegiance. Wakes/rhumb-line trails optional. Hover → name tooltip.
- **Sidebar (on vessel click):** name + prefix, **ship type**, **tonnage**,
  **allegiance** (flag), **cargo** (or "in ballast"), **itinerary** (leg list
  with ports, current leg highlighted, ETA in sim-time), plus flavor (guns/crew,
  war status). Click empty sea to dismiss.
- **Speed slider:** fixed corner control; shows the current multiplier; pause at 0.
- **Ambient counters (optional):** ships at sea, arrived today, lost — reinforces
  the "living world."

Aesthetic direction: parchment/sepia, hand-drawn coastline, compass rose,
period typography. (Invoke the `frontend-design` skill at build time.)

---

## 8. Tech stack & layout

Static, no backend, no framework required. Vanilla ES modules + a small build
step (esbuild or none). Deployable to GitHub Pages / any static host.

The deployable site lives at the **repo root** (so GitHub Pages serves
`index.html` directly):

```
/                     repo root = the deployable static site
  index.html
  main.js             bootstrap + animation loop
  world.js            generator + simulation (headless, seeded, testable)
  render.js           map + markers
  ui.js               slider + vessel/port ledger
  persist.js          localStorage + offline accrual (Milestone 6)
  style.css
  data/               generated: datasets.json, routes.json, land.geojson
  PLAN.md             this file
  README.md           run / build instructions
  data-src/           hand-authored datasets (ship-types, names, powers, cargo,
                      routes, wars) — CSV/JSON, human-editable
  pipeline/
    bake-routes.mjs   archived router → data/routes.json
    build-data.mjs    validate + bundle data-src → data/datasets.json
  test/               node tests for world.js (determinism, plausibility)
  archive/isochrone-v1/   the previous project (see ARCHIVE-NOTE.md)
```

---

## 9. Milestones

1. **Data foundations** — author `data-src/` (ship-types, names, powers, cargo,
   routes, wars); `build-data.mjs` validates & bundles; plausibility self-check
   passes. *(→ datasets.json)*
2. **Route baking** — port `routeFrom` into `bake-routes.mjs`; emit `routes.json`
   for the referenced lanes; verify a few curves look right vs. the archive.
3. **Headless world** — `world.js` generator + `tick()`; Node tests for
   determinism (same seed → same world) and no plausibility contradictions;
   confirm a 24 h fast-forward behaves. *(no UI yet)*
4. **Render spike** — canvas-vs-MapLibre spike; draw land + moving markers from
   world state at speed. Pick the renderer.
5. **UI** — speed slider wired to `tick` dt; click-vessel → sidebar with the
   five required fields + itinerary.
6. **Persistence** — save/restore + offline accrual with catch-up cap; test
   close/reopen accrual.
7. **Polish & deploy** — antique styling (`frontend-design`), ambient counters,
   event log flavor, war-year effects; static deploy.

**Later / optional:** broaden era (galleons→clippers); convoys & named-battle
set-pieces; weather/season cycling the sim clock through; audio ambience;
shareable seed in the URL hash; richer loss narration.

---

## 10. Open questions (from the initial ask — defaults assumed in §0)

1. **Movement engine** — confirm "bake polylines" (§0) vs. shipping the full
   fields (max fidelity, +31 MB) vs. pure great-circle (add any port freely).
2. **Persistence** — confirm offline accrual vs. fresh-each-load, and the
   catch-up cap.
3. **Era scope** — confirm 1700–1815 vs. the broader 1571–1862 age of sail.
4. **Renderer** — canvas (recommended) vs. MapLibre; settled at Milestone 4.
5. **Tone on the slave trade** — it is historically central to this dataset. Plan
   is to represent it factually and soberly (accurate routes/cargoes/mortality
   risk, no euphemism, no gamified reward), consistent with the archive's
   scholarly framing. Confirm this treatment.
