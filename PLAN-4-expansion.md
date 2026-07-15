# PLAN 4 — The wider world: new basins, counted fleets, and the register answered

**Status:** drafted 2026-07-14 from the deep-research sweep
(`research/port-flow-candidates-2026-07.md`) — **awaiting adoption**. Extends
`PLAN-3-flows.md`; changes none of its architecture. Everything here rides the
machinery PLAN-3 built: trade systems with per-decade [lo,hi] ranges, per-seed
realization, basin-local assembly, the silences register, lifecycle windows,
era names, and the promotion queue under `research/CURATION.md`.

---

## 0. Why expand — and why these

PLAN-3 closed with 66 ports, 60 systems, and flow coverage 76–89% — of the
volume *the six authored basins know about*. The 2026-07 research sweep asked
the next Trouillot question: what does the **register itself** not yet carry?
It returned five Tier-1 candidates with **counted** series (the evidence class
the charter prizes), two register revisions, three new register entries, and a
list of what the sweep itself failed to reach. Verification status is honest:
five claims hold a 3–0 adversarial stamp (the Persian Gulf cluster); the rest
are source-extracted and hand-checked, to be re-verified during authoring —
the same standard R3 applied to its own sources.

Two of the five Tier-1 candidates answer **existing silences-register
entries**. That is the test of the register working as designed: silences are
supposed to become work.

## 1. The candidate ledger

Full evidence detail and sources: `research/port-flow-candidates-2026-07.md`.

### Tier 1 — counted series, adopt first

| # | candidate | basin | era | evidence | answers |
|---|---|---|---|---|---|
| E1 | **Montevideo (Río de la Plata)** node + systems | Atlantic | 1680–1815 | counted (Jumar entries 1680–1806; Borucki 712 slave voyages) | new water; sober-framed coerced flow ≥70k people 1777–1812 |
| E2 | **Basra** node (+ **Bandar Abbas** promotion, t2→next) | Indian Ocean W | 1550–1815 | counted/proxied (Gombroon diaries IOR/G/29 ✅; VOC Basra lists) | non-European agency (Çelebi fleet ✅); Hormuz→Bandar Abbas era-rename at 1622 |
| E3 | **South Sea whaling grounds** node (the Smeerenburg pattern) | Atlantic/Pacific | 1775–1815 | counted (BSWF 2,500+ voyages; AOWV) | **revises `svalbard-offshore-whaling`** — the grounds-node solution generalizes |
| E4 | **York Factory (Hudson Bay)** node | Atlantic/Arctic | 1668–1815 | counted (HBCA ships' histories) | the Dejima pattern: 1–3 ships/yr, season-gated like Arkhangelsk |
| E5 | **Port Louis (Île de France)** node + Mascarene system | Indian Ocean W | 1721–1815 | counted (Allen's 641-voyage inventory, 1768–1809) | **extends `coerced-flows-beyond-atlantic`** toward counted; sober framing mandatory |

### Tier 2 — counted/proxied, adopt as basin work allows

| # | candidate | basin | note |
|---|---|---|---|
| E6 | **Jeddah** | Red Sea (new water) | proxied (tithe/customs); the India–Ottoman axis (1785: Istanbul's India imports ≈ its Europe imports) |
| E7 | **Caravane maritime** system + **Alexandria**, **Salonica** | Mediterranean | Panzac; one counted episode (1772: 60+ ships, Salonica→Istanbul grain); upgrades queued Smyrna |
| E8 | **Ragusa** (queued t2 — evidence upgraded) | Mediterranean | Dubrovnik notarial/insurance series → counted/proxied, not asserted |
| E9 | **Callao (Lima)** + Pacific thalassic system | Pacific | proxied/reconstructed; gives Acapulco a non-galleon connection; needs Humboldt-current bake check |
| E10 | **Mozambique Island** | IO W / Atlantic hinge | counted on the Plata side (Borucki); Mascarene + carreira roles; likely supersedes queued Mombasa (t3) |

### Register actions (do with, not after, the adoptions)

- Revise `svalbard-offshore-whaling` when E3 ships (grounds node exists).
- Extend `coerced-flows-beyond-atlantic` with E5's inventory.
- Add `plata-contraband-silver` (evasion) if E1's node bakes before its
  smuggling system is authored.
- Add `mediterranean-corsair-slavery` — record **with** the contestation of
  Davis's estimate (no fabricated precision).
- Add `sulu-zone-raiding` (gestured; thin quantification inside the window).
- `black-sea-after-1783` unchanged — Odessa stays queued.

### The sweep's own silences (next research pass)

Iceland/North Atlantic fisheries · Bergen/Trondheim stockfish · Ostend &
Trieste companies · New Julfa Armenian carriage · Aceh/Bantam pre-VOC pepper.
Declared here so their absence reads as the sweep's limit, not history's.

## 2. Phases

Numbered E (expansion) to avoid colliding with PLAN-3's R/S.

- **E-R1 — verify & author (per candidate).** Re-run adversarial verification
  on the unverified claims (the fleet was rate-limited on 2026-07-14); author
  each adopted candidate as trade systems in its basin file with per-decade
  [lo,hi] ranges, evidence classes, and cross-checks (Jumar/Borucki for E1,
  IOR/VOC for E2, BSWF/HBCA lists for E3/E4, Allen for E5). Coerced systems
  carry the validator-enforced framing block. Register actions land here.
- **E-R2 — port definitions.** New ports into `data-src/ports.json` with
  lifecycle windows and era names where earned (Hormuz→Bandar Abbas 1622;
  Port Royal precedent applies); lanes into `data-src/routes.json` respecting
  the lifecycle invariant; polars: existing classes suffice (dhow for the
  Gulf; brig/indiaman elsewhere; whalers sail as merchant class — a declared
  simplification unless a polar is funded).
- **E-S1 — bake & fold.** Feasibility (ocean-cell snap) per port; re-bake;
  fold the new systems; verify wind-gating behaves in the Gulf and the
  Southern Ocean (the Brouwer/Roaring-Forties machinery already covers E3's
  grounds runs). Watch for new strait carves (Shatt al-Arab approach for
  Basra; Río de la Plata estuary) — the Gulf-of-Finland precedent.
- **E-S2 — surface.** Ledger evidence lines come free; register page updates;
  the research page gains the candidate table with adoption status.

Each phase is per-candidate independent — E2 (whose evidence is already
verified) can run E-R1→E-S2 alone before E1 finishes verification. No
big-bang: adopt in evidence order, Tier 1 first.

## 3. Decisions needed at adoption (flag before deep work)

1. **Scope of the first wave** — all five Tier-1, or a smaller cut (E2 is the
   most verification-ready; E1 is the largest single gap).
2. **Grounds nodes as a pattern** (E3): approving one whaling-grounds node
   implicitly re-opens Svalbard/Davis Strait — decide whether the Arctic
   fishery returns in the same wave or stays registered.
3. **Node placement compromises** — Montevideo-for-the-complex, grounds-node
   coordinates, Mozambique Island vs Mombasa — same roster-scale staging rule
   as the Delaware capes / Hooghly mouth precedents.
4. **Coerced-flow review** — E1 and E5 add substantial coerced systems; the
   sober-framing text for each needs the same user sign-off the Middle
   Passage and Kaffa received.

## 4. What this does not change

The spectator surface (a speed slider and click-to-inspect), the determinism
guarantees, the reset-loop clock, the bake pipeline's corrections, and
PLAN-3's basin files all stand. This plan only widens the world they carry —
and retires silences by the register's own preferred route: with evidence.
