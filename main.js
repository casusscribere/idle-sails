// main.js — bootstrap. Loads the baked data, spins up the headless world, wires
// the renderer and UI, and runs the animation loop. This is the only file that
// touches the network, the clock, and the DOM event wiring.

import { createWorld } from './world.js';
import { createRenderer } from './render.js';
import { createUI, speedFromSlider } from './ui.js';

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
  // #routes=1 starts with the trade-routes overlay on.
  const hashParams = new URLSearchParams(location.hash.slice(1));
  const hashSeed = hashParams.get('seed');
  const seed = hashSeed ? (parseInt(hashSeed, 10) >>> 0) : ((Date.now() ^ (Math.random() * 1e9)) >>> 0);

  const world = createWorld({ seed, data: { datasets, routes } });
  // pre-warm so the sea is already busy on load (~100 sim-days in coarse steps)
  const SEC_PER_DAY = 86400;
  const skipDays = Math.max(0, +hashParams.get('t') || 0);
  if (skipDays) for (let d = 0; d < skipDays; d += 200) world.tick(Math.min(200, skipDays - d) * SEC_PER_DAY);
  for (let i = 0; i < 40; i++) world.tick(2.5 * SEC_PER_DAY);

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
    return { weight: lane.weight || 1, from: lane.from, era: lane.era, color: (power && power.color) || '#3a2c1c', coordsBySeason };
  });

  const canvas = document.getElementById('chart');
  const renderer = createRenderer(canvas, { land, ports: datasets.ports, legById, reducedMotion, routeLines });
  renderer.resize();
  addEventListener('resize', renderer.resize);

  let speed = speedFromSlider(+document.getElementById('speed').value);
  let selectedVesselId = null, selectedPortId = null, lastPanelSig = '';
  let showRoutes = hashParams.get('routes') === '1';
  if (showRoutes) document.getElementById('ov-routes').checked = true;
  let latestSnap = world.snapshot();

  const ledgerCtx = () => ({ portById, cargoById, powerById, simClock: latestSnap.simClock });

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
    } else if (selectedPortId != null) {
      const traffic = portTraffic(selectedPortId);
      // re-render only when membership or the sim-day changes (keeps scroll steady)
      const sig = traffic.outbound.map(v => v.id).join(',') + '|' + traffic.inbound.map(v => v.id).join(',')
        + '|' + Math.floor(latestSnap.simClock / 86400);
      if (sig !== lastPanelSig) { lastPanelSig = sig; ui.showPort(portById.get(selectedPortId), traffic, ledgerCtx()); }
    }
  }
  function selectVessel(id) { selectedVesselId = id; selectedPortId = null; lastPanelSig = ''; renderPanel(); }
  function selectPort(id) { selectedPortId = id; selectedVesselId = null; lastPanelSig = ''; renderPanel(); }
  function clearSelection() { selectedVesselId = null; selectedPortId = null; lastPanelSig = ''; ui.hideLedger(); }

  const ui = createUI({
    onSpeed: (m) => { speed = m; },
    onClose: clearSelection,
    onSelectVessel: selectVessel
  });

  // click a vessel → her ledger; click a port → its inbound/outbound traffic;
  // click empty sea → dismiss.
  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    const hit = renderer.pickAt(e.clientX - r.left, e.clientY - r.top, latestSnap);
    if (!hit) clearSelection();
    else if (hit.type === 'vessel') selectVessel(hit.id);
    else selectPort(hit.id);
  });
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    canvas.style.cursor = renderer.pickAt(e.clientX - r.left, e.clientY - r.top, latestSnap) ? 'pointer' : 'crosshair';
  });

  // hamburger menu + overlays
  const menuToggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');
  menuToggle.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  document.getElementById('ov-routes').addEventListener('change', (e) => { showRoutes = e.target.checked; });

  // animation loop
  let last = performance.now();
  let hudAccum = 0;
  function frame(now) {
    let dtReal = (now - last) / 1000; last = now;
    dtReal = Math.min(dtReal, 0.25);                 // cap catch-up per frame
    if (speed > 0) world.tick(dtReal * speed);

    latestSnap = world.snapshot();
    // overlay context: the flowing year + the current interpolated port weights,
    // so route brightness tracks each origin's prominence in the current decade.
    const routesCtx = showRoutes ? { year: latestSnap.year, weights: world.weightsAt(latestSnap.simClock) } : null;
    renderer.draw(latestSnap, selectedVesselId, selectedPortId, now, routesCtx);

    hudAccum += dtReal;
    if (hudAccum > 0.2) { hudAccum = 0; ui.updateHUD(latestSnap); renderPanel(); }
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
