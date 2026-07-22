# BRANCH: `routing-rebuild`

> **You are on the routing-rebuild branch.** Check with
> `git branch --show-current`. This file exists **only on this branch** — if you
> can read it, that is the confirmation.

**Charter:** `planning/PLAN-7-routing.md` (on both branches). This file carries
only what is specific to working *here*.

Deliberately a separate file rather than a marker in `CLAUDE.md`: the last
long-lived branch put its marker in CLAUDE.md and AGENTS.md, and both conflicted
on merge because `main` edits those files constantly. A branch-only file cannot
conflict with anything.

---

## What belongs on this branch

Everything from **CR-1** onward in PLAN-7 §11:

| | |
|---|---|
| **R-11** | The historical route corpus — find, do not generate |
| **R-12** | Programmatic best practices for route generation |
| **CR-2** | The decision point — answer **D-19** and **D-20** against the baseline |
| **F-42** | Physics: wind + current fields |
| **F-43** | Algorithm & geometry (connectivity / any-angle / coastal resolution) |
| **F-44** | Time-dependent routing |
| **F-45** | Calibration under holdout discipline |
| **F-46** | The re-bake — folded into C2's single bake |

## What does NOT belong here

- **F-41, the harness.** It lives on `main`. It is an instrument: it changes no
  parameter, bakes nothing, and cannot move a ship. Fixes to the harness go to
  `main` and come back by merge, so both branches always measure the same way.
- **Anything unrelated to routing.** W1/W3/W4 items belong on `main`. If you find
  yourself fixing a menu here, you are on the wrong branch.

---

## The rules, and why each one exists

Written down because `movement-realism` taught every one of them the hard way.
That branch drifted three commits behind `main`, never received the via-chain
waystations, and was the sole home of convoys — so convoys appeared to "stop
spawning" when in truth they had never existed on the branch that deploys. The
divergence also concealed a real defect: the region-aware fate roll read segment
progress as 0→1 of a *whole shared polyline*, which was harmless against that
branch's 22 single-via lanes and put a Florida Straits wreck at −65.2°E once
merged against main's 54 chained ones.

1. **Merge `main` → here whenever main touches `world.js`, `pipeline/`,
   `data-src/`, or `data/`.** Not at the end. The bug above existed for a day on
   one branch and became visible only at merge; a week of drift would have made
   it far worse.
2. **This branch never deploys.** Only `main` does, on push. Nothing here is
   live until it is merged.
3. **No feature may live only here for long.** If a piece is ready and safe,
   merge it. A long-lived exclusive feature is exactly how the last confusion
   started.
4. **Run the harness on both sides of every merge:**
   ```
   node research/tools/route-verify.mjs --json=/tmp/before.json   # on main
   node research/tools/route-verify.mjs --json=/tmp/after.json    # here
   diff /tmp/before.json /tmp/after.json
   ```
   The report is byte-identical for an unchanged bundle, so any diff is a real
   change in what the routes do. **This is the check that did not exist last
   time**, and it is the whole reason Phase 0 was built first.
5. **Every re-bake bumps `DATASET_VERSION`** in `pipeline/build-data.mjs` and
   discards saves. Say so in the commit message; do not let a save silently
   resume into a world that no longer generates it.

---

## Working state

| | |
|---|---|
| **Branched from** | `main` @ the F-41 commit + its branch note |
| **Baseline to beat** | `research/routes/baseline-2026-07-21.json` — 10/414 lanes covered (2.4%), 404 unverified, 21/21 claims passing |
| **Next action** | **R-11 ‖ R-12**, in parallel. No engine change before CR-2. |
| **Open decisions** | **D-19** (grid & algorithm), **D-20** (physics depth) — both answered at CR-2, against evidence, not intuition |

### The two fixes that ship regardless of D-20

Independent of whatever the baseline says, both are defects on their own terms
(PLAN-7 §4):

- **Currents are added as a scalar projection** onto boat speed
  (`spd += cspd·cos θ` in `archive/isochrone-v1/pipeline/router.mjs`) rather than
  composed as vectors with the boat's velocity through the water. That is not how
  a ship moves in a current.
- **The 0.4 m/s speed floor** is an undocumented magic number doing real work in
  light airs. It needs a bound, a source, and an evidence class.

### The standing warning

PLAN-7 §10, repeated here because this is the branch where it could actually
happen: **do not let the corpus's shape become the world's shape.** The evidence
is densest for European long-haul shipping after about 1750. If the router is
tuned until those routes are perfect, the chart will have been quietly rebuilt
around the archive's bias rather than the past's — which is the exact failure the
sensitization charter exists to prevent. Stratified reporting is the guard, and
it is not optional.
