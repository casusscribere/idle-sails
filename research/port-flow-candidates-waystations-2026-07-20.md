# Candidate waystations — the T14 waystops sweep, 2026-07-20

The Cape Town phase (2026-07-20) built the first `via` waystop — a refreshment
CALL a lane detours to and dwells at, gated to the station's founding year. This
sweep asks which OTHER age-of-sail waystations were near-universal calls on the
great routes and should be modelled the same way, versus which are trade termini
(full ports) or belong in the silences register.

**Method (RB-campaign pattern, rate-aware):** three basin gather-agents (Atlantic,
Indian Ocean, SE-Asia/Pacific) sourced candidates and adversarially self-checked
their strongest claims; verdicts were cross-checked against the repo's existing
lanes at synthesis. Each landed as one committed artifact. Verification stamps:
✅ verified · ⚠ contested (both readings given) · ✂ rejected.

**Two structural findings that shape the build:**
1. **Direction and nationality both matter.** St Helena and the Azores are
   HOMEWARD calls; Madeira, the Canaries, and Guam are OUTBOUND; St Helena is
   British, the Azores Portuguese, Madeira non-Iberian, the Canaries Spanish,
   Guam Spanish. Our `via` attaches per-LANE, and lanes are directional +
   flagged, so this is expressible — but a nationality-blind "universal" tag
   would overstate every one of these.
2. **The `via` mechanism needs a multi-waystop CHAIN.** A homeward British China
   Indiaman called at **Anjer** (Sunda), **Cape Town** (Table Bay), AND **St
   Helena**. The current baker/sim carry ONE `via` per lane. Several verdicts
   below are only buildable once `via` becomes an ordered list of waystops. The
   ones addable NOW are those on lanes that don't already carry `via:cape-town`
   (Guam on the Manila galleon; Mozambique on the Portuguese Macau lanes).

---

## Verdict table

| Candidate | Coords (lon,lat) | Verdict | Lanes / nation | Direction | Evidence | Buildable now? |
|---|---|---|---|---|---|---|
| **St Helena** | −5.72, −15.93 | **via-waystop** | British EIC homeward Cape/India–China | homeward | ✅ counted | needs chain (lanes already via Cape Town) |
| **Anjer (Sunda Strait)** | 105.9, −6.05 | **via-waystop** | Europe↔Canton (via Sunda) + Cape↔Batavia; multi-national | both, esp. homeward | ✅ reconstructed | needs chain |
| **Azores (Angra)** | −27.22, 38.66 | **via-waystop** | Portuguese homeward Carreira (India/Brazil→Lisbon); Spanish landfall only | homeward | ⚠ reconstructed | addable (Portuguese lanes lack a via) |
| **Guam (Umatac)** | 144.66, 13.3 | **via-waystop, ONE-DIRECTION** | Manila galleon, Acapulco→Manila ONLY | westbound only | ⚠ reconstructed | ✅ **now** (lane has no via) |
| **Madeira (Funchal)** | −16.91, 32.65 | **via-waystop** | outbound British/Dutch/N-European Indies+Atlantic | outbound | ✅ proxied | needs chain (outbound lanes via Cape Town) |
| **Tenerife/Canaries** | −16.25, 28.47 | **via-waystop** | outbound Spanish Carrera | outbound | ⚠ proxied | addable (Carrera lanes lack a via) |
| **Ilha de Moçambique** | 40.73, −15.03 | **full-port (ALREADY) — the Portuguese Cape Town** | Carreira, via segmentation | — | ✅ proxied | refine: add `via:mozambique` to Lisbon↔Macau |
| **Anjouan / Johanna** | 44.42, −12.17 | **via-waystop (secondary)** | British EIC inner-route Europe→W-India only | both | ✅ counted (Bowen 2018) | needs chain (layered on Cape) |
| **Port Louis (Île de France)** | 57.5, −20.16 | **full-port (ALREADY) — the universal FRENCH waystop** | future French Europe↔Asia lanes | — | ✅ proxied | forward note (no such lanes yet) |
| **Cape Verde (Santiago)** | −23.60, 14.92 | **full-port** (slave terminus, coerced framing) | Portuguese Guinea/Brazil outbound | outbound | ✅ counted+recon | promotion candidate |
| **Île Bourbon / Réunion** | 55.45, −20.87 | **full-port candidate** (low priority, diversity) | — | — | proxied | not a via |
| **Galle / Trincomalee** | 80.22, 6.03 / 81.23, 8.57 | **full-port candidates** (VOC cinnamon / RN base) | — | — | proxied | not a via |
| **Malacca** | 102.25, 2.19 | **full-port / chokepoint** — NOT a China through-call | — | — | reconstructed | not a via (Sunda bypassed it) |
| **Ascension** | −14.42, −7.93 | **declared-silence** (+ optional scripted naval node post-1815) | W. Africa Squadron | — | asserted | — |
| **Socotra / Aden** | 54.0, 12.6 / 45.0, 12.8 | **declared-silence** (chokepoint notes) | — | — | asserted | — |
| **Pulo Condore / Pescadores / Malé** | — | **declared-silence** / stays as-is | — | — | asserted | — |

---

## The strong new via-waystops

### St Helena — the British homeward rendezvous  ✅ counted
The EIC ordered homeward Indiamen to rendezvous here from **1649**, colonised it
**1658–59**, and assembled the homeward fleet (with a Navy escort in wartime)
before the Channel run. Company control 1657/1659–**1834** (Dutch took it Dec
1672, EIC retook May 1673). Ship-level record: Friends of St Helena, *East
Indiamen at St Helena 1600–1834*. **⚠ Universality is British-and-homeward only:**
outbound Indiamen essentially never called (the SE trades make it hard to fetch
southbound); Dutch/French homebound ships used the Cape / Île de France. Verdict:
`via:st-helena` on **homeward** British Cape/India–China lanes.

### Anjer (Sunda Strait) — the regional Cape-Town analogue  ✅ reconstructed
"The grand tollgate of the Sunda": water, rice, livestock, AND a report to
Batavia twice a week. Contemporaries: "all homeward-bound ships of every nation
were accustomed to call in passing the straits." **The decisive routing fact:
Europe↔Canton ran overwhelmingly through the Sunda Strait, not the Malacca
Strait** — so Anjer, not Malacca, is the China-route waystop. Dutch roadstead;
best attested ~1780–1830 (destroyed by Krakatoa, 1883). Verdict: `via:anjer` on
the Europe↔Canton (Sunda) lanes and Cape↔Batavia.

### Guam — the Manila galleon's only Pacific stop  ⚠ reconstructed, ONE-DIRECTION
The galleon watered at Umatac on the **westbound Acapulco→Manila** run (trade-wind
belt, ~60 days out). The **eastbound Manila→Acapulco return did NOT call** — it
climbed to 30–45°N in the westerlies past Japan to the California coast. Crown-
mandated c.**1668**; galleon trade 1565–1815. **⚠ Not invariable:** ships missed
Guam often enough that the crown levied a 2,000-ducat fine — model near-universal
westbound WITH occasional misses, absent eastbound. **Buildable NOW** (the
`f-acapulco-manila` lane carries no `via`; `f-manila-acapulco` gets none).

### Madeira / the Canaries — the outbound provisioning pair  ✅/⚠ proxied
Substitutable OUTBOUND calls, split by nation: **Madeira** (Funchal) for British/
Dutch/N-European Indies + Atlantic traffic (wine as stores + cargo — Hancock,
*Oceans of Wine*); **Tenerife/Canaries** for the Spanish Carrera outbound. A ship
provisioned at one, not both. Both Portuguese/Spanish throughout. Anchor: Duncan,
*Atlantic Islands* (1972). Verdict: `via` on the respective OUTBOUND lanes.

### The Azores (Angra) — the homeward Iberian rendezvous  ⚠ reconstructed
Near-universal for the **Portuguese** homeward Carreira ("aguardar nas ilhas").
**✂ Corrected overstatement:** the Azores were NOT the universal Spanish treasure-
fleet call — **Havana** was the Spanish homeward rendezvous; the Azores were a
landfall/guard-station the Spanish mostly passed. Habsburg 1583–1640, Portuguese
else. Verdict: `via:azores` on the **Portuguese homeward** Carreira lanes; a
landfall waypoint (not a hard call) for the Spanish.

### Anjouan / Johanna (Comoros) — the EIC's secondary watering call  ✅ counted
Bowen (2018, *IJMH*) documents it from EIC logs: "the most regularly visited" of
the Comoros by East Indiamen, growing after 1750. **⚠ Route-and-season contingent
and SECONDARY to the Cape, not a substitute** — an EIC Indiaman watered at BOTH
Table Bay and Johanna. On the **inner (Mozambique-Channel) route** to Bombay/Surat
only; outer-route Bengal/China ships bypassed it. Verdict: `via:johanna` layered
on the Cape for British EIC inner-route Europe→W-India lanes (needs the chain);
fallback = declared-silence folded into the Cape leg.

---

## Refinements & forward notes on ports already modelled

- **Ilha de Moçambique = the Portuguese Cape Town (confirmed ✅).** The Portuguese
  avoided the Cape (Agulhas current, the storm-lee shore, and after 1652 a
  Dutch-owned Table Bay); Mozambique was "the only regular stopover on the outward
  voyage" and the armadas' collection point. Already modelled via the segmented
  Carreira (`i-lisbon-mozambique`→`i-mozambique-goa`, homeward `i-mozambique-lisbon`).
  **⚠ Call-universal, stopover-length monsoon-dependent** (late ships wintered
  there for months). **Actionable refinement:** the Portuguese **Lisbon↔Macau**
  lanes (`q-lisbon-macau`, 1557–1815) currently run with NO Mozambique call —
  historically the naus broke there too; add `via:"mozambique"` to make the
  Carreira's refreshment call visible across the whole Portuguese Asia network.
- **Port Louis = the universal FRENCH waystop.** French Indiamen broke voyage at
  their own Mascarene base, not the Dutch Cape (1735→1810). Already a full port;
  the forward note is `via:"port-louis"` if direct **French Europe↔Asia** lanes
  (Lorient/Nantes→Pondicherry/Canton) are ever added.

---

## Implementation queue (feeds a Batch-G data increment)

1. **Guam** on `f-acapulco-manila` (westbound), `via:"guam"` — **buildable now**,
   single via, needs a `guam` station node. Suppress eastbound.
2. **Mozambique** `via` on the Portuguese `q-lisbon-macau`/`q-macau-lisbon` —
   **buildable now**, single via, port already exists.
3. **The Azores + Tenerife/Canaries** on the Portuguese/Spanish Carrera lanes —
   addable (those lanes carry no via yet); needs `azores` + `tenerife` nodes.
4. **The `via`-CHAIN extension** (baker + sim: `via` becomes an ordered list with
   a viaIndex per hop) — unlocks **St Helena, Anjer, Madeira, Johanna** layered on
   the existing Cape via. This is the one code change the sweep surfaces.
5. **Full-port promotions** (separate from vias): Cape Verde (coerced framing),
   Galle, Trincomalee, Île Bourbon — via `CURATION.md`.
6. **Silences:** extend `cape-waystops-silence` / add entries for Ascension (naval),
   Socotra/Aden (chokepoints), Pulo Condore, Malacca-as-terminus.

---

## Verification record

Each basin agent adversarially self-checked; the highest-risk claims were
independently confirmed at synthesis against the repo's lanes and the named
sources:
- ✅ **St Helena British-homeward-only** (not "Indiamen generally") — confirmed;
  attached only to British homeward lanes.
- ✂ **Azores were NOT the universal Spanish treasure-fleet call** — Havana was;
  the Spanish attachment demoted to a landfall waypoint.
- ✅ **Europe↔Canton ran via the Sunda Strait, not Malacca** — Anjer is the
  China-route waystop; Malacca demoted to a port/terminus, never a China via.
- ⚠ **Guam near-universal but not invariable, westbound only** — modelled as
  high-frequency westbound with occasional misses, absent eastbound.
- ✅ **Mozambique = the Portuguese Cape Town** — confirmed call-universal (⚠
  stopover length monsoon-dependent); already modelled.
- ⚠ **Johanna secondary to the Cape, route-contingent** — modelled as a layered
  secondary call, not a Cape-equivalent funnel.

**Sources** (per candidate, condensed): Duncan, *Atlantic Islands* (1972);
Chaunu, *Séville et l'Atlantique*; Hancock, *Oceans of Wine* (2009); Friends of
St Helena, *East Indiamen at St Helena 1600–1834*; Bowen, "The EIC and the island
of Johanna," *IJMH* 30(1) 2018; Boxer, *The Tragic History of the Sea* &
*Portuguese India Armadas*; Guampedia, *Stops Along the Manila Galleon Trade
Route*; Horsburgh, *India Directory* (1836); SlaveVoyages (Cape Verde).
</content>
