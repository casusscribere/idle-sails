# Research task queue

Standing research tasks that are **not** port promotions — those keep their own
pipeline in `CURATION.md` + `minor-ports-promotion.json`. A task moves to
**Done** with a one-line outcome when its output lands in the repo.

> **Renumbered 2026-07-21.** T-numbers and the RA/RB/RC/RD phase names are
> retired. Research tasks now carry **R-nn** IDs in the same flat ID space as
> features, and are ordered by the **waves** in `planning/RANKING.md`. The
> old→new map is in RANKING §3; completed tasks keep their old T-numbers in the
> Done section below, since that is how the outputs are cited across the repo.

> **Sync directive:** any change to this queue (task added / re-scoped / done)
> must update the matching wave table in **`planning/RANKING.md`** in the same
> edit. This file carries a task's *content*; RANKING carries its *position*.

---

## Grouping

Tasks are grouped so each body of sources is read **once**, and ordered
**fidelity first**:

- **W2 — fidelity data & rules.** Research that changes what the sim asserts
  about the past. R-01 · R-02 · R-03 · R-04 · R-05 · R-06 · R-10.
- **W2R — the routing campaign** (`planning/PLAN-7-routing.md`). R-11 (the
  historical route corpus) + R-12 (programmatic best practices) run in
  PARALLEL — they share no sources, and each blocks a different half of the
  rebuild. Both are gated behind PLAN-7 Phase 0, the verification harness,
  which is deliberately built against the CURRENT engine first.
- **W5 — the sim redesign.** R-07 + R-08 run as **one campaign** — they read the
  same archives (prize courts, Lloyd's Register, registry law), and a captured
  ship re-flagged and renamed under its captor is literally one event on both
  lists. Both feed PLAN-5.
- **W6 — the capstone.** R-09, deliberately last so the Aubrey catalog knows
  the convoy, ambient, and capture mechanics it will be expressed through.
- **LOCKED.** The steam-layer research (old T11) is now `L-05`; the refinement
  track is `L-01` / `planning/REFINEMENTS.md`. Neither is scheduled.

---

## Open

### W2 — fidelity data & rules

#### R-01 — Japan & sakoku: the full review
*(added 2026-07-21 from `research_addenda.txt` R1a; extends T12's Japan strand
rather than repeating it — T12 established the sakoku boundary, made Dejima
`scriptedOnly`, and registered two silences.)* Four questions the user raised
separately, which are one reading of one body of sources:

- **(a) Portuguese traffic under sakoku.** Portuguese naus are visibly sailing
  into Nagasaki in 1627 in the current sim. That is very likely *correct* — the
  expulsion came in 1639 after a decade of tightening — so the task is to bound
  the taper honestly: when did Portuguese Japan trade begin in our window, how
  did volume move through the 1620s–30s, and does it end at the right year?
  (See `planning/OPEN-QUESTIONS.md` D-16.)
- **(b) Ryukyu / Naha.** The trade appears to drop out of the later decade
  tranches. Establish whether that is real (the 1609 Satsuma invasion and the
  tribute trade's subsequent character) or a gap in our matrix. Include trade
  with Japanese ports other than Dejima.
- **(c) The Chinese junk trade to Japan, 1550–1650.** The user doubts it reached
  Japan at all given the closure. Bound what actually called — the Chinese
  quarter at Nagasaki persisted throughout sakoku under a separate regime from
  the Dutch factory — and check whether our model represents it or conflates it.
- **(d) Other Japanese ports + a features verdict.** Review what sakoku allowed
  and what actually occurred, and **suggest features back to the queue** (the
  user asked for this explicitly — e.g. whether the shogunate's licensing
  deserves its own display treatment).

**Output:** an extension of `port-flow-candidates-T12-addenda.md`'s Japan strand
(or a new dated candidates doc) + register entries + any corrections to the
`dejima` node and the Japan systems.
**Feeds:** F-09/D-02 (the Nagasaki/Dejima node question), F-14's `scriptedOnly`
gate, and possibly new features.

#### R-02 — Port-event vocabulary
*(added 2026-07-21 from `ideas.txt` §12.)* The events log currently says
**"founded"** for events that are mostly not foundings — re-openings, conquests,
grants of trade, the arrival of a company factory at an existing harbour.
Research a historically nuanced vocabulary and a rule for choosing among terms
("opens to trade", "becomes active", "is granted a factory", "is refounded
as…", "passes to…"). **Present the suggested vocabulary to the user before it
is applied** — the user asked for suggestions, not a unilateral fix.

Note the precedent already set in Phase 4: *"est." only for real in-sim
foundings*. This task generalizes that decision to the whole event vocabulary.

**Output:** a short `research/port-event-language.md` — terms, the rule that
picks one, and a per-event-type mapping.
**Feeds:** the display strings of `world.portEventsSince`. No sim change.

#### R-03 — National port access rules
*(was T15, added 2026-07-19 from `ideas.txt` §8.)* Research which ports
**refused** ships of certain flags in certain periods (closed-port and monopoly
regimes, wartime interdiction, the sakoku exclusions already partly modelled)
and which imposed **class/tonnage** limits (draft-limited roadsteads,
galley-only harbours), so statistical spawn assignment can be guardrailed.

**Scope carefully — much of this is already implicit in the flow matrix** (a
lane that never existed is already absent). The task is to find the cases where
the sim WOULD generate an ahistorical port call the matrix does not already
forbid, and to express those as data rules rather than re-deriving the whole
trade geography. Evidence-classed; no fabricated precision (a "usually refused"
is not a hard block).

**Output:** `research/port-access-rules.md` — bounds + sources per rule + a
sim-shape verdict (hard block vs. weight penalty vs. display-only note).
**Feeds:** a build-data validity layer.

#### R-04 — Korea / Russian-Pacific / Alaska
*(the open half of T14; the waystations half is done — see Done.)* Per port, a
promote-or-register verdict: Korean ports under the Joseon maritime-restriction
boundary declared honestly; Okhotsk and Kamchatka; the Russian-American
Company's Alaskan stations beyond the existing Sitka/Kodiak treatment.
Evidence-classed; expect silences-register entries rather than a row of new
dots.

**Output:** a dated `research/port-flow-candidates-*.md` extension + register
entries; promotion-queue updates via `CURATION.md`.

#### R-05 — Standing region re-review *(blocked on D-05)*
*(re-listed 2026-07-21 in `research_addenda.txt` R1b–R1e.)* Indonesia,
the Caribbean (incl. piracy and the NA gulf coast), India–Arabia–East Africa
(should there be more Ottoman/Mughal trade?), and cross-Pacific / around-South-
America. **All four were answered by T12 on 2026-07-18**, so this task does not
start until the user says whether the re-listing is carried-over text or a
statement that the T12 answers were too thin — and if the latter, which
strands. See `planning/OPEN-QUESTIONS.md` **D-05**.

#### R-06 — Blockade catalog
*(added 2026-07-21 from `ideas.txt` §6a.)* The historical blockades worth
modelling — the Continental System and the British counter-blockades, the
1793–1815 blockades of France and the Baltic approaches, the American coast
1812–15, and earlier Dutch/Spanish cases — with dates, the ports and straits
affected, and, critically, **what traffic actually did**: rerouted, ran the
blockade, transferred to neutral flags, or stopped. The evidence is about
aggregate traffic behaviour, which is why the recommended sim shape is a
war-scoped lane override rather than a live mechanic (D-08).

Overlaps **R-08** — wartime neutral-flag transfer is the same body of evidence,
so if both run, run them together.

**Output:** `research/blockades.md` — per blockade, bounds + effect + a
sim-shape verdict, evidence-classed.
**Feeds:** F-17.

#### R-11 — The historical route corpus (PLAN-7 Phase 1)
*(added 2026-07-21 with `planning/PLAN-7-routing.md`; this is the execution of
the locked refinement track's §1c, which the user unlocked by requesting the
routing plan.)* **Find — do NOT generate — real evidence about the routes ships
actually sailed**, and bound each item's reliability. The emphasis is the
source's: routes must be checked against surviving record, not validated against
our own engine's output.

Candidate sources, each to be verified for what it actually contains and for
which eras and basins — **none is asserted here as fact**:
- **CLIWOC** (Climatological Database for the World's Oceans), built from Dutch,
  English, French and Spanish logbooks, roughly 1750–1854. The likely anchor for
  positional tracks — and pointedly, the source `windfield.mjs` already claims to
  follow without ever having been tested against it.
- **ICOADS** early marine observations.
- **Maury's Wind and Current Charts + Sailing Directions** (1840s onward): late
  for our window, but they codify the routes the sailing era had settled on.
- **Admiralty and company sailing directions**; East India Company route
  instructions.
- **Prescribed routes as documents** — the VOC's Brouwer Route (1611) and
  standing orders, the Carrera de Indias, the Manila galleon's Urdaneta return.
  Record these as `prescribed-route`, NOT as observed track: what ships were told
  to do is different evidence from what they did, and the suite must never
  average the two.
- **Scholarly reconstructions** in maritime history / historical geography.
- **Wreck positions** as weak point-constraints.

**Output:** `research/routes/corpus.json` in the PLAN-7 §2.1 schema — every entry
evidence-classed (counted/proxied/reconstructed/asserted) and bounded, with
`kind` distinguishing prescribed route · logbook track · passage duration ·
waypoint constraint · forbidden corridor. Plus a **declared statement of what the
corpus does not cover**, which will be most of 1550–1700 and most non-European
shipping. Expect silences-register entries.
**Feeds:** F-41 (the verification harness) and F-45 (calibration).
**Charter note:** the corpus's own bias — dense for European long-haul shipping
1750–1854, thin elsewhere — must be stated up front, because PLAN-7 §10 depends
on it being visible.

#### R-12 — Programmatic best practices for route generation & execution (PLAN-7 Phase 1)
*(added 2026-07-21 with `planning/PLAN-7-routing.md`.)* A literature-and-practice
review of how this class of problem is actually solved, whose deliverable is a
**recommendation with trade-offs**, not a preference. Must cover:
- **Any-angle path planning** — Theta*, Lazy Theta*, ANYA, Field D* — as the
  direct answer to the 8-neighbour heading quantization that causes the
  oddly-square legs, including how each interacts with anisotropic
  (direction-dependent) edge cost, which is our case.
- **Fast Marching / level-set methods** for optimal paths in flow fields — the
  other established family for exactly this problem.
- **Time-dependent shortest path** (cost as a function of arrival time at a
  cell), for the defect where a six-month passage is routed entirely in its
  departure season's wind.
- **Discretization**: raising connectivity vs. raising resolution vs. adaptive
  multi-resolution (coarse ocean, fine coast) vs. discrete global grids
  (H3, S2, HEALPix, icosahedral) that avoid lat-lon polar convergence and give
  uniform cell area. Include the cost side: memory, bake time, cache behaviour.
- **Obstacle representation**: raster masks vs. polygon-aware visibility, and the
  sub-cell island problem that currently forces hand-authored `ISLAND_SEAL` and
  `STRAIT_CARVE` entries.
- **Trajectory similarity metrics** — discrete Fréchet, DTW, Hausdorff,
  along/cross-track error — to ground the harness's T5 tier.
- **Determinism and reproducibility** under a seeded simulation. **This is a hard
  constraint, not a preference**: any algorithm adopted must be exactly
  reproducible across runs and platforms, or the project's central invariant
  (same seed + sim-time ⇒ identical world) dies. Flag any candidate whose
  standard implementation uses randomized tie-breaking or floating-point
  reduction order that varies.
- **Baking, caching and compression** for many-to-many precomputed routes.
- **Validation methodology** from the operational weather-routing literature —
  how that field establishes that a router is good, which is the same question
  the harness asks.
**Output:** `research/routing-methods.md` — per technique: what it fixes, what it
costs, whether it is deterministic, and a verdict for this codebase.
**Feeds:** PLAN-7 Phases 3–5; decisions D-19 and D-20.

#### R-10 — Port supply & demand *(blocked on D-01)*
*(added 2026-07-21 from `ideas.txt` §7–§8.)* Per port, the cargoes it produced
and consumed, at documentation depth and evidence-classed — the data behind a
"what is this port buying and selling" display (F-26).

**This is the same body of work as the locked refinement track's §1e**
(`planning/REFINEMENTS.md`), so it does not start until D-01 is answered. If
the track unlocks for §1e, this task IS that section and should be run there.

A cheaper interim exists that needs no research: derive the display from the
cargoes already carried on the lanes we model. That is honest — it claims
"what moved through here", not "what the port wanted" — and it should be
labelled as such if built.

---

### W5 — the sim redesign (R-07 + R-08 as ONE campaign)

#### R-07 — Vessel lifecycle & prize practice
*(was T7, added 2026-07-16 — deferred; start when PLAN-5 is being drafted.)*
The historical grounding vessel persistence / capture / chases will need,
evidence-classed: **service lifespans** by rig/role/era (merchant hull working
life, EIC ships' voyage counts, naval commission and refit rhythms); **capture
and prize volumes** in the modelled wars (prize-court condemnations, privateer
take rates, what fraction of losses were capture vs. wreck vs. foundering —
today's sim folds all loss into one fate); and **prize renaming practice** (when
captors kept a name, when they renamed; navy vs. merchant practice) to ground
the sketch of captured ships joining the captor's pool under a new name.

**Output:** `research/vessel-lifecycle.md` — bounds + sources per claim, a
sim-shape recommendation per mechanism, and explicit flags where the sources
support only qualitative statements.
**Feeds:** PLAN-5.

#### R-08 — Imbricate vessel identity: hull, flag, owner, master, crew
*(was T13, added 2026-07-18 at user request. **Not present in the reorganized
input files — confirm via D-07 before starting.**)* The sim models a vessel as
a single fused identity: one name, one captain, one hull, one nation. History
routinely separated those. A ship could be **American-built, Dutch-owned,
sailing under a British flag, with a Scandinavian master and a mixed crew** —
and each facet moved independently, for reasons the chart could show.

What to establish, evidence-classed:
- **Build origin vs. ownership.** New England yards building for British and
  continental owners; Indian-built (Bombay/Surat) teak tonnage in European
  service; prize hulls entering the captor's merchant fleet.
- **Registry and flag law.** What made a ship "British" (Navigation Acts
  registry), "Dutch", "American"; colonial registries; naturalization of
  foreign-built hulls; how, and how often, a ship legitimately changed flag.
- **Neutral flags in wartime.** The big one for this chart, since the sim runs
  many wars: flag transfer to neutrals to keep trading through blockade and
  belligerent capture (the American neutral carrying trade of the 1790s–1800s;
  the Danish, Hamburg, and Ragusan flags; licence and simulated-sale practice).
  Bound the SCALE — what share of tonnage in a given trade sailed under a flag
  not its owner's — or state plainly that the sources support only a
  qualitative claim. **Shares sources with R-06.**
- **Master and crew nationality.** How often the master's nationality differed
  from the flag; crew composition and its mixedness — including the lascar,
  African, and Asian mariners whom the single-nation model erases entirely.
- **Where the archive cannot say.** Registry records overstate tidiness; flags
  of convenience exist precisely to defeat the record. Expect this task to
  generate **silences-register entries**, not just fields.

**Output:** `research/vessel-identity.md` — bounds + sources per claim, plus a
sim-shape recommendation: which facets deserve modelled state (a `builtIn`
distinct from `flag`? an owner power? a master nationality drawn from a
different pool than the flag?), which are display-only, and which the evidence
cannot support at all. Must say explicitly where modelling a facet would be
**fabricated precision** — a per-vessel crew composition the archive cannot
ground is worse than not modelling it.

**Feeds:** PLAN-5, alongside R-07. Also affects the ledger and legend,
`data-src/powers.json` (build vs. flag are different attributes of a power),
and the captain-naming draw in `world.js` — today the master's culture is a
function of the flag, and this task is exactly the evidence for whether that
should remain true.

---

### W6 — the capstone

#### R-09 — Aubrey canon + the wider historical-fiction catalog
*(was T6.)* Compile Jack Aubrey's commands from the O'Brian novels — per
commission: the vessel (name, rig, guns; the real historical namesake where one
exists), a plausible commission window mapped into the sim's window, and a
**book-appropriate itinerary** expressed as a sequence of ports/waypoints the
baked lanes can carry (flagging any leg needing a custom polyline — read
`pipeline/README.md` first). Because the commissions build after convoys and the
capture mechanics, the catalog also records **per commission: convoy/escort
legs, historical prize-takings and engagements, and chase episodes**, so the
scripted spawns express them through real mechanics rather than sailing a bare
lane. Each commission carries a **suggested per-seed firing probability** so not
every run sails every easter egg.

Cover at least: *Sophie* (Mediterranean, the prize-taking cruise),
*Polychrest*, *Lively*, *Surprise* (the Indian Ocean run), *Boadicea* (the
Mauritius campaign — Port Louis is now a built waystop, so this itinerary has
its real ports), *Leopard* (Desolation Island), *Worcester*/*Bellona*. Note
which spawns fall inside wars the sim already models, and which around-South-
America legs need the Horn routing (now fixed).

**Then the wider sweep** (`ideas.txt` §10): web-search other age-of-sail
historical fiction — novels, film, stage — and rank candidates for inclusion as
scripted easter eggs, same schema, same per-seed probability. A ranked candidate
list is the deliverable; only the top few need a full itinerary.

Also carries the two fixed easter eggs as channel demos: **HMS HMS *Bom Jesus***
and **the cat** (a persistent ship-hopping token, not a commission — see D-10).

**Output:** `research/aubrey-voyages.json` — per commission
`{vessel, rig, window, itinerary, events, book, probability, notes}` — plus the
ranked wider-fiction candidate list.
**Feeds:** F-39.

---

## Done

- **T14 (waystations half) — 2026-07-20/21.** Three basin gather-agents +
  synthesis cross-check →
  `research/port-flow-candidates-waystations-2026-07-20.md`. Verdicts: St
  Helena, Anjer/Sunda Strait (Europe↔Canton ran via Sunda, NOT Malacca), Guam
  (westbound only), Madeira/Canaries (outbound, split by nation), the Azores
  (Portuguese homeward), Johanna/Anjouan (EIC secondary). Ilha de Moçambique =
  the Portuguese Cape Town; Port Louis = the universal French waystop. NOT
  vias: Malacca (terminus), Cape Verde (slave terminus + framing),
  Galle/Trincomalee/Bourbon (full-port candidates), Ascension/Socotra/Aden/Pulo
  Condore (silences). Two build findings: direction *and* nationality both
  matter, and the `via` mechanism needed a multi-waystop **chain** — the one
  code change surfaced, and built the next day. **The Korea/Russian-Pacific
  half is open as R-04.**

- **T12 — the addenda sweep (2026-07-18, Phase-RB chunk 11).** Eight strands in
  `port-flow-candidates-T12-addenda.md`; four gathered strands attacked by
  independent refuters (53 ✅ / 13 ⚠ / 0 ✂), the 28-item specials catalog
  self-verified, zero refutations. Japan: no new sailable node (sakoku
  boundary), Dejima `scriptedOnly`, 2 silences, the Kanagawa-1854 correction.
  Pacific: Callao (= PLAN-4 E9) + `pacific-colonial-spanish`, Guayaquil +
  `guayaquil-cacao`, a Pacific whaling grounds-node (E3), the Nootka→Canton fur
  system. Med-African: Algiers/Tunis/Tripoli/Alexandria nodes,
  `barbary-concessions` (counted) + `barbary-regency-exports`, the
  corsair-slavery register made bidirectional. Caribbean: Curaçao own dot, St
  Thomas/Paramaribo/Belize nodes, the golden-age-piracy hazard zone. Plus the
  28-item specials catalog and the goods-thread display-feature spec. **Closed
  Phase RB (chunks 1–11).**

- **T8 — the 2026-07 sweep's declared silences (2026-07-18, chunks 2 + 9).**
  All five declared gaps answered: the Iceland/North-Atlantic fisheries +
  Bergen stockfish in chunk 2 (`ambient-flows.md` §2); the Ostend & Trieste
  companies, the New Julfa Armenian carriage, and the Aceh/Bantam pre-VOC
  pepper in chunk 9 (`port-flow-candidates-2026-07-18.md`; 64 claims, 55 ✅ /
  9 ⚠ / 0 ✂). Outcomes: **two new ports** (Ostend 1715–1745, Bantam
  1550–1685), **two folds**, **three silences answered**.

- **T10 — the 1815–1850 campaign (2026-07-18, PLAN-6 X-R1).** Per basin, the
  new decades 1820/1830/1840 for surviving and new systems; the 1815–1850 wars
  sweep; new-port dossiers (Singapore, Hong Kong, Valparaíso, Sydney, New
  Orleans). 384 claims at 322 ✅ / 59 ⚠ / 3 ✂. Charter-critical inclusions
  landed: the illegal-era Brazil/Cuba slave trade under the Middle-Passage
  sober pattern, the West Africa suppression squadron, and convict
  transportation to Sydney under the same pattern.

- **T4 — ambient flows & naval movement patterns (2026-07-17, chunks 1–4).**
  `research/ambient-flows.md` §§1–4: naval patterns · fisheries & whaling ·
  scheduled/state services · local metabolisms — 286 claims under full
  adversarial verification (229 ✅ / 56 ⚠ / 1 ✂). Cross-cutting conclusion: the
  **grounds-node** primitive is the one new movement primitive the program
  needs (six patterns wait on it); everything else rides existing machinery.
  Register implications recorded per section.

- **T9 — convoy institutions & rates (2026-07-16, chunk 1).** 84 claims, every
  one independently attacked — 62 verified, 22 corrected, 0 refuted. Output:
  `research/ambient-flows.md` §1 with the evidence-classed rule-values table;
  `planning/PLAN-convoys.md` §1 refreshed. Findings: the caravane maritime is
  NOT a convoy institution; galeones END 1739 with sueltos at 79.5–87% after;
  Brazil frotas 1649–1765 added; the British convoyed-trade share stays
  `asserted` 0.75–0.95.

- **T5 — name-pool expansion (2026-07-16).** All eight failing pools expanded
  to period-plausible sizes (Portugal 12→44, Hansa 10→28, Mughal 9→20, Ottoman
  10→20, Britain merchant 66→90, junk-trade 11→16, Gowa 8→12, Spain 12→16);
  gate green on seeds 42/7/23 (worst pool 64%). Note:
  `research/name-pressure-2026-07-16.md`. **Standing re-gate:** re-run
  `research/tools/name-pressure.mjs` whenever the cycle length or the power
  roster changes.

- **T1 + T2 + T3 — the per-port sweep (2026-07-19).** All 105 ports: the
  1550→1850 name/ownership timeline (`ports[].eraNames` + `ports[].eraPowers`),
  an era-resolved port-panel blurb (`research/port-docs.json`), and a
  documentation entry with citations on `research/ports.html` (105 cards / 23
  regions). See `planning/SHIPPED.md`.
