# Candidate ports & flows — the T8 remaining-candidates sweep, 2026-07-18

*Phase-RB campaign chunk 9. The 2026-07 sweep
([`port-flow-candidates-2026-07.md`](port-flow-candidates-2026-07.md)) declared
five follow-up gaps; the two fisheries items (Iceland/North Atlantic, Bergen
stockfish) were answered in chunk 2 (`ambient-flows.md` §2). This doc answers the
four remaining: **the Ostend & Trieste companies, the New Julfa Armenian carriage,
and the Aceh/Bantam pre-VOC pepper trade.** Each was gathered, then attacked by an
independent refuter that did not gather it: **64 claims — 55 ✅ / 9 ⚠ / 0 ✂** (OS
12/2/0 · TR 15/1/0 · NJ 13/2/0 · AB 15/4/0) — values below are POST-CORRECTION.*

**Outcomes:** two new ports promoted (**Ostend**, **Bantam**), two folds, and
three silences answered/registered. Unlike chunk 8's ports, **Ostend (1715–1745)
and Bantam (1550–1685) fall inside the CURRENT 1550–1815 era** — they can promote
through `CURATION.md` / the promotion queue now, without waiting for PLAN-6's
1850 expansion. The register entries and lane authoring stage for X-S1/S2.

---

## 1. The Ostend Company — Atlantic/East-Indies · **PROMOTE the node + hard-clamped fold**

- **Identity:** the *Generale Keizerlijke Indische Compagnie* (Ostend Company / Austrian East India Company), chartered **19 Dec 1722** by Charles VI (30-yr monopoly); an interloper phase from ~1715; **suspended May 1727** (the Pragmatic-Sanction bargain), **abolished by the Second Treaty of Vienna, 16 Mar 1731**; ceased trading 1734, wound up 1737.
- **Magnitude (counted):** **34 interloper sailings 1715–1723 + 21 chartered sailings 1724–1732 ≈ 55 voyages** (sailings, NOT distinct hulls — repeat Canton runs mean fewer hulls). The outsized fact: it carried **~7M lb of tea 1719–1728 ≈ 41.78% of the whole European tea import** (✅ verified) — its cargo value dwarfed its ship count. Peak ~3–5 sailings/yr (⚠ reconstructed). Vessels ~200–600 t (⚠ the finer 407–433 t / Hamburg-built figures are Grokipedia-only — use the band).
- **Ports:** home **Ostend** (not yet a node); factories at **Cabelon/Covelong** (Coromandel) and **Banquibazar** on the Hooghly (permission from Nawab Murshid Quli Khan — soft date, he died June 1727; note c.1721 initial vs a possible 1727 parwana). Termini `canton`, `calcutta` (displays **Hugli** in-era, the Banquibazar proxy), `madras` all already exist.
- **Sim shape — PROMOTE Ostend as a node + a HARD-CLAMPED strand:** node `ostend`, `active {1715, 1745}`, allegiance **a new Austrian/Imperial flag** (the double-headed eagle — check/extend `powers.json`), shipTypes `east-indiaman`. Author the lanes either as a brief standalone **`ostend-interlude`** system or as clearly-tagged lanes inside `minor-company-arterials` — but **hard-clamp the era-gate to 1715–1734** so the fold's averaging does not leak past 1734 on the Canton/Madras legs (the refuter's key modification; closer to the tightly-scoped Dejima pattern than a continuous flow). Lanes: `ostend↔canton` (tea, largest), `ostend↔calcutta` (Banquibazar/Hooghly), `ostend→madras` (Cabelon, optional). byDecade voyagesPerYear: 1710s `[2,4]`, 1720s `[2,5]`, 1730 `[1,3]`, off after 1732 — **plus a thin Banquibazar/Bengal afterlife tail 1731–1744 only** (imperial flag, de Schonamille, driven out 1744). Evidence **counted** (sailings) / reconstructed (annual rate).
- **Note:** Ostend is the neutral-carrier register's instructive counter-example — a flag suppressed not by war but *by peacetime diplomacy*. Worth a one-line evidence note.

## 2. The Trieste Company (Bolts's Habsburg Asiatic Co.) — · **FOLD + failed-stations silence**

- **Identity:** William Bolts's venture in two phases — the Asiatic Company of Trieste (charter **5 June 1775**, Maria Theresa, 10-yr) then the joint-stock **Imperial Asiatic Company of Trieste and Antwerp** (reorganized 28 July 1781, w/ Charles Proli); **bankrupt Jan/Feb 1785**. First voyage **24 Sept 1776 from Livorno** (Trieste not yet ready).
- **Magnitude:** a **9-year micro-flow** — "9 vessels documented by 1784" (the *Kaiserliche Adler*, 1,100 t, launched Mar 1784, brought the fleet to nine); traffic **lumpy, clustered 1781–84** (5 ships to Canton 1781–83: *Croate, Kollowrath, Zinzendorff, Archiduc Maximilien, Autrichien*). The "6 China+India / 2 E-Africa / 3 whaling" figure is a **PLAN (Aug 1781 proposal), NOT sailings — do not bake** (the whaling arm never materialized).
- **Routes/stations:** Trieste/Livorno → Cape → Malabar (factories at Mangalore/Karwar/Baliapatam under Hyder Ali, from 1777) + Coromandel/Bengal + Canton; the **Nicobar colony** (possession 12 July 1778, effective collapse 1783 on Danish pressure + factor Stahl's death, **formal abandonment 1785**); the **Delagoa Bay station** (est. 1777, expelled April 1781 by a Portuguese 40-gun frigate + ~500 men from Goa). The **wartime-neutral arbitrage** is the load-bearing point (Austria neutral in the American War → Canton unhindered; the 1783 peace glut ~38 ships **and** the British Commutation Act of 1784's duty cut together collapsed the tea returns).
- **Sim shape — FOLD, no new node** (Trieste already exists): add to `minor-company-arterials` a Trieste→Bombay/Goa (Malabar proxy) + Trieste→Canton strand, decades **1770+1780 only**, byDecade `1770s [0,1]`, `1780s [1,3]` on the Canton lane (the 1781–84 peak; refuter raised the hi from [1,2]). Evidence **counted/reconstructed** (named ships, exact dates — not asserted). Note the Livorno/Antwerp origins + the Mauritius/Cape waystage in the lane blurb.

## 3. The New Julfa Armenian carriage — multi-basin · **GESTURED silence + one mapped proxied lane**

- **Identity:** the Armenian merchant network of New Julfa (the Isfahan suburb founded **1605/1606** after the 1604 deportation from Old Julfa); ~1,000 active long-distance merchants at a time, firms running 80–100 factors; the **1619** silk-export auction win over the EIC; the **1688** Kalantar–EIC agreement; floruit ~1600–1750, broken by the **Afghan sack of Isfahan (Mar–Oct 1722)** and Nader Shah's 1740s exactions.
- **Why it is a silence:** the carriage moved **overwhelmingly on OTHER flags' bottoms and by overland caravan** — no source series isolates "Armenian-account voyages" as a countable sea lane. The counted bodies quantify the network's *internal* life (the *Santa Catharina* dossier, ~2,000 Julfan documents, HCA London 1748–52; Hovhannes Joughayetsi's ledger) or its *volume* (the one genuinely counted stratum, the **Russia-transit silk series** — 1676–85 avg 12,032 kg/yr → 1743–47 avg 79,673 kg/yr, Armenian share 60–70% — but that is **volume not voyages, and moved Caspian→Volga overland**, so it too resists a sea lane). *(The gather's "Safi d.1624" was a slip inherited verbatim from the EGO source — Safi reigned 1629–42; caught, not introduced.)*
- **Sim shape — a GESTURED silences entry** `new-julfa-armenian-carriage`, reason `carriage-under-other-flags`, cross-referencing the systems that already absorb its European-record shadow (`greek-ottoman-coasting` in the Med — which already names Armenian shippers; `persian-gulf-trade` + `country-trade-west` in the Indian Ocean) so nothing is double-counted; the note explicitly records the **counted-but-unmappable** Russia-transit stratum (a documented flow that resists a lane — itself a clean "no silent zeros" case).
- **PLUS one mapped `proxied` lane (changed from the gather):** the **Madras–Manila** Armenian shipping is the single leg where Julfans were **isolable shipping principals** (Bhattacharya 2008; Coja Petrus Uscan, Madras 1723–51; the Acapulco-silver link; the *Santa Catharina* was Manila-connected). Map it as a thin `proxied` lane off the Madras node **with guardrails**: a proxied evidence note citing Bhattacharya 2008 + Aslanian; weight derived from the Manila-galleon cadence, not invented annual volumes; and a **double-count guard** against any existing Manila↔Acapulco / country-trade-west Coromandel lane. Suppressing it would be a silent zero on the best-documented Armenian shipping leg.

## 4. Aceh / Bantam pre-VOC pepper — Bengal/SE-Asia · **PROMOTE Bantam + system + displacement silence**

- **Bantam (Banten) — a new PORT NODE:** `bantam` "Bantam", **−6.0424, 106.1609** (Old Banten / Banten Lama, Banten Bay, NW Java) — **distinct from Batavia** (~70–85 km WNW; its own dot, NOT a Batavia eraName). Sultanate 1526/1552; the first Dutch (1596) and English EIC (factory 1602, presidency 1602–1682) pepper emporium of the archipelago; **VOC conquest 1682–84** (Lampung ceded 12 Mar 1682; the pepper-monopoly letter 22 Aug 1682; English expelled 1682). `active {1550, 1685}` — the emporium function, not the physical town (abolished 1813); no eraNames.
- **`bantam-pepper` system** (era 1550→1682 + a ~3-yr declining tail): evidence **counted** on the **Bulbeck/Reid/Tan/Wu, *Southeast Asian Exports since the 14th Century* (1998)** spine — **"counted-pending" until the Banten decade tonnages are pulled from the book** — / reconstructed on the Pires early figures. Lanes: `bantam→Europe` (EIC/VOC factory books); `bantam↔China` (the Fujian junk trade — ~4–8 great junks arriving each December on the NE monsoon, departing May–June on the SW monsoon; seasonal junk polars already exist); `bantam←Lampung/Sumatra` feeder (the sultanate monopolized purchase from ~1625); `bantam→Red Sea/Muslim` (small share — **guard against double-counting `aceh-red-sea`**). Cargo pepper/spices out, porcelain/silk in. Voyages/yr ramp from 1552, peak ~1600–1660, collapse 1682–84.
  - **Magnitude notes (corrected):** the early ~1,000 bahar/yr (by 1522) is **Pires (*Suma Oriental*)** — keep distinct from the 1522 Portuguese treaty (1,000 sacks = 160 bahar ≈ 11 t; a 6× conflation risk). The Banten pepper **bahar is unstable ~70–375 kg** across sources — use a wide reconstructed band and **prefer the Bulbeck tonne series** over any bahar→tonne conversion. Widen the tonnage [hi] toward **~5,000 t at the 1620s peak** (Banten alone is cited that high) rather than capping at the ~1,000–2,000 t typical-decade band.
- **Aceh residual gap:** `aceh-red-sea` (the Aceh→Jedda pepper route) is DONE and not re-authored; Aceh's own China/Europe pepper lading is a **low-priority tranche-3 add**, adequately gestured for v1 — not a T8 blocker.

---

## 5. Silences-register entries (staged for X-S1/S2 — apply with the promotions)

Ready-to-apply blocks for `research/flows/silences.json`. The Bantam entry is
`asserted` and points to `bantam-pepper`, so it lands **with** that system; the
New Julfa and Trieste-stations entries are `gestured`/no-pointer and could land
sooner. (Not appended now — a pointer to a not-yet-authored system would fail
`validate-flows.mjs`.)

```jsonc
{ "id": "new-julfa-armenian-carriage",
  "scope": "Persia → Levant · Mediterranean · India · Russia · Manila (multi-basin, Armenian account)",
  "reason": "carriage-under-other-flags",
  "treatment": "gestured",
  "note": "The Julfan Armenian carriage (New Julfa, Isfahan, 1605; floruit ~1600–1750, broken by the 1722 Afghan sack) moved Persian raw silk, gems, and indigo across the whole Eurasian arc — to Aleppo, Smyrna, Venice, Livorno, Marseille, Amsterdam; to Surat, Madras, Manila; and north via Astrakhan to Russia — almost entirely on OTHER flags' bottoms and by overland caravan. Its European-record shadow is already gestured inside greek-ottoman-coasting (Med) and carried by persian-gulf-trade/country-trade-west (Indian Ocean). Even its one counted stratum — the Russia-transit silk series (12,032 kg/yr in 1676–85 → 79,673 in 1743–47, 60–70% Armenian) — is volume, not voyages, and moved overland, so it resists a sea lane. The one leg mapped as a thin proxied lane is Madras–Manila, where Julfans were isolable shipping principals." }

{ "id": "habsburg-asiatic-stations",
  "scope": "Nicobar Islands (Nancowery) · Delagoa Bay (Mozambique)",
  "reason": "not-yet-reconstructed",
  "treatment": "gestured",
  "note": "Bolts's Imperial Asiatic Company of Trieste planted two short-lived stations — Nancowery in the Nicobars (1778–1785) and Delagoa Bay (1777–1781, expelled by a Portuguese frigate from Goa). Attempted colonial footholds that FAILED, carrying negligible commercial flow; their significance is political, not a trade the chart omits. The company's real traffic folds into minor-company-arterials (Trieste→India/Canton)." }

{ "id": "bantam-pepper-displaced",
  "scope": "Bantam & Lampung (pre-VOC Muslim & Chinese-junk pepper carriage)",
  "reason": "monopoly-displacement",
  "treatment": "asserted", "pointer": "bantam-pepper",
  "note": "The independent Muslim- and Chinese-junk pepper carriage out of Bantam and Lampung goes dark in the record precisely because the VOC monopoly (Lampung ceded 12 Mar 1682; the monopoly letter 22 Aug 1682; conquest 1682–84) FORCED that trade to Batavia and suppressed independent carriage — a DISPLACEMENT, not a disappearance. The counted post-1684 Batavia series is the same pepper re-routed under monopoly. Answered by the bantam-pepper system (era 1550→1682 with a declining tail). Precedent chain: Palembang 1642 · Makassar 1669 · Banten 1682 · Jambi 1683." }
```

*(Two new `reason` strings — `carriage-under-other-flags`, `monopoly-displacement` — extend the register's vocabulary; add them to the schema note at X-S1.)*

## 6. Promotion-queue actions

- **Ostend** → promotion queue (within the current 1550–1815 era): node + a new Austrian/Imperial polity/flag in `powers.json` + a `data-src/ship-types` check for `east-indiaman`; lanes to existing Canton/Calcutta/Madras, hard-clamped 1715–1734 + the 1731–1744 Bengal tail.
- **Bantam** → promotion queue (within era): node + the `bantam-pepper` system; junk & dhow polars already exist; needs a baked lane set (Bantam→Sunda Strait→Indian Ocean; Bantam↔China junk corridor; Bantam↔Sumatra feeder). Record it in `CURATION.md` alongside the existing tranche candidates.
- **Trieste, New Julfa** → no promotion; fold + register only.

---

## 7. Verification record — chunk 9

**64 claims: 55 ✅ / 9 ⚠ / 0 ✂** (OS 12/2/0 · TR 15/1/0 · NJ 13/2/0 · AB 15/4/0).
**Zero refutations** — all four candidates survived, and all four sim-shape
verdicts were endorsed (Ostend's fold tightened to a hard clamp; New Julfa's
Madras–Manila leg upgraded from held-back to a mapped proxied lane). The 9 ⚠,
all kept-with-correction: Ostend's peak-rate (reconstructed) and tonnage (use the
~200–600 t band); Trieste's Nicobar loss (formal abandonment 1785, not 1783);
New Julfa's deportee number (asserted) and the 5–6k-bales figure (range); Bantam's
bahar conversion (~70–375 kg, prefer Bulbeck tonnes), tonnage hi (toward ~5,000 t),
junk count (~4–8 asserted), and the ~70-vessel anchorage (asserted).

**Systemic findings:** these are candidate/mappability calls more than magnitude
series, and the spines held — every operating-window date checked out (the Ostend
1722/1727/1731 chain; Bolts's 1775/1781/1785; New Julfa's 1605/1619/1688/1722; the
Bantam 1682 conquest to the day), and the one striking magnitude claim (Ostend's
~42% of Europe's tea) survived. Recurring ⚠ types: **class inflation on single-web-
source figures** (Ostend tonnage, the ~70-vessel bay), **unit instability** (the
Banten bahar), and **inherited source errors** (the "Safi d.1624" slip came from EGO
— the gather caught it). The gathers' self-discipline was again high (the plan-vs-
sailings distinction on both companies; the double-count guards on Bantam→Red Sea
and Madras–Manila were flagged in the gather, not just the refutation).

**Follow-ups** (to close the ⚠s at authoring): pin the Ostend Canton-vs-Bengal
voyage split + tonnage to Parmentier / the *Mariner's Mirror* afterlife paper;
extract the Bulbeck Banten decade tonnages (the `bantam-pepper` series is
"counted-pending" until then); pull the Madras–Manila voyage counts from
Bhattacharya 2008 before weighting that lane; cite the New Julfa figures to their
underlying sources (Ganjalyan's *Russland-Route* monograph, Iranica) rather than
EGO alone.
