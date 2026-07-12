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
  const hashSeed = new URLSearchParams(location.hash.slice(1)).get('seed');
  const seed = hashSeed ? (parseInt(hashSeed, 10) >>> 0) : ((Date.now() ^ (Math.random() * 1e9)) >>> 0);

  const world = createWorld({ seed, data: { datasets, routes } });
  // pre-warm so the sea is already busy on load (~100 sim-days in coarse steps)
  const SEC_PER_DAY = 86400;
  for (let i = 0; i < 40; i++) world.tick(2.5 * SEC_PER_DAY);

  const legById = new Map(routes.routes.map(r => [r.id, r]));
  const portById = new Map(datasets.ports.map(p => [p.id, p]));
  const cargoById = new Map(datasets.cargo.map(c => [c.id, c]));

  const canvas = document.getElementById('chart');
  const renderer = createRenderer(canvas, { land, ports: datasets.ports, legById, reducedMotion });
  renderer.resize();
  addEventListener('resize', renderer.resize);

  let speed = speedFromSlider(+document.getElementById('speed').value);
  let selectedId = null;
  let latestSnap = world.snapshot();

  const ui = createUI({
    onSpeed: (m) => { speed = m; },
    onClose: () => { selectedId = null; }
  });

  // selection: click a vessel to open her ledger; click empty sea to dismiss
  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    const id = renderer.pick(e.clientX - r.left, e.clientY - r.top, latestSnap);
    selectedId = id;
    if (id) {
      const v = latestSnap.vessels.find(x => x.id === id);
      if (v) ui.showLedger(v, { portById, cargoById, simClock: latestSnap.simClock });
    } else ui.hideLedger();
  });

  // animation loop
  let last = performance.now();
  let hudAccum = 0;
  function frame(now) {
    let dtReal = (now - last) / 1000; last = now;
    dtReal = Math.min(dtReal, 0.25);                 // cap catch-up per frame
    if (speed > 0) world.tick(dtReal * speed);

    latestSnap = world.snapshot();
    renderer.draw(latestSnap, selectedId, now);

    // keep an open ledger live (ETA counts down; status flips on arrival/loss)
    hudAccum += dtReal;
    if (hudAccum > 0.2) {
      hudAccum = 0;
      ui.updateHUD(latestSnap);
      if (selectedId) {
        const v = latestSnap.vessels.find(x => x.id === selectedId);
        if (v) ui.showLedger(v, { portById, cargoById, simClock: latestSnap.simClock });
      }
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
