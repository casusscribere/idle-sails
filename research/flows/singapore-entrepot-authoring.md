# Authoring dossier — `singapore-entrepot` (Phase 1, increment 6d)

*One of the seven orphan-port systems the world build still owes. Singapore was
promoted to a real port in increment 5 (`active {1819,1850}`, node 1.29 N /
103.85 E) but no flow system referenced it, so nothing sailed there. This dossier
synthesises the research (from `new-ports-wars-1815-1850.md` §Singapore + the
`baltic-med-bengal-1815-1850.md` bengal strand, both adversarially refuted in the
RB campaign) into an authorable system, and records the program-architecture
touchpoints and the charter decisions the authoring forced.*

## 1. The history (post-refutation anchors)

Raffles founded the free port on **6 Feb 1819**; full British cession 1824
(Anglo-Dutch Treaty), Straits Settlements from 1826. It grew explosively as the
entrepôt of the eastern archipelago — the hinge where three trade rhythms met:

- **Year-round European square-rig** on the Calcutta ↔ Singapore ↔ Canton
  arterial (opium out, tea/goods home), plus London and Bombay (Malwa opium
  ≈ half the total from the late 1820s) and a thin Batavia link.
- **China junks**, arriving Jan–Mar on the NE monsoon and departing from May
  (first Amoy junk 19 Feb 1821).
- **Bugis prahus**, arriving Sept–Oct with archipelago produce.

**Counted magnitude anchors** (Wong Lin Ken's Master-Attendant returns — the
single-compiler dependency the refuter flagged, hence *counted / medium*):
square-rig entries **139 (1822) → 517 (1834) → ~1028 (1854)**; native craft
**2,310 (1854)**, ~69% by number but only ~18–43% by tonnage; trade value
**$0.4 M (1819) → $17.8 M (1830) → $14.2 M (1835 dip) → $25.2 M (1850)**. Shape:
explosive 1819–25, plateau-with-dip 1826–37 (Dutch duties + NHM diversion at
Batavia), renewed growth 1838–50.

## 2. Deriving `byDecade` voyages/yr [lo,hi] (foreign-going basis, R1)

The guides give a **value** series and **three counted vessel-count years**, not a
ready decade voyage series, so the ranges are reconstructed *between* the counted
anchors and stated as bounds (no fabricated precision). Basis = foreign-going
arrivals: square-rig + long-haul junks + the larger Bugis prahus; the mass of
tiny intra-archipelago native craft sits below the foreign-going threshold and is
**not** summed in (noted, not silently zeroed).

| decade | [lo,hi] | reasoning |
|---|---|---|
| 1810 | [30,100] | the 1819 founding year only; from ~$0.4 M, a bare start |
| 1820 | [130,340] | 139 sq-rig (1822) ramping through the explosive years + the first Amoy junks/Bugis prahus |
| 1830 | [340,640] | 517 sq-rig (1834) + junks/prahus, damped by the mid-1830s value dip |
| 1840 | [560,1040] | renewed growth, sq-rig climbing toward the 1854 count |
| 1850 | [720,1320] | approaching 1854's 1,028 sq-rig + the substantial junk/prahu share |

Evidence class **counted** (honouring the refuted determination), but the `basis`
string states plainly that it rests on one compiler and that the inter-anchor
years are bracketed — the ledger should not imply a hard annual count.

## 3. Program-architecture touchpoints

The fold pipeline (`pipeline/build-data.mjs §fold`) folds each flow system's
`lanes[{from,to,share}]` — via each basin's `ports[].simProxy` — onto **baked**
route pairs whose era overlaps the system era. So making Singapore sail is a
four-layer change, and every layer has a gate:

1. **`research/flows/bengal-se-asia.json`** — add `singapore` to `ports[]`
   (`simProxy: "singapore"`; without it the lanes can't resolve) and the
   `singapore-entrepot` system to `systems[]`.
2. **`data-src/routes.json`** — a **baked lane** for every folded pair, or the
   share folds onto nothing (the nhm-java lesson). Each route's `shipTypes` must
   **overlap** its era (`build-data.mjs:157`) and its era must sit inside both
   ports' lifecycle windows (`:165`) and its flag's power window.
3. **Ship-type eras.** `junk` and `dhow` still ended **1815** (increment 3b
   extended only the four European rigs). The overlap gate therefore *rejects* a
   1819-start junk/dhow lane. Extend both to 1850 — historically correct (the
   junk and dhow trades ran the whole era) and it retroactively tightens the 6c
   Gulf dhows, which had relied on the overlap-only check.
4. **Power windows / cargo.** The `bugis` power ended 1815; extend to 1850 so
   indigenous Bugis carriage flies **its own flag**, not a colonial one (§4).
   `opium` did not exist as a cargo — added, named plainly (§4).

Then `bake-routes.mjs` (South China Sea / Malacca routing — no cap issues) and
`build-data.mjs` regenerate; `npm test` must stay at 55.

## 4. Charter decisions this authoring forced

- **`opium` is named, not laundered.** The China trade's keystone commodity was
  absent from `cargo.json`. Added as a normal (non-coerced) cargo with a note that
  names it honestly — Bengal & Malwa opium carried against Qing prohibition, the
  cause of the Opium Wars — rather than hiding it inside "trade-goods."
- **Indigenous Bugis carriage flies the `bugis` flag.** The guide flagged the
  Bugis prahu flow as "charter-critical indigenous carriage — flag if no baked
  archipelago node." Makassar *is* a baked node; the only obstacle was the
  `bugis` power ending 1815. Extending it to 1850 (its Singapore-era prominence is
  the guide's own point) lets the Makassar→Singapore lane sail under Bugis
  colours — the charter-correct alternative to a colonial (Dutch) flag or a
  silent omission.
- **The indentured-labour inflow rides the junk lane, not a new system** (per the
  dossier): ~5,000–7,000 Chinese labourers/yr with the junk season from ~1830,
  asserted-with-bounds, carried on the existing Amoy→Singapore lane under the
  sober pattern; a dedicated coerced system is not warranted at this magnitude.
- **Sub-threshold native craft are noted, not summed.** The 2,310 tiny native
  craft (1854) are below the foreign-going basis and excluded from the voyage
  count — stated in `basis`, so their exclusion is a declared boundary, not a
  silent zero.

## 5. Lanes authored (share; baked route; flag)

Calcutta→Singapore .15 · Singapore→Canton .15 · Canton→Singapore .09 ·
Singapore→Calcutta .09 · London→Singapore .08 · Singapore→London .06 ·
Bombay→Singapore .10 (Malwa opium) · Singapore→Batavia .05 ·
Amoy→Singapore .13 (junk, `china-junk-trade`) · Makassar→Singapore .10
(dhow, `bugis`). Square-rig lanes flagged `britain` (country/private + Straits
Settlements; the EIC's China monopoly ended 1834 anyway). Shares sum ~1.0.
