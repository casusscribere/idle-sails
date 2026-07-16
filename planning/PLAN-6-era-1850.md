# PLAN-6 — The temporal expansion: 1550→1850, reset 1850→1860

**Status: drafted 2026-07-16 — AWAITING ADOPTION.** Do not build without user
sign-off on the §6 decisions. Extends the flowing era from `PLAN-2-flowing-era.md`
(supersedes its span parameters) and rides `PLAN-3-flows.md`'s machinery
unchanged, the same way PLAN-4 does. Numbered 6 because **PLAN-5 stays
reserved** for the vessel-persistence design (RANKING.md Pass 5, research T7).

## 0. What this is

Extend the flowing clock 35 years: the era becomes **1550→1850**, and the
reset ramp becomes a **decade**, 1850→1860, blending the 1840s spawn
distribution back to the 1550s. The loop period goes 270 → **310 years**
(300 flowing + 10 ramp). Everything else about the clock's semantics — decade
midpoints, interpolation, the wrap-aware lane fade at the seam — is kept.

The parameter change is trivial ([world.js:20-23](../world.js#L20-L23):
`ERA.to`, `RESET_YEARS`, and the derived spans; the `FLOW_DEC` grid grows
1810 → 1840). **Everything hard about this plan is honesty**: 1815–1850 is not
"more of the same era." It contains the post-Napoleonic trade boom, the
illegal-era slave trade, Latin American independence, the end of the Company
monopolies and the opium trade, the Opium War and the treaty ports, the
whaling peak, the sailing packet lines, mass emigration — and steam. A silent
extension that just stretches the 1810s forward would violate the charter
three ways at once (silent zeros, fabricated precision, undeclared
boundaries).

## 1. The mechanical changes (small, enumerable)

- **`world.js`** — `ERA = {from: 1550, to: 1850}`, `RESET_YEARS = 10`,
  `FLOW_SPAN = 300`, `CYCLE_YEARS = 310`; `FLOW_DEC` runs 1550…1840; the
  interpolation clamps move 1815→1850 and 1810→1840; the reset blend becomes
  1840s→1550s over ten years. Spawn-rate drift (0.6→1.25× today) is
  **re-anchored, not re-sloped**: the drift curve must be re-derived from the
  realized flow totals over the longer span (PLAN-3 S1 already computes rate
  from realized totals clamped to the era mean — the clamp band and mean
  simply recompute; verify the 1840s don't blow the population band).
- **`datasetVersion` bump + save reset.** A saved sim-time is a position in a
  270-year cycle; the cycle is now 310 years. There is no honest mapping —
  old saves reset. (Settings survive; they're deliberately outside the save.)
- **The `to: 1815` sentinel sweep.** 21 entries in `data-src/ports.json` use
  `active.to: 1815` where the meaning is "open at era end," and `eraNames`
  windows end at 1815 the same way; every flow system carries
  `era: {…, to: 1815}` likewise. Each must be re-read as a claim: *open →
  1850* (most), or *actually closes in 1815–1850* (and then when, with a
  source). Genuine closures already recorded (Smeerenburg 1660, Kaffa 1783,
  Louisbourg's window) are untouched. `research/flows/_schema.md`'s era
  default updates to 1850.
- **Tests** — the calendar-cycling, era-boundary-fade, and reset-seam tests
  re-pin to the new constants; everything else should hold by construction.

## 2. The historical substance, 1815–1850 (the real work)

Per basin, the surviving systems gain decades **1820/1830/1840** and the era
gains new systems. Evidence classes get *easier*, not harder — the
nineteenth-century record is rich:

- **Anchor series that already ground the matrix extend natively:** the Sound
  Toll Registers run to 1857 (the dues end that year); SlaveVoyages covers
  the illegal era through 1866; the Canton series hands off to treaty-port
  returns after 1842; British trade statistics become annual and official.
- **The illegal-era slave trade (charter-critical).** British abolition
  (1807) and the 1815 treaties did not end the traffic: the Brazil and Cuba
  trades ran at historic highs into the 1840s, ending in Brazil only with
  the 1850 Eusébio de Queirós law. This is **counted** (SlaveVoyages), it is
  enormous, and the era extension cannot silently drop it — that would be
  the exact silent zero the charter forbids. The Middle-Passage sober
  treatment extends unchanged (no value tier, no profit framing, factual,
  never a reward). The West Africa (suppression) Squadron enters as a naval
  pattern — a T4/RB item.
- **Latin American independence.** The Carrera/Cadiz system is already dying
  in the matrix's 1810s; 1820s+ it is gone. New flags (Brazil 1822, the
  Spanish American republics), Buenos Aires/Montevideo and Valparaíso
  opening to free trade — this is where PLAN-4's Montevideo candidate (E1)
  stops being marginal and becomes structural.
- **The China coast.** The Canton system to 1842; the Opium War (1839–42);
  Hong Kong (ceded 1841) and the treaty ports — Shanghai and Amoy are
  *already in the world*, so the treaty-port opening is mostly new lanes and
  windows, not new dots. The country trade and opium (EIC China monopoly
  ends 1833) are carried factually, cargo named as what it is.
- **The whaling peak** (1820s–1840s) — PLAN-4's E3 grounds node gains its
  best decades; adopting E3 without the era extension truncates its peak.
- **Sailing packet lines and emigration.** Black Ball (1818) and the packet
  lines are *scheduled sail* — exactly the T4 "scheduled services" shape,
  no new machinery. Mass emigration (Irish famine years 1845–50) is a flow
  with counted arrivals.
- **New ports the era demands** (via the CURATION rubric, §6 D5):
  **Singapore (1819)** is near-mandatory — instantly a top entrepôt;
  **Hong Kong (1841)**; **Valparaíso**; **Sydney** (wool from the 1820s–30s;
  but see D6 — convict transportation is a coerced flow); **New Orleans**
  (cotton). Each is a bake cost; each new power needs name pools (ship AND
  captain) — which re-raises T5 pressure.
- **Wars 1815–1850** for `wars.json`: the Latin American independence wars at
  sea (Cochrane's campaigns), Greek independence 1821–29 (Navarino 1827),
  Anglo-Burmese 1824–26, the Opium War 1839–42, the Mexican–American War
  1846–48; Algiers 1816 and the French conquest of 1830 end Barbary
  corsairing — which also closes the caravane-maritime context.

## 3. Steam (the boundary decision)

By 1850 steam is real: P&O mail from 1837, transatlantic steamers from 1838,
Cunard from 1840 — but the movement engine is wind/current/polar least-time
routing, and a steamer's track is precisely the thing it cannot produce.
Recommendation (**D1**): v1 of the extension is **a sail chart, declared** —
steam is a named entry in the silences register and a paragraph in
`about.html`'s declared divergences ("the chart shows sail; by the 1840s the
mail and the passengers increasingly went by steam"), not a fudged polar.
Ocean freight in bulk remained overwhelmingly sail through 1850, so the
chart stays honest about what it does show. A later steam layer (great-circle
legs, coaling stations) would be its own plan.

## 4. Phase plan (rides PLAN-3's machinery, PLAN-4's idiom)

- **X-R1 — the 1815–1850 research campaign.** Per basin, author the new
  decades for surviving systems + the new systems, deep-research style with
  adversarial verification (the R3 pattern); wars sweep; new-port candidate
  dossiers (Singapore, Hong Kong, Valparaíso, Sydney, New Orleans) in the
  `port-flow-candidates` pattern. **Runs as one campaign with Phase RB**
  (T4/T8/T9) where sources overlap — whaling, packets, suppression squadron
  are on both lists. Becomes research task **T10** in `research/TASKS.md`
  on adoption.
- **X-R2 — charter sign-offs.** The illegal-era coerced-flow framing (D2),
  convict transportation (D6), opium framing; silences-register entries for
  steam (D1) and whatever X-R1 leaves unquantified.
- **X-S1 — clock + fold.** The §1 mechanical changes; build-data folds the
  extended matrix; sentinel sweep; datasetVersion bump; tests re-pinned.
- **X-S2 — bake.** New ports and lanes baked (`pipeline/README.md` first, as
  always); new powers' vocabulary (flags, name pools, captains) validated;
  T5's `name-pressure.mjs` gate re-run over the 310-year cycle.
- **X-S3 — surfacing.** Era HUD and about/silences/flow-prominence pages
  speak 1550–1850; declared divergences updated; the research pages that are
  titled "…-1550-1815" stay as the historical artifacts they are (they
  document the retired rankings pipeline), with a one-line pointer.

## 5. What this plan touches in the other documents (on adoption)

| Document / phase | Impact |
|---|---|
| `PLAN-2-flowing-era.md` | Span parameters (265-yr flow, 5-yr ramp, 1810 grid) **superseded by this plan** — status-header note added; doc otherwise kept verbatim. |
| `PLAN-3-flows.md` | **Architecture unchanged, machinery re-run.** Schema era default 1815→1850; S1/S2/S3 patterns reused as X-S1/S2/S3; the anchor cross-checks extend natively. |
| `PLAN-4-expansion.md` | **Adopt together, or decide the roster together** (§6 D4): E1 Montevideo and E3 whaling change tier when the era covers their peaks; both plans add ports, and Phase RC must wait for the union of the two rosters. |
| `PLAN-convoys.md` / T9 | Rules era-gate automatically (peace after 1815 ⇒ convoy rates fall to the war-uplift path; Convoy Acts lapse). T9's sweep window extends to 1850 — no structural change. |
| RANKING Pass 3.5 / T5 | **Re-gate required**: 35 more traffic-years, higher late-era rates, and new powers' pools change peak pressure; re-run `name-pressure.mjs` before 3.5 ships (or re-verify after, if 3.5 ships first). |
| RANKING Pass 6 / T6 | Unaffected in substance (Aubrey's 1800–1815 commissions stand); the phrase "the sim's 1800–1815 tail" stops being a tail — cosmetic. |
| RANKING Pass 4 / T4 | **Scope extends to 1850** — packet lines, the whaling peak, the suppression squadron join the catalog. If RB has not run yet, extend it before running (one campaign, once). |
| RANKING Pass 5 / T7 | Unaffected (lifespans and prize practice are era-agnostic within sail). |
| `research/TASKS.md` RC (T1+T2+T3) | **Hard sequencing dependency**: the per-port sweep's windows must tile to 1850 and the roster must include the new ports — RC waits for this adoption decision (and PLAN-4's), else the sweep is done twice. |
| `research/TASKS.md` RB | Gains T10 (X-R1) as a member of the same campaign. |

## 6. Decisions flagged for adoption (do not build past these without sign-off)

1. **D1 — Steam:** declared boundary (recommended, §3) vs. any in-sim
   representation.
2. **D2 — The illegal-era slave trade:** confirm the Middle-Passage treatment
   extends to the Brazil/Cuba illegal trade and that the suppression squadron
   enters as a (naval-pattern) presence. Counted flow; cannot be silently
   omitted.
3. **D3 — Reset-ramp semantics:** same blend as today, stretched to ten years
   (recommended — nothing else changes), or a redesigned "epilogue" decade.
4. **D4 — Sequencing vs. PLAN-4 and Phase RC:** adopt PLAN-4 and PLAN-6
   together (recommended) so the roster settles once and the RC per-port
   sweep runs once, with windows tiling 1550–1850.
5. **D5 — The new-port wave-1 list:** Singapore (near-mandatory), Hong Kong,
   Valparaíso, Sydney, New Orleans — confirm the cut via the CURATION rubric
   (diversity ÷ bake cost).
6. **D6 — Convict transportation** (if Sydney enters): a coerced flow —
   confirm it takes the Middle-Passage-pattern sober treatment.
