// world.js — the headless, deterministic simulation core of Idle Sails.
//
// Given a seed and the two data bundles (datasets.json + routes.json), this
// module procedurally generates plausible age-of-sail vessels and advances them
// along the offline-baked wind/current route polylines over accelerated sim-time.
// It knows NOTHING about the DOM: render.js reads its state, tests drive it in
// Node. Determinism guarantee: same seed + same total sim-time advanced ⇒ same
// world, regardless of the dt granularity used to get there (so offline-accrual
// fast-forward matches a live run). Every stochastic event is drawn from a
// seeded stream keyed to sim-time or to a per-vessel sub-seed, and each vessel's
// entire fate is rolled deterministically at spawn.

const SEC_PER_DAY = 86400;
const DAY_OF_YEAR = 365.25;
// Flowing historical clock (PLAN-2 Phase A): the sim-clock advances continuously
// through 1550→1850, then a designed 10-year epilogue reset ramp (1850→1860) blends the 1840s
// spawn distribution back to the 1550s, and the whole 310-year cycle loops. Every
// derived quantity is a pure function of sim-time, so determinism and offline-
// accrual fast-forward are preserved (a big tick == many small ticks).
const ERA = { from: 1550, to: 1850 };
const RESET_YEARS = 10;                         // designed epilogue decade 1850→1860 (blend fallback; PLAN-6 D3)
const FLOW_SPAN = ERA.to - ERA.from;            // 300 forward years (1550→1850)
const CYCLE_YEARS = FLOW_SPAN + RESET_YEARS;    // 310-year loop period
const YEAR_SEC = SEC_PER_DAY * DAY_OF_YEAR;
const CYCLE_SEC = YEAR_SEC * CYCLE_YEARS;
// Which iteration of the 1550→1860 loop an instant falls in. The chart is
// "redrawn" at every wrap: displayed histories (statistics, counters, port
// calls, the log, wrecks, war events) are scoped to the current iteration.
// Earlier cycles' records are RETAINED in state — a display filter, never a
// sim input.
const cycleIndexOf = (simSec) => Math.floor(simSec / CYCLE_SEC);

// Tuning (spectator-scale; ~40–150 vessels for an open tab). 0.55 since S2:
// the 66-port world runs many SHORT legs (Mediterranean, Baltic, coastal), so
// at-sea population per spawn fell — this restores the approved spectator band
// while the flow weights keep the mix and drift data-driven.
const MEAN_SPAWN_INTERVAL_DAYS = 0.55;
// Spawn-rate drift is data-driven since PLAN-3 S1: see spawnActivity inside
// createWorld — the realized flow totals (per-seed reading of the evidence)
// drive the sea's thickening, clamped to spectator scale.
const PORT_DWELL_DAYS = [3, 10];
const FADE_DAYS = 2;               // how long a retired/lost vessel lingers before cull
const WRECK_LINGER_DAYS = DAY_OF_YEAR; // a lost ship marks the chart for one sim-year
const MAX_LEGS = 3;
const LOG_CAP = 200;
// Unique active names + retirement (feature pass 3.5). A spawning vessel
// redraws her name (from her own dedicated stream) while it is blocked in the
// name ledger; a name blocks until the voyage ends — or, when the pre-rolled
// fate is a loss, for a refractory period beyond the loss (a lost name rests).
// After the redraw budget she accepts the duplicate: historically defensible —
// real fleets ran several Rosários at once. Sim-layer, but fate-inert: the
// candidate draw burns the same vessel-stream words as before, and redraws
// consume only hashSeed('name', seed, id). NEVER source retirement from
// wrecks — tune.wreckLingerDays is observation tuning the sim must not read.
const NAME_REFRACTORY_YEARS = 5;
const NAME_REDRAWS = 8;
const BASE_DAILY_LOSS = 0.0009;    // ~2.5% over a 30-day leg in peacetime
const HURRICANE_UPLIFT = 2.0;      // the Caribbean/Gulf hurricane belt, jun–nov
const CAPE_UPLIFT = 1.6;           // the deep Southern Ocean easting (Roaring Forties)

// Region-aware sinking (movement-realism increment 1, ideas #24). The daily loss
// roll reads the ship's ACTUAL position each day, so wrecks cluster at the real
// graveyards of the age of sail instead of spreading evenly along a leg. Boxes in
// [lon,lat]; `mult` stacks on the base daily rate; `cause` names the graveyard in
// the wreck ledger; optional `era` gates a hazard to its years. Longitudes are
// normalized to [−180,180] before the test (leg coords may be unwrapped for the
// trans-Pacific galleon).
const HAZARD_ZONES = [
  { name: 'Cape Horn',            cause: 'wrecked rounding Cape Horn',            lon: [-70, -63], lat: [-58, -54], mult: 3.0 },
  { name: 'Cape of Good Hope',    cause: 'foundered off the Cape of Good Hope',  lon: [16, 28],   lat: [-37, -34], mult: 2.2 },
  { name: 'Sable Island',         cause: 'lost on Sable Island',                 lon: [-61, -59], lat: [43.4, 44.6], mult: 2.6 },
  { name: 'the Goodwin Sands',    cause: 'wrecked on the Goodwin Sands',         lon: [1, 2.2],   lat: [50.8, 51.6], mult: 2.2 },
  { name: 'the Scilly Isles',     cause: 'lost off the Scillies',                lon: [-7, -5.6], lat: [49.5, 50.3], mult: 2.0 },
  { name: 'the Florida Straits',  cause: 'wrecked in the Florida Straits',       lon: [-81, -74], lat: [23, 28],   mult: 2.0 },
  { name: 'the Skagerrak',        cause: 'foundered in the Skagerrak',           lon: [7, 11],    lat: [56.5, 58.5], mult: 1.8 },
  { name: 'the South China Sea reefs', cause: 'wrecked on the South China Sea reefs', lon: [110, 118], lat: [7, 17], mult: 1.8 },
  { name: 'the Mozambique Channel', cause: 'wrecked in the Mozambique Channel',  lon: [39, 44],   lat: [-23, -20], mult: 1.7 },
  { name: 'the Torres Strait',    cause: 'wrecked in the Torres Strait',         lon: [142, 148], lat: [-12, -9],  mult: 2.0, era: [1788, 1850] }
];

// ---- deterministic PRNG ---------------------------------------------------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Cheap string/number hash → 32-bit seed, for per-vessel independent streams.
function hashSeed(...parts) {
  let h = 2166136261 >>> 0;
  const s = parts.join('|');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const rint = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
const rrange = (rng, lo, hi) => lo + rng() * (hi - lo);
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
// Triangular distribution (mode-weighted): most ships are ordinary.
function triangular(rng, lo, mode, hi) {
  const u = rng(), c = (mode - lo) / (hi - lo);
  return u < c ? lo + Math.sqrt(u * (hi - lo) * (mode - lo))
              : hi - Math.sqrt((1 - u) * (hi - lo) * (hi - mode));
}
function weightedPick(rng, items, weightOf) {
  const total = items.reduce((s, it) => s + weightOf(it), 0);
  if (total <= 0) return items[0];
  let x = rng() * total;
  for (const it of items) { x -= weightOf(it); if (x <= 0) return it; }
  return items[items.length - 1];
}

// ---- geo helpers ----------------------------------------------------------
const D2R = Math.PI / 180;
function havKm(a, b) {
  const R = 6371, dLa = (b[1] - a[1]) * D2R, dLo = (b[0] - a[0]) * D2R;
  const x = Math.sin(dLa / 2) ** 2 + Math.cos(a[1] * D2R) * Math.cos(b[1] * D2R) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}
function bearing(a, b) {
  const y = Math.sin((b[0] - a[0]) * D2R) * Math.cos(b[1] * D2R);
  const x = Math.cos(a[1] * D2R) * Math.sin(b[1] * D2R) - Math.sin(a[1] * D2R) * Math.cos(b[1] * D2R) * Math.cos((b[0] - a[0]) * D2R);
  return (Math.atan2(y, x) / D2R + 360) % 360;
}

// ---- calendar (sim-seconds → flowing, looping 1550→1850→epilogue date + season) --
const SEASON_OF_MONTH = ['djf', 'djf', 'mam', 'mam', 'mam', 'jja', 'jja', 'jja', 'son', 'son', 'son', 'djf'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Returns the flowing year (integer + float), the reset-ramp progress (0 during the
// 1550→1850 forward flow; 0→1 across the 10 epilogue reset years 1850→1860), and the
// date/season within the current year.
function calendar(simSec) {
  const totalYears = simSec / (SEC_PER_DAY * DAY_OF_YEAR);
  const cyc = ((totalYears % CYCLE_YEARS) + CYCLE_YEARS) % CYCLE_YEARS;   // 0..310
  let yearFloat, reset;
  if (cyc <= FLOW_SPAN) { yearFloat = ERA.from + cyc; reset = 0; }        // 1550..1850
  else { yearFloat = ERA.to + (cyc - FLOW_SPAN); reset = (cyc - FLOW_SPAN) / RESET_YEARS; } // 1850..1860
  const doy = (cyc - Math.floor(cyc)) * DAY_OF_YEAR;    // 0..365 within the current year
  const month = Math.min(11, Math.floor(doy / 30.4));
  return { year: Math.floor(yearFloat), yearFloat, reset, month, day: 1 + Math.floor(doy % 30.4), season: SEASON_OF_MONTH[month] };
}
const fmtDate = (c) => `${c.day} ${MONTHS[c.month]} ${c.year}`;

// The port's honest display name for a given flowing year. Where a dot stands
// for different dominant ports across the era (ports[].eraNames — Louisbourg is
// St John's outside 1713–58, Kingston is Port Royal to 1692, Batavia is
// Jayakarta before the VOC…), the chart, the panels, and the log all speak the
// name of the time. Pure; falls back to the canonical name.
export function portNameAt(port, year) {
  if (port.eraNames && year != null) {
    for (const en of port.eraNames) if (year >= en.from && year <= en.to) return en.name;
  }
  return port.name;
}

// The port's ruling power for a given flowing year — the flag of the time over
// the dot (Masulipatnam under Golconda before Fort St George, Jayakarta under
// Banten before the VOC, Nagasaki always Japanese). Pure; falls back to the
// canonical power. See ports[].eraPowers (Phase-4 name/ownership sweep).
export function portPowerAt(port, year) {
  if (port.eraPowers && year != null) {
    for (const ep of port.eraPowers) if (year >= ep.from && year <= ep.to) return ep.power;
  }
  return port.power;
}

// ===========================================================================
// `restore`: a previously serialize()d state (persist.js). When given, the world
// resumes from it exactly — same vessels, clock, counters, and spawn-RNG word —
// so a save/load round-trip is indistinguishable from never having closed.
export function createWorld({ seed = 1, data, restore = null, tuning = null }) {
  const { datasets, routes } = data;

  // Observation-layer tuning (the performance settings, settings.js): these
  // knobs bound what the world RECORDS — log length, wreck linger, port-history
  // depth, tracker pins — never what it computes. Spawns, fates, and movement
  // are identical at every setting (fingerprint() is blind to all observation
  // state, and the tests hold it so). Mutable live via world.tuning;
  // deliberately OUTSIDE serialized state — a device preference, not part of
  // the world.
  const tune = Object.assign(
    { logCap: LOG_CAP, wreckLingerDays: WRECK_LINGER_DAYS, portHistoryDepth: 40, pinCap: 10 },
    tuning || {});

  // ---- flow-driven spawn weights (PLAN-3 S1) --------------------------------
  // datasets.flows.systems carries the trade systems folded onto the baked lanes
  // (build-data), each with per-decade voyage RANGES [lo,hi]. Per the R2 decision
  // this world REALIZES each range with one per-seed draw — every world is one
  // plausible reading of the evidence: two seeds may disagree about how busy a
  // trade was, and so do the historians. Same seed ⇒ same reading ⇒ same world.
  // Weights interpolate between decade midpoints (no boundary jump) and blend
  // last→first across the reset ramp, exactly as the clock does.
  const FLOWS = (datasets.flows && datasets.flows.systems) || [];
  // Decade midpoints span the whole era to ERA.to (1850, PLAN-6) — NOT 1810: the
  // late-era systems authored in Phase-1 increment 6 (Singapore, the Gulf cotton
  // trade, the treaty ports…) carry 1820–1850 byDecade ranges, and clamping the
  // decade set at 1810 froze the entire late era at 1810 weights.
  const LAST_DEC = Math.floor(ERA.to / 10) * 10;   // 1850
  const FLOW_DEC = []; for (let d = 1550; d <= LAST_DEC; d += 10) FLOW_DEC.push(d);
  const flowU = new Map(FLOWS.map(s => [s.id, mulberry32(hashSeed('flow', seed, s.id))()]));
  // per-decade realized lane weights + world totals (computed once; pure in seed)
  const laneFlowByDec = new Map(), totalByDec = new Map();
  for (const d of FLOW_DEC) {
    const m = new Map(); let tot = 0;
    for (const s of FLOWS) {
      const v = s.byDecade[d]; if (!v) continue;
      const rv = v[0] + (v[1] - v[0]) * flowU.get(s.id);   // the seed's reading
      for (const [lid, sh] of Object.entries(s.lanes)) { const w = rv * sh; m.set(lid, (m.get(lid) || 0) + w); tot += w; }
    }
    laneFlowByDec.set(d, m); totalByDec.set(d, tot);
  }
  const meanTotal = [...totalByDec.values()].reduce((a, b) => a + b, 0) / FLOW_DEC.length || 1;
  // interpolate any per-decade quantity between decade midpoints, blending across the reset
  function interpDec(get, cal) {
    if (cal.reset > 0) { const a = get(LAST_DEC), b = get(1550); return a + (b - a) * cal.reset; }
    const y = cal.yearFloat;
    if (y <= 1555) return get(1550);
    if (y >= LAST_DEC + 5) return get(LAST_DEC);
    const dLo = Math.floor((y - 5 - 1550) / 10) * 10 + 1550;
    const t = (y - (dLo + 5)) / 10;
    return get(dLo) + (get(Math.min(dLo + 10, LAST_DEC)) - get(dLo)) * t;
  }
  const laneFlowAt = (laneId, cal) => interpDec(d => laneFlowByDec.get(d).get(laneId) || 0, cal);
  const totalFlowAt = (cal) => interpDec(d => totalByDec.get(d), cal);

  // Spawn-rate drift (S1 decision: normalized, data-driven): the sim's average
  // pace keeps the spectator tuning; within-era variation follows the realized
  // world totals, clamped to [0.5, 1.6]× the era mean so the 1550s never feel
  // empty and the 1810s never swamp the renderer (a documented concession).
  const spawnActivity = (cal) => Math.max(0.5, Math.min(1.6, totalFlowAt(cal) / meanTotal));

  // Composite spawn weight per era-active lane: trade lanes carry their realized
  // flow plus a small residual floor (authored lanes never fully vanish — a
  // Phase-A proxy-coarseness concession, ~3% of the mean total spread by static
  // weight); naval lanes get a fixed ~6% pool — state voyages sit outside the
  // commercial flow matrix by design.
  const RESIDUAL_SHARE = 0.03, NAVAL_SHARE = 0.06;
  // Small-trade visibility floor (charter: no silent zeros; no forced global
  // commensuration). The sim draws a fixed ~1.8 spawns/day proportionally from a
  // world total that runs to ~16,000 ships/yr, so a genuinely tiny but real trade
  // — Hudson Bay's 1–2 ships a year, a whaling ground, Dejima — takes a share so
  // small it would surface roughly once a DECADE, reading as a false zero. These
  // basins are incommensurable with the Carrera by design, so each active trade
  // lane is floored to a minimum share of the spawn budget: enough that a
  // one-or-two-ship-a-year post shows a sail once or twice a year, negligible
  // against the giants. The floor rides eraFade with the lane so it never pops at
  // an era edge. Tuned by measurement: at 0.0015, York Factory rises from 0.06 →
  // ~1.1 ships/yr (its historical 1–2) while the busiest lane drops only ~15%
  // (326 → 278/yr) and stays overwhelmingly dominant.
  const MIN_LANE_VISIBILITY = 0.0015;
  // Lanes fade in/out over ~3 years at their era boundaries instead of popping —
  // the charter's no-sharp-changes rule applied to lane gating (a lane carrying a
  // whole folded trade would otherwise step a port's traffic in one tick). Lanes
  // touching the sim horizon (1550/1850) don't fade there; the reset blend wraps them.
  const ERA_FADE_YEARS = 3;
  function fadeAtYear(r, yF) {
    let f = 1;
    if (r.era.from > ERA.from) f = Math.min(f, (yF - r.era.from) / ERA_FADE_YEARS);
    if (r.era.to < ERA.to) f = Math.min(f, (r.era.to + 1 - yF) / ERA_FADE_YEARS);
    return Math.max(0, Math.min(1, f));
  }
  // During the reset ramp the fade blends toward each lane's 1550 state, so a
  // lane that won't exist after the wrap (the Baltic set, the sugar trades)
  // dims out across the 5 fake years instead of snapping off at the seam.
  const eraFade = (r, cal) => cal.reset > 0
    ? fadeAtYear(r, ERA.to) + (fadeAtYear(r, ERA.from) - fadeAtYear(r, ERA.to)) * cal.reset
    : fadeAtYear(r, cal.yearFloat);
  function spawnLaneWeights(cal, activeLanes) {
    const trade = activeLanes.filter(r => !r.naval), naval = activeLanes.filter(r => r.naval);
    const tradeWsum = trade.reduce((x, r) => x + (r.weight || 1), 0) || 1;
    const navalWsum = naval.reduce((x, r) => x + (r.weight || 1), 0) || 1;
    const totalNow = totalFlowAt(cal);
    const floor = MIN_LANE_VISIBILITY * totalNow;
    const w = new Map();
    for (const r of trade) w.set(r.id, eraFade(r, cal) * Math.max(laneFlowAt(r.id, cal) + RESIDUAL_SHARE * totalNow * (r.weight || 1) / tradeWsum, floor));
    for (const r of naval) w.set(r.id, eraFade(r, cal) * NAVAL_SHARE * totalNow * (r.weight || 1) / navalWsum);
    return w;
  }

  // ---- indexes over the static data ----
  const portById = new Map(datasets.ports.map(p => [p.id, p]));
  const powerById = new Map(datasets.powers.map(p => [p.id, p]));
  const shipById = new Map(datasets.shipTypes.map(s => [s.id, s]));
  const cargoById = new Map(datasets.cargo.map(c => [c.id, c]));
  const routeClassOf = new Map(datasets.shipTypes.map(s => [s.id, s.routeClass]));

  // Baked legs keyed for lookup + chaining.
  const legByKey = new Map();                 // `${lane}__${class}__${season}` → leg
  for (const leg of routes.routes) legByKey.set(leg.id, leg);

  // Precompute per-leg cumulative distances (for position interpolation) and the
  // deepest southern latitude (Cape-passage risk).
  const legGeom = new Map();
  for (const leg of routes.routes) {
    const cum = [0]; let minLat = 90, maxLat = -90;
    for (let i = 1; i < leg.coords.length; i++) cum.push(cum[i - 1] + havKm(leg.coords[i - 1], leg.coords[i]));
    for (const c of leg.coords) { minLat = Math.min(minLat, c[1]); maxLat = Math.max(maxLat, c[1]); }
    legGeom.set(leg.id, { cum, total: cum[cum.length - 1], minLat, maxLat });
  }

  const wars = datasets.wars;

  // ---- world state ----
  // Everything mutable lives in `state` as plain JSON-safe data — including the
  // spawn-RNG's internal word (spawnA) — so persist.js can serialize the world
  // and a restored session continues IDENTICALLY to one that never closed.
  const state = {
    seed,
    simClock: 0,
    vessels: [],
    wrecks: [],        // losses marking the chart; culled after WRECK_LINGER_DAYS
    portCalls: {},     // portId → latest scheduled call (sim-sec) — drives greying
    log: [],
    nextSpawnAt: 0,
    nextId: 1,
    spawnA: hashSeed('spawn', seed) | 0,
    nameLedger: {},    // name → blocked-until (sim-sec); written at spawn, pruned lazily
    counters: { spawned: 0, arrived: 0, lost: 0 },
    // ---- observation layer (feature pass 1): pure accounting on top of sim
    // events — recorded at spawn or at resolution, so a big fast-forward tick
    // records the same figures as many small ones. None of it feeds back into
    // spawns/fates/movement, and fingerprint() never reads it.
    // Statistics are bucketed per 310-year cycle, keyed by each EVENT's own
    // sim-time, so the redrawn chart shows only the current iteration's books
    // while every earlier cycle's stay in the save.
    stats: { byCycle: {} },  // cycle idx → { spawned, arrived, lost, byLane: {laneId → {spawned,arrived,lost}}, byCargo: {cargoId → spawned} }
    portHistory: {},   // portId → [{t, dir:'out'|'in', name, type}] capped at tune.portHistoryDepth
    tracked: { pins: [], archive: {} }   // pinned vessel ids + their retained records after cull
  };
  // mulberry32 stepped in place over state.spawnA (same sequence as the closure form).
  function spawnRng() {
    state.spawnA = (state.spawnA + 0x6D2B79F5) | 0;
    const a = state.spawnA;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  state.nextSpawnAt = SEC_PER_DAY * -MEAN_SPAWN_INTERVAL_DAYS * Math.log(1 - spawnRng());
  // The statistics bucket an event belongs to, keyed by the EVENT's sim-time
  // (spawn at, loss at, voyage end) — never by when the tick processed it — so
  // a big fast-forward tick fills the same buckets as many small ones, and a
  // ship sailing across the 1550 seam spawns in one iteration's books and
  // resolves in the next's.
  const statsBucketAt = (simSec) => {
    const i = cycleIndexOf(simSec);
    return state.stats.byCycle[i] ||
      (state.stats.byCycle[i] = { spawned: 0, arrived: 0, lost: 0, byLane: {}, byCargo: {} });
  };
  const laneStats = (bucket, laneId) =>
    bucket.byLane[laneId] || (bucket.byLane[laneId] = { spawned: 0, arrived: 0, lost: 0 });
  // Resume a saved session. Deep-copied so the live world never aliases the
  // caller's save object (ticking must not mutate a snapshot someone else holds).
  if (restore) {
    Object.assign(state, JSON.parse(JSON.stringify(restore)), { seed });
    // A save can predate a re-bake (persist's version gate should catch this,
    // but never brick on it): drop any restored vessel whose itinerary
    // references a leg the current bake no longer carries — positionOf would
    // otherwise crash on the missing geometry. Everyone else sails on.
    state.vessels = state.vessels.filter(v =>
      Array.isArray(v.schedule) && v.schedule.length && v.schedule.every(s => legByKey.has(s.legId)));
    // fields a pre-wrecks save won't carry
    if (!Array.isArray(state.wrecks)) state.wrecks = [];
    if (!state.portCalls || typeof state.portCalls !== 'object') state.portCalls = {};
    // fields a pre-observation-layer save won't carry — and a pre-cycle-scoped
    // save's flat { byLane, byCargo } folds into its own cycle's bucket. Its
    // lifetime counters ARE that cycle's counts: no flat-shape save can have
    // recorded a wrap.
    if (!state.stats || typeof state.stats !== 'object') state.stats = { byCycle: {} };
    else if (!state.stats.byCycle) state.stats = { byCycle: { [cycleIndexOf(state.simClock)]: {
      spawned: state.counters.spawned, arrived: state.counters.arrived, lost: state.counters.lost,
      byLane: state.stats.byLane || {}, byCargo: state.stats.byCargo || {} } } };
    if (!state.portHistory || typeof state.portHistory !== 'object') state.portHistory = {};
    if (!state.tracked || !Array.isArray(state.tracked.pins)) state.tracked = { pins: [], archive: {} };
    // archived records outlive their vessels; after a re-bake their legs may be
    // gone, and displaying them would crash positionOf — drop those, keep the rest
    for (const [id, rec] of Object.entries(state.tracked.archive)) {
      if (!Array.isArray(rec.schedule) || !rec.schedule.every(s => legByKey.has(s.legId))) {
        delete state.tracked.archive[id];
        state.tracked.pins = state.tracked.pins.filter(p => p !== +id);
      }
    }
    // a pre-captain save backfills to exactly the master she would have had —
    // the captain is a pure function of ('captain', seed, id) + her power
    for (const v of state.vessels)
      if (v.captain === undefined) v.captain = makeCaptain(v.id, powerById.get(v.powerId));
    for (const rec of Object.values(state.tracked.archive))
      if (rec.captain === undefined) rec.captain = makeCaptain(rec.id, powerById.get(rec.powerId));
    // a pre-3.5 save backfills the name ledger from its surviving records:
    // each vessel's block end is derivable from her pre-rolled fate. (Blocks
    // from already-culled lost vessels are unrecoverable — accepted: the
    // ledger converges within one refractory period.) Presence is checked on
    // the RAW save — the state literal's fresh {} would mask an absent field.
    if (!restore.nameLedger || typeof restore.nameLedger !== 'object') {
      state.nameLedger = {};
      for (const v of [...state.vessels, ...Object.values(state.tracked.archive)]) {
        const end = v.fate.lost ? v.fate.atSec + NAME_REFRACTORY_YEARS * SEC_PER_DAY * DAY_OF_YEAR : v.voyageEnd;
        state.nameLedger[v.name] = Math.max(state.nameLedger[v.name] || 0, end);
      }
    }
  }

  // JSON-safe copy of the whole mutable state (for persist.js).
  function serialize() { return JSON.parse(JSON.stringify(state)); }

  // ---- name construction ----
  // Returns the BARE stem. The naval prefix (HMS/USS) lives on the vessel as
  // v.prefix and is applied exactly once at display time — baking it into the
  // name as well is how "HMS HMS Vanguard" used to happen.
  const names = datasets.names;
  function makeName(rng, power, isNaval) {
    const nation = power.kind === 'nation' ? power : (powerById.get(power.parent) || power);
    const themes = (names.themesByPower[nation.id] || names.themesByPower.britain)[isNaval ? 'naval' : 'merchant'];
    const theme = pick(rng, themes);
    let stem;
    if (theme === 'places') stem = pick(rng, names.navalPlaces[nation.id] || names.navalPlaces.britain);
    else if (theme === 'byPower') stem = pick(rng, names.merchantByPower[nation.id] || names.merchant.abstract);
    else if (names.naval[theme]) stem = pick(rng, names.naval[theme]);
    else if (names.merchant[theme]) stem = pick(rng, names.merchant[theme]);
    else stem = pick(rng, names.merchant.abstract);
    return stem;
  }

  // Shipmaster (feature pass 3). Drawn from her OWN RNG sub-stream, keyed
  // ('captain', seed, id) — NOT from the vessel stream — so adding captains
  // changed no existing #seed= world, and a save without the field backfills
  // to exactly the captain she would have sailed with. Cultures follow the
  // vessel-name mapping (companies take their parent nation's pool); the
  // maritime title travels IN the name where that is the historical usage
  // (Nakhoda …, … Reis, Daeng …) and stays out of it for Europeans, whose
  // role the ledger already labels (Captain / Master).
  function makeCaptain(id, power) {
    const pools = datasets.names.captains;
    if (!pools || !power) return null;
    const nation = power.kind === 'nation' ? power : (powerById.get(power.parent) || power);
    const c = pools[nation.id] || pools.britain;
    if (!c) return null;
    const rng = mulberry32(hashSeed('captain', seed, id));
    let nm;
    if (c.full) nm = pick(rng, c.full);
    else {
      const g = pick(rng, c.given);
      const s = c.surname ? pick(rng, c.surname) : '';
      nm = !s ? g : c.order === 'sf' ? `${s} ${g}` : `${g} ${s}`;
    }
    if (c.prefix) nm = `${c.prefix} ${nm}`;
    if (c.suffix) nm = `${nm} ${c.suffix}`;
    return nm;
  }

  // ---- war lookup ----
  function warsActive(year) { return wars.filter(w => year >= w.from && year <= w.to); }
  // hazard:true entries (the Pirate Round) menace EVERY flag in their theatres;
  // ordinary wars menace belligerents only (companies count as their parent).
  function isBelligerent(war, powerId) {
    if (war.hazard) return true;
    const nation = powerById.get(powerId);
    const nid = nation && nation.kind === 'company' ? nation.parent : powerId;
    return war.belligerents.some(side => side.includes(nid));
  }

  // ---- convoys (movement-realism branch, PLAN-convoys.md) ------------------
  // Rules come from datasets.convoys (absent on classic main → CONVOYS null →
  // every path below no-ops, so the branch code merges harmlessly). First
  // matching rule wins; coerced-flow lanes never convoy (charter).
  const CONVOYS = datasets.convoys || null;
  function convoyRuleFor(lane, year, belligWar) {
    if (!CONVOYS || lane.middlePassage || lane.framing) return null;
    for (const rule of CONVOYS.rules) {
      if (rule.era && (year < rule.era.from || year > rule.era.to)) continue;
      if (rule.match.system !== undefined) {
        if (lane.system !== rule.match.system) continue;
        if (rule.match.flags && !rule.match.flags.includes(lane.flag)) continue;
        return rule;
      } else if (rule.match.war === true && belligWar) return rule;
    }
    return null;
  }
  const NUM_WORDS = ['', 'a lone', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const numberWord = (n) => NUM_WORDS[n] || String(n);

  // ---- itinerary construction (chain baked legs of one route class) ----
  function buildItinerary(rng, startLane, routeClass, seasonAtStart, year) {
    const legs = [];
    let laneId = startLane.id, season = seasonAtStart, guard = 0;
    let curPort = startLane.from;
    // leg 1 is the chosen start lane; subsequent legs chain from the destination.
    let laneObj = startLane;
    while (guard++ < MAX_LEGS) {
      const key = `${laneObj.id}__${routeClass}__${season}`;
      const leg = legByKey.get(key);
      if (!leg) break;
      legs.push({ laneId: laneObj.id, leg, season });
      curPort = laneObj.to;
      // find a plausible connecting lane departing curPort for this class + era.
      // Stay within the same trade system so a China Indiaman doesn't wander into
      // the Baltic — real voyages are coherent circuits (out-and-back or triangle).
      const candidates = (datasets.routes.filter(r =>
        r.from === curPort && r.system === startLane.system &&
        year >= r.era.from && year <= r.era.to &&
        r.shipTypes.some(st => routeClassOf.get(st) === routeClass)
      ));
      // a round-trip return toward the origin, preferred so ships come home
      const returnLanes = candidates.filter(r => r.to === startLane.from);
      const pool = (returnLanes.length && rng() < 0.6) ? returnLanes : candidates;
      if (!pool.length || legs.length >= MAX_LEGS) break;
      laneObj = weightedPick(rng, pool, r => r.weight || 1);
      // season advances by the time already spent; recomputed by caller during scheduling,
      // but for lane availability we keep the start season (good enough for selection).
    }
    return legs;
  }

  // ---- vessel generation (PLAN §4), fully deterministic given (id, seed) ----
  // `opts` (movement-realism) marks a CONVOY MEMBER: it copies the leader's lane
  // and shifted schedule instead of picking/routing its own, but its id, name,
  // type, tonnage, cargo, and fate still come from hashSeed('vessel', seed, id).
  // opts.escort → a naval escort (naval type, ballast). Absent ⇒ a normal spawn,
  // whose draw sequence is byte-identical to the pre-convoy code.
  function generateVessel(spawnSimClock, opts) {
    const id = state.nextId++;
    const rng = mulberry32(hashSeed('vessel', seed, id));
    const cal0 = calendar(spawnSimClock);

    // 1. historical year = the flowing clock's year at spawn (during the reset ramp
    //    it clamps to ERA.to so lanes stay active while the *weights* blend back).
    const year = cal0.reset > 0 ? ERA.to : cal0.year;
    // 2. route lane, weighted by this world's REALIZED flow (PLAN-3 S1) — or, for a
    //    convoy member, the leader's lane (copied).
    let lane;
    if (opts) lane = opts.lane;
    else {
      const activeLanes = datasets.routes.filter(r => year >= r.era.from && year <= r.era.to);
      if (!activeLanes.length) return null; // no lane active this year — caller reschedules
      const lw = spawnLaneWeights(cal0, activeLanes);
      lane = weightedPick(rng, activeLanes, r => lw.get(r.id) || 0);
    }
    // 3. flag / allegiance from the lane
    const power = powerById.get(lane.flag);
    // 4. ship-type compatible with {lane, year} — a convoy escort takes an era-valid
    //    naval type (galleon early, frigate/sloop-of-war later) from the whole roster.
    const isEscort = !!(opts && opts.escort);
    const typeCands = isEscort
      ? datasets.shipTypes.filter(s => s.roles.includes('naval') && year >= s.era.from && year <= s.era.to)
      : lane.shipTypes.map(id => shipById.get(id)).filter(s => s && year >= s.era.from && year <= s.era.to);
    if (!typeCands.length) return null; // no era-valid ship-type — reschedule
    const type = pick(rng, typeCands);
    const routeClass = type.routeClass;
    // 5. tonnage / guns / crew (mode-weighted tonnage)
    const tonnage = Math.round(triangular(rng, type.tonnage.min, type.tonnage.mode, type.tonnage.max));
    const guns = rint(rng, type.guns.min, type.guns.max);
    const crew = rint(rng, type.crew.min, type.crew.max);
    // 6. name — dual-role types (the galleon) take their character from the LANE:
    //    a Carrera galleon is a merchant (religious Iberian names), an escort on a
    //    naval lane is a warship. Pure-naval types are naval everywhere.
    const isNaval = isEscort || lane.naval === true || (type.roles.includes('naval') && !type.roles.includes('merchant'));
    // candidate #0 from the vessel stream — burning exactly the draws makeName
    // always burned here, so every later draw (cargo, itinerary, fate) is
    // untouched by pass 3.5; the uniqueness redraw happens at the end, on the
    // vessel's own dedicated name stream.
    let name = makeName(rng, power, isNaval);
    // 7. cargo (an escort sails in ballast; Middle-Passage lanes carry only enslaved-people)
    const cargoId = isEscort ? 'ballast'
      : lane.middlePassage ? 'enslaved-people'
      : weightedPick(rng, lane.cargo, c => (c === 'ballast' ? 0.6 : 1));
    const cargo = cargoById.get(cargoId);
    // 8. itinerary — a convoy MEMBER copies the leader's shifted schedule; a
    //    normal vessel builds her own from the baked legs, splitting a `via`
    //    CHAIN (Anjer → Cape Town → St Helena) into one segment per call.
    let schedule, voyageEnd;
    if (opts) { schedule = opts.schedule; voyageEnd = opts.voyageEnd; }
    else {
      const legSpecs = buildItinerary(rng, lane, routeClass, cal0.season, year);
      if (!legSpecs.length) return null; // no baked leg — skip (caller reschedules)

      // schedule legs in absolute sim-time, with port dwell between them.
      // LIA modifier (PLAN-3 S2, the bounded era-climate signal): North Atlantic
      // legs during the Maunder Minimum (1645–1715) run ~7% longer — a documented
      // storminess proxy, applied to duration rather than to wind fields (per-era
      // reanalysis does not exist; declared boundary).
      const liaFactor = (year >= 1645 && year <= 1715) ? 1.07 : 1.0;
      let t = spawnSimClock;
      schedule = [];
      for (let i = 0; i < legSpecs.length; i++) {
        const { laneId, leg } = legSpecs[i];
        const g0 = legGeom.get(leg.id);
        const northAtlantic = g0.maxLat > 40 && leg.coords[0][0] < 40;   // rough N-Atlantic/N-Sea gate
        const durSec = (leg.hours || (g0.total / 1.852 / 6)) * 3600 * (northAtlantic ? liaFactor : 1);
        // Waystops (T14): a `via` leg is split at each refreshment call, with a
        // dwell — but only at stations already founded in this year (before 1652 a
        // ship rounds the Cape without stopping; before 1659 she passes St Helena).
        // The baked polyline threads every waystop regardless; only the CALL is
        // gated, so a chain degrades hop by hop as the era rolls back. f0/f1 mark
        // each segment's stretch of the shared polyline so positionOf interpolates
        // the right stretch.
        const vias = leg.via == null ? [] : Array.isArray(leg.via) ? leg.via : [leg.via];
        const vIdx = Array.isArray(leg.viaIndex) ? leg.viaIndex : leg.viaIndex != null ? [leg.viaIndex] : [];
        const calls = [];
        for (let k = 0; k < vias.length && k < vIdx.length; k++) {
          const vp = portById.get(vias[k]);
          // no `active` window = the station stood through the whole era (Funchal,
          // Tenerife, Angra were old harbours long before 1550) — the gate is the
          // FOUNDED ones (Table Bay 1652, St Helena 1659, Umatac 1668, Anjer 1682).
          const win = vp && (vp.active || ERA);
          if (vp && year >= win.from && year <= win.to) calls.push({ id: vias[k], f: g0.cum[vIdx[k]] / g0.total });
        }
        if (calls.length) {
          let prevF = 0, prevPort = leg.from;
          for (const c of calls) {
            const arrive = t + durSec * (c.f - prevF);
            schedule.push({ laneId, legId: leg.id, from: prevPort, to: c.id, depart: t, arrive, f0: prevF, f1: c.f });
            t = arrive + rrange(rng, PORT_DWELL_DAYS[0], PORT_DWELL_DAYS[1]) * SEC_PER_DAY;
            prevF = c.f; prevPort = c.id;
          }
          const arrive = t + durSec * (1 - prevF);
          schedule.push({ laneId, legId: leg.id, from: prevPort, to: leg.to, depart: t, arrive, f0: prevF, f1: 1 });
          t = arrive;
        } else {
          const arrive = t + durSec;
          schedule.push({ laneId, legId: leg.id, from: leg.from, to: leg.to, depart: t, arrive });
          t = arrive;
        }
        if (i < legSpecs.length - 1) t += rrange(rng, PORT_DWELL_DAYS[0], PORT_DWELL_DAYS[1]) * SEC_PER_DAY;
      }
      voyageEnd = t;
    }

    // 9. fate: roll per-day loss across the whole voyage at spawn (deterministic)
    const activeWars = warsActive(year).filter(w => isBelligerent(w, lane.flag));
    let fate = { lost: false };
    outer:
    for (const seg of schedule) {
      const days = Math.max(1, Math.round((seg.arrive - seg.depart) / SEC_PER_DAY));
      const legSpan = seg.arrive - seg.depart || 1;
      const fromP = portById.get(seg.from), toP = portById.get(seg.to);
      // war/capture risk is theatre-based (belligerents, not geography)
      let warMult = 1, warRef = null;
      for (const w of activeWars) if (w.theatres.includes(fromP.region) || w.theatres.includes(toP.region)) { warRef = w; if (w.riskUplift > warMult) warMult = w.riskUplift; }
      for (let d = 0; d < days; d++) {
        const dateSec = seg.depart + d * SEC_PER_DAY;
        const cal = calendar(dateSec);
        // where the ship IS this day → the geographic hazard there. A waystop-split
        // segment covers only [f0,f1] of the shared leg polyline (the via CHAIN:
        // Anjer → Table Bay → St Helena is three segments over ONE polyline), so
        // segment progress must be mapped into that stretch exactly as positionOf
        // does — reading it as 0→1 of the whole leg puts the ship, and any wreck
        // blamed on where she was, in the wrong ocean.
        const sf0 = seg.f0 || 0, sf1 = seg.f1 != null ? seg.f1 : 1;
        const pos = legPointAt(seg.legId, sf0 + (sf1 - sf0) * ((dateSec - seg.depart) / legSpan));
        const hz = pos ? hazardAt(pos[0], pos[1], cal, year) : { mult: 1, cause: null };
        const dm = warMult * hz.mult;
        if (rng() < BASE_DAILY_LOSS * dm) {
          // capture frames the loss only when the war risk dominated the geography
          let cause, war = null;
          if (warRef && warMult >= hz.mult) { cause = 'taken as a prize'; war = warRef; }
          else cause = hz.cause || (dm > 1.5 ? 'foundered in heavy weather' : 'lost at sea');
          fate = { lost: true, atSec: dateSec, legId: seg.legId, cause, war };
          break outer;
        }
      }
    }

    // 9b. convoy decision (a leader only) + the escorted reprieve. The convoy
    //     roll is pure in the leader's id (its own sub-stream); the reprieve is
    //     pure in each member's id. Neither touches the vessel rng, so the ships
    //     themselves are unchanged — only whether more spawn alongside.
    // a mandatory-convoy trigger is a NATION-vs-nation war, not a standing hazard
    // (the Barbary corsairs, the Pirate Round): those already raise the loss roll,
    // but they don't put a Convoy Act in force.
    const realWar = activeWars.some(w => !w.hazard);
    let convoyPlan = null;
    if (!opts) {
      const rule = convoyRuleFor(lane, year, realWar);
      if (rule) {
        const crng = mulberry32(hashSeed('convoy', seed, id));
        if (crng() < rule.rate) {
          const N = rint(crng, rule.size[0], rule.size[1]);
          const escorted = rule.escort === 'always' || (rule.escort === 'war' && realWar);
          convoyPlan = { N, escorted, staggerHours: rrange(crng, 3, 10), lane, rule };
        }
      }
    }
    const escorted = opts ? opts.escorted : (convoyPlan ? convoyPlan.escorted : false);
    // an escort spares a prize-taking (weather spares no one): clear the fate
    if (escorted && CONVOYS && fate.lost && CONVOYS.reprieve.causes.includes(fate.cause)) {
      if (mulberry32(hashSeed('reprieve', seed, id))() < CONVOYS.reprieve.q) fate = { lost: false };
    }

    // 10. unique active name (pass 3.5). The ledger is written in spawn order,
    //     so a big fast-forward tick resolves names exactly as many small
    //     ticks would (granularity-independent by the portCalls argument). It
    //     is only written here — after every reschedule-return above — so a
    //     skipped spawn never pollutes it.
    if ((state.nameLedger[name] || 0) > spawnSimClock) {
      const nrng = mulberry32(hashSeed('name', seed, id));
      for (let k = 0; k < NAME_REDRAWS; k++) {
        const cand = makeName(nrng, power, isNaval);
        if (!((state.nameLedger[cand] || 0) > spawnSimClock)) { name = cand; break; }
      }
      // still blocked after the budget → she sails as a duplicate
    }
    const nameBlockEnd = fate.lost
      ? fate.atSec + NAME_REFRACTORY_YEARS * SEC_PER_DAY * DAY_OF_YEAR
      : voyageEnd;
    state.nameLedger[name] = Math.max(state.nameLedger[name] || 0, nameBlockEnd);
    // lazy prune: spawn times only move forward, so an expired block can
    // never matter again (bounded by the distinct-name vocabulary, ~1k keys)
    for (const n in state.nameLedger) if (state.nameLedger[n] <= spawnSimClock) delete state.nameLedger[n];

    return {
      id, name, prefix: isNaval && power.navalPrefix ? power.navalPrefix : null,
      captain: makeCaptain(id, power),
      typeId: type.id, typeName: type.name, rig: type.rig, routeClass,
      powerId: power.id, powerName: power.name, flagColor: power.color,
      tonnage, guns, crew, year, isNaval,
      cargoId, cargoName: cargo.name, cargoClass: cargo.class,
      middlePassage: cargoId === 'enslaved-people',
      laneFraming: lane.framing || null,   // lane-specific sober framing (Kaffa ≠ the Atlantic)
      // PLAN-3 S3: the evidence class behind this voyage's trade — counted /
      // proxied / reconstructed / asserted (from the flow fold), 'state' for
      // naval lanes, null for residual-only lanes.
      evidence: (datasets.flows && datasets.flows.laneEvidence && datasets.flows.laneEvidence[lane.id]) || (lane.naval ? 'state' : null),
      laneName: lane.name, system: lane.system,
      schedule, spawnAt: spawnSimClock, voyageEnd,
      fate,
      status: 'sailing', retiredAt: null,
      // convoy fields are sparse — a singleton carries none (saves stay lean)
      ...(opts ? { convoyId: opts.convoyId } : convoyPlan ? { convoyId: id } : {}),
      ...(isEscort ? { convoyEscort: true } : {}),
      // transient (never serialized): the spawn loop consumes + deletes it
      ...(convoyPlan ? { _convoyPlan: convoyPlan } : {})
    };
  }

  // Build a convoy around a generated leader: N−1 trade members copying her
  // shifted schedule (line-astern by the stagger), plus one naval escort when the
  // rule granted it. Members get fresh contiguous ids and their own vessel streams.
  function buildConvoy(lead, plan) {
    const group = [lead];
    const staggerSec = plan.staggerHours * 3600;
    const shift = (off) => lead.schedule.map(s => ({ ...s, depart: s.depart + off, arrive: s.arrive + off }));
    for (let i = 1; i < plan.N; i++) {
      const off = i * staggerSec;
      const m = generateVessel(lead.spawnAt + off, { convoyId: lead.id, lane: plan.lane, schedule: shift(off), voyageEnd: lead.voyageEnd + off, escorted: plan.escorted });
      if (m) group.push(m);
    }
    if (plan.escorted) {
      const esc = generateVessel(lead.spawnAt, { convoyId: lead.id, lane: plan.lane, schedule: shift(0), voyageEnd: lead.voyageEnd, escorted: true, escort: true });
      if (esc) group.push(esc);
    }
    return group;
  }

  // Interpolate a point [lon,lat] at fraction `frac` along a baked leg — used by
  // the fate roll to know where a ship is on each day of a voyage.
  function legPointAt(legId, frac) {
    const leg = legByKey.get(legId), g = legGeom.get(legId);
    if (!leg || !g) return null;
    const dist = Math.max(0, Math.min(1, frac)) * g.total;
    let i = 1; while (i < g.cum.length - 1 && g.cum[i] < dist) i++;
    const a = leg.coords[i - 1], b = leg.coords[i];
    const segLen = g.cum[i] - g.cum[i - 1] || 1;
    const t = Math.max(0, Math.min(1, (dist - g.cum[i - 1]) / segLen));
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
  // The GEOGRAPHIC risk at a point on a given day: the deep Southern Ocean, the
  // named hazard zones, and the tropical-cyclone season in the hurricane belt.
  // Returns the combined multiplier and the dominant hazard's cause. (War/capture
  // risk is separate — it keys off belligerent theatres, not geography.)
  function hazardAt(lon, lat, cal, year) {
    const L = ((lon + 180) % 360 + 360) % 360 - 180;
    let mult = 1, cause = null, best = 1;
    if (lat < -40) { mult *= CAPE_UPLIFT; if (CAPE_UPLIFT > best) { best = CAPE_UPLIFT; cause = 'foundered in the Southern Ocean'; } }
    for (const z of HAZARD_ZONES) {
      if (z.era && (year < z.era[0] || year > z.era[1])) continue;
      if (L >= z.lon[0] && L <= z.lon[1] && lat >= z.lat[0] && lat <= z.lat[1]) {
        mult *= z.mult;
        if (z.mult > best) { best = z.mult; cause = z.cause; }
      }
    }
    if ((cal.season === 'jja' || cal.season === 'son') && L >= -98 && L <= -58 && lat >= 10 && lat <= 32) {
      mult *= HURRICANE_UPLIFT; if (HURRICANE_UPLIFT > best) { best = HURRICANE_UPLIFT; cause = 'lost in a hurricane'; }
    }
    return { mult, cause };
  }

  // ---- position of a vessel at a given sim-time ----
  function positionOf(v, simClock) {
    // find the active (or most recent) leg
    let seg = v.schedule[0], legIndex = 0;
    for (let i = 0; i < v.schedule.length; i++) {
      if (simClock >= v.schedule[i].depart) { seg = v.schedule[i]; legIndex = i; }
    }
    const leg = legByKey.get(seg.legId), g = legGeom.get(seg.legId);
    let f;
    if (simClock <= seg.depart) f = 0;
    else if (simClock >= seg.arrive) f = 1;
    else f = (simClock - seg.depart) / (seg.arrive - seg.depart);
    // a waystop-split segment (Cape Town) covers only [f0,f1] of the leg polyline
    const f0 = seg.f0 || 0, f1 = seg.f1 != null ? seg.f1 : 1;
    // in a port dwell between legs → clamp at the port
    const dist = (f0 + f * (f1 - f0)) * g.total;
    let i = 1; while (i < g.cum.length - 1 && g.cum[i] < dist) i++;
    const seg0 = leg.coords[i - 1], seg1 = leg.coords[i];
    const segLen = g.cum[i] - g.cum[i - 1] || 1;
    const t = Math.max(0, Math.min(1, (dist - g.cum[i - 1]) / segLen));
    const lon = seg0[0] + (seg1[0] - seg0[0]) * t;
    const lat = seg0[1] + (seg1[1] - seg0[1]) * t;
    return { lon, lat, heading: bearing(seg0, seg1), legIndex, fraction: f, from: seg.from, to: seg.to };
  }

  // Events that resolve inside ONE tick are appended in vessel order, not in
  // time order — so a single big offline step and the same span in many small
  // steps would leave the log differently ordered, and (since it is capped)
  // even holding different entries. Insert in canonical (time desc, id) order
  // instead of unshifting, so the accrual granularity cannot show. The cap
  // then always drops the genuinely oldest entry.
  const logCmp = (a, b) => b.t - a.t ||
    (String(b.vesselId) < String(a.vesselId) ? -1 : String(b.vesselId) > String(a.vesselId) ? 1 : 0);
  function log(entry) {
    let i = 0;
    while (i < state.log.length && logCmp(state.log[i], entry) <= 0) i++;
    state.log.splice(i, 0, entry);
    if (state.log.length > tune.logCap) state.log.length = tune.logCap;
  }
  // era-honest port name for a log line (reset ramp clamps the year, as spawning does)
  const nameAt = (pid, cal) => portNameAt(portById.get(pid), cal.reset > 0 ? ERA.to : cal.year);

  // Register a spawned vessel's observation-layer record (port calls, statistics,
  // port history) — recorded at spawn from her known schedule + fate, so a big
  // fast-forward tick records the same as many small ones. Factored out so every
  // convoy member registers identically; the LOG line is emitted separately (one
  // per convoy, not one per member).
  function registerVessel(v) {
    for (const seg of v.schedule) {
      if (!v.fate.lost || v.fate.atSec >= seg.depart)
        state.portCalls[seg.from] = Math.max(state.portCalls[seg.from] || -Infinity, seg.depart);
      if (!v.fate.lost || v.fate.atSec >= seg.arrive)
        state.portCalls[seg.to] = Math.max(state.portCalls[seg.to] || -Infinity, seg.arrive);
    }
    const sb = statsBucketAt(v.spawnAt);
    sb.spawned++;
    laneStats(sb, v.schedule[0].laneId).spawned++;
    sb.byCargo[v.cargoId] = (sb.byCargo[v.cargoId] || 0) + 1;
    if (tune.portHistoryDepth > 0) {
      const nm = (v.prefix ? v.prefix + ' ' : '') + v.name;
      const call = (pid, t, dir) => {
        const h = state.portHistory[pid] || (state.portHistory[pid] = []);
        h.push({ t, dir, name: nm, type: v.typeName });
        if (h.length > tune.portHistoryDepth) h.splice(0, h.length - tune.portHistoryDepth);
      };
      for (const seg of v.schedule) {
        if (!v.fate.lost || v.fate.atSec >= seg.depart) call(seg.from, seg.depart, 'out');
        if (!v.fate.lost || v.fate.atSec >= seg.arrive) call(seg.to, seg.arrive, 'in');
      }
    }
  }

  // ---- the tick ----
  function tick(dtSimSeconds) {
    if (!(dtSimSeconds > 0)) return;
    const end = state.simClock + dtSimSeconds;

    // spawns: driven by sim-time crossings (granularity independent)
    while (state.nextSpawnAt <= end) {
      const at = Math.max(state.nextSpawnAt, state.simClock);
      const v = generateVessel(at);
      let tradeCount = 1;   // trade voyages spawned this event (drives interval scaling)
      if (v) {
        const plan = v._convoyPlan;
        if (plan) delete v._convoyPlan;   // transient — never pushed/serialized
        const c = calendar(at);
        if (plan) {
          const group = buildConvoy(v, plan);
          for (const m of group) { state.vessels.push(m); state.counters.spawned++; registerVessel(m); }
          tradeCount = group.filter(m => !m.convoyEscort).length;
          // one departure line for the whole body of sail (losses/arrivals stay per-vessel)
          const escorted = group.some(m => m.convoyEscort);
          const isFlota = /^(carrera|carreira)/.test(v.system || '');
          const head = isFlota ? `The ${v.powerName} flota — ${numberWord(tradeCount)} sail`
            : `A convoy of ${numberWord(tradeCount)} sail (${v.powerName})`;
          log({ t: at, kind: 'depart', text: `${head}${escorted ? ' under escort' : ''} cleared ${nameAt(v.schedule[0].from, c)} for ${nameAt(v.schedule[0].to, c)}`, date: fmtDate(c), vesselId: v.id, convoyId: v.id, from: v.schedule[0].from, year: v.year });
        } else {
          state.vessels.push(v); state.counters.spawned++; registerVessel(v);
          log({ t: at, kind: 'depart', text: `${v.prefix ? v.prefix + ' ' : ''}${v.name} (${v.typeName}, ${v.powerName}) cleared ${nameAt(v.schedule[0].from, c)} for ${nameAt(v.schedule[0].to, c)}`, date: fmtDate(c), vesselId: v.id, from: v.schedule[0].from, year: v.year });
        }
      }
      const u = spawnRng();
      // a convoy counts as its trade-voyage count against the flow matrix: the
      // next interval scales by N so mean voyages/yr per lane stays the matrix's.
      state.nextSpawnAt = at + tradeCount * SEC_PER_DAY * (-MEAN_SPAWN_INTERVAL_DAYS / spawnActivity(calendar(at))) * Math.log(1 - u);
    }

    // advance / resolve events for each live vessel
    for (const v of state.vessels) {
      if (v.status === 'lost' || v.status === 'arrived') continue;
      if (v.fate.lost && end >= v.fate.atSec && v.status === 'sailing') {
        v.status = 'lost'; v.retiredAt = v.fate.atSec; state.counters.lost++;
        const lb = statsBucketAt(v.fate.atSec);
        lb.lost++; laneStats(lb, v.schedule[0].laneId).lost++;
        const c = calendar(v.fate.atSec);
        const warTxt = v.fate.war ? ` (${v.fate.war.name})` : '';
        const nearPortId = v.fate.legId ? legByKey.get(v.fate.legId).to : v.schedule[0].to;
        log({ t: v.fate.atSec, kind: 'loss', text: `${v.prefix ? v.prefix + ' ' : ''}${v.name} ${v.fate.cause}${warTxt} off ${nameAt(nearPortId, c)} approaches`, date: fmtDate(c), vesselId: v.id });
        // The wreck marks the chart where she went down, for a sim-year.
        const wp = positionOf(v, v.fate.atSec);
        state.wrecks.push({
          id: v.id, name: v.name, prefix: v.prefix, captain: v.captain, isNaval: v.isNaval,
          typeName: v.typeName, powerName: v.powerName, flagColor: v.flagColor,
          tonnage: v.tonnage, crew: v.crew, cargoId: v.cargoId, cargoName: v.cargoName,
          middlePassage: v.middlePassage, laneFraming: v.laneFraming, system: v.system,
          lon: wp.lon, lat: wp.lat, at: v.fate.atSec, date: fmtDate(c),
          cause: v.fate.cause, war: v.fate.war ? v.fate.war.name : null,
          nearPortId, nearPortName: nameAt(nearPortId, c),   // named as of the loss
          ...(v.convoyId ? { convoyId: v.convoyId } : {})
        });
      } else if (!v.fate.lost && end >= v.voyageEnd && v.status === 'sailing') {
        v.status = 'arrived'; v.retiredAt = v.voyageEnd; state.counters.arrived++;
        const ab = statsBucketAt(v.voyageEnd);
        ab.arrived++; laneStats(ab, v.schedule[0].laneId).arrived++;
        const last = v.schedule[v.schedule.length - 1];
        const c = calendar(v.voyageEnd);
        log({ t: v.voyageEnd, kind: 'arrive', text: `${v.prefix ? v.prefix + ' ' : ''}${v.name} came to anchor at ${nameAt(last.to, c)}`, date: fmtDate(c), vesselId: v.id });
      }
    }

    // cull faded vessels + wrecks past their lingering year. A pinned vessel's
    // record MOVES to the tracker archive instead of vanishing — the vessels
    // array itself stays identical to an unpinned world's (fingerprint-inert),
    // only her story is kept.
    const cullBefore = end - FADE_DAYS * SEC_PER_DAY;
    state.vessels = state.vessels.filter(v => {
      if (v.status === 'sailing' || v.retiredAt > cullBefore) return true;
      if (state.tracked.pins.includes(v.id)) state.tracked.archive[v.id] = v;
      return false;
    });
    const wreckBefore = end - tune.wreckLingerDays * SEC_PER_DAY;
    if (state.wrecks.some(w => w.at <= wreckBefore))
      state.wrecks = state.wrecks.filter(w => w.at > wreckBefore);
    // …and for the same reason as the log: several losses inside one big step
    // are pushed in vessel order, so the array is canonicalised on (time, id).
    state.wrecks.sort((a, b) => a.at - b.at || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

    state.simClock = end;
  }

  // ---- public snapshot for renderers / tests ----
  // `density` (0..1, the performance settings' ship-density) thins which vessels
  // are REALIZED into the snapshot — a stable per-id hash, so the same ships
  // are always the ones shown and positionOf (the per-frame hot path) is simply
  // skipped for the rest. The sim underneath is untouched: counters, spawns,
  // fates, and port calls are those of the full world at every density.
  function activeVessels(density = 1) {
    const out = [];
    for (const v of state.vessels) {
      // thin by CONVOY, not by member, so a convoy shows or hides whole at Low
      // tier (still a stable subset; the sim underneath is identical)
      if (density < 1 && hashSeed('draw', v.convoyId ?? v.id) / 4294967296 >= density) continue;
      const pos = positionOf(v, state.simClock);
      out.push({ ...v, pos });
    }
    return out;
  }
  function snapshot({ density = 1 } = {}) {
    const cal = calendar(state.simClock);
    // Displayed histories are scoped to the current 310-year iteration: at the
    // 1550 wrap the chart is redrawn, and the counters, the log, and the wreck
    // marks read from this cycle's books only. Ships already at sea sail on
    // across the seam (their arrivals are this iteration's traffic); the full
    // records stay in state — lifetime counters, the capped log, the per-cycle
    // stats — merely out of view.
    const cycStart = cycleIndexOf(state.simClock) * CYCLE_SEC;
    const cyc = state.stats.byCycle[cycleIndexOf(state.simClock)];
    return {
      simClock: state.simClock,
      date: fmtDate(cal),
      season: cal.season,
      year: cal.year, reset: cal.reset,
      counters: { spawned: cyc ? cyc.spawned : 0, arrived: cyc ? cyc.arrived : 0, lost: cyc ? cyc.lost : 0,
        atSea: state.vessels.filter(v => v.status === 'sailing').length },
      vessels: activeVessels(density),
      wrecks: state.wrecks.filter(w => w.at >= cycStart),
      log: state.log.filter(e => e.t >= cycStart).slice(0, 40)
    };
  }
  // Compact serialization used to assert determinism in tests.
  function fingerprint() {
    return state.vessels.map(v => `${v.id}:${v.name}:${v.typeId}:${v.powerId}:${v.tonnage}:${v.cargoId}:${v.status}:${Math.round(v.voyageEnd)}:${v.fate.lost ? Math.round(v.fate.atSec) : 'ok'}`).join('\n')
      + `\n#${state.counters.spawned}/${state.counters.arrived}/${state.counters.lost}@${Math.round(state.simClock)}`;
  }

  // Flowing spawn weights, exposed for renderers (the routes overlay's rotating
  // dominance) and tests (smoothness, loop continuity, historical leaders).
  // laneWeightsAt: the composite spawn weight per era-active lane at an instant.
  // weightsAt: derived PORT prominence — half of each touching lane's weight —
  // an output of the flows, no longer a load-bearing input (PLAN-3).
  const laneWeightsAt = (simSec) => {
    const cal = calendar(simSec);
    const year = cal.reset > 0 ? ERA.to : cal.year;
    const active = datasets.routes.filter(r => year >= r.era.from && year <= r.era.to);
    return Object.fromEntries(spawnLaneWeights(cal, active));
  };
  const weightsAt = (simSec) => {
    const lw = laneWeightsAt(simSec);
    const out = Object.fromEntries(datasets.ports.map(p => [p.id, 0]));
    for (const r of datasets.routes) {
      const w = lw[r.id]; if (!w) continue;
      out[r.from] += w / 2; out[r.to] += w / 2;
    }
    return out;
  };

  // Ports that saw traffic within the past sim-year (for the renderer's greying
  // of dormant ports). Keyed on ACTUAL port calls (state.portCalls — each spawn
  // registers its schedule's departures/arrivals, truncated at the pre-rolled
  // fate), not on lane spawn *weights*: an era-active lane with a minuscule flow
  // (the 1550s slave factories — Elmina, Whydah, Luanda) has nonzero weight but
  // may go decades between actual sailings, and greying must tell that truth.
  // A future-dated call (a ship presently bound in) counts as active — she is
  // this port's live traffic. Deterministic: calls are recorded at spawn from
  // sim-time-keyed schedules, so big-tick fast-forward matches many small ticks.
  // cycleClamp: hold the window's tail at the current cycle's 1550 boundary, so
  // the chart starts each iteration FRESH — a port's traffic from before the wrap
  // no longer counts (a display choice, matching the cycle-scoped histories; a
  // ship inbound across the seam still counts, her arrival being new-cycle traffic).
  const activePortsSince = (simSec, windowSec = SEC_PER_DAY * DAY_OF_YEAR, cycleClamp = false) => {
    const active = new Set();
    let since = simSec - windowSec;
    if (cycleClamp) since = Math.max(since, cycleIndexOf(simSec) * CYCLE_SEC);
    for (const [pid, t] of Object.entries(state.portCalls)) if (t >= since) active.add(pid);
    return active;
  };

  // War events (the events log): begin/end entries for every war whose boundary
  // falls within the trailing window. Derived at DISPLAY time from the static
  // wars data + the flowing clock — a pure function of sim-time, no state, so
  // it is trivially deterministic and granularity-independent. Clamped to the
  // current iteration: the chart is redrawn at every 1550 wrap and its
  // displayed past starts there, so cycle two's opening years do not read
  // "…Wars ended" out of the previous cycle. (A war ending in 1850 "ends" at
  // the 1816 boundary, inside the reset ramp — the honest edge of the sim
  // horizon, shown until the wrap.)
  function warEventsSince(simSec, windowYears = 10) {
    const since = simSec - windowYears * YEAR_SEC;
    const cycleStart = cycleIndexOf(simSec) * CYCLE_SEC;
    const out = [];
    for (const w of wars) {
      for (const [year, kind] of [[w.from, 'war-begin'], [w.to + 1, 'war-end']]) {
        const t = cycleStart + (year - ERA.from) * YEAR_SEC;
        if (t >= cycleStart && t > since && t <= simSec)
          out.push({ t, kind, text: `${w.name} ${kind === 'war-begin' ? 'began' : 'ended'}`, date: fmtDate(calendar(t)) });
      }
    }
    out.sort((a, b) => b.t - a.t);
    return out;
  }

  // Port events (the events log's third category): foundings, abandonments, and
  // changes of allegiance (captures/cessions). Derived at DISPLAY time from the
  // static ports data (active windows + eraPowers transitions) + the flowing
  // clock — pure and cycle-clamped exactly like warEventsSince. A port present at
  // the era's start was not "founded" in-sim (skip active.from == 1550), and a
  // handover at the 1550 seam is not an event; the first eraPowers window is the
  // starting flag, so only transitions (i ≥ 1) read as a change of hands.
  function portEventsSince(simSec, windowYears = 10) {
    const since = simSec - windowYears * YEAR_SEC;
    const cycleStart = cycleIndexOf(simSec) * CYCLE_SEC;
    const powName = id => (powerById.get(id) || {}).name || id;
    const out = [];
    const push = (year, kind, text) => {
      const t = cycleStart + (year - ERA.from) * YEAR_SEC;
      if (t >= cycleStart && t > since && t <= simSec)
        out.push({ t, kind, text, date: fmtDate(calendar(t)) });
    };
    for (const p of datasets.ports) {
      if (p.active && p.active.from > ERA.from)
        push(p.active.from, 'port-founded', `${portNameAt(p, p.active.from)} founded`);
      if (p.active && p.active.to < ERA.to)
        push(p.active.to + 1, 'port-abandoned', `${portNameAt(p, p.active.to)} abandoned`);
      for (let i = 1; p.eraPowers && i < p.eraPowers.length; i++) {
        const ep = p.eraPowers[i];
        if (ep.from <= ERA.from) continue;
        push(ep.from, 'port-captured', `${portNameAt(p, ep.from)} passed to ${powName(ep.power)}`);
      }
    }
    out.sort((a, b) => b.t - a.t);
    return out;
  }

  // ---- tracker (feature pass 1): pin a vessel and keep her story ------------
  // Pins and the archive live in serialized state (they are about THIS world's
  // vessels), but none of it feeds the sim: pinning only decides whether a
  // culled vessel's record is kept. The pin cap is observation tuning.
  function isPinned(id) { return state.tracked.pins.includes(id); }
  function canPin() { return state.tracked.pins.length < tune.pinCap; }
  function pinVessel(id) {
    if (isPinned(id) || !canPin()) return false;
    if (!state.vessels.some(v => v.id === id)) return false;   // only a ship on the chart
    state.tracked.pins.push(id);
    return true;
  }
  function unpinVessel(id) {
    state.tracked.pins = state.tracked.pins.filter(p => p !== id);
    delete state.tracked.archive[id];
  }
  // The followed fleet, pin order: live vessels with their current position,
  // retired ones from the archive positioned where their voyage ended.
  function trackedVessels() {
    const out = [];
    for (const id of state.tracked.pins) {
      const live = state.vessels.find(v => v.id === id);
      const rec = live || state.tracked.archive[id];
      if (!rec) continue;   // pinned this tick, culled unpinnable — never both
      const at = rec.status === 'sailing' ? state.simClock : rec.retiredAt;
      out.push({ ...rec, pos: positionOf(rec, at), live: !!live });
    }
    return out;
  }

  // Port history for the port panel: the recorded calls, newest first, only
  // those already in the past (a future-dated arrival is the port's inbound
  // list's business, not its history's) — and only THIS iteration's. Calls
  // from before the 1550 wrap stay in state.portHistory; the redrawn chart
  // simply does not show them.
  function portHistoryOf(portId) {
    const h = state.portHistory[portId];
    if (!h) return [];
    const cycStart = cycleIndexOf(state.simClock) * CYCLE_SEC;
    return h.filter(e => e.t <= state.simClock && e.t >= cycStart).sort((a, b) => b.t - a.t);
  }

  // Port lifecycle: which ports EXIST and which lie in RUIN at an instant.
  // ports[].active {from,to} is the declared existence window (absent = all
  // era); build-data enforces every lane's era inside both endpoints' windows,
  // so this is presentation truth, not a traffic gate — the traffic is already
  // impossible. Year is clamped exactly as spawning clamps it (reset ramp →
  // 1850), so the chart doesn't flicker ports during "the chart is redrawn".
  const portLifecycleAt = (simSec) => {
    const cal = calendar(simSec);
    const year = cal.reset > 0 ? ERA.to : cal.year;
    const existing = new Set(), ruined = new Set();
    for (const p of datasets.ports) {
      if (!p.active) { existing.add(p.id); continue; }
      if (year > p.active.to) ruined.add(p.id);            // fell / abandoned
      else if (year >= p.active.from) existing.add(p.id);  // alive
      // else: not yet founded — absent from the chart entirely
    }
    return { existing, ruined };
  };

  return {
    state, tick, snapshot, activeVessels, positionOf, fingerprint, calendar,
    laneWeightsAt, weightsAt, activePortsSince, portLifecycleAt, serialize,
    warEventsSince, portEventsSince, tuning: tune,
    isPinned, canPin, pinVessel, unpinVessel, trackedVessels, portHistoryOf,
    // the CURRENT iteration's statistics — the display contract. The full
    // per-cycle record is retained in state.stats.byCycle.
    get stats() {
      return state.stats.byCycle[cycleIndexOf(state.simClock)] ||
        { spawned: 0, arrived: 0, lost: 0, byLane: {}, byCargo: {} };
    },
    portById, powerById,
    get simClock() { return state.simClock; }
  };
}

export const _internals = { calendar, mulberry32, hashSeed, triangular, havKm, portNameAt, cycleIndexOf, HAZARD_ZONES, SEC_PER_DAY, DAY_OF_YEAR, ERA, RESET_YEARS, FLOW_SPAN, CYCLE_YEARS, CYCLE_SEC };
