# Authoring dossier — York Factory / Hudson Bay (Phase 1, increment 6i)

*Sixth orphan-port authoring, and the one that needed new BAKER infrastructure:
a summer-only seasonal-ice seal. Research from `port-flow-candidates-2026-07.md`
§4 + PLAN-4 §E4 (verified-with-restatements, chunk 10).*

## 1. History

The HBC's London ↔ Hudson Bay supply run, 1668 onward — the only English presence
in the bay. Counted on the **HBCA ships' histories** (Archives of Manitoba), a
per-vessel register from the Eaglet/Nonsuch (1668) through the era. Real volume is
tiny: **1–3 supply ships a year** — the Dejima pattern, a low-volume high-meaning
exemplar. York Factory is the era-name from 1684 (Rupert House earlier); the
**1694–1714 French occupation** rerouted English trade to Fort Albany.

## 2. The baker infrastructure this forced — a sub-66 seasonal-ice seal

Hudson Bay freezes; the HBC ships transited Hudson Strait **Jun–Oct only**. But
the bay and strait sit at **lat 55–64, BELOW the 66°N Arctic cap**, so the cap
does not seal them — they were open year-round in the model, which would let York
Factory take winter arrivals it never took. The existing Arctic *corridors* do the
opposite job (they OPEN a 66+ region in its navigation season); Hudson Bay needs a
region CLOSED in its off-season. So `bake-routes.mjs` gains a `SEASONAL_ICE` zone
(lon[−95,−64] × lat[55,66], closed djf+mam): those cells become land in
winter/spring, so the Dijkstra field can't reach York Factory then and the lane is
season-gated exactly like the ice-locked Arctic — the sim reschedules any vessel
that draws it in a closed season. Verified: both HBC lanes bake **jja/son only**
(London→York 32 d in summer), and the bounds miss Davis Strait (67°N/−55, whaling)
and the Labrador Sea (east of −64°), so no other route is touched (season-gated
count 24→28, all four the York djf/mam legs).

This is reusable: any future winter-frozen sub-Arctic sea (the Gulf of Bothnia's
deep winter, the White Sea's shoulder months) can be added as a `SEASONAL_ICE`
entry.

## 3. Program architecture + charter

- Basin `atlantic.json`; added `york-factory` to `ports[]`. Flag `hbc` (1670–1850).
- Routing VERIFIED earlier (increment-6 scouting): London→York Factory threads
  Hudson Strait (lat ~61–64) into the bay — a real, geographically valid path, not
  a raster leak — at ~63 days year-round / ~32 in summer.
- **The 1694–1714 French occupation is a declared simplification**: at 1–3
  ships/yr the lifecycle gap + Fort-Albany reroute is not modelled; the flat range
  spans it, stated in the basis (no fabricated precision, no silent claim).
- `evidence: counted` on the HBCA register, not the derived web table (the
  chunk-10 restatement).

## 4. System + lanes

`hudson-bay` (counted, 1684–1850): London→York Factory .5 · York Factory→London
.5; byDecade a flat [1,3] (→[2,4] late), the Dejima-pattern low volume. Two baked
lanes, flag `hbc`, cargo furs out / trade-goods in, season-gated to the summer.
