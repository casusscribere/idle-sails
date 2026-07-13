# Minor-ports curation rubric

*The operational form of PLAN-2 §5.6 — how the diversity roster grows without
lopsiding, and how a research candidate becomes a sailing port.*

## The pipeline (three stations)

```
research/minor-ports-1500-1830.*        the CANDIDATE gazetteer (grows freely)
        │  score → verify → author
        ▼
research/minor-ports-promotion.json     the PROMOTION QUEUE (sim-ready, staged)
        │  Phase B: bake 16 fields/port → expand lanes → build-data
        ▼
data-src/ports.json + routes.json       the SIM (deliberate, baked, validated)
```

A port never jumps a station. The vocabulary a port needs (cargo, flags, rigs,
regions) is added to `data-src/` **when it enters the queue** — that pass is
done once (2026-07: 18 cargoes, 19 polities/flags, junk & dhow + the 16th-c
rigs, 9 regions) — so promotion itself is only: copy the port entry, expand its
`lanes` pairs into directed `routes.json` legs, bake, run `build-data`.

## Scoring a candidate (the four axes)

Score each candidate 0–2 per axis on how much it fills a gap the **current
roster** leaves open — the score is marginal, not absolute:

| Axis | 2 points looks like | currently thin |
|---|---|---|
| **Region** | a sea the map has none of | Korea/Vietnam, Swahili coast, Black Sea, N. Pacific |
| **Cargo / function** | a commodity or role no port supplies | pilgrim carriage, porcelain entrepôt, whaling/cod stations |
| **Route-type** | a lane shape we lack (tribute run, monsoon shuttle, contraband, seasonal fishery) | seasonal fisheries, tribute circuits |
| **Polity** | a flag excluded from European-volume datasets | Mughal/Golconda, SE-Asian sultanates, the country-trade flags |

**Interest = sum − bake-cost penalty** (−1 if a `bakeRisk` needs engine work:
mask exceptions, strait carving, bounds extension; see the queue's tranche-3
entries). Promote from the top; re-score after every promotion because each
one changes what is thin.

## Hard rules (not scored — required)

1. **Era-window honesty.** A port sails only its real years (`era`), enforced
   by the flowing clock — Makassar dies in 1669, Louisbourg in 1758.
2. **Sober treatment of human trafficking.** Any slave-trade lane replicates
   the Whydah pattern exactly: `middlePassage: true`, cargo only
   `enslaved-people`, the framing block, no value tier, elevated attrition.
   The Atlantic-only invariant in `build-data.mjs` is a deliberate guard; the
   Old Calabar and Kaffa queue entries carry explicit promotion rules.
3. **Weights stay in the diversity band.** Minor-port lane weights are 1–2
   (majors run 3–9), so the tail flavours the mix without distorting it
   (PLAN-2 §5.5). Tune the band, not individual ports.
4. **Movement is baked or it doesn't sail.** No great-circle fallbacks for
   flavour ports; a port waits in the queue until its fields exist.

## Open flag decisions the queue surfaced

Recorded on the entries themselves (`flagNeeded` / `powerNeeded`): a
**china-junk-trade** flag (the private junk diaspora, distinct from the Qing
state) would unlock Hội An, Patani, Manila and Ayutthaya lanes at once;
**tsushima** unlocks Busan; **golconda** and **patani** are one-line shore
powers; Île Sainte-Marie is better modelled as a 1690–1725 Indian-Ocean
*hazard* (a war-style riskUplift) than as a port.
