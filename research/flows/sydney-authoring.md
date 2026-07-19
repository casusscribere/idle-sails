# Authoring dossier — Sydney (Phase 1, increment 6f)

*Third orphan-port authoring, and the first with a COERCED flow. Sydney was
promoted in increment 5 (`active {1788,1850}`, node −33.86 / 151.21) but nothing
sailed there. Research from `new-ports-wars-1815-1850.md` §Sydney (framing-
critical, X-03) + `atlantic-1815-1850.md`. Two systems: `sydney-convicts`
(counted, coerced) and `sydney-colonial-trade` (reconstructed, commercial).*

## 1. History (post-refutation)

First Fleet founded Sydney Cove 26 Jan 1788. **Convict transportation**: ~162,000
to Australia 1788–1868; **~80,000 to NSW 1788–1842** (the ~80,000 estimate and
the 97,797 indexed indent RECORDS are the same window measured twice — not two
periods, X-05). **NSW transportation ends 1840** (last old-system ship *Eden*
18 Nov 1840); Hobart runs to 1853 but that is a different port's flow, so
Sydney's convict lane terminates 1840. Mortality: ~5–10% early, the **Second
Fleet (1790) ~26% at sea**, cut to ~2–3% after naval surgeon-superintendents on
every ship from 1815. **Free commerce**: the counted **wool** arc (175k lb 1821
→ 3.69M lb 1836, surpassing whale oil by the 1830s), whaling from 1805, the
sandalwood→Canton→tea triangle, and mass assisted emigration post-1840.

## 2. The coerced-flow model (the architecture decision this forced)

Studying the existing coerced systems settled how to represent convicts. The
non-Atlantic slave systems (`indian-ocean-slave-trades`, `black-sea-slave-trade`)
fold their **volume** onto ordinary commercial baked lanes (ivory dhows, Ottoman
coasters) — the enslaved-people cargo and the sober `framing` block live at the
**system/record level**, surfaced in the prominence + silences pages; only the
explicit Atlantic `middlePassage` lanes bake as labelled slavers. That is the
precedent, and the tracker confirms the framing goes "onto their systems."

So Sydney's convicts are modelled as **record + volume**, NOT as a per-ship label:

- A new sober cargo **`transported-convicts`** (valueTier null, class
  `coerced-transportation`) — kept DISTINCT from `enslaved-people`; conflating
  convict transportation with chattel slavery would itself be a charter error,
  and the framing text is explicit ("prisoners under sentence, not cargo … not
  enslaved"). It carries no `middlePassageOnly` flag (that stays reserved for
  enslaved-people, enforced at `build-data.mjs:132`).
- `sydney-convicts` carries `transported-convicts` + the user-approved `framing`
  block; its single lane (London→Sydney, share 1.0) folds onto the commercial
  Britain→Sydney baked lane, so the convict VOLUME rides the real Britain–Sydney
  traffic while the sober truth stays in the record and the silences register.
- The Warrane/Gadigal dispossession is a new `silences` entry (reason
  `unrecorded`, treatment `gestured`) — the site was not empty water and the
  founding not terra nullius, recorded under the same sober logic.

## 3. Program architecture touchpoints

- **Basin**: `research/flows/pacific.json` (the broad Pacific basin opened in 4c;
  the dossier's recommended host). Added `sydney` + `london` to its `ports[]`
  (per-basin membership, the 6d/6e lesson).
- **Routing verified** (the dossier's bake-feasibility flag): London↔Sydney bakes
  via the Cape of Good Hope at ~129/130 days, minLat −48/−49 — north of the −50
  cap, so **no cap change is needed** (unlike the Pacific-Americas Horn work in
  6b). Sydney→Canton bakes at ~44–50 days. The Tasman/Southern-Ocean fields cover
  it.
- **Cargo**: added `wool` (Sydney's premier export, was missing) + the sober
  `transported-convicts`. `whale-oil`/`tea`/`trade-goods` already existed.
- No new powers (`britain`). No render change (the Australasia REGIONS plate the
  dossier suggests is increment-7 surfacing, not needed to sail).

## 4. Charter decisions

- **Convicts ≠ slaves.** Distinct cargo, distinct class, distinct history — the
  single most important framing call, and the source's X-03 finding.
- **The convict lane terminates 1840**, not 1850 — the honest end of NSW
  transportation (Hobart's continuation is a different port).
- **Warrane/Gadigal dispossession recorded**, not silently omitted.
- **Wool surpasses whale oil by the 1830s** — the commercial system's evidence
  spine is the counted wool series; voyage ranges reconstructed around it.
- **Deferred (noted, not silently zeroed)**: the E3 Pacific whaling-grounds link
  is the separate `pacific-grounds` orphan (increment 6h); sealing's fur-seal
  collapse and the bounty-emigration detail ride the colonial-trade volume for now.

## 5. Systems + lanes authored

`sydney-convicts` (counted, 1788–1840): London→Sydney 1.0 · byDecade rising
[2,5]→[12,28] peak 1830s→[6,16] 1840. `sydney-colonial-trade` (reconstructed,
1788–1850): Sydney→London .35 (wool/oil) · London→Sydney .35 (emigrants/goods) ·
Sydney→Canton .15 · Canton→Sydney .15; byDecade [1,3]→[35,80]. Four baked lanes,
flag `britain`; the Canton legs from 1805 (first Sydney whaler).
