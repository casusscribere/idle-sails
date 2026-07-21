# `data-src/` schema (human reference)

Hand-authored, human-editable source datasets for Idle Sails. `pipeline/build-data.mjs`
validates and bundles these into `data/datasets.json`. The `$schema` keys in each
file point here; they are documentation only, not enforced JSON Schema.

**Shared vocabularies**

- **Route classes** (baked-field selectors, fixed by the archived engine): `frigate`,
  `indiaman`, `brig`, `slaver`. Every `ship-types[].routeClass` must be one of these.
- **Seasons**: `djf`, `mam`, `jja`, `son`.
- **Regions**: `britain, lowlands, france, iberia, baltic, caribbean, brazil,
  west-africa, east-indies, china, india, japan, north-america, europe` (plus `*`).
- **Era scope**: 1700–1815 (PLAN §0, confirmed). All `era` windows must fall inside it.

## ports
`ports[]`: `id, name, lon, lat, power (→powers.id), region, roles[], note,
active{from,to}?`.
lon/lat **must** equal the archive coordinates — the baked routing fields are keyed to them.
`active` is the port's LIFECYCLE window (founded/destroyed inside 1550–1815);
absent = the port existed all era. build-data enforces that every lane's era
fits inside both endpoints' windows, so no vessel is ever scheduled to a
not-yet-founded or destroyed port. Where a dot carries an earlier harbour's
flow under the continuity-proxy rule (Batavia=Jayakarta, Bombay=Goa,
Madras=Coromandel, Calcutta=Hugli, Gothenburg=Älvsborg, Kingston=Port Royal),
the window covers the proxy period and the `note` declares it; flows displaced
by a strict window are recorded in `research/flows/silences.json`, never
silently zeroed.
`eraNames[]` (optional): `{from, to, name}` periods giving the dot's honest
DISPLAY name per flowing year — the actual dominant port of the time
(Louisbourg reads St John's outside 1713–58; Kingston reads Port Royal to
1692). Must tile the port's `active` window exactly (contiguous, ordered, no
gaps — build-data enforces). The chart labels, panels, and log all speak the
era name via `world.portNameAt(port, year)`; `name` stays the canonical id
for research pages.

## powers
`powers[]`: `id, name, kind (nation|company|shore), color, homePorts[] (→ports.id),
era{from,to}, propensity{naval,merchant}, navalPrefix, article, rivals[] (→powers.id),
parent (companies → parent nation), note`. `shore` powers (african, qing) never spawn vessels.

## ship-types
`shipTypes[]`: `id, name, routeClass (∈ route classes), rig, tonnage{min,mode,max},
guns{min,max}, crew{min,max}, era{from,to}, roles[] (naval|merchant|slaver),
powers ("*" | →powers.id[]), note`.

## cargo
`cargo[]`: `id, name, origins[] (regions|*), valueTier (0–5|null), class, note`.
`enslaved-people` additionally carries `middlePassageOnly:true` and a `framing{}` block;
it is the only cargo permitted `middlePassageOnly`, and it may appear on no lane except
those flagged `middlePassage`. See PLAN §10.5.

## routes
`routes[]`: directed legs — `id, system, name, from (→ports.id), to (→ports.id),
shipTypes[] (→ship-types.id), cargo[] (→cargo.id), era{from,to}, weight, flag (→powers.id)`.
Optional: `middlePassage:true`, `naval:true`, `framing`, `note`. The baker bakes each lane
for {distinct routeClasses among its shipTypes} × {4 seasons}, keyed by the `to` port's field.

Optional `via`: a port id, or an ORDERED CHAIN of them, that the lane CALLS at on the way —
a refreshment waystop, not a terminus (`["madeira","cape-town","anjer"]` on London→Canton).
The baker routes `from → v1 → … → vn → to`, simplifies hop by hop so each call survives as a
guaranteed vertex, and records `viaIndex[]`; `world.js` splits the leg into one segment per
hop with a dwell at each. A call is gated to the station's `active` window, so a chain
degrades hop by hop as the era rolls back (no Table Bay before 1652, no St Helena before
1659) while the polyline threads them all. Adds NO flow volume — the lane's traffic is
unchanged, it simply stops on the way.

## names
`naval{}`, `navalPlaces{}`, `merchant{}`, `merchantByPower{}` word pools;
`themesByPower{}` maps power → allowed naval/merchant themes; `articles{}` construction rules.

## wars
`wars[]`: `id, name, from, to, belligerents[[...],[...]] (→powers.id), theatres[] (regions),
riskUplift, engagements[{year,name,note?}]`.
