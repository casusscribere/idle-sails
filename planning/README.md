# planning/ — design & feature planning documents

Everything Claude-authored that plans *what to build* lives here. It is
deliberately separate from two neighbours:

- **`feature-ideas/`** (untracked) — the user's own raw sketches
  (`ideas.txt`, `research_addenda.txt`, `research_refinements`,
  `procgen_variant.txt`; `tweaks.txt` was emptied on 2026-07-21 when its
  contents were folded into `ideas.txt`). Human-written input; never edited by
  agents. Two of them carry standing agent instructions in their headers —
  `research_refinements` is **locked** (see REFINEMENTS.md) and
  `procgen_variant.txt` is **out of scope for this version**.
- **`research/`** — evidence work: the research task queue (`TASKS.md`),
  the promotion rubric (`CURATION.md`), datasets, and reference pages.
  Research tasks gate feature passes but are not feature plans.

Reading order for a fresh session: `CLAUDE.md` → this index → whichever
document is live for the work at hand.

## The documents

| Document | Status | What it is |
|---|---|---|
| [PLAN-1-rebuild.md](PLAN-1-rebuild.md) | ✅ complete (M1–M7) | The ground-up rebuild design — architecture, datasets, generator, sim loop, milestones. Still the architecture reference. |
| [PLAN-2-flowing-era.md](PLAN-2-flowing-era.md) | ✅ complete / partly superseded | The flowing 1550→1815 clock + minor-ports diversity layer. Its Phase B and §7 were re-scoped by PLAN-3 (Phase S2). |
| [PLAN-3-flows.md](PLAN-3-flows.md) | ✅ complete | The evidence-classed trade-system flow matrix (counted/proxied/reconstructed/asserted), the sensitization charter (§1), and the R1→S3 phase ledger. |
| [PLAN-4-expansion.md](PLAN-4-expansion.md) | ✅ **adopted 2026-07-16** (unbuilt) | The wider-world expansion (Montevideo, Basra, whaling grounds, Hudson Bay, Port Louis…). All five Tier-1 in wave 1; §3 decisions recorded in its ledger. E-R1 rides the Phase-RB research campaign. |
| [PLAN-6-era-1850.md](PLAN-6-era-1850.md) | ✅ **adopted 2026-07-16** (unbuilt) | The temporal expansion: era 1550→1850, reset 1850→1860 (310-yr loop). §6 decisions recorded in its ledger — steam is a declared boundary (layer queued via T11), reset ramp is a designed epilogue decade, all five new ports in. X-R1 = research task T10 (Phase RB). |
| [RANKING.md](RANKING.md) | 🔄 **live** | **The work queue.** Renumbered 2026-07-21: one flat typed ID space (**F-** feature · **R-** research · **D-** decision · **L-** locked) ordered by **waves W1–W6** plus LOCKED. Carries the three-layer slider architecture, the old→new ID map, and the recommended pull order. |
| [SHIPPED.md](SHIPPED.md) | 📖 record | The build record moved out of RANKING in the same renumbering. Keeps the **old** identifiers (Pass 0–3.5, Phase 1/4, Batch P–Z, T1–T15) verbatim, since that is how shipped work is cited across the repo. |
| [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) | ❓ **live** | The **D-nn** decisions blocking queued work, with options and a recommendation each. Items blocked on one say so in their RANKING row. |
| [REFINEMENTS.md](REFINEMENTS.md) | 🔒 locked | Mirror of `feature-ideas/research_refinements` (L-01) — full re-review passes over port histories, name lists, routes-vs-real-map-data, weather, and cargo flows. **Not queued**, by its own header. Records where it collides with live items. |
| [PLAN-7-routing.md](PLAN-7-routing.md) | 📋 **drafted 2026-07-21**, unadopted | The routing rebuild + its verification suite. Supersedes L-02 and unlocks the refinement track's §1c. Phase 0 (the harness, built against the CURRENT engine) ships before any rebuild decision. Corrects three queue beliefs: the wind field is ~15 hardcoded constants not data; the square legs are 8-neighbour connectivity not grid resolution; a whole voyage is routed in its departure season's wind. |
| [PLAN-convoys.md](PLAN-convoys.md) | 📋 drafted, unbuilt | Full implementation plan for convoys (sim/render/UI/data/tests). Feasible now — does not break fate-at-spawn. Research task T9 (Phase RB) refines its rates without gating it. |
| [PHASE-1-build.md](PHASE-1-build.md) | 🔨 **in progress** | The World Build tracker (RANKING Phase 1 = PLAN-4 E-S + PLAN-6 X-S): era→1850, fold the 1815–50 systems, bake the new ports, enforce the approved framing, design the epilogue decade. Rate-aware increment checklist; the disruptive clock-flip is last. Increment 1 (epilogue spec) done 2026-07-18. |

## Conventions

- A plan carries its own **status header** and, once adopted, a **decision
  ledger** — decisions and their dates stay in the plan that made them.
  Completed plans are kept verbatim as the project's design record; they are
  not merged or pruned.
- Numbered `PLAN-N` documents are era/architecture plans; named plans
  (`PLAN-convoys`) are single-feature specs; `RANKING.md` sequences the work
  and points at the research content in `research/TASKS.md`.
- **Task nomenclature (2026-07-21).** One flat ID space, one ordering axis.
  IDs are **permanent** — `F-nn` build · `R-nn` research · `D-nn` user
  decision · `L-nn` locked — and are never reused or renumbered. Ordering is
  by **wave** (`W1` corrections → `W2` fidelity data → `W3` movement →
  `W4` legibility → `W5` sim redesign → `W6` capstone, plus `LOCKED`); an
  item's wave may change, its ID may not. The retired schemes (Pass 0–6,
  Phase RA–RD, Phase 1–6, Batch P–Z, T1–T15) are mapped in RANKING §3 and
  survive verbatim in `SHIPPED.md`.
- **Sync directive:** **any edit to a document in this directory, to
  `research/TASKS.md`, or to an adoption status must update the matching wave
  table in `RANKING.md` in the same change.** A plan edit that doesn't touch
  the queue should say why (e.g. "no ordering impact"). `research/TASKS.md`
  holds a research task's *content*; `RANKING.md` holds its *position*.
- A future PLAN-5 (vessel persistence / capture / chases — see RANKING.md
  Pass 5 and research task T7) belongs here when drafted. **The number 5 is
  reserved for it** — the temporal expansion was numbered PLAN-6 to keep the
  many existing "PLAN-5 material" references true.
