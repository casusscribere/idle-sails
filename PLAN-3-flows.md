# PLAN 3 — Flows, evidence, and silences

**Status:** adopted 2026-07-13 (user-accepted). Extends `PLAN.md` and
`PLAN-2-flowing-era.md`; **supersedes** PLAN-2's Phase B scoping and §7
decision list (re-scoped here as Phase S2), and **dissolves** the "third tier"
question. Nothing built is discarded — see §4.

---

## 0. Why restructure

The review of the tiered rankings (2026-07-13) found the tier/ranking
structure is the wrong primitive for the project's aim — *a historically
weighted simulation of naval traffic worldwide, 1550–1815, sensitized to
silences (Trouillot) and to the Euro-centrism of surviving sources*:

1. **Rankings inherit the archive's shape.** Silences enter at source
   creation and archive assembly (Trouillot's first two moments): the Sound
   Toll and customs series exist because European states taxed those flows.
   The junk trade left no toll series — yet Chinese ocean-going tonnage in
   Asian waters rivalled all European tonnage there combined into the 18th c.
   A rankings→weights pipeline renders unrecorded traffic **zero**, and in a
   spawn model zero is not neutrality — it is an active, repeated claim that
   the ships weren't there.
2. **Ranks are the wrong data type for a traffic sim.** The sim wants flows
   (voyages per lane per decade), not orderings. rank→score→prominence was a
   chain of workarounds to recover flow information the ranking destroyed.
3. **A single global ranking forces the Euro-centrism.** "Was Canton busier
   than London in 1750?" is unanswerable from commensurable sources, so a
   global list silently resolves every such tie toward the better-documented
   side. Traffic is basin-local; only routes connect basins.

## 1. Principles (the sensitization charter)

These govern all data authoring and are mirrored in `CLAUDE.md`/`AGENTS.md`:

1. **No silent zeros.** A trade known to have existed may never be implicitly
   absent. Every flow is `counted`, `proxied`, `reconstructed`, or `asserted`
   — the last meaning *our own estimate with stated bounds and reasoning*.
   A stated ±60% guess is more accurate than an implicit 0.
2. **No fabricated precision.** Rank only where sources support ranking;
   presence-without-rank is a valid, honest state (Istanbul is the exemplar).
3. **Basin-local assembly.** Each basin is anchored to its own best sources
   and scholarship; no forced global commensuration.
4. **Declared boundaries.** Every dataset states what it excludes and why
   (e.g., the rankings' European-commercial-record scope).
5. **The silences register.** Known-but-unquantifiable flows are recorded as
   data — with the reason for the silence and the chosen treatment — and
   surfaced in the UI, not dropped.
6. **Sober treatment of coerced human movement** wherever it appears — the
   Middle-Passage pattern (no value tier, no profit framing, factual, never a
   reward) extends to any promoted coerced flow (Kaffa, Indian Ocean trades).

## 2. Data architecture

**Primitive: the trade system** (not the port). ~50–70 systems across six
basins (Baltic–North Sea · Atlantic · Mediterranean · western Indian Ocean ·
Bengal–SE Asia · East Asia), each with per-decade entries:

```jsonc
{ "system": "baltic-grain-west",   // one named trade, possibly several lanes
  "basin": "baltic-north-sea",
  "decade": 1620,
  "voyagesPerYear": [900, 1400],   // a RANGE, never a point
  "tonnageBand": "small-bulk",      // optional coarse band
  "lanes": [ { "from": "...", "to": "...", "share": 0.4 } ],
  "evidence": "counted",            // counted | proxied | reconstructed | asserted
  "basis": "Sound Toll Registers; van Tielhof" }
```

- **Port prominence becomes an output** (sum of flows touching a port per
  decade) — computable for the reference pages, no longer a load-bearing input.
- **The silences register** is a sibling file: flows we know existed and
  deliberately leave unquantified or excluded (Caribbean inter-island
  smuggling — silent *by evasion*; African coastwise trade; Pacific islander
  voyaging), each with reason + treatment (`excluded` | `asserted` | `gestured`).
- The three-metric rankings survive as the **`counted` stratum** and remain
  the right content for the reference pages, with their boundary stated.

## 3. Phases

### Phase R1 — Correct the counted stratum *(rankings fixes)* — ✅ APPLIED 2026-07-13
*(Decisions resolved: ships basis = foreign-going, documented; all four
promotions approved incl. Rio T1 at the gold peak. 168 edits — changelog in the
JSON; universe 57→60; queue 33→34 with Istanbul; tools in `research/tools/`.)*
Apply the reviewed fixes to `research/port-rankings-1550-1815.json` and
regenerate CSV/HTML/synthesis + interim era-weights:
- Universe/pool gaps: Rotterdam (all metrics, 1660s+); Porto (1700s+);
  Venice/Genoa/Livorno carried in T2 to ~1800; Lübeck T2 to 1650s; Emden T2
  1560s–80s; St Petersburg into *value* 1780+; Boston (ships T2 1720s+),
  Philadelphia/New York (T2 1750s+); Bahia value T2 1600s–1680s; Rio value
  T2/T1 1700s–1800s; Nagasaki value T2 1600s–1630s.
- Boundary-case promotions: **Goa↔Lübeck swap** (value T1, 1550s–80s);
  **Cap-Français → value T1** 1770s–80s (ends 1791); **Kingston → value T2**
  from 1740s.
- **Istanbul**: boundary statement in the JSON `basis` + entry in the
  promotion queue (tranche 3, Ottoman, shares Kaffa's Bosporus bake-risk);
  never ranked.
**Decisions:** (1) Newcastle/collier basis — document *ships = foreign-going
clearances* (recommended) vs adding coastal colliers to the ships metric;
(2) confirm the three promotions above (accepted in principle 2026-07-13).

### Phase R2 — Flow-matrix schema + proof-of-shape basin — ✅ DONE 2026-07-13
*(Decisions resolved: voyage ranges `[lo,hi]`; per-seed draw within bounds;
systems + lane shares. Delivered: `research/flows/_schema.md`,
`baltic-north-sea.json` — 13 systems × 27 decades, Sound cross-check ✓ in all
anchor decades — `silences.json` (6 entries incl. the asserted collier answer
to R1's declared silence), `tools/build-baltic-flows.mjs` +
`tools/validate-flows.mjs`. The derived prominence already shows what rankings
couldn't: with colliers counted, London leads the basin by movements from the
1590s.)*
Schema for trade-systems + silences register; validator; author the
**Baltic–North Sea** basin (mostly transcription — Sound Toll–anchored);
sanity check that the `counted` stratum's derived prominence ≈ the rankings.
**Decisions:** (1) voyage-range convention & tonnage bands; (2) **weight
realization rule** — fixed midpoint vs *per-seed draw within [lo,hi]*
(recommended: per-seed — each world is one plausible reading of the evidence,
still deterministic given seed); (3) granularity — systems with lane-share
splits (recommended) vs individual port-pair entries.

### Phase R3 — Basin authoring *(the big pass)* — ✅ DONE 2026-07-13
*(Decisions resolved: all 46 proposed systems accepted (+1 — the Black Sea
slave trade under decision 4 — for 47 new, 60 total with the Baltic); asserted
bounds default ±60% (validator warns under ±40%); Caribbean smuggling and
China coastal grain ASSERTED, African coastwise and Pacific voyaging gestured;
coerced flows quantified with the sober framing block, validator-enforced.
Delivered: five basin files (atlantic 11, mediterranean 9, indian-ocean-west
9, bengal-se-asia 9, east-asia 9), 1,403 system-decades, seven cross-checks
passing (Sound Toll, SlaveVoyages, Chaunu, DAS, Nagasaki registers, Canton
fleet, French échelles), the silences register at 11 entries with three
silences answered, and a derived world prominence whose 1590s top-10 includes
Istanbul, Shanghai, Tianjin, Alexandria, and Smyrna — ports the ranking
universe could not represent.)*

### Phase S1 — Sim swap to flow-driven spawning — ✅ DONE 2026-07-13
*(Decisions resolved: per-seed realization ON (from R2); population scaling =
normalized data-driven drift, clamped [0.5, 1.6]× era mean — a documented
spectator-scale concession; save reset accepted (datasetVersion 2).
Delivered: build-data folds the flow matrix onto the baked lanes — 18 of 60
systems fold, 25→34% of world volume, the honest Phase-A coverage number —
and world.js realizes each system's [lo,hi] once per seed (every world is one
plausible reading of the evidence), spawns lanes by realized flow + a 3%
residual floor + a 6% naval pool, fades lanes over ~3 years at era boundaries
(and across the reset seam) instead of popping, and derives port prominence
as an output. The routes overlay now shows the traffic the sim actually
samples. era-weights retired from the bundle. 19 tests green; at-sea 1755
composition: gothenburg-node 25% (the folded Baltic — the stated proxy
limit), london 19%, kingston 12%, whydah 10%, batavia/canton 4%.)*

### Phase S2 — Coverage expansion + re-bake *(old PLAN-2 Phase B, re-scoped)*
Choose the expanded port set **by flow coverage** (which systems cannot be
represented without which ports), regen wind-fields, bake, promote queue
entries, add the unlock flags, do the engine exceptions.
**Decisions (inherits PLAN-2 §7):** (1) port count / target universe
(~40–55?); (2) backbone + diversity in one bake (recommended: yes);
(3) junk/dhow polars — map onto indiaman/brig (recommended) vs author new;
(4) **evidence-band visibility** — how much on-screen traffic the
reconstructed/asserted strata carry (replaces the "diversity weight band");
(5) wind-fidelity floor — accept 18th-c climatology for all eras
(recommended); (6) engine exceptions to fund now vs defer — Bosporus/Kerch
carving (Kaffa, Istanbul), White Sea/Svalbard seasonal ice exception
(Arkhangelsk, Smeerenburg), Pacific render-bounds (Sitka, Manila galleon);
(7) flag additions — china-junk-trade (recommended: unlocks Hội An, Patani,
Manila, Ayutthaya), tsushima, golconda, patani; Île Sainte-Marie as a
1690–1725 hazard rather than a port (recommended).

### Phase S3 — Surfacing the historiography
Ledger evidence-class line (*"this voyage stands for a reconstructed trade"*);
a **"The chart's silences"** reference page; regenerate research pages with
flow-derived prominence; boundary statements on every page.
**Decisions:** (1) ledger wording/tone (sober, one line); (2) whether evidence
class also styles the vessel/route glyph (recommended: no — visual language
stays flag/category; the ledger carries the historiography).

## 4. What survives (nearly everything)

| Built | Becomes |
|---|---|
| Three-metric tiered rankings | The `counted` stratum + reference pages (boundary stated) |
| `route-persistence` (165 lanes) | The flow matrix's lane skeleton |
| 33-minor queue + CURATION.md | Seeds of the `reconstructed`/`asserted` strata; S2's shopping list |
| `era-weights.json` pipeline | Interim weight source until S1; then retired |
| `world.js` flowing clock, persistence, drift, wars | Untouched — only the weight *source* changes |
| Sober Middle-Passage treatment | The template for principle 6 |

The "tier 3" question is dissolved: tier 3 was "everything the rankings can't
see," and the flow matrix makes that the dataset's explicit subject instead of
its remainder.

## 5. Sequencing

R1 → R2 → R3 → S1 → S2 → S3, with R-phases pausing at each decision list.
R1 is small (edits + regeneration). R2 is the shape-proof. R3 is the one
Milestone-1-scale authoring pass. S1 is a focused code swap. S2 is the
expensive bake (unchanged in cost from old Phase B). S3 is polish.
