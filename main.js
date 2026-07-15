// main.js — bootstrap. Loads the baked data, spins up the headless world, wires
// the renderer and UI, and runs the animation loop. This is the only file that
// touches the network, the clock, and the DOM event wiring.

import { createWorld, portNameAt } from './world.js';
import { createRenderer } from './render.js';
import { createUI, buildLegend, speedFromSlider } from './ui.js';
import { loadSave, autoSave, accrualSeconds } from './persist.js';
import { loadSettings, saveSettings, perfValues, PERF_NOTES } from './settings.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function loadJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json();
}

async function boot() {
  const [datasets, routes, land] = await Promise.all([
    loadJSON('data/datasets.json'),
    loadJSON('data/routes.json'),
    loadJSON('data/land.geojson')
  ]);

  // seed: from the URL hash (#seed=…) for shareable worlds, else time-derived.
  // Debug params: #t=<sim-days> fast-forwards to a point in the flowing era;
  // #routes=1 starts with the trade-routes overlay on; #fresh=1 ignores the save.
  const hashParams = new URLSearchParams(location.hash.slice(1));
  const hashSeed = hashParams.get('seed');
  const skipDays = Math.max(0, +hashParams.get('t') || 0);
  const SEC_PER_DAY = 86400;

  // Restore the saved session — unless the URL pins a specific/fresh world.
  // The compat gate covers BOTH shipped bundles: a re-bake (routes.version)
  // changes the leg set just as surely as a dataset change, and a save whose
  // vessels reference retired legs must be discarded, not restored.
  const dataVersion = `${datasets.version}:${routes.version}`;
  const wantFresh = !!hashSeed || skipDays > 0 || hashParams.get('fresh') === '1';
  const saved = wantFresh ? null : loadSave({ datasetVersion: dataVersion });

  // device-local settings (settings.js): panel visibility + the performance
  // tier. The tier only tunes the render layer (ship density, wakes) and the
  // observation layer (log cap, wreck linger) — the sim itself is identical at
  // every setting, so it is safe to load before the world and to change live.
  const settings = loadSettings();
  let perf = perfValues(settings);

  const seed = saved ? saved.seed
    : hashSeed ? (parseInt(hashSeed, 10) >>> 0)
    : ((Date.now() ^ (Math.random() * 1e9)) >>> 0);
  const world = createWorld({
    seed, data: { datasets, routes }, restore: saved ? saved.state : null,
    tuning: { logCap: perf.logCap, wreckLingerDays: perf.wreckLingerDays }
  });

  if (saved) {
    // offline accrual: real time away × last speed, capped — in a few big ticks
    // (granularity-independent, so this matches having stayed open).
    let acc = accrualSeconds((Date.now() - saved.savedAt) / 1000, saved.speed);
    while (acc > 0) { const step = Math.min(acc, 30 * SEC_PER_DAY); world.tick(step); acc -= step; }
  } else {
    // fresh world: optional debug fast-forward, then pre-warm so the sea is busy
    if (skipDays) for (let d = 0; d < skipDays; d += 200) world.tick(Math.min(200, skipDays - d) * SEC_PER_DAY);
    for (let i = 0; i < 40; i++) world.tick(2.5 * SEC_PER_DAY);
  }

  const legById = new Map(routes.routes.map(r => [r.id, r]));
  const portById = new Map(datasets.ports.map(p => [p.id, p]));
  const cargoById = new Map(datasets.cargo.map(c => [c.id, c]));
  const powerById = new Map(datasets.powers.map(p => [p.id, p]));
  const routeClassOf = new Map(datasets.shipTypes.map(s => [s.id, s.routeClass]));

  // Popular-routes overlay data: one representative polyline per lane, per season,
  // tagged with the lane's traffic weight (popularity), flag colour (nation), and
  // origin/era so the overlay can flow with the historical clock — lanes brighten
  // and fade as their origin port's prominence shifts across the decades.
  const SEASONS = ['djf', 'mam', 'jja', 'son'];
  const routeLines = datasets.routes.map(lane => {
    const rc = routeClassOf.get(lane.shipTypes[0]);
    const coordsBySeason = {};
    for (const s of SEASONS) { const leg = legById.get(`${lane.id}__${rc}__${s}`); if (leg) coordsBySeason[s] = leg.coords; }
    const power = powerById.get(lane.flag);
    return { id: lane.id, era: lane.era, color: (power && power.color) || '#3a2c1c', coordsBySeason };
  });

  const canvas = document.getElementById('chart');
  const renderer = createRenderer(canvas, { land, ports: datasets.ports, legById, reducedMotion, routeLines, portNameAt });
  renderer.setPerf({ wakeLength: perf.wakeLength });
  renderer.resize();
  addEventListener('resize', renderer.resize);

  // restore the helm to its saved position (before the UI reads it)
  if (saved && saved.slider != null) document.getElementById('speed').value = saved.slider;
  let speed = speedFromSlider(+document.getElementById('speed').value);
  let selectedVesselId = null, selectedPortId = null, selectedWreckId = null, lastPanelSig = '';
  let showRoutes = hashParams.get('routes') === '1';
  if (showRoutes) document.getElementById('ov-routes').checked = true;
  let latestSnap = world.snapshot({ density: perf.shipDensity });
  // overlay lane weights drift era-slow, so they're recomputed on the ~5 Hz HUD
  // throttle (and at toggle time), not per frame — 261 lanes need no rAF math.
  let laneWeightsCache = showRoutes ? world.laneWeightsAt(latestSnap.simClock) : null;
  // ports greyed unless they saw traffic in the past sim-year; lifecycle
  // (existing/ruined per the flowing year) gates chart presence. Both recomputed
  // on the HUD throttle (era-slow) and passed to every draw()/pickAt().
  let activePorts = world.activePortsSince(latestSnap.simClock);
  let portLife = world.portLifecycleAt(latestSnap.simClock);

  const ledgerCtx = () => ({
    portById, cargoById, powerById, portNameAt, simClock: latestSnap.simClock,
    // the flowing year, clamped through the reset ramp exactly as spawning is
    year: latestSnap.reset > 0 ? 1815 : latestSnap.year
  });

  // ships whose CURRENT leg leaves this port (outbound) or is bound for it
  // (inbound). Current leg only — ships that called here on an earlier leg and
  // have since moved on are not counted.
  function portTraffic(portId) {
    const outbound = [], inbound = [];
    for (const v of latestSnap.vessels) {
      if (v.status !== 'sailing' || v.pos.fraction >= 1) continue;
      if (v.pos.from === portId) outbound.push(v);
      else if (v.pos.to === portId) inbound.push(v);
    }
    outbound.sort((a, b) => a.pos.fraction - b.pos.fraction);   // freshest departures first
    inbound.sort((a, b) => b.pos.fraction - a.pos.fraction);    // soonest arrivals first
    return { outbound, inbound };
  }

  function renderPanel() {
    if (selectedVesselId != null) {
      const v = latestSnap.vessels.find(x => x.id === selectedVesselId);
      if (v) ui.showLedger(v, ledgerCtx()); else clearSelection();
    } else if (selectedWreckId != null) {
      const w = latestSnap.wrecks.find(x => x.id === selectedWreckId);
      if (!w) { clearSelection(); return; }          // her year has passed
      // static content — render once per selection (sig = the wreck id)
      const sig = 'wreck:' + w.id;
      if (sig !== lastPanelSig) { lastPanelSig = sig; ui.showWreck(w, ledgerCtx()); }
    } else if (selectedPortId != null) {
      const traffic = portTraffic(selectedPortId);
      // re-render only when membership or the sim-day changes (keeps scroll steady)
      const sig = traffic.outbound.map(v => v.id).join(',') + '|' + traffic.inbound.map(v => v.id).join(',')
        + '|' + Math.floor(latestSnap.simClock / 86400);
      if (sig !== lastPanelSig) { lastPanelSig = sig; ui.showPort(portById.get(selectedPortId), traffic, ledgerCtx()); }
    }
  }
  function selectVessel(id) { selectedVesselId = id; selectedPortId = null; selectedWreckId = null; lastPanelSig = ''; renderPanel(); }
  function selectPort(id) { selectedPortId = id; selectedVesselId = null; selectedWreckId = null; lastPanelSig = ''; renderPanel(); }
  function selectWreck(id) { selectedWreckId = id; selectedVesselId = null; selectedPortId = null; lastPanelSig = ''; renderPanel(); }
  function clearSelection() { selectedVesselId = null; selectedPortId = null; selectedWreckId = null; lastPanelSig = ''; ui.hideLedger(); }

  const ui = createUI({
    onSpeed: (m) => { speed = m; },
    onClose: clearSelection,
    onSelectVessel: selectVessel
  });

  // click a vessel → her ledger; click a port → its inbound/outbound traffic;
  // click empty sea → dismiss.
  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    const hit = renderer.pickAt(e.clientX - r.left, e.clientY - r.top, latestSnap, portLife);
    if (!hit) clearSelection();
    else if (hit.type === 'vessel') selectVessel(hit.id);
    else if (hit.type === 'wreck') selectWreck(hit.id);
    else selectPort(hit.id);
  });
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    canvas.style.cursor = renderer.pickAt(e.clientX - r.left, e.clientY - r.top, latestSnap, portLife) ? 'pointer' : 'crosshair';
  });

  // hamburger menu + overlays
  const menuToggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');
  menuToggle.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  document.getElementById('ov-routes').addEventListener('change', (e) => {
    showRoutes = e.target.checked;
    laneWeightsCache = showRoutes ? world.laneWeightsAt(latestSnap.simClock) : null;
  });

  // events log signature — declared before the panel wiring below, which can
  // call renderEventsPanel() during boot when the panel was left switched on
  let lastEventsSig = '';

  // panels (settings.panels): the menu shows/hides each on-display card
  buildLegend({ powers: datasets.powers });
  const PANEL_EL = { legend: 'legend', events: 'events', counters: 'counters', helm: 'helm' };
  function applyPanels() {
    for (const [key, id] of Object.entries(PANEL_EL))
      document.getElementById(id).hidden = !settings.panels[key];
  }
  for (const key of Object.keys(PANEL_EL)) {
    const box = document.getElementById('pn-' + key);
    box.checked = settings.panels[key];
    box.addEventListener('change', () => {
      settings.panels[key] = box.checked;
      applyPanels(); saveSettings(settings);
      if (key === 'events' && box.checked) renderEventsPanel(true);
    });
  }
  applyPanels();
  if (settings.panels.events) renderEventsPanel(true);

  // performance tier: render + observation knobs only — the world's spawns and
  // fates never change, so switching live is safe (and instant).
  const perfNote = document.getElementById('perf-note');
  perfNote.textContent = PERF_NOTES[settings.perfTier];
  for (const radio of document.querySelectorAll('input[name="perf"]')) {
    radio.checked = radio.value === settings.perfTier;
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      settings.perfTier = radio.value;
      perf = perfValues(settings);
      Object.assign(world.tuning, { logCap: perf.logCap, wreckLingerDays: perf.wreckLingerDays });
      renderer.setPerf({ wakeLength: perf.wakeLength });
      perfNote.textContent = PERF_NOTES[settings.perfTier];
      saveSettings(settings);
    });
  }

  // events log: losses from the world's log + war begin/end entries derived
  // from the flowing clock, merged newest-first. Re-rendered on the HUD
  // throttle, gated by a cheap signature so a quiet sea costs no DOM work.
  function renderEventsPanel(force = false) {
    const losses = latestSnap.log.filter(e => e.kind === 'loss');
    const wars = world.warEventsSince(latestSnap.simClock);
    const entries = losses.concat(wars).sort((a, b) => b.t - a.t).slice(0, 40);
    const sig = entries.length + ':' + (entries.length ? entries[0].t : 0);
    if (!force && sig === lastEventsSig) return;
    lastEventsSig = sig;
    ui.renderEvents(entries);
  }

  // debug export: the full serialized run — state (vessels, wrecks, log, port
  // calls, counters, the spawn-RNG word), seed, versions — as a JSON download
  // for offline analysis. Costs nothing until clicked.
  document.getElementById('dbg-export').addEventListener('click', () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      datasetVersion: dataVersion,
      seed, settings,
      simDays: Math.round(world.simClock / SEC_PER_DAY),
      date: latestSnap.date, year: latestSnap.year,
      state: world.serialize()
    };
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `idle-sails-run-${seed}-day${payload.simDays}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
  });

  // persist: every 10 s + when the tab hides/closes (skip for pinned debug worlds,
  // so a shared #seed/#t link never clobbers the player's own voyage).
  if (!wantFresh) autoSave(world, () => ({
    speed, slider: +document.getElementById('speed').value, datasetVersion: dataVersion
  }));

  // animation loop
  let last = performance.now();
  let hudAccum = 0;
  function frame(now) {
    let dtReal = (now - last) / 1000; last = now;
    dtReal = Math.min(dtReal, 0.25);                 // cap catch-up per frame
    if (speed > 0) world.tick(dtReal * speed);

    latestSnap = world.snapshot({ density: perf.shipDensity });
    // overlay context: this world's realized per-lane flow weights — route
    // brightness IS the traffic the sim is actually sampling. Weights drift
    // era-slow, so the cache refreshed on the HUD throttle is visually exact.
    const routesCtx = showRoutes && laneWeightsCache ? { laneWeights: laneWeightsCache } : null;
    renderer.draw(latestSnap, selectedVesselId, selectedPortId, now, routesCtx, activePorts, selectedWreckId, portLife);

    hudAccum += dtReal;
    if (hudAccum > 0.2) {
      hudAccum = 0;
      activePorts = world.activePortsSince(latestSnap.simClock);
      portLife = world.portLifecycleAt(latestSnap.simClock);
      if (showRoutes) laneWeightsCache = world.laneWeightsAt(latestSnap.simClock);
      if (settings.panels.events) renderEventsPanel();
      ui.updateHUD(latestSnap); renderPanel();
    }
    requestAnimationFrame(frame);
  }
  ui.updateHUD(latestSnap);
  requestAnimationFrame(frame);
}

boot().catch(err => {
  document.body.insertAdjacentHTML('beforeend',
    `<p style="position:fixed;inset:0;display:grid;place-content:center;font-family:Georgia,serif;color:#3a2c1c;padding:2rem;text-align:center">
       Could not weigh anchor.<br><small>${err.message}</small><br>
       <small>Serve this folder over HTTP (see README) — the browser blocks module &amp; data loads from <code>file://</code>.</small></p>`);
  console.error(err);
});
