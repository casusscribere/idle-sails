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
  a scheduled feature pass: ~~T5 → pass 3.5~~ (done 2026-07-16), T6 → pass 6.
  No shared sources; run whenever a pass is wanted — though T6 is
  deliberately sequenced LATE in the interleaved queue
  (`planning/RANKING.md`): pass 6 builds after the movement patterns, so the
  Aubrey catalog should know the convoy and Pass-5 mechanics it will be
  expressed through.
- **Phase RB — movement & flows.** One campaign over voyage-pattern sources:
  ~~T4~~ (ambient flows — **done 2026-07-17**, chunks 1–4 of the campaign)
  coordinated with PLAN-4's E-R1 verification where the
  two overlap — whaling grounds (E3), the caravane maritime (E7), Jeddah
  pilgrim shipping (E6), and the fisheries all appear on BOTH lists, so
  running T4 and a PLAN-4 wave-1 verification separately would read the same
  sources twice. ~~T8~~ (the sweep's declared silences — **done 2026-07-18**:
  fisheries/stockfish in chunk 2, the four remaining candidates in chunk 9)
  extended the same campaign.
  ~~T9~~ (convoy institutions & rates — **done 2026-07-16**, chunk 1 of the
  campaign) shared T4's naval-patterns strand, which landed with it.
  **T10 (PLAN-6 X-R1, live since the 2026-07-16 adoption)** is a member of
  the same campaign: whaling, packet lines, and the suppression squadron
  sit on both its list and T4's. **T12 (the 2026-07-17 addenda sweep)** is
  the campaign's tail: a T8-successor over Japan, Indonesia, the Pacific
  coasts, the Med African coast, and the Caribbean, plus the specials
  catalog and goods-thread lens — its Indonesia strand IS T8's Aceh/Bantam
  item. Campaign state: `research/rb-campaign.md`.
- **Phase RC — the per-port sweep.** T1 + T2 + T3 executed **together, one
  port at a time**: a single reading of a port's sources yields its
  name/ownership timeline (T1), the one-line blurb per window (T2), and the
  documentation-depth entry with citations (T3). Doing them as three separate
  66-port passes would triple the source work. **The roster question is now
  decided** (2026-07-16): PLAN-4 wave 1 (all five Tier-1) and PLAN-6 (era to
  1850, five new ports) are both adopted — the sweep waits for their E-S/X-S
  builds so it runs once over the final roster, with windows tiling
  1550–1850.
- **Phase RD — deferred design research.** T7 feeds the eventual PLAN-5
  design doc (vessel persistence / capture); T11 feeds the future
  steam-layer plan (PLAN-6 D1 queued it). Each starts only when its plan is
  being drafted; listed now so neither design is done from nothing.

## Open

### Phase RA — feature gates

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
earlier costs a second look once the mechanics exist. *(2026-07-17,
addendum #7): commissions may carry a per-seed FIRING PROBABILITY so not
every run sails every easter egg — record a suggested probability per
commission; the around-South-America legs (#3) note which need the Cape
Horn / west-coast candidates from T12.*
**Output:** `research/aubrey-voyages.json` — per commission
`{vessel, rig, window, itinerary, events, book, notes}`.
**Feeds:** feature pass 6 (`planning/RANKING.md`).

### Phase RB — movement & flows

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

#### T12 — The addenda sweep: under-searched waters & goods threads
*(added 2026-07-17 from `feature-ideas/research_addenda.txt` — a
T8-successor candidates campaign; run with or after Phase-RB chunks 5–10,
sharing sources where they overlap)* Deep-search sweeps in the
`port-flow-candidates` pattern (evidence class, bounds, adversarial
verification, mappability) over the waters the addenda flag:
- **Japan** (#1): Dejima trade histories beyond the Nagasaki registers the
  matrix already uses; candidate additional Japanese ports (with the
  sakoku boundary declared honestly); feeds the Pass-4 `scriptedOnly` port
  gate (Dejima the exemplar).
- **Indonesia** (#2): deep search for archipelago trade — **overlaps T8's
  Aceh/Bantam item; run as one strand.**
- **Cross-Pacific & around South America** (#3): NA/SA west-coast port
  candidates (overlaps queued E9 Callao); Cape Horn / around-SA routes —
  chunk 1 verified post-1740 registros sueltos rounded the Horn, and the
  Aubrey canon (T6) sails these waters.
- **Mediterranean African coast** (#4): valid ports on the bare coast
  (Tripoli, Tunis, Algiers…) — chunks 1/3 already ground the corsair and
  caravane-Barbary context.
- **Caribbean** (#5): trade and pattern deep search — piracy beyond the
  existing hazard treatment, the NA gulf coast (New Orleans is adopted via
  PLAN-6; what else?). Chunk 1's guarda-costas findings are the starting
  bounds.
- **India–Arabia–East Africa review** (#6): should there be more
  Ottoman/Mughal trade? Run as a lens over E2/E6/E10's E-R1 work rather
  than a separate gather.
- **Special one-time routes** (#7): a catalog of unique/rare historical
  voyages suitable as probabilistic scripted specials (per-seed firing —
  see RANKING Pass 4). Feeds Pass 4 and Pass 6.
- **Goods-thread lens** (#8): the global silver circuit, whaling (incl.
  Japanese coastal whaling), and the Middle Passage as followable threads
  — research for the queued trade-goods-threads display feature (RANKING,
  outside the ladder). The Middle-Passage thread keeps the sober register
  exactly; charter review as authored.
**Output:** dated candidates doc(s) + register entries + the specials
catalog; promotion-queue updates via `CURATION.md`.
**Feeds:** the promotion queue; Pass 4/6; the trade-goods-threads feature;
PLAN-4's next wave.

#### T10 — The 1815–1850 research campaign (PLAN-6 X-R1)
*(live 2026-07-16 on PLAN-6 adoption — the plan's X-R1 phase, run as part of
the Phase-RB campaign)* Per basin, author the new decades **1820/1830/1840**
for surviving systems and the era's new systems, deep-research style with
adversarial verification (the R3 pattern); the 1815–1850 wars sweep; and
new-port candidate dossiers (Singapore, Hong Kong, Valparaíso, Sydney, New
Orleans — the adopted D5 list) in the `port-flow-candidates` pattern.
Charter-critical inclusions per the adoption sign-off: the **illegal-era
Brazil/Cuba slave trade** (counted, SlaveVoyages through 1866; Middle-Passage
sober pattern; the West Africa suppression squadron as a naval pattern) and
**convict transportation** to Sydney (same sober pattern). Whaling, packet
lines, and the suppression squadron overlap T4 — one campaign, one reading.
**Output:** extended basin files in `research/flows/`, wars additions,
candidate dossiers, and X-R2's charter sign-off texts staged for review.
**Feeds:** PLAN-6 X-S1/X-S2; PLAN-4 E-R1 (shared verification fleet).


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

#### T11 — Steam under sail: the evidence base for a future steam layer
*(added 2026-07-16 with the PLAN-6 D1 decision: v1 of the era extension is a
declared sail chart, and steam becomes a QUEUED feature with its own research
task — this one. Deferred; start when the steam layer is being planned.)*
The 1815–1850 window ends with steam real (P&O mail 1837, transatlantic
steamers 1838, Cunard 1840) but unrepresentable by the wind/polar routing
engine. For a future steam layer: **which services** actually ran under
steam by 1850 (mail packets, river/coastal services, the pioneering ocean
lines), their **routes, schedules, and coaling stations**, how volume split
sail-vs-steam per trade (bulk freight stayed sail — bound this properly),
and what a sim representation needs (great-circle legs + coaling calls vs.
baked polylines; era windows per line). Evidence-classed throughout.
**Output:** `research/steam-services-1815-1850.md` — services catalog with
bounds + a sim-shape recommendation; the silences-register `steam` entry
(created at X-R2) gains a pointer to it.
**Feeds:** the future steam-layer plan (`planning/RANKING.md`, outside the
ladder); until that plan is drafted, steam remains a declared boundary.

## Done

- **T8 — the 2026-07 sweep's declared silences (2026-07-18, Phase-RB
  chunks 2 + 9).** All five declared gaps answered: the Iceland/North-Atlantic
  fisheries + Bergen stockfish in chunk 2 (`ambient-flows.md` §2); the four
  remaining — the Ostend & Trieste companies, the New Julfa Armenian carriage,
  the Aceh/Bantam pre-VOC pepper — in chunk 9 (`port-flow-candidates-2026-07-18.md`;
  64 claims, 55 ✅ / 9 ⚠ / 0 ✂). Outcomes: **two new ports** (Ostend 1715–1745,
  Bantam 1550–1685 — both inside the current era, so promotable now via
  `CURATION.md`), **two folds** (Ostend hard-clamped into `minor-company-
  arterials`; Trieste/Bolts's 9-yr micro-flow), and **three silences answered**
  (New Julfa `gestured` + a mapped Madras–Manila proxied lane; the failed
  Habsburg stations `gestured`; Bantam's pre-VOC carriage a `monopoly-
  displacement` `asserted` pointing at the new `bantam-pepper` system). Feeds
  the promotion queue + the silences register.

- **T4 — ambient flows & naval movement patterns (2026-07-17, Phase-RB
  chunks 1–4).** The full catalog is `research/ambient-flows.md` §§1–4:
  naval patterns · fisheries & whaling · scheduled/state services · local
  metabolisms — 286 claims total under full-adversarial verification
  (229 ✅ / 56 ⚠ / 1 ✂). Cross-cutting conclusion: the GROUNDS-NODE
  primitive is the one new movement primitive the program needs (six
  patterns wait on it); everything else rides existing machinery. Register
  implications recorded per section (herring quantified; coastal-shipping
  and china-coastal upgradeable; Pontic grain a mandatory declared silence
  if no Black Sea port). **Feature pass 4's hard gate is OPEN.**

- **T9 — convoy institutions & rates (2026-07-16, Phase-RB chunk 1).**
  Full-adversarial campaign: 84 claims gathered (Iberian · company/British/
  Levant · naval patterns), every one independently attacked — 62 verified,
  22 corrected, 0 refuted. Output: `research/ambient-flows.md` §1 with the
  evidence-classed rule-values table; `planning/PLAN-convoys.md` §1 table
  refreshed with corrected values. Substantive findings: the caravane
  maritime is NOT a convoy institution (row re-scoped to Dutch/English
  Smyrna convoys); galeones END 1739 with sueltos at 79.5–87% after;
  Brazil frotas 1649–1765 added; the British convoyed-trade share stays
  `asserted` 0.75–0.95 (no source quantifies it — verify vs Knight).
  T4's naval-patterns strand landed in the same section (station-keeping
  needs a station-node primitive; guarda-costas = hazard-uplift only;
  Pirate Round's existing hazard treatment confirmed).

- **T5 — name-pool expansion (2026-07-16).** All eight failing pools
  expanded to period-plausible target sizes (Portugal 12→44, Hansa 10→28,
  Mughal 9→20, Ottoman 10→20, Britain merchant 66→90, junk-trade 11→16,
  Gowa 8→12, Spain 12→16; dutch/france padded as headroom); gate green on
  seeds 42/7/23 (worst pool 64%), 46 tests pass. Measurement note:
  `research/name-pressure-2026-07-16.md`. **Standing caveat:** PLAN-6's
  adoption re-raises pressure — re-run `research/tools/name-pressure.mjs`
  over the 310-year cycle at X-S2, and again before pass 3.5 ships.
