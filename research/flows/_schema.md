# The flow matrix — schema (PLAN-3 §2, fixed at R2)

*The trade-system flow matrix replaces port rankings as the simulation's weight
source. Decisions recorded here were approved 2026-07-13 (R2): volumes are
**voyage ranges**, realization is a **per-seed draw within bounds**, and the
unit of authorship is the **named trade system with lane shares**.*

## Basin files — `research/flows/<basin>.json`

One file per basin (`baltic-north-sea`, `atlantic`, `mediterranean`,
`indian-ocean-west`, `bengal-se-asia`, `east-asia`). Each:

```jsonc
{
  "basin": "baltic-north-sea",
  "anchors": [ "…the scholarship this basin is anchored to…" ],
  "ports": [               // every port named by a lane, exactly once
    { "id": "danzig", "name": "Danzig (Gdańsk)",
      "simProxy": "gothenburg" }   // nearest BAKED sim port, or null (unsailable
  ],                               // until Phase S2 bakes it — never a reason
                                   // to zero the flow itself)
  "systems": [
    { "id": "baltic-grain-west",
      "name": "Baltic grain, westbound",
      "evidence": "counted",       // counted | proxied | reconstructed | asserted
      "basis": "Sound Toll Registers…",   // source or reasoning — REQUIRED
      "era": { "from": 1550, "to": 1815 },
      "cargo": ["grain"],          // data-src/cargo.json ids (validated)
      "shipTypes": ["fluyt", "brig"],     // data-src/ship-types.json ids
      "lanes": [                   // shares sum to ~1.0 per system
        { "from": "danzig", "to": "amsterdam", "share": 0.40 } ],
      "byDecade": {                // every decade in era, no gaps
        "1550": { "voyagesPerYear": [220, 380] } },  // RANGE, never a point
      "notes": "…" }
  ]
}
```

### Semantics

- **`voyagesPerYear: [lo, hi]`** counts *loaded one-way voyages* in the named
  direction. Return legs are their own systems where the return trade is
  distinct (`baltic-return-east`); otherwise the sim's itinerary chaining
  supplies the homeward leg. This matches how the Sound Toll counted passages
  (per direction), so counted systems cross-check against their sources.
- **Evidence classes** (the Trouillot rule — *a known trade is never silently
  zero*): `counted` = a surviving series; `proxied` = inferred from an adjacent
  series; `reconstructed` = modern scholarship's estimate; `asserted` = our own
  stated guess — wide bounds, reasoning in `basis`, flagged in the UI at S3.
- **Realization (per-seed draw):** at S1 each world seed deterministically
  draws one value inside every `[lo, hi]` — a world is *one plausible reading
  of the evidence*; two seeds may disagree about how busy a trade was, and so
  do the historians. Same seed ⇒ same reading ⇒ same world.
- **`simProxy`** is consumption-side folding only (Phase A's 15-port limit).
  The flow data itself always names the *historical* port: coverage gaps live
  in the proxy column, never in the record of the trade.
- **Port prominence is an output**: sum of realized flows touching a port per
  decade — computable for reference pages, no longer a load-bearing input.

## The silences register — `research/flows/silences.json`

Flows we know existed and deliberately do not (or cannot) quantify:

```jsonc
{ "silences": [
  { "id": "coastal-shipping-general",
    "scope": "all basins",
    "reason": "excluded-by-basis | unrecorded | evasion | fishery-not-trade | not-yet-reconstructed",
    "treatment": "asserted | excluded | gestured",   // asserted ⇒ pointer names the system
    "pointer": "english-coastal-colliers",
    "note": "why it is silent, and what we chose to do about it" } ] }
```

`treatment: asserted` means the silence was *answered* — a system entry now
carries our stated estimate. `gestured` means it is acknowledged and may become
ambient content (S3) without volume claims. `excluded` means genuinely out of
scope, with the reason on record. The register is publishable content, not an
appendix: S3 renders it as "The chart's silences."

## Validation — `research/tools/validate-flows.mjs`

Structural (hard errors): unique ids; every lane port in `ports`; shares sum to
1 ± 0.02; `lo ≤ hi`, positive; `byDecade` covers the system era exactly on the
decade grid; evidence/treatment enums; cargo & shipTypes resolve against
`data-src/`. Historical (reported): per-basin cross-checks (e.g. Sound-crossing
systems' west+east sums vs Sound passage totals) and a derived-prominence
comparison against the rankings' counted stratum.
