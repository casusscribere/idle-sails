# Authoring dossier — Montevideo / the Río de la Plata (Phase 1, increment 6g)

*Fourth orphan-port authoring. Montevideo was promoted in increment 5
(`active {1724,1850}`) but nothing sailed there. Two systems in the Atlantic
basin: `plata-republics-trade` (commercial, reconstructed) and `plata-montevideo`
(coerced, counted — the ratified E1 framing text). Research from
`atlantic-1815-1850.md` §5 + the framing signoff §4.*

## 1. History

**Commercial** (post-independence, all flags): hides & tallow out (>1M hides/yr
by the early 1820s), tasajo (salt beef) from the saladeros to Cuba and Brazil,
manufactures in — Britain leading, with US and France. THREE blockade dents: the
Cisplatine War 1826–28, the French blockade 1838–40, the Anglo-French blockade
1845–48. **Coerced**: Montevideo was made the sole authorized port of entry for
enslaved people to the Plata in **1791** — most brought by way of Brazil, others
direct from Mozambique and Angola; wound down with the independence-era
abolitions (Argentine free-womb law 1813). The two are one economy: the
estuary's tasajo provisioned enslaved plantations elsewhere.

## 2. Program architecture + charter decisions

- Basin `atlantic.json`; added `montevideo` to `ports[]` (Buenos Aires folded in
  — no separate node; the estuary's deep-water port is Montevideo).
- `plata-montevideo` follows the established **coerced record model** (6f): cargo
  `enslaved-people` + the ratified sober `framing` block at the record level; its
  single lane (Rio→Montevideo, the Brazil route) folds onto the commercial
  Brazil→Plata baked lane, so the coerced VOLUME rides real traffic and the sober
  truth lives in the record. This is an Atlantic slave flow, so `enslaved-people`
  is correct here (unlike Sydney's convicts).
- Added cargoes `hides` + `tasajo` (both were missing) — the Plata's defining
  exports, `tasajo` noted for its grim tie to slavery elsewhere.
- Routing bakes cleanly (Montevideo↔Liverpool ~60 d, Rio↔Montevideo ~9–13 d);
  no cap changes.

## 3. A latent seam bug this increment surfaced (and fixed)

Adding these five routes shifted the spawn RNG and tripped the 310-year
port-lifecycle test: a junk on `e-amoy-shanghai` spawned in the last days of the
epilogue ramp, sailed a short hop, and its legs crossed the 1860→1550 seam —
calling Shanghai (founded 1600) at year 1550. Root cause: extending junk to 1850
(6d) first let junk lanes sail the reset ramp, where a seam-crossing voyage lands
in the next cycle's early years. This is an in-flight ship spawned when the port
was valid — the seam counterpart of the test's existing to+3 late-arrival
tolerance. Fixed in the TEST (no sim change): a voyage that BEGINS in the reset
ramp is anchored to 1850 for all its calls (a genuine 1550 spawn on a 1600+ lane
is impossible — spawn is era-gated — so any such call can only be a ramp voyage).

## 4. Systems + lanes

`plata-republics-trade` (reconstructed, 1810–1850): Montevideo↔Liverpool
(hides/goods), Montevideo→Havana (tasajo), Rio↔Montevideo (regional); byDecade
[25,60]→[110,260], the three blockade dents in the basis. `plata-montevideo`
(counted, 1791–1812): Rio→Montevideo 1.0, `enslaved-people` + framing; byDecade
[8,20]→[10,25]→[4,12] (declining to the 1813 abolition). Five baked lanes.
