# `research/routes/` — the route verification corpus

**PLAN-7 Phase 0 (F-41).** This directory holds the evidence the generated
routes are checked against, and nothing else. It does not hold routes.

| File | What |
|---|---|
| `corpus.json` | The evidence corpus — verified historical observations about how ships actually sailed. |
| `baseline-*.json` | Committed harness output, so later phases have something to diff. |

The runner is `research/tools/route-verify.mjs`; the rendered report is
`research/routes.html`.

---

## What belongs here

**Findings, not routes.** An entry records something the historical record
supports about a passage — that Europe↔Canton traffic used Sunda and not
Malacca, that Indiamen watered at Table Bay from 1652. It never records a track
we generated.

The distinction PLAN-7 §2.1 insists on: **a prescribed route is not an observed
route.** VOC standing orders say what ships were *told* to do; logbooks say what
they did. Both are evidence, they are not the same evidence, and the harness
must never average them. That is what `kind` is for.

## Entry schema

```jsonc
{
  "id": "europe-canton-via-sunda",     // stable, kebab-case, permanent
  "tier": "T1",                        // which metric evaluates this entry
  "kind": "prescribed-route | logbook-track | passage-duration |
           waypoint-constraint | forbidden-corridor",
  "class": "counted | proxied | reconstructed | asserted",   // evidence class
  "era":  { "from": 1700, "to": 1834 },   // when the claim holds
  "lanes": ["china-can-lon", "china-lon-can"],  // explicit lane ids, or…
  "match": { "flag": "eic", "from": "london" }, // …a predicate over lanes

  // T1 — at least one of:
  "waypoints": [
    { "name": "Anjer (Sunda Strait)", "lon": 105.9, "lat": -6.05,
      "tolKm": 400, "required": true }
  ],
  "corridors": [
    { "name": "Malacca Strait", "forbidden": true,
      "box": [98.0, 1.0, 104.5, 6.5] }        // [lonMin, latMin, lonMax, latMax]
  ],

  // T2
  "duration": { "days": [180, 240], "n": 42, "basis": "…" },

  // T3 — the lane this one must visibly differ from
  "asymmetryWith": "china-lon-can",
  "minSeparationKm": 200,

  // T4
  "seasonal": { "minSeparationKm": 150 },

  // T5 — only where positional data genuinely exists
  "track": [[lon, lat], …],

  "sources": ["…"],
  "notes": "…"
}
```

### Field notes

- **`class`** is the project's evidence vocabulary, used exactly as
  `research/flows/` uses it. An entry with no defensible class is not an entry.
- **`era`** matters: a claim true for the EIC period is not automatically true
  for 1600. The harness only applies an entry to lanes whose era overlaps it.
- **`tolKm`** must be honest about the source's precision. A sailing direction
  saying ships "watered at St Helena" supports a 300–500 km tolerance, not 20 km.
  Tightening a tolerance beyond what the source supports is fabricated precision
  and is the main way this file could go wrong.
- **`lanes` vs `match`**: prefer explicit `lanes` — it fails loudly when a lane
  is renamed, where a predicate would silently match nothing.

## The three verdicts

Every lane × entry evaluates to one of:

| Verdict | Meaning |
|---|---|
| `pass` | The generated route satisfies the claim. |
| `fail` | It does not. |
| `unverified` | **No entry covers this lane.** Not a pass. Never counted toward a pass rate. |

`unverified` is the whole point of the D-21 decision (PLAN-7 §1.1). Most of the
414 lanes will sit there, and the harness publishes that fraction rather than
quietly reporting a healthy-looking pass rate over the minority that happen to
have evidence.

## What this corpus does NOT cover

Stated here, and re-stated by the harness on every run, because the shape of the
evidence is itself a finding:

- **The early era.** The richest positional sources for age-of-sail tracks begin
  around 1750. For 1550–1700 the corpus will hold prescribed routes and
  categorical constraints, not tracks.
- **Non-European shipping.** Junk, dhow, and prau traffic is thinly served by
  the surviving positional record.
- **Coastal and regional traffic**, which rarely generated the kind of record
  that survives.

PLAN-7 §10 is the standing warning: if the router is tuned until the
well-documented routes are perfect, the chart will have been quietly rebuilt
around the archive's bias. The coverage report exists so that cannot happen
silently.
