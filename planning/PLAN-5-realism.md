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
