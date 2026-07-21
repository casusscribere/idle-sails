# REFINEMENTS.md — the locked refinement track (L-01)

**Status: 🔒 LOCKED — not in the queue.**

This mirrors `feature-ideas/research_refinements`, whose header carries a
standing agent instruction:

> *do not add items here to general IS to-do or feature lists until unblocked
> or specifically requested by the user. This list should cover
> refinement/redo passes for all systems, as well as test suite improvements
> that connect historical data to tests*

So nothing here is scheduled, and nothing here appears in `RANKING.md`'s waves.
This file exists for two reasons only: to record the track so it is not lost,
and to record **where it collides with work that IS queued** — because four of
its five sections are the deeper version of a live item, and running the
shallow version first may waste the work.

---

## The five review targets

### 1a. Port histories
Review each port's founding, capture(s), renaming(s), and vessel
category/nationality blocking/allowlists. Review all names and dates.

**Collision:** the shallow version is live. `RANKING.md` **R-01** (Japan/sakoku,
including the 1627 Portuguese naus), **R-03** (national port access rules —
which is *literally* "vessel category/nationality blocking/allowlists"), and
**R-04** (Korea/Russian-Pacific verdicts) are all subsets of this section. The
per-port sweep (old T1+T2+T3) already produced the timelines this proposes to
re-review.

### 1b. Namelists and classes
Review all namelists for all vessels, captains, etc.

**Collision:** `RANKING.md` **F-08** is the one-list version of this (the Dutch
list, `'t Vergulde Draeck`). Doing F-08 now and this later means reading the
same sources twice; doing only this means the known-wrong entry stays live
until the track unlocks.

### 1c. Sailing routes
**Find (NOT generate)** as much real map data as possible on historical routes,
compare with the generated routes, and propose solutions to match route
generation to the historical record.

**Collision:** this is the evidence base **L-02** (the routing/wind-chart engine
rebuild) would need, and it is the principled answer to **F-06**'s open
question — are the oddly-square legs an artifact or history? Note the emphasis
in the source: *find, not generate*. That is a charter position — the routes
should be checked against surviving sailing directions, logbooks, and pilot
charts rather than validated against our own engine.

### 1d. Weather patterns
Which zones of the map are more likely to lose ships; which years had
particularly bad hurricane seasons or other relevant weather patterns.

**Collision:** `RANKING.md` **F-13** (region/route-aware sinking) is currently
specified against the *existing* hazard zones. This section is the evidence
that would make F-13 historically grounded rather than plausible — and it adds
a dimension F-13 does not have: **per-year** severity, which would also serve
ideas §6b's "it's really bad this year" (**F-16**).

### 1e. Cargo flows
Which ports consumed/produced different cargos into the ship-flow network.

**Collision:** direct. `RANKING.md` **R-10** is this section, and **F-26**
("show what each port is buying/selling") cannot be honest without it. F-26 has
a cheaper interim — derive from cargoes already carried on modelled lanes,
which claims only "what moved", not "what the port wanted" — but the real
feature waits on this.

---

## Also in scope per the header, not yet enumerated

> *test suite improvements that connect historical data to tests*

No items written yet. Worth noting the existing precedent: `test/regions.test.mjs`
pins each chart plate to the ports it must contain, and `build-data.mjs`
validates that every `eraPowers`/`eraNames` window tiles its port's active
window. Both are already "historical data as a test"; this track would extend
the pattern.

---

## Unlocking

The user unblocks this track, or requests a specific section. Until then, the
only action an agent should take is to answer **D-01** in
[OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) — whether the shallow, queued versions
of 1a/1b/1d/1e proceed now or wait for their deep counterparts here.
