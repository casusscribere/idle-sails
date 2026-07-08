# Idle Sails

A browser **idler** for the age of sail. Leave it open and a procedurally
generated, historically-grounded world sails itself: plausible vessels — names,
rigs, tonnages, flags, cargoes — set out on realistic wind-and-current routes
between historical ports, cross the world, and are lost or arrive over time.

The only controls: a **speed** slider, and **click a vessel** for a sidebar
(tonnage · ship type · allegiance · cargo · itinerary).

## Status

**Planning / rebuild.** See [PLAN.md](PLAN.md) for the full design.

This is a ground-up rebuild. The previous project — an isochronic passage-*chart*
(a static travel-time map) — is preserved under
[`archive/isochrone-v1/`](archive/isochrone-v1/ARCHIVE-NOTE.md). The rebuild
reuses its wind/current routing engine, its 15 historical ports, and its
coastline data to power vessel movement.

## Layout (target)

```
data-src/     hand-authored historical datasets (ships, names, powers, cargo, routes, wars)
pipeline/     offline builders: bake-routes.mjs (routes) + build-data.mjs (datasets)
app/          the deployable static site (world.js · render.js · ui.js · persist.js)
archive/      the previous isochronic-chart project
```

## Build & run (target)

```
node pipeline/build-data.mjs     # data-src/ -> app/data/datasets.json
node pipeline/bake-routes.mjs    # archived router -> app/data/routes.json
# then serve app/ as static files
```
