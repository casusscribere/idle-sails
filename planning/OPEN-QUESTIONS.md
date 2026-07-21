# OPEN-QUESTIONS.md — decisions blocking queued work

Opened **2026-07-21** with the queue renumbering. Each entry is a **D-nn** ID
referenced from `RANKING.md`. Answer them in any order; each records the answer
and its date inline, and the blocked items move the same day.

Format: the question, why it is blocking, and the options with a
recommendation where one is defensible.

> **Answer these two first — they unblock the whole of chunk C1 (the clean
> sweep), which is every no-research, no-sim, no-re-bake fix in one sitting:**
> **[D-05b](#d-05b--which-chart-plates-survive)** (which chart plates survive)
> and **[D-13](#d-13--debug-overlays-debug1-only-or-a-menu-toggle)** (debug
> overlay: `#debug=1` or a menu toggle). Both are small. Every other decision
> gates a later chunk — see the decisions-by-chunk table in
> [RANKING.md §11](RANKING.md#11-execution-chunks).

---

## Scheduling

### D-01 — Do the shallow versions run now, or wait for the locked refinement track?
**Blocks:** F-08, F-26, R-10, and the framing of F-13 and R-03.

`feature-ideas/research_refinements` (locked, mirrored in
[REFINEMENTS.md](REFINEMENTS.md)) asks for full re-review passes over port
histories (1a), name lists (1b), routes vs. real map data (1c), weather/loss
zones (1d), and per-port cargo production/consumption (1e). Four of those are
the deep version of something already queued:

| Locked section | Queued shallow item |
|---|---|
| 1a port histories | R-01 (Japan), R-03 (access rules), R-04 (Korea/Pacific) |
| 1b name lists | F-08 (the Dutch list) |
| 1d weather | F-13 (region-aware sinking) |
| 1e cargo flows | R-10 → F-26 (port buy/sell) |

**Options:** (a) proceed with the queued items now and accept that the locked
pass will revisit them; (b) hold the four queued items until the track
unlocks; (c) unlock specific sections now (1b and 1e are the two where the
shallow version is most likely to be wasted work).

**Recommendation:** (c) for **1e** — F-26 has no honest data without it — and
(a) for the rest.

### D-02 — Nagasaki and Dejima: one node or two?
**Blocks:** F-09, F-24, and part of F-14's `scriptedOnly` work.

`ideas.txt` §12 says *"Nagasaki is not Dutch in 1550; sorry. Separate Nagasaki
from Dejima and spawn Dejima separately when relevant."* The first half is
already fixed — the node is `power: japan` and carries a `note` explaining it.
The second half was deliberately **not** done: there is one node, `dejima`,
displayed as **"Nagasaki (Dejima)"**, active 1571–1850, whose note argues that
at a kilometre apart they are one dot at chart scale, so the separation is
carried in the flow matrix and the vessel's ledger instead.

**Options:** (a) keep one node, and make the *ledger* carry the distinction
more visibly (cheap); (b) split into two nodes and let **F-24** draw them as a
shared icon that lists both in the panel — this is exactly the co-located-icon
feature, and Dejima would become the exemplar `scriptedOnly` port; (c) split
with two separate marks at chart scale (visually wrong, but unambiguous).

**Recommendation:** (b) — it is the option that makes both features real, and
it is the one the user's own §9 co-located-icon idea anticipates.

### D-03 — "Rebuild the route-finder and wind charts": how far?
**Blocks:** L-02, and the ambition level of F-06.

`ideas.txt` §1 opens with *"Rebuild the route-finder and wind charts to be more
granular / effective"* and then asks whether the oddly-square routing is
historical or an artifact. **Answer: artifact.** The router works on a 1° grid
against a 50 m display coastline; that mismatch is the confirmed root cause of
the square legs, the residual land clipping, and the tip-grazes — and it is why
the Danish straits **cannot** be sealed without severing the Baltic entirely.

**Options:** (a) keep the 1° engine and fix offenders one at a time (F-06,
cheap, never fully clean); (b) increase grid resolution in coastal zones only
(a hybrid — moderate cost, re-bake required); (c) full rebuild with new field
data at higher resolution (L-02: new archived fields, a full re-bake of all 414
routes, and a design doc).

**Recommendation:** (b) if the squareness genuinely bothers you at normal zoom;
(a) otherwise. (c) only alongside refinement-track §1c, so the rebuilt engine
is validated against real historical routes rather than against itself.

### D-04 — Porto and Rotterdam: flows, or declared silences?
**Blocks:** F-01.

Verified 2026-07-21: of 112 ports, **Porto** and **Rotterdam** appear in no
route as origin, destination, or waystop. They are drawn on the chart and can
never receive a vessel. Under the charter that is a silent zero — Porto's port
wine trade to Britain under the Methuen Treaty and Rotterdam's Rhine-mouth
carriage both plainly existed.

**Options:** (a) author flows for both (Porto→London/Bristol wine; Rotterdam
into the existing North Sea/Baltic arterials) — the honest fix, needs a small
research pass and a re-bake; (b) register both as declared silences and mark
them on the chart as such; (c) remove the dots.

**Recommendation:** (a). (c) is the one option the charter rules out for Porto —
removing a port because we lack its data is exactly the silence the project
exists to refuse.

### D-05 — Are the four re-listed region strands a re-run, or carried-over text?
**Blocks:** R-05.

The reorganized `research_addenda.txt` still lists Indonesia (R1b), Caribbean
(R1d), India–Arabia–East Africa (R1e), and cross-Pacific/around-SA (R1c) as
open research. All four were answered by T12 on 2026-07-18 (nodes added:
Callao, Guayaquil, Curaçao, St Thomas, Paramaribo, Belize, Bantam; systems and
hazard zones added; silences registered).

**Options:** (a) they are carried-over text — close R-05 and point at T12;
(b) the T12 answers were too thin for one or more strands — say which, and
R-05 re-runs only those; (c) re-run all four at greater depth.

### D-05b — Which chart plates survive?
**Blocks:** F-33.

Eight plates exist: `world`, `europe` (full Med incl. the North African
shore), `caribbean`, `east-indies`, `arabia-india`, `na-northeast` (already
hidden), `australasia`, `pacific`. `ideas.txt` §12 says *"consider removing the
'Arabia & India' and 'Newfoundland to the Chesapeake' hidden plate views
entirely — really, review all visible and deprecated plate views."*

Note `arabia-india` is **not** currently hidden and was fleshed out by Phase 1
(Basra, Bandar Abbas, Jedda + the India ports); `na-northeast` is hidden and
still sparse (5 ports; its Grand Banks fishery traffic waits on F-15).

**Options:** (a) delete `na-northeast`, keep `arabia-india`; (b) delete both;
(c) keep both, unhide `na-northeast` after F-15 ships.

---

## Feature shape

### D-06 — Is the overlay taxonomy still wanted?
**Blocks:** F-27.

The request was to replace the routes-overlay's per-**basin** sub-toggles with
per-**movement-type** ones (arterial / coasting / coerced / fisheries /
naval-state). It has been pending design since 2026-07-19 and **is not present
in the reorganized input files** — it may have been dropped deliberately.

### D-07 — Is R-08 (imbricate vessel identity) still wanted?
**Blocks:** R-08, and the scope of R-07.

R-08 (old T13) was added on 2026-07-18 at the user's verbal request: model a
vessel's build origin, ownership, registry, flag, master nationality, and crew
as facets that moved independently — including wartime neutral-flag transfer,
and including the lascar, African, and Asian mariners the single-nation model
erases entirely. It is **not present in the reorganized input files**.

It is a substantial charter item (that erasure is exactly a Trouillot silence),
so it is worth confirming rather than assuming.

### D-08 — Blockades: data override or sim mechanic?
**Blocks:** F-17, and the scope of R-06.

`ideas.txt` §6a asks for *"port/route blockades (historical famous blockades,
ships should re-route, etc)"*.

**Options:** (a) a war-scoped lane override in the data — a lane is blocked,
rerouted, or attrition-uplifted for a date range (cheap, fate-at-spawn-safe,
and matches the evidence, which is about aggregate traffic behaviour);
(b) a live sim mechanic with blockading squadrons on station that individual
vessels evade or run (needs W5's interaction model).

**Recommendation:** (a). The historical record supports what traffic *did*, not
what a given ship's encounter looked like.

### D-09 — Piracy: pursuing vessels, or visible presence?
**Blocks:** F-37's scope, and whether a cheap version lands in W3.

`ideas.txt` §6a asks for *"pirate vessels spawn and pursue other ships"*. True
pursuit breaks fate-at-spawn and belongs in W5. But there is a W3-buildable
version: pirates spawn as vessels on plausible cruising patterns (the Pirate
Round and the golden-age-piracy hazard zone already exist as hazards), visibly
present and raising loss odds in their waters, without ship-to-ship interaction.

**Options:** (a) cheap version in W3 now, true pursuit later in W5; (b) wait
for W5 and do it once.

### D-10 — Does the cat survive the cycle reset?
**Blocks:** F-20.

`ideas.txt` §10 says the cat *"persists across the sim cycle"* and needs
fallbacks for being trapped in a port that shuts down and for being aboard a
ship that sinks (nine lives).

At the 1550 wrap the world's displayed histories reset to the new iteration
while state is retained. **Does the cat cross that seam** — the same cat, at
the same port, in 1550 as in 1849 — or is she re-placed with the new cycle?
The first is more charming and slightly harder (she must be granularity-
independent across the seam); the second is trivial.

Also: are the nine lives **counted and shown** (a cat panel, a death toll), or
purely a fallback rule?

### D-11 — Ahistorical mode: separate mode, or a seed flag?
**Blocks:** L-03.

**Options:** (a) a URL/menu mode with its own visual treatment, so nothing
ahistorical can ever be mistaken for a sourced claim; (b) a seed flag that
randomizes wars and dynamics inside the normal chart. The charter argues
strongly for (a) — the sober register cannot be allowed to blur.

### D-12 — Confirm the archive prune plan.
**Blocks:** L-04.

`ideas.txt` §2 asks to prune the archive completely, taking anything useful
forward first. The dependency is hard: `pipeline/bake-routes.mjs` still reuses
`archive/isochrone-v1/pipeline/router.mjs` and the 31 MB of `.bin` wind/current
field data. Confirm the plan is: move `router.mjs` + the fields into
`pipeline/`, re-run a bake to prove the move, **then** delete `archive/`
(keeping `ARCHIVE-NOTE.md` and `SOURCES.md`, which are cited by
`research/about.html`).

### D-13 — Debug overlays: `#debug=1` only, or a menu toggle?
**Blocks:** F-34.

`ideas.txt` §3 asks for red marks on ports that will change name / appear /
disappear, and red icons for ports that have not appeared yet. Debug-only keeps
the chart clean; a menu toggle makes it a genuinely interesting *feature* (the
chart showing you its own future), which may be worth having.

### D-14 — Is PLAN-5 wanted now, or still deferred?
**Blocks:** W5 in its entirety.

Vessel persistence is the largest single item in the input files (`ideas.txt`
§5 in full, plus §6a's interactions) and it gates the tracker panel, which is
currently shipped-but-greyed. Confirm it stays last, or promote it.

---

## Verification

### D-15 — York Factory: too few ships, or too bursty?
**Blocks:** F-02's framing.

After the small-trade visibility floor (2026-07-20), York Factory measures
~1.1 ships/yr against a historical 1–2. The user reports it still *"doesn't
seem to reliably get"* that. A Poisson process at 1–2/yr produces multi-year
gaps as a matter of course — so the question is whether the complaint is
"the rate is wrong" or "the gaps are unreadable". If the latter, the fix is a
seasonal/annual scheduled sailing (the Hudson's Bay Company ship *was* an
annual scheduled sailing, which is a fidelity improvement, not a fudge).

### D-16 — Portuguese naus at Nagasaki in 1627: is the sim wrong?
**Blocks:** the framing of R-01(a).

Portuguese ships did trade at Nagasaki in 1627 — the expulsion came in 1639,
after a decade of tightening. So the sighting may be **correct**. The real
questions R-01 must answer are whether the traffic *ends* at the right year,
whether its volume tapers through the 1630s, and whether the sim's Portuguese
Japan trade begins at the right year too.

### D-17 — Confirm the new nomenclature.
**Blocks:** nothing, but it is worth confirming before it propagates.

The scheme now in use: permanent typed IDs (**F-** feature, **R-** research,
**D-** decision, **L-** locked), never renumbered; ordering by **wave W1–W6**
plus **LOCKED**, where an item's wave may change but its ID may not. Passes,
Phases (both kinds), Batches, and T-numbers are retired, with a full old→new
map in `RANKING.md` §3.
