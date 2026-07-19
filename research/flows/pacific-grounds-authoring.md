# Authoring dossier — the South Sea whaling grounds (Phase 1, increment 6j)

*Seventh and LAST orphan-port authoring — the E3 grounds node, a novel pattern:
a station dot standing for a fishery, not a port pair. Research from
`port-flow-candidates-2026-07.md` §3 + PLAN-4 §E3.*

## 1. History + the grounds-node pattern

The South Sea sperm fishery off Peru/Chile, opened by the *Emilia* round the Horn
in 1788, worked first by the British southern whale fishery (fleet peak 149 ships
1821 → halved mid-1830s → <20 by the 1840s) then overwhelmingly by the American
(the 1846 peak of 735–6 vessels, ≈[150,250] departures/yr across all grounds, the
Pacific a large share). Counted on the voyage-level databases (American Offshore
Whaling Voyages; the British southern lists).

The **grounds-node convention** (the Smeerenburg/Davis-Strait pattern): a
multi-year whaling cruise is abstracted as an out-and-return pair between a home
port and the grounds dot — the years spent *working* the grounds are not ticked.
`pacific-grounds` (−82/−15, role `station`) is that dot. Shipping it proves the
pattern; the Svalbard/Davis-Strait Arctic fisheries stay registered for a later
wave (their `svalbard-offshore-whaling` silence now points here).

## 2. The architecture decision — the grounds join HORN_DEST

The grounds sit in the Pacific off Peru, so a whaler from London or Boston
**rounds Cape Horn** to reach them — exactly the case the destination-aware Horn
cap (6b) exists for. Added `pacific-grounds` to `HORN_DEST`, so its field uses the
−58° cap and the outbound legs round the Horn (verified: London/Boston→grounds
minLat −57, ~90–98 d). The RETURN legs (grounds→London/Boston) have a non-Horn
destination, so they take the −50-capped westward route round the Cape of Good
Hope (~147 d, minLat −49) — the "Golden Round" circumnavigation many whalers and
China traders actually sailed, a geographically valid (if longer) homeward leg.
The asymmetry is a faithful consequence of the destination-keyed cap, not a bug.

## 3. Program architecture + charter

- Basin `pacific.json` (already holds Boston + London); added `pacific-grounds` to
  `ports[]`. No new cargo (whale-oil existed), flags `britain` (British fishery) +
  `usa` (American).
- byDecade reconstructs the Pacific share between the British and American counted
  peaks — British-led 1810s–20s, American-dominated 1840s ([90,190] at the 1846
  peak). Evidence `counted` on the voyage databases; the combined-fleet decade
  ranges are the reconstructed Pacific portion, stated in the basis.
- **The grounds-node pattern is now reusable** — Svalbard and Davis Strait can be
  retro-fitted as grounds nodes in a later wave (their register entries already
  anticipate it).

## 4. System + lanes

`south-sea-whaling` (counted, 1788–1850): London↔grounds .22/.22 (britain) ·
Boston↔grounds .28/.28 (usa); byDecade [2,8]→[90,190]→[80,170]. Four baked lanes,
out (trade-goods) round the Horn, home (whale-oil) round the Cape.
