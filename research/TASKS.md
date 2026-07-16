# Research task queue

Standing research tasks that are **not** port promotions — those keep their
own pipeline in `CURATION.md` + `minor-ports-promotion.json`. A task moves to
**Done** with a one-line outcome when its output lands in the repo.

## Open

### T1 — Port name & ownership changes: the full-roster sweep
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

### T2 — Era blurbs: one sentence per port/name/ownership combination
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

### T3 — Port documentation: paragraphs + citations, per port
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

### T4 — Deep research: ambient flows & naval movement patterns
A deep-research sweep (the `port-flow-candidates-2026-07.md` pattern:
multi-source, adversarially verified, claims flagged) into **movement
patterns that are not port-to-port trade lanes** but may be relevant and
mappable in this project — the evidence base for feature pass 4.5 (ambient
flows). Candidate families to investigate, confirm, bound, or reject:
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
**Output:** `research/ambient-flows.md` — the catalog with per-pattern
evidence class, bounds, sim-shape recommendation, and silences-register
cross-references (patterns that answer a gestured silence must say which).
**Feeds:** feature pass 4.5 (`feature-ideas/RANKING.md`); silences register
updates where a gestured entry gains representation.

### T5 — Name-pool expansion: peak pressure under 70% per pool
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
  plus recent losses). The measurement harness from the 2026-07-16
  feasibility pass belongs in `research/tools/` so the target is re-checkable
  after any flow-matrix change (traffic growth re-raises pressure).
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
**Feeds:** feature pass 3.5 (`feature-ideas/RANKING.md`).

## Done

*(nothing yet)*
