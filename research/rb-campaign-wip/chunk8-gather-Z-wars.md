# Chunk 8 gather Z — 1815–1850 wars sweep, non-Atlantic gaps (raw, pre-refutation)

Completes chunk 5's 13 Atlantic/China war drafts. Confidence: [Z-HI] date confirmed; [Z-MED] period-consistent; all `riskUplift` are [Z-LO] design knobs, not source claims. Verify against wars.json schema.

**[Z-01] french-conquest-algeria** 1830–1847 · belligerents [["france"],["ottoman"]] · theatres ["mediterranean","west-africa"] · uplift 1.4 · engagements: 1830 landing Sidi Ferruch + capture of Algiers; 1847 surrender of Abd el-Kader. Note: invasion 14 June 1830 [Z-HI], Algiers surrenders 5 July 1830 [Z-HI]; Abd el-Kader war 1832–1847, surrender 23 Dec 1847 [Z-HI]. Enemy = Regency of Algiers (Ottoman vassal) mapped to `ottoman` — approximation; a new `algiers` id if finer wanted. Marseille–Algeria military lane.

**[Z-02] russo-turkish-1828** 1828–1829 · [["russia"],["ottoman"]] · ["black-sea","mediterranean"] · uplift 1.7 · engagements: 1828 siege/capture of Varna; 1829 Treaty of Adrianople opens the Straits. Declared 26 Apr 1828 [Z-HI]; Adrianople signed 14 Sept 1829 opening the Dardanelles to commercial shipping [Z-HI] — relevant to the Odessa grain trade (S-13).

**[Z-03] egyptian-ottoman-1** (First Syrian War) 1831–1833 · [["egypt"],["ottoman"]] · ["levant","mediterranean"] · uplift 1.4 · engagements: 1832 fall of Acre to Ibrahim Pasha. Acre besieged Oct 1831, fell May 1832; ends Convention of Kütahya 1833 [Z-HI]. Affects Alexandria/Beirut/Smyrna.

**[Z-04] oriental-crisis-1839** (Second Egyptian–Ottoman War) 1839–1841 · [["britain","ottoman"],["egypt"]] · ["levant","mediterranean"] · uplift 1.7 · engagements: 1839 Battle of Nezib + Ottoman fleet defects to Alexandria; 1840 Anglo-Austrian bombardment of Beirut and Acre (Napier). Nezib 24 June 1839; fleet surrenders at Alexandria 1 July 1839; Convention of London 15 July 1840; Beirut/Sidon shelled 11 Sept 1840; Muhammad Ali accepts 27 Nov 1840 [Z-HI]. Austria a co-belligerent at sea — omitted for lack of an id (recommend adding `austria`).

**[Z-05] java-war** (Diponegoro War) 1825–1830 · [["dutch"],[]] · ["east-indies"] · uplift 1.2 · engagements: 1830 capture of Diponegoro at Magelang. Rebellion July 1825; Diponegoro captured 28 Mar 1830 [Z-HI]. Overwhelmingly LAND — minimal at sea; elevated Dutch coastal reinforcement to Batavia/Semarang. Rebel side no maritime power id (empty set). Droppable if only fleet wars wanted.

**[Z-06] war-of-confederation** 1836–1839 · [["chile"],["peru"]] · ["pacific-america"] · uplift 1.4 · engagements: 1836 Chilean seizure of the Confederate squadron at Callao; 1839 Battle of Casma. Callao seizure Aug 1836; Chile declares war 28 Dec 1836; Casma 12 Jan 1839; Yungay 20 Jan 1839 [Z-HI]. `peru` stands in for the Peru–Bolivian Confederation (Bolivia landlocked); Argentina co-belligerent (land) omitted. Callao blockaded; Valparaíso the Chilean base. (Matches Valparaíso gather W-13.)

**[Z-07] first-carlist-war** (naval) 1833–1840 · [["spain","britain"],[]] · ["iberia"] · uplift 1.3 · engagements: 1836 RN squadron + British Auxiliary Legion lift the siege of Bilbao. War 1833–1840; Auxiliary Legion 1835–37; Bilbao relief Nov–Dec 1836 [Z-HI]. Chiefly land; at sea an RN/French Quadruple-Alliance blockade of the Cantabrian coast + gunfire support of the Cristinos. Carlist side no maritime flag (empty set). Minor at sea — borderline; drop if a naval-only bar is applied. France co-belligerent (could add to set one).

**[Z-08] Navarino — NOT a new war.** Add to chunk 5's `greek-independence` as an engagement: `{ "year": 1827, "name": "Battle of Navarino" }`. Battle 20 Oct 1827 [Z-HI] — combined British/French/Russian fleet destroys the Ottoman–Egyptian fleet; the decisive naval action of Greek independence.

**New power ids required:** `ottoman` (also stands in for Regency of Algiers), `egypt` (distinct from ottoman), `russia`, `chile`, `peru` (stands in for Peru–Bolivian Confederation). `greece` already introduced by chunk 5's greek-independence. **Omitted co-belligerents flagged:** `austria` (Oriental Crisis fleet), `france` (Carlist blockade / Convention of London) — dropped for lack of ids; recommend adding `austria` for the Oriental Crisis coalition.

**New region ids required:** `mediterranean` (Algeria, Russo-Turkish, both Egyptian wars), `black-sea` (Russo-Turkish + Odessa grain lane), `levant` (both Egyptian wars — Alexandria/Beirut/Acre/Smyrna), `pacific-america` (War of the Confederation). `east-indies`/`west-africa`/`iberia` already exist.

**Coverage/duplication:** no overlap with chunk 5's 13 (verified vs exclusion list). Considered and NOT drafted: Dutch Padri War (Sumatra 1821–1837), Bali expeditions (1846–49) — near-total land, negligible open-sea risk; Sulu/anti-piracy overlaps chunk 5's `south-china-sea-piracy` (1843–49). Flag if low-uplift stubs wanted.

**Sources:** WebSearch-verified dates for each (French conquest of Algeria; Russo-Turkish War 1828–29 / Treaty of Adrianople; First & Second Egyptian–Ottoman Wars / Convention of London 1840; Java War / Diponegoro; War of the Confederation; First Carlist War; Battle of Navarino — standard encyclopedic + event chronologies).
