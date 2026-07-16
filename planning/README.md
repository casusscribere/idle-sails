# planning/ — design & feature planning documents

Everything Claude-authored that plans *what to build* lives here. It is
deliberately separate from two neighbours:

- **`feature-ideas/`** (untracked) — the user's own raw sketches
  (`ideas.txt`, `tweaks.txt`). Human-written input; never edited by agents.
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
| [RANKING.md](RANKING.md) | 🔄 **live** | The feature-pass sequencing: `ideas.txt` ranked by feasibility × performance, the three-layer slider architecture, the pass ledger (0–3 shipped; 3.5, 4, 5, 6 open — Aubrey easter eggs are pass 6, deliberately after the movement patterns), and the outside-the-ladder items (new chart views, convoys, tweaks). |
| [PLAN-convoys.md](PLAN-convoys.md) | 📋 drafted, unbuilt | Full implementation plan for convoys (sim/render/UI/data/tests). Feasible now — does not break fate-at-spawn. Research task T9 (Phase RB) refines its rates without gating it. |

## Conventions

- A plan carries its own **status header** and, once adopted, a **decision
  ledger** — decisions and their dates stay in the plan that made them.
  Completed plans are kept verbatim as the project's design record; they are
  not merged or pruned.
- Numbered `PLAN-N` documents are era/architecture plans; named plans
  (`PLAN-convoys`) are single-feature specs; `RANKING.md` sequences the
  feature passes and points at the research gates in `research/TASKS.md`.
- **Sync directive:** `RANKING.md` ends with **the interleaved queue** — the
  one recommended order merging feature passes, research phases, and pending
  adoption decisions. **Any edit to a document in this directory, to
  `research/TASKS.md`, or to an adoption status must update that queue in
  the same change.** A plan edit that doesn't touch the queue should say why
  (e.g. "no ordering impact").
- A future PLAN-5 (vessel persistence / capture / chases — see RANKING.md
  Pass 5 and research task T7) belongs here when drafted. **The number 5 is
  reserved for it** — the temporal expansion was numbered PLAN-6 to keep the
  many existing "PLAN-5 material" references true.
