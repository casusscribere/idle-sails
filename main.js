// main.js — bootstrap. Loads the baked data, spins up the headless world, wires
// the renderer and UI, and runs the animation loop. This is the only file that
// touches the network, the clock, and the DOM event wiring.

import { createWorld, portNameAt, portPowerAt } from './world.js';
import { createRenderer, REGIONS } from './render.js';
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
  // The tracker is DISABLED until vessel persistence (feature pass 5): a
  // one-voyage vessel makes a poor thing to follow. The world-side pin API
  // and its tests stay; the menu row is disabled and the panel forced off.
  settings.panels.tracker = false;
  let perf = perfValues(settings);

  const seed = saved ? saved.seed
    : hashSeed ? (parseInt(hashSeed, 10) >>> 0)
    : ((Date.now() ^ (Math.random() * 1e9)) >>> 0);
  const world = createWorld({
    seed, data: { datasets, routes }, restore: saved ? saved.state : null,
    tuning: {
      logCap: perf.logCap, wreckLingerDays: perf.wreckLingerDays,
      portHistoryDepth: perf.portHistoryDepth, pinCap: perf.pinCap
    }
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

  // Each lane's basin, for the overlay's layer toggles: a lane folded from
  // several flow systems takes the basin that contributes the most share;
  // lanes outside the flow matrix (naval stations, residual-only trades)
  // gather under 'other'.
  const laneBasin = new Map();
  {
    const votes = new Map();   // laneId → { basin: share }
    for (const s of (datasets.flows && datasets.flows.systems) || []) {
      if (!s.basin) continue;
      for (const [lid, sh] of Object.entries(s.lanes)) {
        if (!votes.has(lid)) votes.set(lid, {});
        votes.get(lid)[s.basin] = (votes.get(lid)[s.basin] || 0) + sh;
      }
    }
    for (const [lid, v] of votes)
      laneBasin.set(lid, Object.entries(v).sort((a, b) => b[1] - a[1])[0][0]);
  }

  const canvas = document.getElementById('chart');
  const renderer = createRenderer(canvas, { land, ports: datasets.ports, legById, reducedMotion, routeLines, portNameAt });
  renderer.setPerf({ wakeLength: perf.wakeLength });
  // the saved chart view, validated against the presets (a stale id → world)
  if (!REGIONS.some(r => r.id === settings.region && !r.hidden)) settings.region = 'world';
  renderer.setRegion(settings.region);      // sizes the canvas (includes resize)
  addEventListener('resize', renderer.resize);

  // restore the helm to its saved position (before the UI reads it)
  if (saved && saved.slider != null) document.getElementById('speed').value = saved.slider;
  let speed = speedFromSlider(+document.getElementById('speed').value);
  let selectedVesselId = null, selectedPortId = null, selectedWreckId = null, lastPanelSig = '';
  let selectedArchiveId = null;   // a tracked vessel whose record outlived her
  let showRoutes = hashParams.get('routes') === '1';
  if (showRoutes) document.getElementById('ov-routes').checked = true;
  let latestSnap = world.snapshot({ density: perf.shipDensity });
  // overlay lane weights drift era-slow, so they're recomputed on the ~5 Hz HUD
  // throttle (and at toggle time), not per frame — 261 lanes need no rAF math.
  let laneWeightsCache = showRoutes ? world.laneWeightsAt(latestSnap.simClock) : null;
  // ports greyed unless they saw traffic in the recent past; lifecycle
  // (existing/ruined per the flowing year) gates chart presence. Both recomputed
  // on the HUD throttle (era-slow) and passed to every draw()/pickAt().
  // The greying window is DISPLAY policy (tweaks.txt, 2026-07-16): 3 sim-years,
  // up from the world default of 1 — minor ports with sparse but real flows
  // (a slave factory between sailings, a seasonal Arctic port in winter) read
  // as quiet, not abandoned. world.activePortsSince keeps its own default.
  const GREY_WINDOW_SEC = 3 * 365.25 * 86400;
  let activePorts = world.activePortsSince(latestSnap.simClock, GREY_WINDOW_SEC);
  let portLife = world.portLifecycleAt(latestSnap.simClock);

  const ledgerCtx = () => ({
    portById, cargoById, powerById, portNameAt, portPowerAt, simClock: latestSnap.simClock,
    // the flowing year, clamped through the reset ramp exactly as spawning is
    year: latestSnap.reset > 0 ? 1850 : latestSnap.year
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

  // pin controls for a vessel ledger (live or kept record)
  const pinState = (id) => ({ pinned: world.isPinned(id), canPin: world.canPin() });

  function renderPanel() {
    if (selectedVesselId != null) {
      const v = latestSnap.vessels.find(x => x.id === selectedVesselId);
      // pinState omitted while the tracker is disabled — no Follow button
      if (v) ui.showLedger(v, ledgerCtx()); else clearSelection();
    } else if (selectedArchiveId != null) {
      const rec = world.trackedVessels().find(r => r.id === selectedArchiveId);
      if (!rec) { clearSelection(); return; }        // unfollowed — record gone
      // a kept record is near-static; refresh on the sim-day (a pinned ship
      // hidden by density thinning routes through here while still sailing)
      const sig = `arch:${rec.id}:${rec.status}:${Math.floor(latestSnap.simClock / 86400)}`;
      if (sig !== lastPanelSig) { lastPanelSig = sig; ui.showLedger(rec, ledgerCtx()); }
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
      if (sig !== lastPanelSig) { lastPanelSig = sig; ui.showPort(portById.get(selectedPortId), traffic, { ...ledgerCtx(), portHistory: world.portHistoryOf(selectedPortId) }); }
    }
  }
  function deselect() { selectedVesselId = null; selectedPortId = null; selectedWreckId = null; selectedArchiveId = null; lastPanelSig = ''; }
  // on mobile a selection presents the ledger as the bottom sheet
  function present() { renderPanel(); if (isMobile()) openSheet('ledger'); }
  function selectVessel(id) { deselect(); selectedVesselId = id; present(); }
  function selectPort(id) { deselect(); selectedPortId = id; present(); }
  function selectWreck(id) { deselect(); selectedWreckId = id; present(); }
  function selectArchived(id) { deselect(); selectedArchiveId = id; present(); }
  function clearSelection() {
    deselect(); ui.hideLedger();
    if (activeSheet === 'ledger') { activeSheet = null; applyPanels(); }
  }

  const ui = createUI({
    onSpeed: (m) => { speed = m; },
    onClose: clearSelection,
    onSelectVessel: selectVessel,
    // follow/unfollow from a ledger: flip the pin, refresh the ledger + tracker
    onTogglePin: (id) => {
      if (world.isPinned(id)) {
        world.unpinVessel(id);
        if (selectedArchiveId === id) { clearSelection(); }   // her record is gone with the pin
      } else world.pinVessel(id);
      lastPanelSig = ''; renderPanel(); renderTrackerPanel(true);
    },
    // a tracker row: her live ledger if she still sails, else her kept record
    onSelectTracked: (id) => {
      if (latestSnap.vessels.some(v => v.id === id)) selectVessel(id);
      else selectArchived(id);
    }
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
  // ---- routes overlay: master toggle + per-basin layers + chart views ----
  // The overlay draws to the renderer's cached offscreen canvas, refreshed on
  // the 5 Hz HUD throttle (weights drift era-slow) and at toggle/filter/view
  // time — per frame it costs one blit.
  const BASIN_ORDER = ['atlantic', 'baltic-north-sea', 'mediterranean',
    'indian-ocean-west', 'bengal-se-asia', 'east-asia', 'pacific'];
  const BASIN_LABEL = {
    'atlantic': 'The Atlantic', 'baltic-north-sea': 'Baltic & North Sea',
    'mediterranean': 'The Mediterranean', 'indian-ocean-west': 'Western Indian Ocean',
    'bengal-se-asia': 'Bengal & Southeast Asia', 'east-asia': 'East Asia',
    'pacific': 'The Pacific',
    'other': 'Naval & state voyages'
  };
  const basinsPresent = new Set(laneBasin.values());
  const basinIds = BASIN_ORDER.filter(b => basinsPresent.has(b))
    .concat([...basinsPresent].filter(b => !BASIN_ORDER.includes(b)).sort(), ['other']);
  const layerOn = (b) => settings.layers[b] !== false;

  // visible lane set for the overlay: null = no filter (every basin on)
  function laneVisibleSet() {
    if (basinIds.every(layerOn)) return null;
    return new Set(routeLines.filter(rl => layerOn(laneBasin.get(rl.id) || 'other')).map(rl => rl.id));
  }
  function refreshOverlay() {
    renderer.setOverlay(showRoutes && laneWeightsCache
      ? { season: latestSnap.season, laneWeights: laneWeightsCache, visible: laneVisibleSet() }
      : null);
  }

  // the per-basin rows under the master toggle (disabled while it is off)
  const layerSubs = document.getElementById('layer-subs');
  for (const b of basinIds) {
    const lab = document.createElement('label');
    lab.className = 'menu-item';
    const box = document.createElement('input');
    box.type = 'checkbox'; box.id = 'ly-opt-' + b; box.checked = layerOn(b);
    const span = document.createElement('span');
    span.textContent = BASIN_LABEL[b] || b.replace(/-/g, ' ');
    lab.append(box, span);
    layerSubs.appendChild(lab);
    box.addEventListener('change', () => {
      // stored sparsely: only switched-off basins persist (absent = on)
      if (box.checked) delete settings.layers[b]; else settings.layers[b] = false;
      saveSettings(settings); refreshOverlay();
    });
  }
  function applyLayerSubs() {
    for (const b of basinIds) {
      const box = document.getElementById('ly-opt-' + b);
      box.disabled = !showRoutes;
      box.closest('.menu-item').classList.toggle('is-disabled', box.disabled);
    }
  }
  document.getElementById('ov-routes').addEventListener('change', (e) => {
    showRoutes = e.target.checked;
    laneWeightsCache = showRoutes ? world.laneWeightsAt(latestSnap.simClock) : null;
    applyLayerSubs(); refreshOverlay();
  });
  applyLayerSubs(); refreshOverlay();      // honour #routes=1 at boot

  // chart views: preset regional plates from render.js REGIONS
  const viewBox = document.getElementById('view-radios');
  for (const r of REGIONS) {
    if (r.hidden) continue;                    // sparse plates hidden until fleshed out
    const lab = document.createElement('label');
    lab.className = 'menu-item';
    const radio = document.createElement('input');
    radio.type = 'radio'; radio.name = 'view'; radio.value = r.id;
    radio.checked = r.id === settings.region;
    const span = document.createElement('span');
    span.textContent = r.name;
    lab.append(radio, span);
    viewBox.appendChild(lab);
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      settings.region = r.id;
      renderer.setRegion(r.id);      // rebuilds base + labels + overlay buffer
      saveSettings(settings);
    });
  }

  // panel signatures + lookups — declared before the wiring below, which can
  // call the render functions during boot when a panel was left switched on
  let lastEventsSig = '', lastStatsSig = '', lastTrackerSig = '';
  const laneNameById = new Map(datasets.routes.map(r => [r.id, r.name]));
  const PANEL_RENDER = { events: () => renderEventsPanel(true), stats: () => renderStatsPanel(true), tracker: () => renderTrackerPanel(true) };

  // panels (settings.panels): the menu shows/hides each on-display card.
  // A furled chart overrides them all — the cartouche collapses to a small
  // title plate and every ambient panel (and the hint) is stowed with it;
  // unfurling restores whatever the settings say. Click-to-inspect still
  // works throughout — the ledger is the chart's business, not its chrome.
  buildLegend({ powers: datasets.powers });
  const PANEL_EL = { legend: 'legend', events: 'events', stats: 'stats', tracker: 'tracker', counters: 'counters', helm: 'helm' };
  const cartouche = document.getElementById('cartouche');
  const hintEl = document.getElementById('hint');

  // ---- mobile bottom sheets (the map-app pattern) ----
  // Below 720px the ledger, legend, events, and tracker present as non-modal
  // bottom sheets, ONE at a time; the chart stays interactive above. Desktop
  // is untouched: the same elements sit in their corner docks.
  const mobileMq = matchMedia('(max-width: 719px)');
  const SHEETS = ['ledger', 'legend', 'events', 'stats', 'tracker'];
  let activeSheet = null;
  function isMobile() { return mobileMq.matches; }
  function openSheet(id) {
    if (!isMobile() || settings.furled) return;
    if (id !== 'ledger' && activeSheet === 'ledger') clearSelection();
    activeSheet = id;
    menu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false');
    applyPanels();
  }
  function closeSheet() {
    const was = activeSheet;
    activeSheet = null;
    if (was === 'ledger') clearSelection();
    applyPanels();
  }
  mobileMq.addEventListener('change', () => {
    // crossing the breakpoint: drop any sheet; a live selection re-presents
    activeSheet = null;
    if (isMobile() && (selectedVesselId ?? selectedPortId ?? selectedWreckId ?? selectedArchiveId) != null)
      activeSheet = 'ledger';
    applyPanels();
  });

  function applyPanels() {
    const mob = isMobile();
    for (const [key, id] of Object.entries(PANEL_EL)) {
      let show = !settings.furled && settings.panels[key];
      if (mob && SHEETS.includes(id)) show = show && activeSheet === id;
      document.getElementById(id).hidden = !show;
    }
    for (const id of SHEETS)
      document.getElementById(id).classList.toggle('as-sheet', mob && activeSheet === id);
    cartouche.classList.toggle('furled', settings.furled);
    // the hint shares the legend's bottom-right corner — yield when it's on
    hintEl.hidden = settings.furled || settings.panels.legend;
    applyLegendSections();
    applyCollapsed();
  }

  // ---- per-panel header collapse (the uniform disclosure idiom) ----
  // Desktop: the header collapses the card to its title bar in place.
  // Mobile sheet form: the header is the dismiss bar (closes = turns off).
  const COLLAPSIBLE = { legend: 'legend-body', events: 'events-body', stats: 'stats-body', tracker: 'tracker-body' };
  function applyCollapsed() {
    const mob = isMobile();
    for (const [key, id] of Object.entries(COLLAPSIBLE)) {
      document.getElementById(id).hidden = !mob && settings.collapsed[key];
      document.getElementById('ch-' + key).setAttribute('aria-expanded', String(mob || !settings.collapsed[key]));
    }
  }
  for (const key of Object.keys(COLLAPSIBLE)) {
    document.getElementById('ch-' + key).addEventListener('click', () => {
      if (isMobile()) {
        settings.panels[key] = false;
        document.getElementById('pn-' + key).checked = false;
        closeSheet(); saveSettings(settings);
        return;
      }
      settings.collapsed[key] = !settings.collapsed[key];
      applyCollapsed(); saveSettings(settings);
    });
  }
  // the legend's toggle tree: each section independently, under the parent
  const LG_SECTIONS = { ships: 'lg-ships', flags: 'lg-flags' };
  function applyLegendSections() {
    for (const [key, id] of Object.entries(LG_SECTIONS))
      document.getElementById(id).hidden = !settings.legend[key];
    for (const key of Object.keys(LG_SECTIONS)) {
      const box = document.getElementById('lg-opt-' + key);
      box.disabled = !settings.panels.legend;
      // class instead of :has(input:disabled) — Firefox ESR ≤115 lacks :has()
      box.closest('.menu-item').classList.toggle('is-disabled', box.disabled);
    }
  }
  for (const key of Object.keys(LG_SECTIONS)) {
    const box = document.getElementById('lg-opt-' + key);
    box.checked = settings.legend[key];
    box.addEventListener('change', () => {
      settings.legend[key] = box.checked;
      applyLegendSections(); saveSettings(settings);
    });
  }
  function toggleFurl() {
    settings.furled = !settings.furled;
    if (settings.furled) {
      menu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false');
      if (activeSheet === 'ledger') clearSelection(); else activeSheet = null;
    }
    applyPanels(); saveSettings(settings);
  }
  // Escape: close the options first, then any open sheet
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!menu.hidden) {
      menu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.focus();
    } else if (activeSheet) closeSheet();
  });
  cartouche.addEventListener('click', (e) => {
    // the menu's own controls (and the hamburger) keep their meanings
    if (!settings.furled && e.target.closest('button, input, label, a')) return;
    toggleFurl();
  });
  cartouche.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === cartouche) { e.preventDefault(); toggleFurl(); }
  });
  for (const key of Object.keys(PANEL_EL)) {
    const box = document.getElementById('pn-' + key);
    box.checked = settings.panels[key];
    box.addEventListener('change', () => {
      settings.panels[key] = box.checked;
      saveSettings(settings);
      // on mobile, switching a sheet-capable panel on presents its sheet
      if (box.checked && isMobile() && SHEETS.includes(PANEL_EL[key])) openSheet(PANEL_EL[key]);
      else applyPanels();
      if (box.checked && PANEL_RENDER[key]) PANEL_RENDER[key]();
    });
  }
  applyPanels();
  for (const key of Object.keys(PANEL_RENDER)) if (settings.panels[key]) PANEL_RENDER[key]();

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
      Object.assign(world.tuning, {
        logCap: perf.logCap, wreckLingerDays: perf.wreckLingerDays,
        portHistoryDepth: perf.portHistoryDepth, pinCap: perf.pinCap
      });
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

  // statistics panel: shapes the world's observation-layer tallies for
  // display. Re-rendered on the HUD throttle, gated on the fleet totals —
  // nothing changes between resolutions, so a quiet sea costs no DOM work.
  function renderStatsPanel(force = false) {
    const c = latestSnap.counters;
    const sig = `${c.spawned}:${c.arrived}:${c.lost}`;
    if (!force && sig === lastStatsSig) return;
    lastStatsSig = sig;
    const st = world.stats;
    const routesView = Object.entries(st.byLane).filter(([, s]) => s.lost > 0)
      .sort((a, b) => b[1].lost - a[1].lost).slice(0, 6)
      .map(([id, s]) => ({ name: laneNameById.get(id) || id, lost: s.lost, spawned: s.spawned, pct: Math.round(100 * s.lost / s.spawned) }));
    const totCargo = Object.values(st.byCargo).reduce((a, b) => a + b, 0);
    const cargoesView = !totCargo ? [] : Object.entries(st.byCargo)
      .sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([id, n]) => ({ name: id === 'ballast' ? 'in ballast' : (cargoById.get(id) || { name: id }).name, pct: Math.round(100 * n / totCargo) }));
    ui.renderStats({
      spawned: c.spawned, arrived: c.arrived, lost: c.lost,
      lossPct: c.spawned ? Math.round(100 * c.lost / c.spawned) : 0,
      routes: routesView, cargoes: cargoesView
    });
  }

  // tracker panel: the followed fleet, re-rendered when membership or a
  // status changes (or a live destination leg advances)
  function renderTrackerPanel(force = false) {
    const year = latestSnap.reset > 0 ? 1850 : latestSnap.year;
    const rows = world.trackedVessels().map(r => ({
      id: r.id, name: r.name, prefix: r.prefix, typeName: r.typeName, flagColor: r.flagColor,
      status: r.status,
      where: r.status === 'sailing' ? portNameAt(portById.get(r.pos.to), year).replace(/\s*\(.*\)/, '') : ''
    }));
    const sig = rows.map(r => `${r.id}:${r.status}:${r.where}`).join(',');
    if (!force && sig === lastTrackerSig) return;
    lastTrackerSig = sig;
    ui.renderTracker(rows);
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

  // debug hook (#debug=1): exposes the live world + renderer for headless
  // verification scripts. Display-only access — never wired to any UI.
  if (hashParams.get('debug') === '1')
    window.__is = { world, renderer, snap: () => latestSnap };

  // animation loop
  let last = performance.now();
  let hudAccum = 0;
  function frame(now) {
    let dtReal = (now - last) / 1000; last = now;
    dtReal = Math.min(dtReal, 0.25);                 // cap catch-up per frame
    if (speed > 0) world.tick(dtReal * speed);

    latestSnap = world.snapshot({ density: perf.shipDensity });
    // the routes overlay is a cached canvas inside the renderer, refreshed on
    // the HUD throttle below — the frame just draws snapshot + blits
    renderer.draw(latestSnap, selectedVesselId, selectedPortId, now, activePorts, selectedWreckId, portLife);

    hudAccum += dtReal;
    if (hudAccum > 0.2) {
      hudAccum = 0;
      activePorts = world.activePortsSince(latestSnap.simClock, GREY_WINDOW_SEC);
      portLife = world.portLifecycleAt(latestSnap.simClock);
      // overlay weights: this world's realized per-lane flow — route brightness
      // IS the traffic the sim is actually sampling. They drift era-slow, so a
      // 5 Hz redraw of the cached overlay canvas is visually exact.
      if (showRoutes) { laneWeightsCache = world.laneWeightsAt(latestSnap.simClock); refreshOverlay(); }
      if (settings.panels.events) renderEventsPanel();
      if (settings.panels.stats) renderStatsPanel();
      if (settings.panels.tracker) renderTrackerPanel();
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
