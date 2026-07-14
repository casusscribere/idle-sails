// render.js — the chart. Draws Idle Sails as an 18th-century sea chart onto a
// <canvas>: a blank-parchment sea webbed with rhumb lines, engraved coastlines,
// a wind rose, and sepia vessels crawling along their baked wind/current routes.
// It only READS world snapshots; it never mutates the sim. The static chart
// (land, graticule, rhumb lines, wind roses, ports) is rendered once to an
// offscreen buffer and blitted each frame; only vessels, wakes and the selected
// route are redrawn live.

const INK = '#3a2c1c';           // iron-gall sepia
const INK_SOFT = 'rgba(58,44,28,0.55)';
const INK_FAINT = 'rgba(58,44,28,0.16)';
const INK_DIM = '#9c8d72';       // dormant port — greyed (no traffic in the past sim-year)
const PAPER = '#e7dabd';         // aged parchment
const PAPER_HI = '#efe4cb';
const SEA_TINT = 'rgba(120,140,150,0.06)'; // barely-cool wash over the sea
const LAND = '#cdb488';          // warm tan landmass
const LAND_EDGE = '#5c4630';
const RHUMB_RED = 'rgba(150,70,50,0.16)';
const WAKE = 'rgba(58,44,28,0.28)';

// The chart viewport (geographic degrees) is fit to the DATA, not hardcoded:
// computeBounds() below crops the parchment tightly around the world that is
// actually sailed. The east/west edges frame the farthest PORTS (so their names
// still render), leaving only a small margin; the top/bottom edges sit just
// beyond the highest/lowest routes-and-ports, so the decorative neatline bands
// hug the content and the empty mid-Pacific and the empty poles are cropped.
// (The whole world still CONTAINS in the viewport width — see resize() — the
// page scrolls only below the readability floor.)

// Colour is spent on allegiance (the flag), so ship CATEGORY is carried by the
// glyph's shape instead. The ship-types collapse into five map categories:
const SHIP_CATEGORY = {
  'ship-of-the-line': 'line',
  'frigate': 'warship', 'sloop-of-war': 'warship',
  'east-indiaman': 'indiaman', 'fluyt': 'indiaman',
  'slave-ship': 'slaver',
  // the 16th-c great ships read as large hulls, not slender warships
  'galleon': 'indiaman', 'carrack': 'indiaman', 'junk': 'indiaman'
  // everything else (merchantman, snow, brig, sloop, caravel, dhow) → 'merchant'
};
export const categoryOf = (v) => SHIP_CATEGORY[v.typeId] || 'merchant';

// Build a heading-aligned glyph path (bow at +x, to be rotated to heading). `s`
// is the glyph radius (scaled from tonnage by the caller).
export function shipGlyphPath(ctx, cat, s) {
  ctx.beginPath();
  switch (cat) {
    case 'warship': // frigate / sloop-of-war — slender, sharp, barbed arrowhead
      ctx.moveTo(1.3 * s, 0);
      ctx.lineTo(-0.55 * s, 0.72 * s);
      ctx.lineTo(-0.15 * s, 0);
      ctx.lineTo(-0.55 * s, -0.72 * s);
      ctx.closePath();
      break;
    case 'line': // ship of the line — broad, blunt, imposing hexagonal hull
      ctx.moveTo(1.0 * s, 0);
      ctx.lineTo(0.35 * s, 0.64 * s);
      ctx.lineTo(-0.75 * s, 0.64 * s);
      ctx.lineTo(-0.5 * s, 0);
      ctx.lineTo(-0.75 * s, -0.64 * s);
      ctx.lineTo(0.35 * s, -0.64 * s);
      ctx.closePath();
      break;
    case 'indiaman': // east-indiaman / fluyt — full, rounded bulk hull
      ctx.moveTo(1.05 * s, 0);
      ctx.quadraticCurveTo(0.35 * s, 0.82 * s, -0.55 * s, 0.55 * s);
      ctx.quadraticCurveTo(-0.85 * s, 0.28 * s, -0.7 * s, 0);
      ctx.quadraticCurveTo(-0.85 * s, -0.28 * s, -0.55 * s, -0.55 * s);
      ctx.quadraticCurveTo(0.35 * s, -0.82 * s, 1.05 * s, 0);
      ctx.closePath();
      break;
    case 'slaver': // slave ship — blunt boxy hull (a transverse bar is added after)
      ctx.moveTo(0.95 * s, 0);
      ctx.lineTo(0.78 * s, 0.5 * s);
      ctx.lineTo(-0.72 * s, 0.52 * s);
      ctx.lineTo(-0.72 * s, -0.52 * s);
      ctx.lineTo(0.78 * s, -0.5 * s);
      ctx.closePath();
      break;
    default: // merchantman / snow / brig / sloop — slim dart with a notched stern
      ctx.moveTo(0.95 * s, 0);
      ctx.lineTo(-0.7 * s, 0.6 * s);
      ctx.lineTo(-0.4 * s, 0);
      ctx.lineTo(-0.7 * s, -0.6 * s);
      ctx.closePath();
  }
}

export function createRenderer(canvas, assets) {
  const { land, ports, legById, reducedMotion, routeLines = [] } = assets;
  const ctx = canvas.getContext('2d');

  // Crop the viewport tightly around the world that is actually sailed.
  function computeBounds() {
    let lonMin = Infinity, lonMax = -Infinity, latMin = Infinity, latMax = -Infinity;
    for (const p of ports) {
      if (p.lon < lonMin) lonMin = p.lon;   // Sitka, the westernmost port
      if (p.lon > lonMax) lonMax = p.lon;   // Banda Neira / Dejima, the easternmost
      if (p.lat < latMin) latMin = p.lat;
      if (p.lat > latMax) latMax = p.lat;   // Smeerenburg, the northernmost
    }
    // Baked routes extend the LATitude envelope only — the southern Roaring-
    // Forties easting dips well below any port. Their longitudes are unwrapped
    // past ±180 for the antimeridian galleon, so they must NOT widen the
    // horizontal crop: the east/west edges frame the farthest PORTS alone.
    for (const leg of legById.values())
      for (const c of leg.coords) { if (c[1] < latMin) latMin = c[1]; if (c[1] > latMax) latMax = c[1]; }
    return {
      lonMin: lonMin - 2.5,   // the westernmost port's dot clears the left band
      lonMax: lonMax + 10,    // room for the easternmost port's name (edge-flip covers overflow)
      latMin: latMin - 3,     // just below the southernmost route
      latMax: latMax + 2.5    // just above the northernmost port
    };
  }
  const BOUNDS = computeBounds();

  let base = null, baseCtx = null;      // offscreen static chart
  let W = 0, H = 0, dpr = 1, k = 1, ox = 0, oy = 0;
  const wakes = new Map();               // vesselId → [[x,y],...] recent screen positions
  let portScreen = [];                   // [{id, x, y}] for hit-testing the fixed ports
  let portDraw = [];                     // [{id, x, y, name, label:{ax,ay,align}|null}] cached placement
  // Popular-routes overlay: weighted per-frame by the flowing clock (see
  // drawRouteOverlay) — lanes brighten and fade as their origin's era-prominence
  // shifts, so national dominance visibly rotates across the centuries.

  function project(lon, lat) {
    let L = ((lon + 180) % 360 + 360) % 360 - 180;
    return [ox + (L - BOUNDS.lonMin) * k, oy + (BOUNDS.latMax - lat) * k];
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const spanLon = BOUNDS.lonMax - BOUNDS.lonMin, spanLat = BOUNDS.latMax - BOUNDS.latMin;
    const vw = document.documentElement.clientWidth || window.innerWidth;
    const vh = window.innerHeight;
    // CONTAIN, not cover: the whole world fits the viewport width, so Japan and
    // Sitka stay on screen without scrolling; the parchment letterboxes above
    // and below. Only when that would shrink the map below a readable height
    // (narrow/mobile screens) does the canvas hold a minimum scale and the page
    // scroll left/right instead.
    const MIN_MAP_H = 460;                           // px readability floor
    const kContain = vw / spanLon;
    if (kContain * spanLat >= MIN_MAP_H) { k = kContain; W = vw; }
    else { k = MIN_MAP_H / spanLat; W = Math.max(vw, Math.ceil(spanLon * k)); }
    H = vh;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    canvas.width = W * dpr; canvas.height = H * dpr;
    ox = (W - spanLon * k) / 2; oy = (H - spanLat * k) / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildBase();
  }

  // ---- static chart layer -------------------------------------------------
  function buildBase() {
    base = document.createElement('canvas');
    base.width = W * dpr; base.height = H * dpr;
    baseCtx = base.getContext('2d');
    const c = baseCtx; c.setTransform(dpr, 0, 0, dpr, 0, 0);

    // parchment ground + vignette
    c.fillStyle = PAPER; c.fillRect(0, 0, W, H);
    const vg = c.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.2, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
    vg.addColorStop(0, PAPER_HI); vg.addColorStop(1, '#d3c19b');
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
    c.fillStyle = SEA_TINT; c.fillRect(0, 0, W, H);
    drawGrain(c);

    // graticule every 15° (the projection grid). Snap each line's constant axis
    // to a half-pixel so every meridian/parallel renders with identical crispness
    // (otherwise whichever line happens to align to a device pixel looks bolder).
    // Edges computed from ox/k directly — project() wraps +180° back to −180°,
    // which collapsed every parallel to a zero-length line (the S2 full-globe
    // bounds regression). Meridians and parallels now span the whole chart.
    c.lineWidth = 1; c.strokeStyle = INK_FAINT;
    const xL = ox, xR = ox + (BOUNDS.lonMax - BOUNDS.lonMin) * k;
    const yT = oy, yB = oy + (BOUNDS.latMax - BOUNDS.latMin) * k;
    for (let lon = -165; lon <= 165; lon += 15) {
      const x = Math.round(project(lon, 0)[0]) + 0.5;
      line(c, [x, yT], [x, yB]);
    }
    for (let lat = -45; lat <= 75; lat += 15) {
      const y = Math.round(oy + (BOUNDS.latMax - lat) * k) + 0.5;
      line(c, [xL, y], [xR, y]);
    }

    // land
    c.lineJoin = 'round';
    for (const f of land.features) drawGeom(c, f.geometry);

    // ports: compute each label's placement now (collision-avoiding, once per
    // resize) and cache it in portDraw; the dots + labels are drawn per-frame in
    // drawPorts(), each inked normally or greyed by whether traffic reached the
    // port in the past sim-year. Placement is activity-independent, so it caches.
    portScreen = ports.map(p => { const [x, y] = project(p.lon, p.lat); return { id: p.id, x, y }; });
    computePortLabels(c);
  }

  // Decide where each port's name sits, caching the result in portDraw. With 66
  // ports the labels crowd Europe badly, so each tries anchors best-first — right
  // of the dot, then left, above, below — taking the first that clears the chart
  // edges, the labels already placed, and the neighbouring dots. A label with
  // nowhere to go is dropped (the dot still shows); ports like Acapulco (hard by
  // Veracruz) now find a spot instead of vanishing.
  function computePortLabels(c) {
    c.save();
    c.font = `11px "Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif`;
    const placed = [];   // committed label rects
    const dots = portScreen.map(ps => ({ x0: ps.x - 5, y0: ps.y - 5, x1: ps.x + 5, y1: ps.y + 5 }));
    portDraw = ports.map((p, i) => ({ id: p.id, x: portScreen[i].x, y: portScreen[i].y, name: p.name.replace(/\s*\(.*\)/, ''), label: null }));
    for (let i = 0; i < portDraw.length; i++) {
      const { x, y, name } = portDraw[i];
      const w = c.measureText(name).width;
      // anchors, best-first: right of the dot, then left, above, below, corners
      const cands = [
        { ax: x + 7, ay: y + 3, align: 'left' }, { ax: x - 7, ay: y + 3, align: 'right' },
        { ax: x, ay: y - 8, align: 'center' }, { ax: x, ay: y + 15, align: 'center' },
        { ax: x + 7, ay: y - 7, align: 'left' }, { ax: x - 7, ay: y - 7, align: 'right' },
        { ax: x + 7, ay: y + 13, align: 'left' }, { ax: x - 7, ay: y + 13, align: 'right' },
      ];
      for (const cd of cands) {
        const x0 = cd.align === 'left' ? cd.ax : cd.align === 'right' ? cd.ax - w : cd.ax - w / 2;
        const rect = { x0, y0: cd.ay - 10, x1: x0 + w, y1: cd.ay + 2 };
        if (rect.x0 < 3 || rect.x1 > W - 3 || rect.y0 < 14 || rect.y1 > H - 14) continue;  // off-chart / under a band
        if (placed.some(r => rect.x0 < r.x1 && rect.x1 > r.x0 && rect.y0 < r.y1 && rect.y1 > r.y0)) continue;
        if (dots.some((r, j) => j !== i && rect.x0 < r.x1 && rect.x1 > r.x0 && rect.y0 < r.y1 && rect.y1 > r.y0)) continue;
        portDraw[i].label = { ax: cd.ax, ay: cd.ay, align: cd.align };
        placed.push(rect);
        break;
      }
    }
    c.restore();
  }

  // Draw the port dots + names over the blitted base each frame. `active` is the
  // set of ports that saw traffic in the past sim-year (world.activePortsSince):
  // a port outside it has gone quiet and is greyed; ports in it (or when no set
  // is supplied) are inked normally.
  function drawPorts(active) {
    for (const pd of portDraw) {
      const on = !active || active.has(pd.id);
      const col = on ? INK : INK_DIM;
      ctx.save();
      ctx.fillStyle = col; ctx.strokeStyle = col;
      ctx.beginPath(); ctx.arc(pd.x, pd.y, 2.6, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = on ? 0.5 : 0.35; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(pd.x, pd.y, 5.2, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      if (pd.label) label(ctx, pd.name, pd.label.ax, pd.label.ay, 11, col, pd.label.align);
    }
  }

  function drawGrain(c) {
    // one cheap procedural speckle pass for paper tooth
    const n = Math.floor((W * H) / 900);
    c.save();
    for (let i = 0; i < n; i++) {
      const x = (i * 97.13 % W), y = ((i * 57.31 + Math.floor(i / W)) % H);
      c.fillStyle = (i % 3 === 0) ? 'rgba(90,70,45,0.05)' : 'rgba(255,250,235,0.05)';
      c.fillRect(x, y, 1, 1);
    }
    c.restore();
  }

  function drawGeom(c, geom) {
    const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
    c.fillStyle = LAND; c.strokeStyle = LAND_EDGE; c.lineWidth = 0.9;
    for (const poly of polys) {
      c.beginPath();
      for (const ring of poly) {
        // Unwrap each ring's longitudes so it stays geometrically continuous. A
        // landmass crossing the antimeridian (lon ±180, e.g. Chukotka) otherwise
        // has its halves projected to opposite screen edges, and both fill and
        // stroke smear a band straight across the chart. Unwrapping keeps the
        // crossing off-screen where it belongs (any residual pole-encircling seam,
        // i.e. Antarctica, sits below the viewport).
        let prevLon = null;
        for (let i = 0; i < ring.length; i++) {
          let lon = ((ring[i][0] + 180) % 360 + 360) % 360 - 180;
          if (prevLon !== null) { while (lon - prevLon > 180) lon -= 360; while (lon - prevLon < -180) lon += 360; }
          prevLon = lon;
          const x = ox + (lon - BOUNDS.lonMin) * k, y = oy + (BOUNDS.latMax - ring[i][1]) * k;
          i ? c.lineTo(x, y) : c.moveTo(x, y);
        }
        c.closePath();
      }
      c.fill(); c.stroke();
    }
  }

  // ---- helpers ------------------------------------------------------------
  function line(c, a, b) { c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }

  // Trace a lon/lat polyline, splitting where the projection wraps the
  // antimeridian (the Manila→Acapulco galleon) so no segment streaks across
  // the whole chart. Call between beginPath()/stroke().
  const wrapSpan = () => (BOUNDS.lonMax - BOUNDS.lonMin) * k * 0.5;
  function tracePath(c, coords) {
    let prevX = null;
    for (let i = 0; i < coords.length; i++) {
      const [x, y] = project(coords[i][0], coords[i][1]);
      if (i === 0 || Math.abs(x - prevX) > wrapSpan()) c.moveTo(x, y); else c.lineTo(x, y);
      prevX = x;
    }
  }
  function label(c, text, x, y, size, color, align) {
    c.save();
    c.font = `${size}px "Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif`;
    c.textAlign = align || 'left'; c.fillStyle = color;
    if ('letterSpacing' in c) c.letterSpacing = '0.4px';
    // faint paper halo for legibility over the web
    c.strokeStyle = 'rgba(231,218,189,0.85)'; c.lineWidth = 2.4; c.lineJoin = 'round';
    c.strokeText(text, x, y); c.fillText(text, x, y);
    c.restore();
  }

  // ---- popular-routes overlay --------------------------------------------
  // Each lane drawn in its flag's colour (national distribution) with line
  // weight & opacity scaled by traffic volume (popularity).
  function hexA(hex, a) {
    const h = hex.replace('#', '');
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
  }
  // routesCtx = { laneWeights } — this world's realized flow weight per
  // era-active lane (world.laneWeightsAt): the overlay shows the traffic the
  // sim is actually sampling. Faint→bold so the busiest lanes sit on top.
  function drawRouteOverlay(season, routesCtx) {
    const wts = routesCtx.laneWeights || {};
    const active = [];
    let maxEff = 0;
    for (const rl of routeLines) {
      const eff = wts[rl.id];
      if (!eff) continue;                        // era-inactive or zero-flow lane
      active.push({ rl, eff });
      if (eff > maxEff) maxEff = eff;
    }
    if (!maxEff) return;
    active.sort((a, b) => a.eff - b.eff);
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const { rl, eff } of active) {
      const coords = rl.coordsBySeason[season] || rl.coordsBySeason.jja || Object.values(rl.coordsBySeason)[0];
      if (!coords) continue;
      const f = eff / maxEff;
      ctx.strokeStyle = hexA(rl.color, 0.22 + 0.5 * f);
      ctx.lineWidth = 1.2 + 5.5 * f;
      ctx.beginPath();
      tracePath(ctx, coords);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---- dynamic frame ------------------------------------------------------
  function draw(snapshot, selectedId, selectedPortId, t, routesCtx, activePorts, selectedWreckId) {
    if (base) ctx.drawImage(base, 0, 0, W, H);
    drawPorts(activePorts);

    const vessels = snapshot.vessels;
    if (routesCtx) drawRouteOverlay(snapshot.season, routesCtx);
    if (selectedPortId) drawPortFocus(snapshot, selectedPortId);
    const selected = vessels.find(v => v.id === selectedId);
    if (selected) drawSelectedRoute(selected, t);

    drawWrecks(snapshot.wrecks || [], snapshot.simClock, selectedWreckId);
    for (const v of vessels) drawVessel(v, v.id === selectedId, t);

    // prune wake history for vessels no longer present
    if (wakes.size > vessels.length + 20) {
      const live = new Set(vessels.map(v => v.id));
      for (const id of wakes.keys()) if (!live.has(id)) wakes.delete(id);
    }
  }

  // Highlight a selected port: draw the current legs of the ships bound to/from
  // it (its live "spokes") and ring the port itself.
  function drawPortFocus(snapshot, portId) {
    const ps = portScreen.find(p => p.id === portId); if (!ps) return;
    ctx.save(); ctx.lineWidth = 1.2;
    for (const v of snapshot.vessels) {
      if (v.status !== 'sailing') continue;
      const out = v.pos.from === portId, inb = v.pos.to === portId;
      if ((!out && !inb) || v.pos.fraction >= 1) continue;
      const leg = legById.get(v.schedule[v.pos.legIndex].legId); if (!leg) continue;
      ctx.strokeStyle = out ? 'rgba(120,72,40,0.42)' : 'rgba(52,86,110,0.5)';
      ctx.beginPath();
      tracePath(ctx, leg.coords);
      ctx.stroke();
    }
    ctx.strokeStyle = INK; ctx.lineWidth = 1.7;
    ctx.beginPath(); ctx.arc(ps.x, ps.y, 8.5, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.5; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ps.x, ps.y, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function drawSelectedRoute(v, t) {
    ctx.save();
    ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(58,44,28,0.7)';
    for (const seg of v.schedule) {
      const leg = legById.get(seg.legId); if (!leg) continue;
      ctx.beginPath();
      tracePath(ctx, leg.coords);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    // mark ports on the itinerary
    const seen = new Set();
    for (const seg of v.schedule) for (const pid of [seg.from, seg.to]) {
      if (seen.has(pid)) continue; seen.add(pid);
      const leg = legById.get(seg.legId); if (!leg) continue;
      const g = pid === seg.from ? leg.coords[0] : leg.coords[leg.coords.length - 1];
      const [x, y] = project(g[0], g[1]);
      ctx.fillStyle = RHUMB_RED.replace('0.16', '0.9'); ctx.beginPath(); ctx.arc(x, y, 3.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawVessel(v, isSel, t) {
    // a lost vessel's wreck marker (drawWrecks) is her chart presence now
    if (v.status === 'lost') { wakes.delete(v.id); return; }
    const [x, y] = project(v.pos.lon, v.pos.lat);
    // wake
    let w = wakes.get(v.id); if (!w) { w = []; wakes.set(v.id, w); }
    const last = w[w.length - 1];
    if (!last || Math.hypot(last[0] - x, last[1] - y) > 1.5) { w.push([x, y]); if (w.length > 14) w.shift(); }
    if (w.length > 1 && !reducedMotion) {
      ctx.beginPath(); ctx.moveTo(w[0][0], w[0][1]);
      for (let i = 1; i < w.length; i++) {
        // a vessel wrapping the antimeridian teleports across the chart — break
        // the wake there instead of streaking it
        if (Math.abs(w[i][0] - w[i - 1][0]) > wrapSpan()) ctx.moveTo(w[i][0], w[i][1]);
        else ctx.lineTo(w[i][0], w[i][1]);
      }
      ctx.strokeStyle = WAKE; ctx.lineWidth = 1; ctx.stroke();
    }

    const size = 3 + Math.sqrt(v.tonnage) / 7;   // ~4–9 px
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((v.pos.heading - 90) * Math.PI / 180);
    // hull glyph: shape = ship category, fill = allegiance flag colour
    const cat = categoryOf(v);
    shipGlyphPath(ctx, cat, size);
    ctx.fillStyle = v.flagColor || INK;
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.lineWidth = 0.8; ctx.strokeStyle = INK; ctx.globalAlpha = 1; ctx.stroke();
    if (cat === 'slaver') { // sober transverse beam bar
      ctx.beginPath(); ctx.moveTo(0.05 * size, 0.52 * size); ctx.lineTo(0.05 * size, -0.52 * size);
      ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke();
    }
    ctx.restore();

    if (isSel) {
      ctx.beginPath(); ctx.arc(x, y, size + 6, 0, Math.PI * 2);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke();
      label(ctx, (v.prefix ? v.prefix + ' ' : '') + v.name, x + size + 9, y + 4, 12, INK, 'left');
    }
  }

  // Wreck markers: where a ship was lost, a sober saltire over a sinking hull
  // bar marks the chart for a sim-year, fading as the year passes. Clickable
  // (see pickAt) → the loss ledger.
  const WRECK_SEC = 365.25 * 86400;
  function drawWrecks(wrecks, simClock, selectedWreckId) {
    for (const w of wrecks) {
      const [x, y] = project(w.lon, w.lat);
      const age = Math.max(0, Math.min(1, (simClock - w.at) / WRECK_SEC));
      const a = 0.85 - 0.55 * age;                 // fresh 0.85 → year-old 0.30
      ctx.save();
      ctx.strokeStyle = `rgba(120,40,30,${a})`; ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x - 3.5, y - 3.5); ctx.lineTo(x + 3.5, y + 3.5);
      ctx.moveTo(x + 3.5, y - 3.5); ctx.lineTo(x - 3.5, y + 3.5);
      ctx.stroke();
      ctx.strokeStyle = `rgba(58,44,28,${a * 0.8})`; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(x - 4.5, y + 4.5); ctx.lineTo(x + 4.5, y + 4.5); ctx.stroke(); // the waterline
      if (w.id === selectedWreckId) {
        ctx.strokeStyle = INK; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.stroke();
        label(ctx, (w.prefix ? w.prefix + ' ' : '') + w.name, x + 12, y + 4, 12, INK, 'left');
      }
      ctx.restore();
    }
  }

  // ---- picking ------------------------------------------------------------
  // Pick the nearest hittable thing at (px,py): a vessel, a wreck, or a port —
  // whichever is closest within its own radius. Ports are precise targets, so a
  // click right on a port dot wins over a ship drifting nearby; wrecks pick like
  // vessels (a live ship shades a wreck only when genuinely nearer).
  function pickAt(px, py, snapshot) {
    let vBest = null, vd = 15 * 15;
    for (const v of snapshot.vessels) {
      if (v.status === 'lost') continue;
      const [x, y] = project(v.pos.lon, v.pos.lat);
      const d = (x - px) ** 2 + (y - py) ** 2;
      if (d < vd) { vd = d; vBest = v.id; }
    }
    let wBest = null, wd = 12 * 12;
    for (const w of snapshot.wrecks || []) {
      const [x, y] = project(w.lon, w.lat);
      const d = (x - px) ** 2 + (y - py) ** 2;
      if (d < wd) { wd = d; wBest = w.id; }
    }
    let pBest = null, pd = 13 * 13;
    for (const ps of portScreen) {
      const d = (ps.x - px) ** 2 + (ps.y - py) ** 2;
      if (d < pd) { pd = d; pBest = ps.id; }
    }
    const cands = [];
    if (vBest != null) cands.push({ type: 'vessel', id: vBest, d: vd });
    if (wBest != null) cands.push({ type: 'wreck', id: wBest, d: wd });
    if (pBest != null) cands.push({ type: 'port', id: pBest, d: pd });
    if (!cands.length) return null;
    cands.sort((a, b) => a.d - b.d);
    return { type: cands[0].type, id: cands[0].id };
  }

  return { resize, draw, pickAt, project };
}
