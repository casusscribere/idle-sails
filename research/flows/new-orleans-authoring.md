# Authoring dossier — New Orleans (Phase 1, increment 6h)

*Fifth orphan-port authoring. New Orleans was promoted in increment 5
(`active {1718,1850}`, eraNames France/Spain/US) but nothing sailed there. Two
Atlantic systems: `cotton-gulf-liverpool` (commercial, counted) and
`neworleans-coastwise` (the coerced domestic slave trade, counted, ratified
framing). Research from `new-ports-wars-1815-1850.md` §New Orleans +
`atlantic-1815-1850.md` §5.*

## 1. History

By ~1840 the **second-largest US port**: >half of all US cotton passed through
(>180M lb ≈ 450k bales by the late 1820s; Liverpool ~1.1–1.3M American bales
c.1850). Louisiana sugar ran 5,000 hhd (1802) → 449,000 (1853), the backbone
until cotton overtook it ~1842. Britain took ~2× the cotton France did (Le Havre
folded into the Liverpool trunk). It was also **the largest slave market in the
United States**, terminus of the coastwise "second Middle Passage": Williams'
*Oceans of Kinfolk* counts ~4,000 manifests naming **>63,000 enslaved people**
trafficked by sea 1818–1860, ~70% from the Chesapeake (Norfolk/Baltimore/
Richmond/Alexandria), ~90% with Charleston and the wider upper-South seaboard.

## 2. Charter decisions

- **The coerced flow ships WITH the commercial one** — the core charter rule
  flagged in the tracker: New Orleans' cotton boom without its coastwise slave
  trade would be a silent zero. Both authored together.
- **`neworleans-coastwise` uses the record model, NOT an explicit `middlePassage`
  slaver.** slave-ship ends 1815 by design (the project excluded it from late-era
  extension at the Atlantic abolition), so a baked domestic slaver would require
  reviving slave-ship past abolition — deliberately avoided. Instead the coerced
  flow carries `enslaved-people` + the ratified sober framing at record level, its
  volume riding the Chesapeake→New Orleans coastwise lane (the same model as
  Montevideo 6g and the Indian Ocean / Black Sea slave systems). This IS an
  Atlantic slave flow, so `enslaved-people` is correct (unlike Sydney's convicts).
- **The `chesapeake` node stands for the Upper-South seaboard** (~90% of origins);
  the 1836 "120,000 from Virginia" is an all-modes interregional total, kept
  distinct from the by-sea figure.
- **Up-river western produce is out of scope** — internal river traffic, node
  prominence not a sea lane. Le Havre folded into Liverpool (no node).

## 3. Program architecture

- Basin `atlantic.json`; added `new-orleans` to `ports[]`. Partners
  (liverpool/new-york/havana/chesapeake) already present.
- Routing bakes cleanly — the Mississippi-bar concern is moot at 1° (New Orleans
  snaps to the Gulf off the delta): New Orleans→Liverpool 63 d, →New York 16 d,
  →Havana 5 d, Chesapeake→New Orleans 24 d. The into-Gulf legs wind-gate to their
  favorable season (realistic). No cap or seal changes.
- No new cargoes (cotton/sugar/tobacco/trade-goods all existed); flags
  britain + usa (1783–1850).

## 4. Systems + lanes

`cotton-gulf-liverpool` (counted, 1815–1850): NO→Liverpool .34 · Liverpool→NO .24
· NO→NY .16 · NY→NO .14 · NO→Havana .12; byDecade [40,120]→[150,350]→[350,700]→
[700,1400]→[800,1500] (the bales spine). `neworleans-coastwise` (counted,
1818–1850): Chesapeake→NO 1.0, `enslaved-people` + framing; byDecade [3,8]→
[18,40]. Six baked lanes.
