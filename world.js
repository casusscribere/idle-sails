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
// through 1550→1815, then a 5-year "fake" reset ramp (1815→1820) blends the 1810s
// spawn distribution back to the 1550s, and the whole 270-year cycle loops. Every
// derived quantity is a pure function of sim-time, so determinism and offline-
// accrual fast-forward are preserved (a big tick == many small ticks).
const ERA = { from: 1550, to: 1815 };
const RESET_YEARS = 5;                          // fake reset ramp 1815→1820
const FLOW_SPAN = ERA.to - ERA.from;            // 265 forward years (1550→1815)
const CYCLE_YEARS = FLOW_SPAN + RESET_YEARS;    // 270-year loop period

// Tuning (spectator-scale; ~40–120 vessels for an open tab).
const MEAN_SPAWN_INTERVAL_DAYS = 1.0;
// Spawn-rate drift is data-driven since PLAN-3 S1: see spawnActivity inside
// createWorld — the realized flow totals (per-seed reading of the evidence)
// drive the sea's thickening, clamped to spectator scale.
const PORT_DWELL_DAYS = [3, 10];
const FADE_DAYS = 2;               // how long a retired/lost vessel lingers before cull
const MAX_LEGS = 3;
const LOG_CAP = 200;
const BASE_DAILY_LOSS = 0.0009;    // ~2.5% over a 30-day leg in peacetime
const HURRICANE_UPLIFT = 2.0;      // Caribbean, jun–nov
const CAPE_UPLIFT = 1.6;           // leg passing south of 30°S (Cape of Good Hope)

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

// ---- calendar (sim-seconds → flowing, looping 1550→1815→reset date + season) --
const SEASON_OF_MONTH = ['djf', 'djf', 'mam', 'mam', 'mam', 'jja', 'jja', 'jja', 'son', 'son', 'son', 'djf'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Returns the flowing year (integer + float), the reset-ramp progress (0 during the
// 1550→1815 forward flow; 0→1 across the 5 fake reset years 1815→1820), and the
// date/season within the current year.
function calendar(simSec) {
  const totalYears = simSec / (SEC_PER_DAY * DAY_OF_YEAR);
  const cyc = ((totalYears % CYCLE_YEARS) + CYCLE_YEARS) % CYCLE_YEARS;   // 0..270
  let yearFloat, reset;
  if (cyc <= FLOW_SPAN) { yearFloat = ERA.from + cyc; reset = 0; }        // 1550..1815
  else { yearFloat = ERA.to + (cyc - FLOW_SPAN); reset = (cyc - FLOW_SPAN) / RESET_YEARS; } // 1815..1820
  const doy = (cyc - Math.floor(cyc)) * DAY_OF_YEAR;    // 0..365 within the current year
  const month = Math.min(11, Math.floor(doy / 30.4));
  return { year: Math.floor(yearFloat), yearFloat, reset, month, day: 1 + Math.floor(doy % 30.4), season: SEASON_OF_MONTH[month] };
}
const fmtDate = (c) => `${c.day} ${MONTHS[c.month]} ${c.year}`;

// ===========================================================================
// `restore`: a previously serialize()d state (persist.js). When given, the world
// resumes from it exactly — same vessels, clock, counters, and spawn-RNG word —
// so a save/load round-trip is indistinguishable from never having closed.
export function createWorld({ seed = 1, data, restore = null }) {
  const { datasets, routes } = data;

  // ---- flow-driven spawn weights (PLAN-3 S1) --------------------------------
  // datasets.flows.systems carries the trade systems folded onto the baked lanes
  // (build-data), each with per-decade voyage RANGES [lo,hi]. Per the R2 decision
  // this world REALIZES each range with one per-seed draw — every world is one
  // plausible reading of the evidence: two seeds may disagree about how busy a
  // trade was, and so do the historians. Same seed ⇒ same reading ⇒ same world.
  // Weights interpolate between decade midpoints (no boundary jump) and blend
  // last→first across the reset ramp, exactly as the clock does.
  const FLOWS = (datasets.flows && datasets.flows.systems) || [];
  const FLOW_DEC = []; for (let d = 1550; d <= 1810; d += 10) FLOW_DEC.push(d);
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
    if (cal.reset > 0) { const a = get(1810), b = get(1550); return a + (b - a) * cal.reset; }
    const y = cal.yearFloat;
    if (y <= 1555) return get(1550);
    if (y >= 1815) return get(1810);
    const dLo = Math.floor((y - 5 - 1550) / 10) * 10 + 1550;
    const t = (y - (dLo + 5)) / 10;
    return get(dLo) + (get(Math.min(dLo + 10, 1810)) - get(dLo)) * t;
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
  // Lanes fade in/out over ~3 years at their era boundaries instead of popping —
  // the charter's no-sharp-changes rule applied to lane gating (a lane carrying a
  // whole folded trade would otherwise step a port's traffic in one tick). Lanes
  // touching the sim horizon (1550/1815) don't fade there; the reset blend wraps them.
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
    const w = new Map();
    for (const r of trade) w.set(r.id, eraFade(r, cal) * (laneFlowAt(r.id, cal) + RESIDUAL_SHARE * totalNow * (r.weight || 1) / tradeWsum));
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
    const cum = [0]; let minLat = 90;
    for (let i = 1; i < leg.coords.length; i++) cum.push(cum[i - 1] + havKm(leg.coords[i - 1], leg.coords[i]));
    for (const c of leg.coords) minLat = Math.min(minLat, c[1]);
    legGeom.set(leg.id, { cum, total: cum[cum.length - 1], minLat });
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
    log: [],
    nextSpawnAt: 0,
    nextId: 1,
    spawnA: hashSeed('spawn', seed) | 0,
    counters: { spawned: 0, arrived: 0, lost: 0 }
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
  // Resume a saved session. Deep-copied so the live world never aliases the
  // caller's save object (ticking must not mutate a snapshot someone else holds).
  if (restore) Object.assign(state, JSON.parse(JSON.stringify(restore)), { seed });

  // JSON-safe copy of the whole mutable state (for persist.js).
  function serialize() { return JSON.parse(JSON.stringify(state)); }

  // ---- name construction ----
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
    const prefix = isNaval && nation.navalPrefix ? nation.navalPrefix + ' ' : '';
    return prefix + stem;
  }

  // ---- war lookup ----
  function warsActive(year) { return wars.filter(w => year >= w.from && year <= w.to); }
  function isBelligerent(war, powerId) {
    const nation = powerById.get(powerId);
    const nid = nation && nation.kind === 'company' ? nation.parent : powerId;
    return war.belligerents.some(side => side.includes(nid));
  }

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
  function generateVessel(spawnSimClock) {
    const id = state.nextId++;
    const rng = mulberry32(hashSeed('vessel', seed, id));
    const cal0 = calendar(spawnSimClock);

    // 1. historical year = the flowing clock's year at spawn (during the reset ramp
    //    it clamps to ERA.to so lanes stay active while the *weights* blend back).
    const year = cal0.reset > 0 ? ERA.to : cal0.year;
    // 2. route lane, weighted by this world's REALIZED flow (PLAN-3 S1): the trade
    //    systems' per-decade voyage ranges, drawn once per seed, folded onto the
    //    baked lanes — plus the residual floor and the naval pool.
    const activeLanes = datasets.routes.filter(r => year >= r.era.from && year <= r.era.to);
    if (!activeLanes.length) return null; // no lane active this year — caller reschedules
    const lw = spawnLaneWeights(cal0, activeLanes);
    const lane = weightedPick(rng, activeLanes, r => lw.get(r.id) || 0);
    // 3. flag / allegiance from the lane
    const power = powerById.get(lane.flag);
    // 4. ship-type compatible with {lane, year}
    const typeCands = lane.shipTypes.map(id => shipById.get(id)).filter(s => s && year >= s.era.from && year <= s.era.to);
    if (!typeCands.length) return null; // no era-valid ship-type for this lane/year — reschedule
    const type = pick(rng, typeCands);
    const routeClass = type.routeClass;
    // 5. tonnage / guns / crew (mode-weighted tonnage)
    const tonnage = Math.round(triangular(rng, type.tonnage.min, type.tonnage.mode, type.tonnage.max));
    const guns = rint(rng, type.guns.min, type.guns.max);
    const crew = rint(rng, type.crew.min, type.crew.max);
    // 6. name — dual-role types (the galleon) take their character from the LANE:
    //    a Carrera galleon is a merchant (religious Iberian names), an escort on a
    //    naval lane is a warship. Pure-naval types are naval everywhere.
    const isNaval = lane.naval === true || (type.roles.includes('naval') && !type.roles.includes('merchant'));
    const name = makeName(rng, power, isNaval);
    // 7. cargo (Middle-Passage lanes carry only enslaved-people)
    const cargoId = lane.middlePassage ? 'enslaved-people'
      : weightedPick(rng, lane.cargo, c => (c === 'ballast' ? 0.6 : 1));
    const cargo = cargoById.get(cargoId);
    // 8. itinerary from baked legs
    const legSpecs = buildItinerary(rng, lane, routeClass, cal0.season, year);
    if (!legSpecs.length) return null; // no baked leg — skip (caller reschedules)

    // schedule legs in absolute sim-time, with port dwell between them
    let t = spawnSimClock;
    const schedule = [];
    for (let i = 0; i < legSpecs.length; i++) {
      const { laneId, leg } = legSpecs[i];
      const depart = t;
      const durSec = (leg.hours || (legGeom.get(leg.id).total / 1.852 / 6)) * 3600; // fallback ~6kn
      const arrive = depart + durSec;
      schedule.push({ laneId, legId: leg.id, from: leg.from, to: leg.to, depart, arrive });
      t = arrive;
      if (i < legSpecs.length - 1) t += rrange(rng, PORT_DWELL_DAYS[0], PORT_DWELL_DAYS[1]) * SEC_PER_DAY;
    }
    const voyageEnd = t;

    // 9. fate: roll per-day loss across the whole voyage at spawn (deterministic)
    const activeWars = warsActive(year).filter(w => isBelligerent(w, lane.flag));
    let fate = { lost: false };
    outer:
    for (const seg of schedule) {
      const g = legGeom.get(seg.legId);
      const days = Math.max(1, Math.round((seg.arrive - seg.depart) / SEC_PER_DAY));
      const fromP = portById.get(seg.from), toP = portById.get(seg.to);
      // per-leg risk multiplier
      let mult = 1;
      for (const w of activeWars) if (w.theatres.includes(fromP.region) || w.theatres.includes(toP.region)) mult = Math.max(mult, w.riskUplift);
      if (g.minLat < -30) mult *= CAPE_UPLIFT;
      for (let d = 0; d < days; d++) {
        const dateSec = seg.depart + d * SEC_PER_DAY;
        const cal = calendar(dateSec);
        let dm = mult;
        if ((toP.region === 'caribbean' || fromP.region === 'caribbean') && (cal.season === 'jja' || cal.season === 'son')) dm *= HURRICANE_UPLIFT;
        if (rng() < BASE_DAILY_LOSS * dm) {
          const war = activeWars.find(w => w.theatres.includes(fromP.region) || w.theatres.includes(toP.region)) || null;
          const cause = war ? 'taken as a prize' : (dm > 1.5 ? 'foundered in heavy weather' : 'lost at sea');
          fate = { lost: true, atSec: dateSec, legId: seg.legId, cause, war };
          break outer;
        }
      }
    }

    return {
      id, name, prefix: isNaval && power.navalPrefix ? power.navalPrefix : null,
      typeId: type.id, typeName: type.name, rig: type.rig, routeClass,
      powerId: power.id, powerName: power.name, flagColor: power.color,
      tonnage, guns, crew, year, isNaval,
      cargoId, cargoName: cargo.name, cargoClass: cargo.class,
      middlePassage: cargoId === 'enslaved-people',
      laneName: lane.name, system: lane.system,
      schedule, spawnAt: spawnSimClock, voyageEnd,
      fate,
      status: 'sailing', retiredAt: null
    };
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
    // in a port dwell between legs → clamp at the port
    const dist = f * g.total;
    let i = 1; while (i < g.cum.length - 1 && g.cum[i] < dist) i++;
    const seg0 = leg.coords[i - 1], seg1 = leg.coords[i];
    const segLen = g.cum[i] - g.cum[i - 1] || 1;
    const t = Math.max(0, Math.min(1, (dist - g.cum[i - 1]) / segLen));
    const lon = seg0[0] + (seg1[0] - seg0[0]) * t;
    const lat = seg0[1] + (seg1[1] - seg0[1]) * t;
    return { lon, lat, heading: bearing(seg0, seg1), legIndex, fraction: f, from: seg.from, to: seg.to };
  }

  function log(entry) { state.log.unshift(entry); if (state.log.length > LOG_CAP) state.log.length = LOG_CAP; }

  // ---- the tick ----
  function tick(dtSimSeconds) {
    if (!(dtSimSeconds > 0)) return;
    const end = state.simClock + dtSimSeconds;

    // spawns: driven by sim-time crossings (granularity independent)
    while (state.nextSpawnAt <= end) {
      const at = Math.max(state.nextSpawnAt, state.simClock);
      const v = generateVessel(at);
      if (v) {
        state.vessels.push(v);
        state.counters.spawned++;
        const c = calendar(at);
        log({ t: at, kind: 'depart', text: `${v.prefix ? v.prefix + ' ' : ''}${v.name} (${v.typeName}, ${v.powerName}) cleared ${portById.get(v.schedule[0].from).name} for ${portById.get(v.schedule[0].to).name}`, date: fmtDate(c), vesselId: v.id, from: v.schedule[0].from, year: v.year });
      }
      const u = spawnRng();
      state.nextSpawnAt = at + SEC_PER_DAY * (-MEAN_SPAWN_INTERVAL_DAYS / spawnActivity(calendar(at))) * Math.log(1 - u);
    }

    // advance / resolve events for each live vessel
    for (const v of state.vessels) {
      if (v.status === 'lost' || v.status === 'arrived') continue;
      if (v.fate.lost && end >= v.fate.atSec && v.status === 'sailing') {
        v.status = 'lost'; v.retiredAt = v.fate.atSec; state.counters.lost++;
        const c = calendar(v.fate.atSec);
        const warTxt = v.fate.war ? ` (${v.fate.war.name})` : '';
        log({ t: v.fate.atSec, kind: 'loss', text: `${v.prefix ? v.prefix + ' ' : ''}${v.name} ${v.fate.cause}${warTxt} off ${portById.get(v.fate.legId ? legByKey.get(v.fate.legId).to : v.schedule[0].to).name} approaches`, date: fmtDate(c), vesselId: v.id });
      } else if (!v.fate.lost && end >= v.voyageEnd && v.status === 'sailing') {
        v.status = 'arrived'; v.retiredAt = v.voyageEnd; state.counters.arrived++;
        const last = v.schedule[v.schedule.length - 1];
        const c = calendar(v.voyageEnd);
        log({ t: v.voyageEnd, kind: 'arrive', text: `${v.prefix ? v.prefix + ' ' : ''}${v.name} came to anchor at ${portById.get(last.to).name}`, date: fmtDate(c), vesselId: v.id });
      }
    }

    // cull faded vessels
    const cullBefore = end - FADE_DAYS * SEC_PER_DAY;
    state.vessels = state.vessels.filter(v => v.status === 'sailing' || v.retiredAt > cullBefore);

    state.simClock = end;
  }

  // ---- public snapshot for renderers / tests ----
  function activeVessels() {
    const out = [];
    for (const v of state.vessels) {
      const pos = positionOf(v, state.simClock);
      out.push({ ...v, pos });
    }
    return out;
  }
  function snapshot() {
    const cal = calendar(state.simClock);
    return {
      simClock: state.simClock,
      date: fmtDate(cal),
      season: cal.season,
      year: cal.year, reset: cal.reset,
      counters: { ...state.counters, atSea: state.vessels.filter(v => v.status === 'sailing').length },
      vessels: activeVessels(),
      log: state.log.slice(0, 40)
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

  return {
    state, tick, snapshot, activeVessels, positionOf, fingerprint, calendar,
    laneWeightsAt, weightsAt, serialize,
    portById, powerById,
    get simClock() { return state.simClock; }
  };
}

export const _internals = { calendar, mulberry32, hashSeed, triangular, havKm, SEC_PER_DAY, DAY_OF_YEAR, ERA, RESET_YEARS, FLOW_SPAN, CYCLE_YEARS };
