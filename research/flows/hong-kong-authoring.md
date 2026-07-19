# Authoring dossier — `treaty-port-trade` / Hong Kong (Phase 1, increment 6e)

*Second of the orphan-port systems. Hong Kong was promoted in increment 5
(`active {1841,1850}`, node 114.16 E / 22.28 N, power `britain`) but nothing
sailed there. Research from `new-ports-wars-1815-1850.md` §Hong Kong (the
cleanest dossier, 25/25 ✅) + `east-asia-io-1815-1850.md` §treaty-port-trade.*

## 1. The history (post-refutation)

Britain took possession 26 Jan 1841; free-port proclamation 7 June 1841; ceded
by the Treaty of Nanking 29 Aug 1842; Crown colony 1843. It became the
deep-water anchorage and opium receiving-ship depot after the Lintin→HK shift —
but **Canton remained the larger port to era end**: HK is the entrepôt-in-
formation, not yet the bigger port. **Counted magnitude anchor: 538 vessels /
189,257 tons (1844)** — the first year any shipping record was kept, "almost
without exception sailing ships." **Contamination hazard the refuter caught:
this figure is repeatedly misattributed to Shanghai online; it is Hong Kong's,
confirmed against the primary. Shanghai opened Nov 1843 and had no 1844 series —
do not fabricate one.** No HK vessel series exists before 1844.

Lanes (asserted skeleton, from the dossier): Canton ~30–35%; Calcutta/Bombay
opium ~20%; London tea/goods ~10–15%; Singapore ~10%; Macau ~5–8%; Amoy + the
other treaty ports ~8–10%; Manila ~3–5%. Cargo: opium in (Bengal + Malwa, HK the
offshore receiving depot), tea homeward, general goods. **Steam is a declared
boundary** — P&O's monthly London–HK mail from Sept 1845 is surfaced, never
sailed (the wind engine cannot make a steamer).

## 2. `byDecade` voyages/yr [lo,hi]

Era 1843–1850 (treaty-port function from 1843; the port exists from 1841). Only
two decade buckets touch it. The 538/1844 count anchors the level; the range
brackets it (counted anchor, reconstructed spread — one recorded year, so the
ledger says counted but the basis states the single-year dependency):

| decade | [lo,hi] | reasoning |
|---|---|---|
| 1840 | [400,700] | HK entries/yr from 1844, anchored on 538 (1844) |
| 1850 | [500,800] | continued growth to era end |

## 3. Program architecture

Same fold pipeline as Singapore (6d). `treaty-port-trade` goes in
`research/flows/east-asia.json`. Cross-basin lane partners must be **declared in
this basin's `ports[]`** (validate-flows enforces per-basin membership — the 6d
`amoy` lesson): add `hong-kong`, `calcutta`, `bombay`, `singapore` (Canton,
Macau, Amoy, Shanghai, Manila, London already present). Ningbo/Fuzhou proxy onto
Amoy already, so the minor treaty-port shares fold there. `opium` cargo now
exists (added 6d); `junk`/`china-junk-trade` for Chinese coastal legs already
valid to 1850 (6d). Then baked lanes in `data-src/routes.json`, bake (South China
Sea — no cap issues, HK adjacent to Canton), build, test.

## 4. Charter decisions

- **Canton stays larger than Hong Kong.** The lane shares keep Canton dominant
  (canton→HK 0.18 + HK→canton 0.15 > any HK-terminal share) — HK is the new
  deep-water depot, not yet the bigger port, exactly as the source insists.
- **Opium named, not laundered** (as 6d): the Calcutta/Bombay→HK legs carry
  `opium`, HK being the post-1842 receiving-ship depot.
- **Steam is a registered boundary, not a lane** — no P&O steamer track; it
  belongs in the increment-7 declared-divergences + silences surfacing.
- **The coolie/emigration trade sits after era end** — nascent 1841–50 (chiefly
  Amoy), its volume anchor post-1850; carried under the sober pattern on the
  nanyang/Amoy lanes when authored, not a new HK system inside this era.

## 5. Lanes authored (share; flag)

canton→HK .18 · HK→canton .15 (britain) · calcutta→HK .12 · bombay→HK .08
(opium, britain) · london→HK .07 · HK→london .07 (britain) · singapore→HK .06 ·
HK→singapore .05 (britain) · macau→HK .06 (portugal) · amoy→HK .05
(china-junk-trade, junk) · shanghai→HK .04 (china-junk-trade, junk) ·
manila→HK .03 (spain). Shares ~1.0.
