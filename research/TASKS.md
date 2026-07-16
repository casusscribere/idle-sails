# Research task queue

Standing research tasks that are **not** port promotions — those keep their
own pipeline in `CURATION.md` + `minor-ports-promotion.json`. A task moves to
**Done** with a one-line outcome when its output lands in the repo.

> **Sync directive:** any change to this queue (task added / re-scoped /
> done, phase regrouped) must update **the interleaved queue** at the end of
> `planning/RANKING.md` in the same edit — that queue is the one recommended
> cross-queue order, and it must never lag this file.

## Phasing (reorganized 2026-07-16)

Tasks are grouped so that each body of sources is read **once**. The phases
are independent of each other (any order, or in parallel); *within* a phase
the tasks share a source campaign and should run together.

- **Phase RA — feature gates.** Small, self-contained tasks that each unblock
  a scheduled feature pass: T5 → pass 3.5, T6 → pass 6. No shared sources;
  run whenever a pass is wanted — though T6 is deliberately sequenced LATE
  in the interleaved queue (`planning/RANKING.md`): pass 6 builds after the
  movement patterns, so the Aubrey catalog should know the convoy and
  Pass-5 mechanics it will be expressed through.
- **Phase RB — movement & flows.** One campaign over voyage-pattern sources:
  T4 (ambient flows) coordinated with PLAN-4's E-R1 verification where the
  two overlap — whaling grounds (E3), the caravane maritime (E7), Jeddah
  pilgrim shipping (E6), and the fisheries all appear on BOTH lists, so
  running T4 and a PLAN-4 wave-1 verification separately would read the same
  sources twice. T8 (the sweep's declared silences) extends the same
  campaign northward (fisheries, stockfish) and is natural to fold in.
  T9 (convoy institutions & rates) shares T4's naval-patterns strand — the
  convoy-escort sources ARE the convoy-rules sources; read them once.
- **Phase RC — the per-port sweep.** T1 + T2 + T3 executed **together, one
  port at a time**: a single reading of a port's sources yields its
  name/ownership timeline (T1), the one-line blurb per window (T2), and the
  documentation-depth entry with citations (T3). Doing them as three separate
  66-port passes would triple the source work. **Fix the near-term roster
  first**: if PLAN-4 wave 1, tranche-2 promotions, and/or PLAN-6 (the
  1550→1850 temporal expansion — it adds ports AND retiles every window to
  1850) are close, adopt those decisions before starting the sweep so new
  ports and the final era span ride the same pass instead of a follow-up
  (outputs are per-port and additive, so late ports are appendable — but at
  the cost of re-entering research mode per port).
- **Phase RD — deferred design research.** T7 feeds the eventual PLAN-5
  design doc (vessel persistence / capture). Needed only when PLAN-5 is
  drafted; listed now so pass-5 design isn't done from nothing.

## Open

### Phase RA — feature gates

#### T5 — Name-pool expansion: peak pressure under 70% per pool
The gate for feature pass 3.5 (unique active names + name retirement).
Measured across full 270-year cycles, peak SIMULTANEOUS vessels per naming
culture exceeds several pools outright — Portugal merchant hit 217% of its
pool, Hansa 170%, Mughal 133%, Ottoman 120%, with Britain at ~88% and China
at ~82% — so a uniqueness rule today would either fail or degenerate into a
near-deterministic tail of leftover names. For **every (culture, role) name
pool**, research and author enough additional **period-plausible ship-name
stems** to bring peak pressure under **70%**:
- **Measure first:** peak concurrency per (culture, role) across several
  seeds (≥3) with margin for the refractory period R (a retired name stays
  blocked ~5 sim-years beyond a loss, so effective demand is peak-active
  plus recent losses). The measurement harness landed 2026-07-16 as
  `research/tools/name-pressure.mjs` — the auditable gate; re-run it after
  any flow-matrix change (traffic growth re-raises pressure).
- **Author to target:** pool size ≥ peak-effective-demand ÷ 0.7. Current
  worst cases imply roughly: Portugal merchant 12→~40, Hansa 10→~25, Mughal
  9→~18, Ottoman 10→~18, Britain merchant 66→~85, Spain 12→~14, China
  junk-trade 11→~14; sweep ALL culture/role pools, naval included.
- **Stay period-plausible per culture:** Portuguese religious invocations,
  Hansa saint-and-city names, Ottoman/Greek mixed marine, junk-trade
  auspicious compounds — the pass-3 vocabulary is the register; no
  anachronisms, no invented-sounding filler.
**Output:** expanded pools in `data-src/names.json` + a short measurement
note (per-pool peak vs. size, seeds used) so the 70% claim is auditable.
**Feeds:** feature pass 3.5 (`planning/RANKING.md`).

#### T6 — Aubrey canon: vessels, dates, and book-appropriate routes
*(added 2026-07-16; re-scoped the same day when the easter eggs moved to
pass 6, after the movement patterns)* The evidence base for the Aubrey
easter eggs: compile Jack Aubrey's commands from the O'Brian novels — per
commission, the vessel (name, rig, guns; the real historical namesake where
one exists, e.g. HMS *Surprise*), a plausible commission window mapped into
the sim's 1800–1815 window, and a **book-appropriate itinerary** expressed
as a sequence of ports/waypoints the baked lanes can carry (flagging any leg
that would need a custom polyline — `pipeline/README.md` first). Because
pass 6 builds after convoys and Pass 5, the catalog also records, **per
commission: convoy/escort legs, historical prize-takings and engagements,
and chase episodes** — so the scripted spawns can express them through the
convoy and Pass-5 capture/chase mechanics rather than sailing a bare lane.
Cover at least: *Sophie* (Mediterranean, the prize-taking cruise),
*Polychrest*, *Lively*, *Surprise* (the Indian Ocean run), *Boadicea* (the
Mauritius campaign — **overlaps PLAN-4 E5 Port Louis**: if E5 is adopted,
this itinerary gains its real ports), *Leopard* (Desolation Island),
*Worcester*/*Bellona*. Note which spawns fall inside wars the sim already
models. Deliberately sequenced late in the interleaved queue; running it
earlier costs a second look once the mechanics exist.
**Output:** `research/aubrey-voyages.json` — per commission
`{vessel, rig, window, itinerary, events, book, notes}`.
**Feeds:** feature pass 6 (`planning/RANKING.md`).

### Phase RB — movement & flows

#### T4 — Deep research: ambient flows & naval movement patterns
A deep-research sweep (the `port-flow-candidates-2026-07.md` pattern:
multi-source, adversarially verified, claims flagged) into **movement
patterns that are not port-to-port trade lanes** but may be relevant and
mappable in this project — the evidence base for feature pass 4 (the
scripted-spawn channel + ambient flows). Candidate families to investigate,
confirm, bound, or reject:
- **Fisheries as grounds-traffic** — the Dutch herring buss fleet (the grote
  visserij), the Banks cod fishery's seasonal rhythm, Arctic/South-Sea
  whaling grounds cruising (each already gestured in the silences register);
- **Naval patterns** — convoy escort cycles, guarda-costas and revenue
  cruisers, station-keeping (guard ships, blockade squadrons in wartime),
  cruising grounds of privateers and the Pirate Round;
- **Scheduled/state services** — packet boats (Falmouth packets, the
  correo marítimo), the caravane maritime, pilgrim traffic (the Surat–Jeddah
  hajj shipping);
- **Local metabolisms** — coastwise grain/fuel circuits already asserted in
  the flow matrix (colliers, shachuan) that could gain visible short-circuit
  representation.
For each pattern: what the sources support (volume, season, era window,
geography), what SHAPE it takes in sim terms (recurring local circuit ·
grounds-loitering · station-keeping · scheduled line), whether the baked-
route machinery can carry it or the baker needs new work
(`pipeline/README.md` first), and a mappability verdict.
**Coordinate with PLAN-4 E-R1:** the whaling grounds (E3), caravane maritime
(E7), and Jeddah pilgrim shipping (E6) sit on both lists — if a PLAN-4 wave
is being verified, share the source pass rather than reading twice.
**Output:** `research/ambient-flows.md` — the catalog with per-pattern
evidence class, bounds, sim-shape recommendation, and silences-register
cross-references (patterns that answer a gestured silence must say which).
**Feeds:** feature pass 4 (`planning/RANKING.md`); silences register
updates where a gestured entry gains representation.

#### T8 — The 2026-07 sweep's declared silences: follow-up candidates sweep
*(added 2026-07-16, from PLAN-4 §1)* The 2026-07 port-flow sweep declared
its own limits: **Iceland / North Atlantic fisheries · Bergen/Trondheim
stockfish · the Ostend & Trieste companies · New Julfa Armenian carriage ·
Aceh/Bantam pre-VOC pepper**. Run these as a second candidates campaign in
the `port-flow-candidates-2026-07.md` pattern (evidence class, bounds,
adversarial verification, mappability). The fisheries items share sources
with T4 — fold them into the same Phase-RB campaign when both run.
**Output:** a new dated `research/port-flow-candidates-*.md` (or an extension
of the existing sweep doc) + silences-register entries for whatever stays
unquantifiable.
**Feeds:** PLAN-4's next wave; the promotion queue; the silences register.

#### T9 — Convoy institutions & rates
*(added 2026-07-16, from `planning/PLAN-convoys.md` §1)* The convoy plan is
buildable now — its rules ship `asserted` with stated reasoning, which the
charter permits — but every number in its grounding table is our estimate.
This task turns those estimates into evidence-classed bounds: per pattern
(the **flota** system and its 1564→1778 ordinance window; **company return
fleets** — VOC retourvloot, EIC/CdI homeward practice; **wartime trade
convoy** culminating in the Convoy Acts 1793/98; the **caravane/Levant
convoy** against corsairs), verify the institutional windows, and bound the
*rates* — what share of a lane's sailings actually went in company, per
decade window — plus typical sizes, escort practice, and any pattern the
table misses (Portuguese Brazil fleets? Manila galleon pairing?).
**Coordinate with T4:** the naval-patterns strand (convoy escort cycles,
station-keeping) reads the same squadron and admiralty sources — run the two
as one pass when both are wanted.
**Output:** a grounding note (extend `research/ambient-flows.md` or a short
sibling doc) + evidence-classed values for `data-src/convoys.json` rules
(each rule carries `class` + `note` — the validator already requires it).
**Feeds:** `planning/PLAN-convoys.md` (refines its §1/§5 numbers; does NOT
gate the build).

### Phase RC — the per-port sweep (run T1+T2+T3 together, one port at a time)

#### T1 — Port name & ownership changes: the full-roster sweep
For each of the 66 sailing ports (`data-src/ports.json`), compile the
1550–1815 timeline of (a) **name** changes and (b) **ownership/allegiance**
changes, with year boundaries and a one-line source note per change. Seven
ports already carry `eraNames` (Louisbourg⇄St John's, Kingston⇄Port Royal,
Batavia⇄Jayakarta, Bombay⇄Goa, Madras⇄Masulipatnam, Calcutta⇄Hugli,
Gothenburg⇄Älvsborg) — verify those windows and sweep the remaining roster
systematically; ownership has no data field yet anywhere (`ports[].power` is
static), so this sweep is the data prerequisite for showing the flag of the
time in the UI.
**Output:** `research/port-eras.json` — per port, an ordered list of windows
`{from, to, name, power, source}` tiling the era exactly (the `eraNames`
validator pattern), ready to feed `ports[].eraNames` and a new
`ports[].eraPowers`, so the chart labels, port panel, and log speak both the
name and the allegiance of the time.

#### T2 — Era blurbs: one sentence per port/name/ownership combination
For every distinct window from T1 — every (port, name, ownership)
combination — write **one sentence** describing the port in that state: what
it was, who ran it, what moved through it. When a port changes name OR
ownership, the sentence changes with it (Port Royal's sentence is not
Kingston's; Dutch Cochin's is not Portuguese Cochin's).
**Output:** a `blurb` field on each window in `research/port-eras.json`;
surfaced later in the port panel beneath the lifeline line.
**Register:** the chart's sober voice; the charter applies (no fabricated
precision — hedge where sources hedge; coerced human movement in the
Middle-Passage pattern, factual and never framed as value).

#### T3 — Port documentation: paragraphs + citations, per port
For each of the 66 sailing ports, research and write **period-appropriate
descriptive text at documentation depth**: a few paragraphs per port covering
what the harbour physically was (roadstead, river mouth, fortified basin),
what moved through it and for whom, how its fortunes ran across 1550–1815,
and what the era's own voices called it — each port with **citations** to the
sources used. This is the deep layer beneath T2's one-liners: T2 gives the
port panel its sentence; T3 gives the research section a proper entry per
port, the way `about.html` documents the whole chart.
**Output:** `research/port-docs.json` (per port: paragraphs, a distilled
period-appropriate description usable in the sim's port panel, and a source
list) + a `research/ports.html` documentation page rendering all 66 entries
(nav.js-integrated, house style). Citations follow the about-page pattern —
named series and scholarship, links where they exist.
**Register:** the charter applies in full; where a port's wealth rests on
coerced labour or the slave trade (Kingston, Cap-Français, Bahia, Elmina…),
the entry says so factually and without value framing.

### Phase RD — deferred design research

#### T7 — Vessel lifecycle & prize practice (feeds the eventual PLAN-5)
*(added 2026-07-16 — deferred; start only when PLAN-5 is being drafted)*
The historical grounding pass 5 (vessel persistence / capture / chases) will
need, evidence-classed like everything else: **service lifespans** by
rig/role/era (merchant hull working life, EIC ships' voyage counts, naval
commission and refit rhythms); **capture and prize volumes** in the modeled
wars (prize-court condemnations, privateer take rates, what fraction of
losses were capture vs. wreck vs. foundering — today's sim folds all loss
into one fate); and **prize renaming practice** (when captors kept a name,
when they renamed, navy vs. merchant practice) to ground the ideas.txt
sketch of captured ships joining the captor's pool under a new name.
**Output:** `research/vessel-lifecycle.md` — bounds + sources per claim, a
sim-shape recommendation per mechanism, and explicit flags where sources
support only qualitative statements (no fabricated precision).
**Feeds:** the PLAN-5 design doc (feature pass 5, `planning/RANKING.md`).

## Done

*(nothing yet)*
