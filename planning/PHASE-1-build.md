# Phase 1 — The World Build (tracker)

*The build that makes Phase-RB's staged research real: era 1550→**1850**, the
1815–50 flow systems folded, the new ports baked, the approved framing texts
enforced, the epilogue decade designed. This is RANKING.md's Phase 1 (was queue
step 8 = PLAN-4 E-S + PLAN-6 X-S). **Any session resumes here:** find the first
increment not ✅, read its note, continue.*

## Method — rate-aware, loss-proof (same discipline as the RB campaign)

- **Small committed increments.** Each increment is one coherent change +
  `npm run build:data` (and `build:routes` when ports/lanes change) + `npm test`
  green + a commit. Nothing half-done spans a commit boundary.
- **Additive-safe first, the disruptive clock-flip LAST.** Every increment
  before the clock-flip leaves the *running* 1550→1815 sim behaviourally
  identical (new data era-gates ≥1815, so it doesn't spawn until the clock
  opens). The one disruptive step — flipping the world clock to 1850, bumping
  `DATASET_VERSION`, re-pinning tests — happens once, at the end, atomically.
- **Read `pipeline/README.md` before ANY baker work.** The route bake reuses
  the archived wind/current engine with three corrections (ice cap, isthmus
  seals, Drake cap); do not touch it blind.
- **Never break determinism silently.** The clock constants change fingerprints
  by design (that's why the version bumps + saves reset); everything *before*
  the flip must keep fingerprints identical — verify with `npm test`.

## Where the load-bearing constants live (pinned 2026-07-18)

| Thing | File · symbol | Current | Target |
|---|---|---|---|
| World clock era | `world.js:20` `ERA` | `{from:1550, to:1815}` | `{from:1550, to:1850}` |
| Reset ramp | `world.js:21` `RESET_YEARS` | `5` (1815→1820) | epilogue decade (see §Epilogue) |
| Cycle period | `world.js:22` `CYCLE_YEARS` | `270` | `310` (300 fwd + 10 epilogue) |
| Fold/validate scope | `pipeline/build-data.mjs:23` `ERA` | `{from:1550, to:1815}` | `{from:1550, to:1850}` |
| **Scope gate** | `build-data.mjs:55` `inEra` | **hard-errors on era.to > 1815** | widens with the ERA change |
| Dataset version | `build-data.mjs:22` `DATASET_VERSION` | `4` | `5` (resets old saves) |
| Hardcoded reset year | `main.js:145`, `main.js:526` | `1815` | `1850` |
| Coverage report decades | `build-data.mjs:269` | `[1550,1650,1750,1810]` | add `1850` |

**The gate that dictates order:** `build-data.mjs:55` rejects any flow system
whose `era.to > 1815`. So the 1815–50 systems **cannot be authored into the
basin JSONs until `build-data`'s `ERA.to` is widened to 1850** (increment 2).
Widening it does NOT move the world clock (that's `world.js`, increment ~7), so
the sim keeps flowing 1550→1815 while the late-era data accumulates unsailed.

## Increment checklist (safe → disruptive)

- [ ] **1 — Epilogue-decade design spec** *(this doc, §Epilogue below; design only, no code)*. ✅ increment-1 content is written; ratify/adjust before the clock-flip (increment 7).
- [ ] **2 — Widen the validation/fold scope.** `build-data.mjs` `ERA.to → 1850` + add `1850` to the coverage-report decades. **⚠ NOT a no-op (probed 2026-07-18):** widening the era makes each port's default lifecycle window `{1550,1850}`, so `eraNames` must tile to 1850 — `build:data` errors until the **last `eraName` window of 7 ports is extended 1815→1850**: `gothenburg` (Gothenburg 1621–), `kingston` (Kingston 1693–), `batavia` (Batavia 1619–), `louisbourg` (St John's 1759–), `bombay` (Bombay 1661–), `madras` (Madras 1639–), `calcutta` (Calcutta 1690–). All seven kept their names 1815–1850, so the extension is historically safe (the RC sweep can refine). Bundle the ERA widen + these 7 `eraNames` edits in ONE commit; `npm run build:data` + `npm test`. *(Powers/shipTypes ending 1815 stay valid — they're within scope; their late-era activity is a data-completeness question for increments 3–5, not a validation error.)*
- [ ] **3 — Author the 1815–50 basin extensions** into the six `research/flows/*.json`, **one basin per commit**, from the staged chunk-5/6/7 synthesis (`atlantic-1815-1850.md`, `east-asia-io-1815-1850.md`, `baltic-med-bengal-1815-1850.md`): extend surviving systems' `era.to` + add `byDecade` 1820/1830/1840/1850 ranges; add the new systems (illegal-era Brazil/Cuba, cotton-gulf-liverpool, bna-timber-emigrants, emigrant-packets, brazil-coffee, plata-republics-trade, around-the-horn-pacific, treaty-port-trade, opium-carriage, zanzibar, mauritius-sugar, indenture, black-sea-grain, alexandria-cotton, sicily-sulphur, singapore-entrepot, nhm-java, manila, german-emigration-atlantic…). Each with cargo/shipTypes ids that resolve, lanes summing ~1.0, evidence class, and — for coerced systems — the **approved framing blocks** (§Framing below). Run `research/tools/validate-flows.mjs` + `npm run build:data` + `npm test` per basin. Commit per basin.
- [ ] **4 — Author the T8/T12 new SYSTEMS** (barbary-concessions, barbary-regency-exports, guianas-plantations, logwood-mahogany, pacific-colonial-spanish, guayaquil-cacao, nootka-fur, bantam-pepper, ostend-interlude/fold) into their basins, from `port-flow-candidates-2026-07-18.md` + `-T12-addenda.md`. Same validation. Commit per basin/group.
- [ ] **5 — New PORTS into `data-src/ports.json`** (no bake yet): the PLAN-4/6 five + Montevideo/Basra/York-Factory/Port-Louis/whaling-grounds + the T8/T12 promotions (Ostend, Bantam, Callao, Guayaquil, Nootka, Algiers, Tunis, Tripoli, Alexandria, Curaçao, St Thomas, Paramaribo, Belize). Coords, `active{from,to}` windows, `eraNames`/`eraPowers` where flagged, `simProxy: null`. Add new powers (`algiers/tunis/tripoli/morocco`) + name/captain pools. `npm run build:data` + `npm test`. Commit in logical groups.
- [ ] **6 — BAKE routes for the new ports/lanes.** `pipeline/README.md` FIRST. Ocean-cell snap per port; routing-field-coverage check (Cape Horn ~56°S, Tasman ~48°S, NW coast ~50°N — flagged in the research); `npm run build:routes`. Commit. *One combined bake beats several — batch all new ports.*
- [ ] **7 — THE CLOCK-FLIP (disruptive, atomic).** `world.js` `ERA.to → 1850`, `RESET_YEARS → 10` (the epilogue), `CYCLE_YEARS → 310`; the epilogue presentation (§Epilogue); `main.js` reset-year `1815 → 1850`; `build-data.mjs` `DATASET_VERSION → 5`. Re-pin every test to the new clock math (determinism, cycle, port-lifecycle). `npm run build` + `npm test` green. Commit. **Saves reset here by design.**
- [ ] **8 — X-S3/E-S2 surfacing.** Era HUD speaks 1550–1850; silences page absorbs the ~11 new entries; about page + declared-divergences (incl. steam) updated; hazard zones (caribbean-golden-age-piracy, W-Med corsair) + `scriptedOnly` ports (Dejima) live; ledger evidence lines; the Mascarene `notes` line. `name-pressure.mjs` re-gate over the 310-yr cycle (new powers). Commit.
- [ ] **9 — Verify end-to-end** (headless: the sim flows 1550→1850, the epilogue reads right, new ports sail, coerced ledgers show the approved framing, no console errors). Update `research/rb-campaign.md` cross-refs, CLAUDE.md/AGENTS.md status, SOURCES.md. Final commit.

## §Framing — the eight approved coerced-flow blocks

Written at increment 3/4 onto their systems, verbatim from
`research/flows/e-r1-closeout-and-framing-signoff.md` Part B (user-approved
2026-07-18): `brazil-illegal-era`, `cuba-illegal-era`, `neworleans-coastwise`,
`plata-montevideo`, `west-africa-squadron` (a `note`), `indenture`,
`amoy-emigration`, `sydney-convicts`. Each as `framing{sober:true, label:
"coerced human movement", description: <approved text>, rule: <the shared no-
value-framing rule string>}`. The Mascarene tail **inherits**
`indian-ocean-slave-trades.framing` + a one-line `notes`. The three R3 blocks
are already cleaned/live.

## §Epilogue — the designed decade 1850→1860 (increment-1 deliverable)

**PLAN-6 D3:** the reset is a *designed epilogue decade*, not the mechanical
stretched blend — though the blend machinery stays as the fallback underneath.

**Spec:**
- **Clock:** the forward era is 1550→1850 (300 years). The epilogue runs
  **1850→1860 (10 years)**, giving `CYCLE_YEARS = 310`. The cycle then loops to
  1550. (Replaces the current 5-year 1815→1820 ramp.)
- **What the blend does (unchanged mechanic):** across the 10 epilogue years the
  spawn distribution ramps from the realized **1850 totals** back toward the
  **1550s** distribution (the existing `cal.reset` 0→1 lerp between the 1810s and
  1550s decade weights, re-centred on 1850s→1550s). This stays deterministic
  (seed + sim-time) exactly as today.
- **The DESIGNED layer on top (the "epilogue", not just a blend):**
  1. **A wind-down taper.** Sail traffic *thins* across the decade — an
     era-end spawn-rate taper (multiplying the existing normalized drift) so the
     age of sail visibly closes rather than merely cross-fading. Bottoms out near
     the 1550-reopen, so the loop's seam reads as "the age ends, and begins
     again," not a jump-cut.
  2. **Steam as a declared boundary (D1), surfaced not sailed.** During the
     epilogue the HUD carries a one-line era note ("1850 — the age of steam
     begins; this chart follows sail") and the declared-divergences paragraph
     covers it. **No steamer tracks** (the wind engine cannot produce them);
     steam is the silences-register entry + the note. The P&O/Cunard steam layer
     is the deferred T11 feature.
  3. **A quiet seam.** No war/loss spikes scripted into the epilogue; it is the
     calm at the end of the record before 1550 reopens.
- **Fallback:** if the designed taper/HUD is deferred, the underlying blend
  alone still produces a correct (if plainer) 10-year reset — so increment 7 can
  ship the clock-flip with the blend and layer the designed presentation as a
  fast-follow without re-pinning the clock.
- **Determinism/tests:** `CYCLE_YEARS 270→310` changes all cycle math →
  fingerprints move by design (hence `DATASET_VERSION 4→5` + save reset). The
  determinism, granularity-independence, and port-lifecycle-window tests re-pin
  to 310; the cycle-wrap tests assert the epilogue seam.

## Current state

**Increment 1 (this doc + the epilogue spec) landed 2026-07-18.** Increment 2
was **probed 2026-07-18** and found to couple to the 7-port `eraNames` tiling
(see its note); the probe was reverted clean (build green at 1815, 53 tests
pass) rather than shipped as a fiddly orphan. Next up: execute increment 2 as
specified (ERA widen + the 7 `eraNames` extensions, one commit), then the basin
authoring (increment 3) begins. The tree is at a clean, deployable 1815 state.
