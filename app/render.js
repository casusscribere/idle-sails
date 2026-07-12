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
const PAPER = '#e7dabd';         // aged parchment
const PAPER_HI = '#efe4cb';
const SEA_TINT = 'rgba(120,140,150,0.06)'; // barely-cool wash over the sea
const LAND = '#cdb488';          // warm tan landmass
const LAND_EDGE = '#5c4630';
const RHUMB = 'rgba(90,70,45,0.13)';
const RHUMB_RED = 'rgba(150,70,50,0.16)';
const WAKE = 'rgba(58,44,28,0.28)';

// Chart viewport in geographic degrees (frames all ports, routes and ice caps).
const BOUNDS = { lonMin: -100, lonMax: 150, latMin: -58, latMax: 74 };
// Wind-rose nodes (portolan style): sea points that radiate rhumb lines.
const ROSES = [[-38, 32], [-20, -18], [70, -20], [95, 18]];
const COMPASS_DIRS = 16;

export function createRenderer(canvas, assets) {
  const { land, ports, legById, reducedMotion } = assets;
  const ctx = canvas.getContext('2d');
  let base = null, baseCtx = null;      // offscreen static chart
  let W = 0, H = 0, dpr = 1, k = 1, ox = 0, oy = 0;
  const wakes = new Map();               // vesselId → [[x,y],...] recent screen positions

  function project(lon, lat) {
    let L = ((lon + 180) % 360 + 360) % 360 - 180;
    return [ox + (L - BOUNDS.lonMin) * k, oy + (BOUNDS.latMax - lat) * k];
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.floor(r.width)); H = Math.max(1, Math.floor(r.height));
    canvas.width = W * dpr; canvas.height = H * dpr;
    const spanLon = BOUNDS.lonMax - BOUNDS.lonMin, spanLat = BOUNDS.latMax - BOUNDS.latMin;
    k = Math.max(W / spanLon, H / spanLat);           // cover the canvas
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

    // rhumb-line web from the wind roses (drawn under everything, faint)
    for (const [rl, rt] of ROSES) drawRhumbs(c, rl, rt);

    // graticule every 15°
    c.lineWidth = 1; c.strokeStyle = INK_FAINT;
    for (let lon = -90; lon <= 150; lon += 15) { const a = project(lon, BOUNDS.latMax), b = project(lon, BOUNDS.latMin); line(c, a, b); }
    for (let lat = -45; lat <= 60; lat += 15) { const a = project(BOUNDS.lonMin, lat), b = project(BOUNDS.lonMax, lat); line(c, a, b); }

    // land
    c.lineJoin = 'round';
    for (const f of land.features) drawGeom(c, f.geometry);

    // wind roses on top of the sea web
    for (const [rl, rt] of ROSES) drawRose(c, rl, rt);

    // ports
    for (const p of ports) drawPort(c, p);
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

  function drawRhumbs(c, lon, lat) {
    const [cx, cy] = project(lon, lat);
    const R = Math.max(W, H) * 1.4;
    for (let i = 0; i < 32; i++) {
      const ang = (i / 32) * Math.PI * 2;
      c.strokeStyle = (i % 8 === 0) ? RHUMB_RED : RHUMB;
      c.lineWidth = (i % 4 === 0) ? 1.1 : 0.7;
      line(c, [cx, cy], [cx + Math.cos(ang) * R, cy + Math.sin(ang) * R]);
    }
  }

  function drawRose(c, lon, lat) {
    const [cx, cy] = project(lon, lat); const R = 26;
    c.save();
    c.strokeStyle = INK_SOFT; c.fillStyle = 'rgba(58,44,28,0.10)'; c.lineWidth = 1;
    c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(cx, cy, R * 0.62, 0, Math.PI * 2); c.stroke();
    for (let i = 0; i < COMPASS_DIRS; i++) {
      const a = (i / COMPASS_DIRS) * Math.PI * 2 - Math.PI / 2;
      const long = i % 4 === 0, r0 = long ? 0 : R * 0.62, r1 = R;
      // four-point star petals
      c.beginPath();
      c.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      c.lineTo(cx + Math.cos(a + 0.13) * r0, cy + Math.sin(a + 0.13) * r0);
      c.lineTo(cx + Math.cos(a - 0.13) * r0, cy + Math.sin(a - 0.13) * r0);
      c.closePath();
      c.fillStyle = (i % 2 === 0) ? 'rgba(58,44,28,0.16)' : 'rgba(58,44,28,0.05)';
      c.fill(); c.stroke();
    }
    // north fleur mark
    c.fillStyle = RHUMB_RED; c.beginPath();
    c.moveTo(cx, cy - R - 6); c.lineTo(cx - 3, cy - R + 2); c.lineTo(cx + 3, cy - R + 2); c.closePath(); c.fill();
    c.restore();
  }

  function drawPort(c, p) {
    const [x, y] = project(p.lon, p.lat);
    c.save();
    c.fillStyle = INK; c.strokeStyle = INK;
    c.beginPath(); c.arc(x, y, 2.6, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(x, y, 5.2, 0, Math.PI * 2); c.lineWidth = 0.8; c.globalAlpha = 0.5; c.stroke();
    c.globalAlpha = 1;
    label(c, p.name.replace(/\s*\(.*\)/, ''), x + 7, y + 3, 11, INK, 'left');
    c.restore();
  }

  function drawGeom(c, geom) {
    const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
    c.fillStyle = LAND; c.strokeStyle = LAND_EDGE; c.lineWidth = 0.9;
    for (const poly of polys) {
      c.beginPath();
      for (const ring of poly) {
        for (let i = 0; i < ring.length; i++) {
          const [x, y] = project(ring[i][0], ring[i][1]);
          i ? c.lineTo(x, y) : c.moveTo(x, y);
        }
        c.closePath();
      }
      c.fill(); c.stroke();
    }
  }

  // ---- helpers ------------------------------------------------------------
  function line(c, a, b) { c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
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

  // ---- dynamic frame ------------------------------------------------------
  function draw(snapshot, selectedId, t) {
    if (base) ctx.drawImage(base, 0, 0, W, H);

    const vessels = snapshot.vessels;
    const selected = vessels.find(v => v.id === selectedId);
    if (selected) drawSelectedRoute(selected, t);

    for (const v of vessels) drawVessel(v, v.id === selectedId, t);

    // prune wake history for vessels no longer present
    if (wakes.size > vessels.length + 20) {
      const live = new Set(vessels.map(v => v.id));
      for (const id of wakes.keys()) if (!live.has(id)) wakes.delete(id);
    }
  }

  function drawSelectedRoute(v, t) {
    ctx.save();
    ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(58,44,28,0.7)';
    for (const seg of v.schedule) {
      const leg = legById.get(seg.legId); if (!leg) continue;
      ctx.beginPath();
      leg.coords.forEach((cpt, i) => { const [x, y] = project(cpt[0], cpt[1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
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
    const [x, y] = project(v.pos.lon, v.pos.lat);
    // wake
    let w = wakes.get(v.id); if (!w) { w = []; wakes.set(v.id, w); }
    const last = w[w.length - 1];
    if (!last || Math.hypot(last[0] - x, last[1] - y) > 1.5) { w.push([x, y]); if (w.length > 14) w.shift(); }
    if (w.length > 1 && !reducedMotion) {
      ctx.beginPath(); ctx.moveTo(w[0][0], w[0][1]);
      for (let i = 1; i < w.length; i++) ctx.lineTo(w[i][0], w[i][1]);
      ctx.strokeStyle = WAKE; ctx.lineWidth = 1; ctx.stroke();
    }

    const lost = v.status === 'lost';
    const size = 3 + Math.sqrt(v.tonnage) / 7;   // ~4–9 px
    ctx.save();
    ctx.translate(x, y);
    if (lost) {
      const age = t != null ? 1 : 1;
      ctx.strokeStyle = 'rgba(120,40,30,0.8)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-4, -4); ctx.lineTo(4, 4); ctx.moveTo(4, -4); ctx.lineTo(-4, 4); ctx.stroke();
      ctx.restore(); return;
    }
    ctx.rotate((v.pos.heading - 90) * Math.PI / 180);
    // little hull glyph pointing along heading, tinted by allegiance
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(-size * 0.7, size * 0.6);
    ctx.lineTo(-size * 0.4, 0);
    ctx.lineTo(-size * 0.7, -size * 0.6);
    ctx.closePath();
    ctx.fillStyle = v.flagColor || INK;
    ctx.globalAlpha = v.middlePassage ? 0.95 : 0.9;
    ctx.fill();
    ctx.lineWidth = 0.8; ctx.strokeStyle = INK; ctx.globalAlpha = 1; ctx.stroke();
    ctx.restore();

    if (isSel) {
      ctx.beginPath(); ctx.arc(x, y, size + 6, 0, Math.PI * 2);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke();
      label(ctx, (v.prefix ? v.prefix + ' ' : '') + v.name, x + size + 9, y + 4, 12, INK, 'left');
    }
  }

  // ---- picking ------------------------------------------------------------
  function pick(px, py, snapshot) {
    let best = null, bestD = 16 * 16;
    for (const v of snapshot.vessels) {
      if (v.status === 'lost') continue;
      const [x, y] = project(v.pos.lon, v.pos.lat);
      const d = (x - px) ** 2 + (y - py) ** 2;
      if (d < bestD) { bestD = d; best = v.id; }
    }
    return best;
  }

  return { resize, draw, pick, project };
}
