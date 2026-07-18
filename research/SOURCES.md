# SOURCES — the research documentation index & consolidated bibliography

*The one place that answers: **which research chunk produced what, how was it
validated, and every source it leaned on.** Two parts — (A) a documentation
cross-walk from each research chunk / validation pass to its artifact and
verdict tally, and (B) a consolidated bibliography of every source referenced
across the flow-matrix work, grouped by basin/theme.*

This complements — does not replace — the sources each artifact carries
inline. The authoritative per-claim reasoning lives in the artifacts
themselves; this file is the map and the bibliography. The archived isochrone
project keeps its own sourcing report at
[`archive/isochrone-v1/SOURCES.md`](../archive/isochrone-v1/SOURCES.md).

---

## A. Documentation cross-walk — every chunk & validation pass

### The Phase-RB campaign (movement & flows, 1815–1850 + ambient flows)

Tracker: [`rb-campaign.md`](rb-campaign.md). Method: parallel gather agents →
**independent adversarial refuters** (a refuter never attacks its own
gathering) → synthesis with per-claim stamps (✅ verified · ⚠ contested, both
readings kept · ✂ refuted, corrected/removed) → commit. Raw gathers + per-claim
verdicts were committed live to `rb-campaign-wip/` and **deleted at synthesis**
(surviving session loss); the verdict tallies and every correction are
preserved in each artifact's in-file **Verification record** and in
`rb-campaign.md`'s Done section.

| Chunk | Scope (tasks) | Artifact + validation record | Claims (✅/⚠/✂) |
|---|---|---|---|
| 1 | Convoy institutions & rates + naval patterns (T9 + T4) | [`ambient-flows.md`](ambient-flows.md) §1 (rec. §1 end) | 84 — 62/22/0 |
| 2 | Fisheries & whaling as grounds-traffic (T4 + E3 + T8) | [`ambient-flows.md`](ambient-flows.md) §2 (rec. §2 end) | 84 — 74/10/0 |
| 3 | Scheduled & state services (T4 + E6 + T10 packets) | [`ambient-flows.md`](ambient-flows.md) §3 (rec. §3 end) | 73 — 59/13/**1**✂ |
| 4 | Local metabolisms — colliers, coastwise, shachuan (T4) | [`ambient-flows.md`](ambient-flows.md) §4 (rec. §4 end) | 45 — 34/11/0 |
| 5 | T10 basin extensions — Atlantic 1815–50 | [`flows/atlantic-1815-1850.md`](flows/atlantic-1815-1850.md) §5 | 101 — 82/19/0 |
| 6 | T10 basin extensions — East Asia + Indian Ocean W | [`flows/east-asia-io-1815-1850.md`](flows/east-asia-io-1815-1850.md) §5 | 59 — 47/11/**1**✂ |
| 7 | T10 basin extensions — Baltic/Med/Bengal | [`flows/baltic-med-bengal-1815-1850.md`](flows/baltic-med-bengal-1815-1850.md) §6 | 110 — 98/11/**1**✂ |
| 8 | New-port dossiers (Singapore, Hong Kong, Valparaíso, Sydney, New Orleans) + wars sweep | [`flows/new-ports-wars-1815-1850.md`](flows/new-ports-wars-1815-1850.md) §6 | 114 — 95/18/**1**✂ |
| 9 | T8 remaining candidates (Ostend/Trieste cos., New Julfa, Aceh/Bantam) | [`port-flow-candidates-2026-07-18.md`](port-flow-candidates-2026-07-18.md) §7 | 64 — 55/9/0 |
| 10 | E-R1 closeout (E4 York Factory/HBCA) + X-R2 framing sign-off | [`flows/e-r1-closeout-and-framing-signoff.md`](flows/e-r1-closeout-and-framing-signoff.md) | E4: 6 — 5/1/0 |
| 11 | T12 addenda sweep (Japan/Dejima, Indonesia, cross-Pacific, specials catalog) | queued | — |

- **T4 COMPLETE** across chunks 1–4: **286 claims — 229 ✅ / 56 ⚠ / 1 ✂.**
- **T10 COMPLETE** across chunks 5–8: **384 claims — 322 ✅ / 59 ⚠ / 3 ✂** —
  the six basin extensions (chunks 5–7) plus the five new-port dossiers and the
  full 1815–50 wars set (chunk 8). All staged for PLAN-6's X-S1/X-S2 (era default
  1550→1850; JSON/`wars.json`/node edits not yet applied).
- The three ✂ in chunks 5–8: Crawfurd's 80,000-ton junk figure miscast as a
  Siam–Cochinchina subtotal (it is the whole trade); Hamburg's Sandtorhafen
  dated 1840 (actually 1866, out of era); the `java-war` draft dropped (interior
  land war, no sea risk). Chunk 3's ✂: monthly Post Office India mail existed
  from 1815, not the 1830s.

### PLAN-4 wider-world candidate sweep (pre-campaign, feeds chunks 8/10)

- Artifact: [`port-flow-candidates-2026-07.md`](port-flow-candidates-2026-07.md).
  **88 claims extracted, 24 sources fetched; 5 fully verified** (the Persian
  Gulf cluster — Gombroon diaries, factory 1623, 1786 Ottoman fleet count,
  Çelebi fifteen ships — passed 3–0 panels, zero refuted). The rest are
  source-extracted but machine-unverified (verification fleet rate-limited);
  hand-cross-checked, no claim refuted. E1/E3/E5/E6 verifications were then
  completed inside the RB campaign (chunks 2/3/6).

### The R3 flow-matrix authoring (the six basins, 1550–1815)

Adopted in [`../planning/PLAN-3-flows.md`](../planning/PLAN-3-flows.md); schema
in [`flows/_schema.md`](flows/_schema.md). Each basin JSON carries an `anchors`
array (the scholarship the basin is anchored to) and a per-system `basis` field
(source or reasoning — required). Cross-checks passing at R3: Sound Toll,
SlaveVoyages, Chaunu, DAS, the Nagasaki registers, Canton, the échelles. Silences
register: [`flows/silences.json`](flows/silences.json) (rendered at
[`silences.html`](silences.html)). Validator:
[`tools/validate-flows.mjs`](tools/validate-flows.mjs).

| Basin | File | Systems |
|---|---|---|
| Atlantic | [`flows/atlantic.json`](flows/atlantic.json) | 11 |
| Baltic & North Sea | [`flows/baltic-north-sea.json`](flows/baltic-north-sea.json) | 13 |
| Mediterranean & Black Sea | [`flows/mediterranean.json`](flows/mediterranean.json) | 9 |
| Indian Ocean West | [`flows/indian-ocean-west.json`](flows/indian-ocean-west.json) | 9 |
| Bengal & SE Asia | [`flows/bengal-se-asia.json`](flows/bengal-se-asia.json) | 9 |
| East Asia | [`flows/east-asia.json`](flows/east-asia.json) | 9 |

### Pre-flow reference datasets (PLAN-1/2, some superseded as sim inputs by R3)

- **Busiest ports 1550–1815** — [`port-rankings-1550-1815.json`](port-rankings-1550-1815.json)
  (+ `.csv`, [`ports-1550-1815.html`](ports-1550-1815.html)). Anchors listed
  in [`README.md`](README.md) §1. R1 corrections logged in the JSON `changelog`.
- **Persistence synthesis** — `port-persistence-synthesis.csv` / `port-synthesis.html`.
- **33 minor ports c.1500–1830** — [`minor-ports-1500-1830.json`](minor-ports-1500-1830.json)
  (10/33 adversarially research-verified; ◆ on the page).
- **Route persistence** — `route-persistence.json` / `.html` (structural model,
  no empirical source — declared as such).
- **Name-pressure measurement** — [`name-pressure-2026-07-16.md`](name-pressure-2026-07-16.md)
  (the T5 gate report).

---

## B. Consolidated bibliography

Every source referenced across the flow matrix, R3 authoring, and the RB
campaign, grouped by basin/theme. A source used in more than one place is
listed once, under its primary basin, with the referencing chunks noted.
Entries preserve the author/title/year strings as written in the artifacts;
where an artifact cites only a bare surname or a dataset acronym, that is what
appears here (a fuller citation is a standing follow-up).

### Cross-basin databases & serial sources

- **SlaveVoyages — the Trans-Atlantic Slave Trade Database (TSTD)** — ~36,000
  documented voyages; the era's best-counted trade. `middle-passage`,
  `guinea-outward` (R3 Atlantic); the illegal-era anchors (chunk 5); PLAN-4 #1.
- **Sound Toll Registers / STRO (Sound Toll Registers Online)** — the anchoring
  series for every counted Baltic system; the 1815–50 passage index. R3 Baltic
  (all systems); chunk 7 (R-01/R-32).
- **Dutch-Asiatic Shipping (DAS)** — every VOC voyage both directions 1595–1795
  (4,722 outward / 3,359 homeward). `voc-arterial` (R3 Bengal); chunk 1 §1.5.
- **The Nagasaki tōsen registers** — the shogunate's count of every Chinese
  arrival (~190 in 1688, capped 70/1689 then 30/1715). `china-japan-junks`,
  `nanyang-junk-trade` cross-check (R3 East Asia); chunk 6 (Cullen).
- **British Southern Whale Fishery database — Jones / Richards / Chatwin**
  (whalinghistory.org) — 2,543 voyages / 930 vessels 1775–1859. Chunk 2 §2.7
  (E3 verified); PLAN-4 #3.
- **AOWV — American Offshore Whaling Voyages** (whalinghistory.org) — 15,000+
  records from 1667. Chunk 2 §2.7; PLAN-4 #3.
- **Scottish Arctic Whaling database — Sanger** — chunk 2 §2.7; PLAN-4 #3 (SAW).
- **Lloyd's List** / **The Naval Chronicle** (capture-and-loss table) — 4,314
  captures vs 2,385 sea-peril losses 1793–1800. Chunk 1 §1.7.

### Atlantic (R3 `atlantic.json` + chunk 5)

- **P. & H. Chaunu, *Séville et l'Atlantique*** — the Carrera de Indias backbone.
  `carrera-de-indias`; R3 cross-check.
- **A. García-Baquero** — Cádiz-century shipping; the post-1739 registros-sueltos
  shares. `carrera-de-indias`; chunk 1 §1.1.
- **J. H. Parry** — Atlantic maritime synthesis. R3 Atlantic anchor.
- **R. Davis, *The Rise of the English Shipping Industry*** — English tonnage;
  the 1709 coastal-vs-foreign-going bracket. R3 Atlantic; chunk 4 §4.2.
- **P. Pope (Newfoundland)** and **G. Cell** — the Banks cod fishery & sack ships.
  `newfoundland-cod`; chunk 2 §2.3.
- **K. Morgan (Bristol/Atlantic)** — R3 Atlantic anchor.
- **Bethell / Foreign Office (FO) series** — 371,615 people 1840–51, the
  `brazil-illegal-era` floor. Chunk 5 (L-03/L-05).
- **Wynn / Lower** — the 1,520 BNA timber-vessels figure (follow-up). Chunk 5.
- **Cuban consular / registry figures** (189,497, 1830–41) — `cuba-illegal-era`.
  Chunk 5 (L-15).
- **Liverpool / Owen cotton "American bales" series** — `cotton-gulf-liverpool`.
  Chunk 5 (M-10/M-11).

### Baltic & North Sea (R3 `baltic-north-sea.json` + chunk 7)

- **M. van Tielhof, *The 'Mother of All Trades'*** — Baltic grain. `baltic-grain-west`.
- **J. U. Nef, *The Rise of the British Coal Industry*** — the coal trades.
  `english-coal-foreign`, `english-coastal-colliers`; chunk 4 §4.1.
- **J. Hatcher, *History of the British Coal Industry*** — colliers.
  `english-coastal-colliers`; chunk 4 §4.1.
- **Y. Kaukiainen** — Baltic shipping. `baltic-timber-naval-west`.
- **Å. Åström** — Baltic timber/naval stores. `baltic-timber-naval-west`.
- **C. de Jong, *Geschiedenis van de oude Nederlandse walvisvaart*** — Dutch
  whaling (fleet 100–260 ships/yr; 251 in 1721). `svalbard-whaling`; chunk 2 §2.6.
- **J. W. Veluwenkamp** — Arkhangelsk / the White Sea. `white-sea-west`.
- **Muscovy Company records; Dutch notarial acts** — `white-sea-west`.
- **P. Sharp, "1846 and All That" (BAHS, 2010)** — the British-wheat appendix
  confirmed to the digit (1,144 qr 1833; 87,701 qr 1845). Chunk 7 (R-11/R-12).
- **Fischer & Nordvik** — Norwegian shipping (repeal-era percentages, follow-up).
  Chunk 7 (R-28).
- **Karlsson / Evans-Rydén** — Swedish bar-iron destination tonnages (follow-up).
  Chunk 7 (R-19).
- **Copenhagen Convention 1857 / BFSP 1856–57** — Sound-Toll capitalization
  30,476,325 rigsdaler. Chunk 7 (R-10).
- **General Steam Navigation Co. (inc. 1824)** — the packet layer behind the
  steam boundary. Chunk 7 (R-26).

### Mediterranean & Black Sea (R3 `mediterranean.json` + chunk 7)

- **F. Braudel, *La Méditerranée*** — the structural picture; the annona;
  the "Spanish road" at sea. `italian-grain`, `habsburg-genoa-route`.
- **Levant Company records; the French échelles du Levant series (Marseille
  chamber of commerce)** — `levant-trade`, `marseille-trade`.
- **D. Sella; R. Rapp; A. Tenenti (Venice)** — `venice-adriatic`.
- **F. W. Carter (Ragusa)** — `ragusa-carrying`; cf. PLAN-4 #8 (Tadić).
- **Ottoman provisioning studies** — Istanbul's grain lifeline; the
  R1-declared-boundary exemplar. `ottoman-provisioning`, `black-sea-slave-trade`.
- **T. Kremmidas (via MPRA 76414)** — Odessa movement figures confirmed exactly
  (post-porto-franco 1819); Greek flag-share. Chunk 7 (S-01/S-02).
- **G. Harlaftis, *A History of Greek-Owned Shipping*** — Chiot ~40% of
  Odessa→Britain, Greek merchants 31%→57% of Britain-entry tonnage; south-Russian
  clearances. Chunk 7 (S-04/S-06/S-09/S-16).
- **E. R. J. Owen, *Cotton and the Egyptian Economy 1820–1914*** — the canonical
  Alexandria cotton quinquennial volume/value series. Chunk 7 (S-26/S-27).
- **Austrian Handelsstatistik / *Tafeln zur Statistik*** — Trieste 1850 arrival
  tonnage (641,394 t; follow-up to pin). Chunk 7 (S-19).

### Indian Ocean West (R3 `indian-ocean-west.json` + chunk 6)

- **K. N. Chaudhuri, *Trade and Civilisation in the Indian Ocean*** — the
  arterial synthesis; Malabar coastal circuits. `gujarat-red-sea`,
  `malabar-pepper-coastal`; chunk 6 India↔Britain.
- **A. Das Gupta (Surat)** — `gujarat-red-sea`; chunk 3 §3.5 (hajz follow-up).
- **S. Subrahmanyam (the Portuguese Estado)** — R3 IO-West anchor; `aceh-red-sea`.
- **A. R. Disney (the Carreira)** — `carreira-da-india`.
- **R. J. Barendse, *The Arabian Seas*** — `persian-gulf-trade`.
- **G. Campbell; E. Alpers (Indian Ocean slavery)** — `swahili-coast`,
  `indian-ocean-slave-trades` (R3 decision 4, sober).
- **R. B. Allen, *JAH* 2008 ("The Constant Demand of the French")** — the
  641-voyage Mascarene inventory (exact); **Allen, *JICH* 2008** — the illegal-era
  point ~52,550 to Mauritius. Chunk 6 (E5, P-04); PLAN-4 #5.
- **A. Sheriff** — Zanzibar; the Shivji customs-farm rent growth proxy
  (MT$110,000/1819 → MT$220,000/1856). Chunk 6 (`zanzibar`).
- **Hogendorn & Johnson, *The Shell Money of the Slave Trade*** — `cowrie-maldives`.
- **UNESCO Memory of the World / Mauritius immigration registers** — the counted
  indenture series. Chunk 6 (E5, `indenture`).
- **J. Wellsted** — Gulf pearling-boat count (high count discounted). Chunk 6 (Gulf).

### Bengal & SE Asia (R3 `bengal-se-asia.json` + chunk 6/7)

- **A. Reid, *Southeast Asia in the Age of Commerce*** — the indigenous carrying
  trade; junk-trade scale. `bugis-carrying`, `spice-islands`, `aceh-red-sea`;
  chunk 6 (Sugihara/Reid).
- **L. Blussé (Batavia and the junk connection)** — `voc-arterial` context;
  R3 East Asia.
- **S. Arasaratnam** — Coromandel textiles east. `coromandel-se-asia`.
- **EIC marine records; Chaudhuri's fleet series** — `eic-india-arterial`.
- **DAC & Compagnie des Indes records** — Copenhagen–Tranquebar, Lorient–
  Pondicherry. `minor-company-arterials`, `mascarenes-french`.
- **Wong Lin Ken** — the Singapore entrepôt backbone (Table 4; the JMBRAS 1960
  Appendix B vs the 1978 JSEAS summary — a ~60% level gap, follow-up). Chunk 7
  (T-01…T-11).
- **J. Crawfurd** (incl. *Journal of an Embassy to the Courts of Siam and Cochin
  China*) — the ~80,000-ton junk economy c.1830; the Bangkok junk table. Chunk 6
  (O-17), chunk 7 (T-37/T-38).
- **B. Legarda, *After the Galleons*** — Manila export tables; the 1821 galleon
  severance; the 1818/1830 liberalization steps (upgrade path). Chunk 7 (T-26–29).
- **F. Broeze** — the Java merchant fleet (9→49→92 ships 1823–35); NHM freights.
  Chunk 7 (T-21/T-22).
- **D. Owen; M. Greenberg (*British Trade and the Opening of China*, 1951);
  C. Trocki (*Opium, Empire and the Global Political Economy*)** — the opium
  chest series, Bengal-vs-Malwa, season-vs-calendar (follow-up). Chunk 7 (T-13/T-14).
- **Master-Attendant tonnage returns (Singapore)** — counted-but-estimated
  native-craft tonnage. Chunk 7 (T-08).
- **H. Keppel, *The Expedition to Borneo of HMS Dido*** — Sulu-raiding easing
  1843–49. Chunk 7 (T-35).

### East Asia (R3 `east-asia.json` + chunk 6)

- **H. B. Morse, *The Chronicles of the East India Company Trading to China*
  (esp. vol. IV)** — Canton factory trade; the season tables (follow-up).
  `canton-arterial`; chunk 6 (O-21, Morse IV).
- **EIC Canton factory records** — `canton-arterial`.
- **Ng Chin-keong (Amoy and the Nanyang)** — `nanyang-junk-trade`.
- **K. Sugihara** — the junk trade's scale. `nanyang-junk-trade`; chunk 6.
- **L. M. Cullen** — the china-Japan junk series (verified verbatim). Chunk 6.
- **F. Dulles** — Americans plateaued 30–40/yr at Canton (verbatim). Chunk 6 (O-31).
- **J. K. Fairbank** — Shanghai / treaty-port tables (the gate before citing the
  44/437 endpoints; follow-up). Chunk 6 (O-21).
- **The Acapulco registers** — `manila-galleon` (one to four ships/yr).
- **The shuin-sen (red-seal) licenses 1592–1635; Ayutthaya crown-junk records**
  — `redseal-siam-japan`.
- **Records of the Japan House at Busan (the Sō domain)** — `korea-tsushima`.

### Ambient flows & naval movement (chunks 1–4, `ambient-flows.md`)

**Convoys & naval (§1):** Costa (Brazil 1658 return-convoy rule, follow-up); T.
Bentley Duncan (post-1650 Carreira rate, follow-up); Urdaneta (1565 galleon
crossing); Cruisers and Convoys Act 1708; the Convoy Acts 1793/1798;
Postlethwayt (convoy insurance differential); Knight, Ryan, Bowen (convoyed-share
& large-convoy sizes, to verify); Starkey / High Court of Admiralty declarations
(privateer commissioning series); Encyclopædia Britannica 1911 (letter-of-marque
exemption); Cairn / RHMC (caravane-not-convoy finding).

**Fisheries & whaling (§2):** Kranenburg (the ~500-buss herring fleet;
debunked pamphlet counts); Parkhurst 1578 (~50 English Banks ships); Turgeon
(French ~500 ships c.1550); Ryan, *Fishery to Colony* (migratory collapse);
Heritage NL (portal figure, direction only); de Jong (northern-whaling counts);
SEHR 2025 (Bergen >70% share, paywalled follow-up); van Bochove (GDP-share page
cite, follow-up).

**Scheduled & state services (§3):** the 1814 Act (Post Office India mail — the
chunk-3 refutation); Albion (American sailing-packet series); Burckhardt 1814
(the India→Jeddah pulse, verbatim); Faroqhi (Jeddah customs anchors); Pearson
(15,000/yr pilgrim figure — could not be found, not used); Boxer (1566 Aceh→Red
Sea pepper); D. Panzac (the caravane maritime corpus, incl. IJMES fn.45),
verified against the OpenEdition chapters; Aynural (1758 Istanbul grain-by-sea,
181,000 t); Choudhury, Das Gupta (page-level follow-ups).

**Local metabolisms (§4):** English port books (1561–62 London coal); coal-
meters' records (1700/01); Parliamentary Papers (1829 London coal); MacGregor
(London coal-cargo arrival counts); Dunn (633-voyage collier series) and the
Solar/Dunn/Kane 40,000-voyage dataset (paywalled); Pepys (the 1666 collier
convoy); Davis (1709 coastal tonnage bracket); Bao Shichen (~3,500 sand junks at
Shanghai); the Jianghai customs register (monthly arrivals); Xue Yong (the grain-
volume deflation dispute); Wang Zongmu 1572 (the pre-1684 state sea-logistics
exception); Leonard's monographs, Flinn's table (follow-ups).

### New-port dossiers + wars sweep (chunk 8, `flows/new-ports-wars-1815-1850.md`)

*Node bake data + the 1815–50 wars set. Much of the port magnitude is carried by
sources already listed above (Wong Lin Ken for Singapore; the *Twentieth Century
Impressions…* 1844 series for Hong Kong; the Valparaíso 287/166 anchor; the
`cotton-gulf-liverpool` bale series for New Orleans). New to this chunk:*

- **Jennie K. Williams, *Oceans of Kinfolk* (JHU diss. 2020)** + the Coastwise
  Traffic to New Orleans Dataset — ~4,000 manifests / >63,000 people by sea to
  New Orleans, 1818–1860. New Orleans coastwise coerced lane (counted).
- **NARA RG36, *Slave Ship Manifests Filed at New Orleans, 1807–1860*** (M1895,
  under the Act of 2 Mar 1807) — the manifest series behind Williams. New Orleans.
- **R. J. Follett, *The Sugar Masters* (2005)** + Champomier's series — the
  Louisiana sugar hogshead series (5,000 hhd 1802 → 449,000 1853). New Orleans.
- **Museums of History NSW / SLNSW convict indent index** (97,797 records
  1788–1842) + the standard ~80,000 / ~162,000 convict estimates — Sydney convict
  transportation (counted). *Reconciled: the two NSW figures are the same window
  measured two ways.*
- **W. Redfern, *Report on convict ships* (1814)**; P. Pearn, "Surgeon-
  superintendents on convict ships," *ANZ J. Surgery* 66 (1996) — the convict
  passage mortality shift (Second Fleet ~26%; surgeon-superintendents from 1815).
- **J. Macarthur / NSW wool export series** (175k→3.693M lb, 1821–1836) — Sydney
  wool arc (counted). *King George* (1805) — first Sydney-owned whaler.
- **P&O Heritage, *Lady Mary Wood* (1842)** — first P&O Hong Kong departure,
  1 Sept 1845 (behind the declared steam boundary).
- **Wikisource primary instruments** — *Proclamation of Free Port (Hong Kong)*
  (Elliot, 7 June 1841); *Hong Kong Letters Patent 1843*; *Treaty of Nanking*
  (1842). Hong Kong lifecycle.
- **Memoria Chilena / Biblioteca del Congreso Nacional (Chile)** — the *almacenes
  francos* legislation (1824/1832/1833/1834). Valparaíso lifecycle.
- **N. Twohill, "The British World…" (SciELO Chile, *Historia* 2010)** — early US
  ship shares at Valparaíso; the flour-diversion trade.
- **Wars-sweep event chronologies** (encyclopedic, WebSearch-verified dates):
  the French conquest of Algeria (Sidi Ferruch 14 June / Algiers 5 July 1830;
  Abd el-Kader 23 Dec 1847); the Russo-Turkish War 1828–29 & the Treaty of
  Adrianople (14 Sept 1829); the First Syrian War (Acre 27 May 1832 / Kütahya
  1833); the Oriental Crisis (Nezib 24 June 1839; Convention of London 15 July
  1840; Acre 3 Nov 1840); the War of the Confederation (Casma 12 Jan 1839; Yungay
  20 Jan 1839); the First Carlist War (Bilbao relief 1836); the Battle of Navarino
  (20 Oct 1827).

### T8 remaining candidates (chunk 9, `port-flow-candidates-2026-07-18.md`)

- **Ostend Company:** *Ostend Company* (Wikipedia); Jan Parmentier / *Mapping
  Bengal — The Ostend Company*; Wim De Winter, "The Afterlife of the Ostend
  Company, 1727–1745," *Mariner's Mirror* 105:3 (2019); Banglapedia "Ostend
  Company" + Sarkar & Majumdar eds., *History of Bengal Vol. II*.
- **Trieste / Bolts:** *Austrian East India Company* + *William Bolts* +
  *Austrian colonization of the Nicobar Islands* (Wikipedia); Klemen Kocjančič,
  "Imperial Asiatic Company in Trieste and Antwerp… 1781–1785"; N. L. Hallward,
  *William Bolts: A Dutch Adventurer under John Company* (Cambridge, 1920).
- **New Julfa Armenian carriage:** Sebouh David Aslanian, *From the Indian Ocean
  to the Mediterranean: The Global Trade Networks of Armenian Merchants from New
  Julfa* (UC Press, 2011) + "Trade Diaspora versus Colonial State… 1748–1752"
  (the *Santa Catharina*); Levon Khachikian, "The Ledger of the Merchant Hovhannes
  Joughayetsi," *J. Asiatic Society* 8/3 (1966); Tamara Ganjalyan, "Armenian Trade
  Networks," *EGO* (+ her *Russland-Route* monograph for the counted Russia-transit
  silk series); *Encyclopaedia Iranica* "Julfa i/ii/v"; Bhaswati Bhattacharya,
  "Making money at the blessed place of Manila," *J. Global History* (2008) — the
  mapped Madras–Manila proxied lane; Ina Baghdiantz McCabe, *The Shah's Silk for
  Europe's Silver* (1999).
- **Aceh/Bantam pepper:** Bulbeck, Reid, Tan & Wu, *Southeast Asian Exports since
  the 14th Century: Cloves, Pepper, Coffee, and Sugar* (KITLV/ISEAS, 1998) — the
  counted pepper spine ("counted-pending" the Banten decade tonnages); Anthony
  Reid, *Southeast Asia in the Age of Commerce 1450–1680* (Yale, 1988 & 1993);
  Tomé Pires, *Suma Oriental* (the ~1,000-bahar 1522 figure); M. A. P.
  Meilink-Roelofsz, *Asian Trade and European Influence… 1500–c.1630* (Nijhoff,
  1962); Claude Guillot, *The Sultanate of Banten* / *Banten: Sejarah dan
  Peradaban Abad X–XVII*; D. K. Bassett, *The Factory of the English East India
  Company at Bantam, 1602–1682*.

### E-R1 closeout — E4 York Factory/HBCA (chunk 10, `flows/e-r1-closeout-and-framing-signoff.md`)

- **Hudson's Bay Company Archives (HBCA), Archives of Manitoba** — the ships'
  histories register + the underlying counted series (York Factory **bills of
  health**, ships' **logs** [Section C], **post journals**).
- **"The Cycle of Commerce: York Factory Records of Hudson's Bay Company
  Supplies," *Archivaria*** — the account-book analysis; the counted basis.
- **Manitoba Historical Society, "Navigation of Hudson Bay and Straits"** — the
  season-gating (the ~15 July–1 Oct strait window).
- *Hudson's Bay Company* / *York Factory* / *Hudson's Bay Company vessels* /
  *Battle of Hudson's Bay* (Wikipedia); Canadian Encyclopedia "Nonsuch"; Parks
  Canada, York Factory NHS — the 1668 voyage, the 1684 founding, the 1694–1714
  French occupation, the named ships.

*(Part B, the X-R2 framing sign-off, is assembly of framing texts authored in
chunks 5/6/8 — no new sources.)*

### PLAN-4 wider-world candidates (`port-flow-candidates-2026-07.md`)

- **Jumar (school), *Circulación ultramarina… Complejo Portuario Rioplatense*
  (CONICET)** — Río de la Plata ship-entries 1680–1806 (AGN Sala IX). #1.
- **A. Borucki, *The Slave Trade to the Río de la Plata, 1777–1812*** — 712
  slave voyages, ≥70,000 disembarked; Montevideo sole authorized entry 1791.
  #1; chunk 6 (E1 verified). Paired with **TSTD** (counted class).
- **A. Camarda (2013, Cuadro 1)** — the corrected fragata/bergantín entry
  series (building on Jumar; AGN Sala IX). Chunk 6 (E1 citation correction).
- **EIC Gombroon Diaries, IOR/G/29/2-14 (Qatar Digital Library)** — Gulf ship
  movements Nov 1708–Feb 1763 (verified). #2.
- **Leiden dissertation — VOC Basra/Bushehr arrival series** — #2.
- **Cambridge/IJMES, *Ottoman Shipping in the Indian Ocean, c.1650–1900*** — the
  Çelebi family (fifteen ships 1759–80, verified); Jeddah tithe; 1785 parity. #2, #6.
- **HBCA — Hudson's Bay Company Archives ships' histories (Archives of Manitoba)**
  — per-vessel register from 1668. #4 (E4 — the last E-R1 stamp, chunk 10).
- **D. Panzac, *International and Domestic Maritime Trade in the Ottoman Empire***
  — the caravane series; the 1772 Salonica→Istanbul episode. #6, #7.
- **B. Tadić — Dubrovnik State Archives (notarial/chancery/insurance)** — makes
  Ragusa counted/proxied (~180 ships at peak). #8.
- **ANU Press — the Callao/Pacific thalassic chapter** — Armada del Mar del Sur;
  almojarifazgo records. #9.
- **R. C. Davis** — corsair-slavery estimate (~1–1.25 M, 1530–1780, contested) →
  silences entry `mediterranean-corsair-slavery`.
- **J. F. Warren — the Sulu Zone** — slave-raiding economy → gestured silences
  entry `sulu-zone-raiding` (1768–1815).

---

*Maintenance: when a chunk lands, add its row to §A and fold any new sources
into §B under their basin. When a follow-up citation is pinned (e.g. Owen's
exact digits, Wong Lin Ken's table basis), upgrade the bibliography entry from
a bare surname to the full reference. Keep this file in sync with
`rb-campaign.md` (the live tracker) and each artifact's Verification record.*
