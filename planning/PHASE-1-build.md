# Phase 1 — The World Build (tracker)

*The build that makes Phase-RB's staged research real: era 1550→**1850**, the
1815–50 flow systems folded, the new ports baked, the approved framing texts
enforced, the epilogue decade designed. This is RANKING.md's Phase 1 (was queue
step 8 = PLAN-4 E-S + PLAN-6 X-S). **Any session resumes here:** find the first
increment not ✅, read its note, continue.*

## Method — rate-aware, loss-proof (same discipline as the RB campaign)

- **Work on a branch (`phase-1-world-build`); keep `main` green at 1815.**
  **Finding (probed 2026-07-18): the era is ATOMIC — there is no safe
  intermediate widen.** `build-data`'s ERA scope, `world.js`'s clock ERA, the
  port `eraNames`, and the tests are all bound to a single era-end value: the
  moment build-data admits an 1815–50 system (ERA.to→1850) it *requires* the
  `eraNames` to tile to 1850, and the world.js-based `era names` test then
  *rejects* eraNames that overshoot 1815. So build-data ERA + world.js ERA +
  eraNames + tests must move together — **the clock-flip is one atomic change,
  and it must come FIRST** (you cannot author 1815–50 data behind a 1815 clock).
  But the flip leaves the late era **empty** until the systems are authored — a
  visibly sparse 1815–50. Therefore the whole migration (flip → author → bake →
  surface) lives on a branch; `main` stays deployable at 1815; **merge only when
  the late era is populated and green.**
- **Small committed increments *on the branch*.** Each increment is one coherent
  change + `npm run build:data` (and `build:routes` when ports/lanes change) +
  `npm test` green + a commit. Nothing half-done spans a commit boundary; a
  broken branch tip is fine mid-migration, a broken `main` is not.
- **Read `pipeline/README.md` before ANY baker work.** The route bake reuses
  the archived wind/current engine with three corrections (ice cap, isthmus
  seals, Drake cap); do not touch it blind.
- **Determinism moves by design at the flip.** `CYCLE_YEARS 270→310` changes all
  cycle math ⇒ fingerprints move ⇒ `DATASET_VERSION 4→5` + saves reset + the
  clock tests re-pin. That's the ONE sanctioned fingerprint break; every
  increment *after* the flip keeps the (new) fingerprints stable — verify with
  `npm test`.

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

**The gate that dictates order (revised 2026-07-18):** the era is **atomic**
(see Method). `build-data.mjs:55` rejects any system with `era.to > 1815`; the
moment you widen it, the port `eraNames` must tile to 1850, and the world.js
`era names` test then rejects eraNames past 1815 — so **the clock-flip comes
FIRST**, all at once, and the 1815–50 data is authored *after* it (behind the
already-open clock, filling an initially-empty late era). All of this on the
`phase-1-world-build` branch; `main` stays green at 1815.

## Increment checklist (branch `phase-1-world-build`; flip-first)

- [x] **1 — Epilogue spec + tracker** *(main; done 2026-07-18)*. Design only.
- [ ] **2 — Branch + the ATOMIC CLOCK-FLIP** *(one commit; the old 2+7 merged)*. On `phase-1-world-build`: `world.js` `ERA.to 1815→1850` + `RESET_YEARS 5→10` (⇒ `CYCLE_YEARS 310`; the epilogue **blend** is the fallback, the designed taper/HUD is a fast-follow per §Epilogue); `build-data.mjs` `ERA.to→1850` + `DATASET_VERSION 4→5` + coverage decade `1850`; `main.js:145/526` reset-year `1815→1850`; the **6 erroring `eraNames`** extended 1815→1850 (`gothenburg`, `batavia`, `louisbourg`/St John's, `bombay`, `madras`, `calcutta` — all name-continuous; `kingston` has an explicit `active` to 1815 so it does NOT error, its late-era window is increment 5's job). Re-pin the clock tests (`world.test.mjs`: the `1815→1850`/`1820→1860` asserts + the title; `CYCLE_YEARS` is read dynamically). `npm run build` + `npm test` green. **Expected: an EMPTY late era 1815–1850** (no systems there yet) — correct on the branch; increment 3 fills it. **Saves reset by design (v4→v5).**
- [ ] **3 — Author the 1815–50 basin extensions** into the six `research/flows/*.json`, **one basin per commit**, from the staged chunk-5/6/7 synthesis (`atlantic-1815-1850.md`, `east-asia-io-1815-1850.md`, `baltic-med-bengal-1815-1850.md`): extend surviving systems' `era.to` + add `byDecade` 1820/1830/1840/1850 ranges; add the new systems (illegal-era Brazil/Cuba, cotton-gulf-liverpool, bna-timber-emigrants, emigrant-packets, brazil-coffee, plata-republics-trade, around-the-horn-pacific, treaty-port-trade, opium-carriage, zanzibar, mauritius-sugar, indenture, black-sea-grain, alexandria-cotton, sicily-sulphur, singapore-entrepot, nhm-java, manila, german-emigration-atlantic…). Each with cargo/shipTypes ids that resolve, lanes summing ~1.0, evidence class, and — for coerced systems — the **approved framing blocks** (§Framing). `research/tools/validate-flows.mjs` + `npm run build:data` + `npm test` per basin. Commit per basin. *This is what populates the empty late era.*
- [ ] **4 — Author the T8/T12 new SYSTEMS** (barbary-concessions, barbary-regency-exports, guianas-plantations, logwood-mahogany, pacific-colonial-spanish, guayaquil-cacao, nootka-fur, bantam-pepper, ostend-interlude/fold) into their basins, from `port-flow-candidates-2026-07-18.md` + `-T12-addenda.md`. Same validation. Commit per basin/group.
- [ ] **5 — New PORTS + powers/vocab** (no bake yet): the PLAN-4/6 five + Montevideo/Basra/York-Factory/Port-Louis/whaling-grounds + the T8/T12 promotions (Ostend, Bantam, Callao, Guayaquil, Nootka, Algiers, Tunis, Tripoli, Alexandria, Curaçao, St Thomas, Paramaribo, Belize). Coords, `active{from,to}`, `eraNames`/`eraPowers` where flagged, `simProxy: null`. **Extend the late-era windows** of existing ports that need it (kingston etc.). New powers (`algiers/tunis/tripoli/morocco`) + name/captain pools. `npm run build:data` + `npm test`. Commit in logical groups.
- [ ] **6 — BAKE routes for the new ports/lanes.** `pipeline/README.md` FIRST. Ocean-cell snap per port; routing-field-coverage check (Cape Horn ~56°S, Tasman ~48°S, NW coast ~50°N); `npm run build:routes`. Commit. *One combined bake beats several.*
- [ ] **7 — Surfacing (X-S3/E-S2).** Era HUD speaks 1550–1850; the designed epilogue taper/HUD (§Epilogue); silences page absorbs the ~11 new entries; about + declared-divergences (incl. steam); hazard zones (caribbean-golden-age-piracy, W-Med corsair) + `scriptedOnly` ports (Dejima); ledger evidence lines; the Mascarene `notes`. `name-pressure.mjs` re-gate over the 310-yr cycle. Commit.
- [ ] **8 — Verify + MERGE to `main`.** Headless end-to-end (flows 1550→1850, epilogue reads right, new ports sail, coerced ledgers show the approved framing, no console errors). Update `rb-campaign.md` cross-refs, CLAUDE.md/AGENTS.md, SOURCES.md. **Merge `phase-1-world-build` → `main` only now** — the late era is populated and green. Final commit.

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

**Increment 1 (this doc + epilogue spec) landed on `main` 2026-07-18.** Two
probes on 2026-07-18 established the atomic-era finding (Method): widening
build-data ERA alone → eraNames-tiling error; extending eraNames to 1850 with
world.js still at 1815 → the `era names` test rejects them. Both reverted clean;
**`main` is green at 1815, deployable.** Approach corrected to **flip-first on a
branch**. Next: create `phase-1-world-build` and land increment 2 (the atomic
clock-flip) there — green at 1850 with an intentionally-empty late era, which
increment 3's basin authoring then fills.
