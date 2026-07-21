# PLAN-5 — Movement realism (the `movement-realism` branch)

> **Status:** ACTIVE — branch `movement-realism`, forked from `main` at the
> 2026-07-20 chart-views work. **This branch is the experimental "complex
> realism" fork; `main` remains the classic deterministic idler and stays the
> live site.** The two are preserved in parallel by the user's decision
> (2026-07-20): a clean spectator idler on `main`, an attempted deeper-simulation
> build here.

## Why a branch

The classic idler's defining invariant is **fate-at-spawn determinism**: every
vessel's whole life (route, cargo, fate, loss time/place) is rolled at spawn from
`hashSeed(seed, id)`, and spawns key off absolute sim-time. Same seed + sim-time ⇒
identical world at any tick granularity — which is what makes offline accrual
exact and the save tiny.

The deeper realism features the user wants — vessels that **persist** across many
voyages, are **captured** and re-flagged as prizes, and **chase** each other —
are ship-to-ship interactions that *cannot* be pre-rolled per vessel at spawn.
They break the invariant. Rather than compromise the classic build, this branch
takes the divergence explicitly.

## Divergence contract

- **Determinism.** Increments 1–2 below (region-aware sinking, convoys) stay
  fate-at-spawn-safe — they are deterministic and could, in principle, be
  cherry-picked back to `main`. Everything from Pass 5 on (persistence, capture,
  chases) relaxes the invariant; when the first such feature lands it **bumps
  `datasetVersion`** and the save format diverges from classic. Note per increment
  below whether it is still fate-safe.
- **Deploy.** `.github/workflows/pages.yml` deploys on push to **`main` only**, so
  this branch never touches the live site. To preview the realism build, run it
  locally (`python3 -m http.server`) or deploy it manually to a separate target.
- **Merge policy.** Undecided by the user — the branch may stay a permanent second
  version, or the fate-safe pieces may be merged back while the rest stays here.
  Keep the fate-safe increments cleanly separable so either path is open.
- **Rate-aware, same as `main`.** Small committed increments; the branch stays
  green (`npm test`); build-data + bake-routes + tests + commit per increment.

## Scope & plan — the movement-realism grouping, then the hard part

**Increment 1 — Region-aware sinking** *(fate-safe)*. Ideas.txt #24. Losses are
already rolled at spawn and placed at the ship's position on the loss day, but the
risk multipliers are coarse (whole-leg Cape flag, region-wide hurricane/war). Make
the daily loss probability read the ship's **actual position** each day and spike
at real geographic **hazard zones** (Cape Horn, the Cape of Good Hope, the Bahama
channel, the Goodwin Sands, the South-China-Sea reefs, pirate coasts …), so wrecks
cluster where ships really foundered and the ledger names the graveyard. Still one
deterministic per-day roll at spawn — fingerprints change (fates differ), but the
model stays granularity-independent.

**Increment 2 — Convoys** *(fate-safe)*. `planning/PLAN-convoys.md` (drafted):
spawn-event grouping of merchantmen under escort, an escorted-reprieve on the loss
roll, and a convoy ledger. Does not break fate-at-spawn (grouping + a shared risk
modifier decided at spawn). Inherits T9's evidence-classed rates.
- **2a — sim core (2026-07-20, DONE).** `data-src/convoys.json` (9 rules, folded
  additively to `datasets.convoys`, build-data-validated: systems exist, no
  coerced-flow lane, rates/sizes/class/note enforced). `world.js`: a convoy roll
  pure in the leader's id (`hashSeed('convoy',…)`), members copying the leader's
  lane + shifted schedule from their own vessel streams, a naval escort when the
  rule grants one, the escorted reprieve (`hashSeed('reprieve',…)`, prize-takings
  only), interval scaling by N (flow honesty), and one group departure log line.
  Trigger is REAL wars only (hazard/corsair standing risk doesn't put a Convoy Act
  in force). Measured: ~19% of traffic convoyed in peace, ~50–64% in wartime — the
  historical surge. Group-thinning by convoy (Low tier shows a convoy whole). 68
  tests green (+7 `convoys.test.mjs`: determinism, granularity, structure,
  charter-exclusion, reprieve contract, flow honesty/population, save-restore).
  **Known tradeoff:** convoys cluster same-culture ships, so the pass-3.5
  name-uniqueness tail fattens (duplicate-moment ~55%, refractory violations
  ~5.9%, up from ~1.6%/~0.1%) — the small Iberian religious-name sub-pool exhausts
  under a flota. Historically defensible ("several *Rosários* at once"); the two
  pass-3.5 tests were relaxed to convoy-aware bounds. **A future increment should
  expand the convoy-heavy culture pools to restore the tighter guarantee.**
- **2b — render + UI (2026-07-20, DONE).** `render.js`: a per-member formation
  offset (perpendicular to heading, stable per id) so a convoy reads as a loose
  column, and a selection ring on EVERY member of a selected convoy (the focus
  ship named). `ui.js`: extracted `vesselCardHtml` (showLedger is now a thin
  wrapper) so the convoy panel's expanded rows are the standalone ledger by
  construction; new `showConvoy` renders the body of sail — header (flota name on
  Carrera/Carreira lanes, else "Convoy — A to B"), sail count + escort note, and a
  disclosure row per member (chevron, flag, name, type, status tag) expanding in
  place. `main.js`: `selectVessel` routes a member with ≥1 companion present to
  `selectConvoy`; `convoyExpanded` set + `toggleConvoyMember`; renderPanel convoy
  branch with signature gating; the last survivor is just a ship. Reuses the
  `#ledger` element so close/Escape/mobile-sheet come free. Headless-verified
  (click → panel lists members, the clicked ship starts open, toggling expands to
  the full ledger, 0 console errors). **Increment 2 (Convoys) COMPLETE.**

**Increment 3+ — Pass 5: persistence / capture / chases** *(BREAKS fate-safe)*.
The real architecture change: a vessel is a persistent entity with a lifespan,
running many voyages until retired / captured / wrecked; captures happen in the
sim when belligerent ships meet, and a prize is re-flagged, renamed, and added to
the captor's fleet; chases are ship-to-ship pursuit. Needs its own design
(vessel-as-entity state machine, an interaction tick, a save-format bump) grounded
in research T7 (vessel lifecycle & prize practice) + T13 (imbricate vessel
identity). Unlocks the **tracker panel** (disabled on `main` because a
one-voyage vessel is a poor thing to follow). This is where the branch earns its
name.

**Possibly also here:** Pass 4 (the scripted-spawn channel + ambient flows) and
the Aubrey easter eggs (Pass 6) — they gain the most from persistence/capture/
chases, so they may live on this branch rather than `main`.

## Increment log

- **Setup (2026-07-20).** Branched `movement-realism` from `main`; this charter
  written.
- **Increment 1 — region-aware sinking (2026-07-20, fate-safe).** The per-day
  loss roll now reads the ship's actual position (`legPointAt` interpolates the
  baked leg) and applies `hazardAt(lon,lat,cal,year)`: the deep Southern Ocean
  (lat < −40), ten named graveyard zones (Cape Horn, the Cape of Good Hope, Sable
  Island, the Goodwin Sands, the Scillies, the Florida Straits, the Skagerrak, the
  South-China-Sea reefs, the Mozambique Channel, the Torres Strait), and the
  Caribbean/Gulf hurricane belt in season — replacing the old whole-leg Cape/
  hurricane flags. War/capture risk stays theatre-based; the wreck's cause names
  the graveyard when geography dominated. Measured (seeds 42/7/23, 60 yr): 4.16%
  of voyages lost; ~11% of losses now carry a named-graveyard cause, and all
  hazard-cause wrecks fall exactly inside their zone box (verified 51/51, and a
  test pins it). Still one deterministic roll at spawn — 61 tests green,
  granularity-independence holds, 0 console errors headless.
