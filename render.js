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
const INK_DIM = '#9c8d72';       // dormant port — greyed (no traffic within main.js's greying window)
const PAPER = '#e7dabd';         // aged parchment
const PAPER_HI = '#efe4cb';
const SEA_TINT = 'rgba(120,140,150,0.06)'; // barely-cool wash over the sea
const LAND = '#cdb488';          // warm tan landmass
const LAND_EDGE = '#5c4630';

// The Great Lakes — a cosmetic user request (so someone feels represented). Coarse
// outlines cut into the North-American landmass as inland water; no port or route
// touches them, so recognisable-but-rough is the right fidelity. Superior · Michigan
// · Huron · Erie · Ontario.
const GREAT_LAKES = [
  [[-92.0, 46.7], [-90.0, 46.6], [-87.5, 46.5], [-85.0, 46.7], [-84.4, 47.6], [-85.5, 48.4], [-87.5, 48.6], [-89.5, 48.2], [-91.5, 47.4]],
  [[-87.9, 42.0], [-86.2, 41.7], [-85.4, 42.5], [-85.3, 43.8], [-85.8, 45.2], [-86.9, 45.9], [-88.0, 45.1], [-88.1, 43.5]],
  [[-84.6, 43.4], [-83.2, 43.0], [-82.4, 43.9], [-81.7, 44.8], [-80.6, 44.8], [-81.0, 45.9], [-82.4, 46.3], [-83.7, 45.9], [-84.7, 44.5]],
  [[-83.4, 41.7], [-81.5, 41.5], [-79.5, 42.1], [-78.9, 42.6], [-80.2, 42.9], [-82.5, 42.2]],
  [[-79.7, 43.3], [-78.0, 43.4], [-76.5, 43.7], [-76.3, 44.1], [-77.8, 44.2], [-79.4, 43.9]]
];
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

// Regional views (feature pass 2): preset crops for the crowded corners of the
// chart — hand-tuned degree boxes, not free zoom, so each reads as its own
// engraved plate. 'world' keeps the data-fit crop above. Everything downstream
// of BOUNDS (projection, base chart, labels, overlay, picking) follows the
// active region; the sim underneath never knows a region exists.
export const REGIONS = [
  { id: 'world', name: 'The whole world' },
  { id: 'europe', name: 'Europe & the Mediterranean',
    bounds: { lonMin: -13, lonMax: 46, latMin: 33, latMax: 67.5 } },
  { id: 'caribbean', name: 'The Caribbean',
    bounds: { lonMin: -100, lonMax: -54, latMin: 5, latMax: 30 } },
  { id: 'east-indies', name: 'The East Indies & China',
    bounds: { lonMin: 100, lonMax: 140, latMin: -12, latMax: 38 } },
  // The two 2026-07-16 additions (RANKING "Outside the ladder"). Arabia & India
  // deliberately leaves north/west headroom for PLAN-4's E2 (Basra/Bandar
  // Abbas, ~30.5N in the Gulf) and E6 (Jeddah, ~39E in the Red Sea) so their
  // adoption needs no re-crop; Port Louis (~20S) is deliberately OUT of frame —
  // the Mascarenes belong to the world plate. Newfoundland→Chesapeake reaches
  // past −50 so the Grand Banks sea room is in frame, ready for grounds-
  // loitering fishery traffic if Pass 4 (T4) ships it.
  { id: 'arabia-india', name: 'Arabia & India',
    bounds: { lonMin: 36, lonMax: 92, latMin: -2, latMax: 31 } },
  // Hidden from the menu until its Grand-Banks fishery traffic ships (Pass 4) —
  // 5 ports read as sparse (user tweak). The plate + its test pin stay defined
  // so unhiding is deleting one flag. (arabia-india was on the same tweak but
  // Phase 1 populated it with Basra/Bandar Abbas/Jedda + the India ports, so it
  // now reads as fleshed out and stays visible.)
  { id: 'na-northeast', name: 'Newfoundland to the Chesapeake', hidden: true,
    bounds: { lonMin: -82, lonMax: -49, latMin: 34.5, latMax: 52.5 } },
  // Phase-1 addition (increment 7): the SW Pacific / Tasman, framing Sydney
  // (151E/−34S) and its Batavia/Pacific reaches — the basin PLAN-4 E3 opened.
  { id: 'australasia', name: 'Australasia & the Tasman',
    bounds: { lonMin: 110, lonMax: 180, latMin: -48, latMax: -8 } }
];

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
  const { land, ports, legById, reducedMotion, routeLines = [], portNameAt = null } = assets;
  // era-honest label text: eraNames-aware when the helper is supplied
  const displayName = (p, year) =>
    ((portNameAt && year != null) ? portNameAt(p, year) : p.name).replace(/\s*\(.*\)/, '');
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
  const WORLD_BOUNDS = computeBounds();
  let BOUNDS = WORLD_BOUNDS;
  let designedBounds = WORLD_BOUNDS;   // a regional plate's authored crop, before aspect-fill
  let regionId = 'world';

  // Switch the chart to a preset regional plate (or back to the world). The
  // projection, base chart, labels, and overlay all rebuild from the new
  // bounds; wakes are screen-space history from the old projection, so they
  // are dropped rather than streaked across the new plate.
  function setRegion(id) {
    const r = REGIONS.find(r => r.id === id);
    regionId = r ? r.id : 'world';
    designedBounds = (r && r.bounds) ? r.bounds : WORLD_BOUNDS;
    BOUNDS = designedBounds;
    wakes.clear();
    resize();
  }

  let base = null, baseCtx = null;      // offscreen static chart
  let W = 0, H = 0, dpr = 1, k = 1, ox = 0, oy = 0;
  // render-layer performance knobs (settings.js perf tier); mutable via setPerf
  const perf = { wakeLength: 14 };
  function setPerf(p) { Object.assign(perf, p); }
  const wakes = new Map();               // vesselId → [[x,y],...] recent screen positions
  let portScreen = [];                   // [{id, x, y}] for hit-testing the fixed ports
  let portDraw = [];                     // [{id, x, y, name, label:{ax,ay,align}|null}] cached placement
  let labelYear = null;                  // the year the cached labels were placed for
  let showWrecks = true;                 // draw + pick sunken-ship markers (menu toggle)
  // Popular-routes overlay: weighted per-frame by the flowing clock (see
  // drawRouteOverlay) — lanes brighten and fade as their origin's era-prominence
  // shifts, so national dominance visibly rotates across the centuries.

  function project(lon, lat) {
    let L = ((lon + 180) % 360 + 360) % 360 - 180;
    return [ox + (L - BOUNDS.lonMin) * k, oy + (BOUNDS.latMax - lat) * k];
  }

  // Regional plates letterbox when their aspect ≠ the viewport's, and content
  // beyond the crop (a coastline west of the plate, a ship bound for an
  // out-of-frame port) bled into the parchment mat where the graticule fades —
  // reading as "faded gridlines with stray land/ships." Clip the land + the
  // dynamic layer to the plate rectangle so a crop is a TRUE crop, matted on
  // clean parchment. The world plate is the data-fit crop — nothing to clip.
  const plateRect = () => ({ x: ox, y: oy, w: (BOUNDS.lonMax - BOUNDS.lonMin) * k, h: (BOUNDS.latMax - BOUNDS.latMin) * k });
  function beginPlateClip(c) {
    if (regionId === 'world') return false;
    const r = plateRect();
    c.save(); c.beginPath(); c.rect(r.x, r.y, r.w, r.h); c.clip();
    return true;
  }
  function inPlate(x, y, m = 0) {
    if (regionId === 'world') return true;
    const r = plateRect();
    return x >= r.x - m && x <= r.x + r.w + m && y >= r.y - m && y <= r.y + r.h + m;
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const vw = document.documentElement.clientWidth || window.innerWidth;
    const vh = window.innerHeight;
    // Regional plates EXPAND their authored crop to the viewport aspect so the
    // plate FILLS the screen — no letterbox mat, and routes run out through the
    // edges instead of terminating at a mid-screen plate edge (user tweak). The
    // crop only GROWS (extra surrounding ocean), so the authored ports/framing
    // stay in view. The equirectangular projection makes pixel-aspect = spanLon/
    // spanLat, so match that to vw/vh.
    if (regionId !== 'world') {
      let { lonMin, lonMax, latMin, latMax } = designedBounds;
      const sLon = lonMax - lonMin, sLat = latMax - latMin, target = vw / vh, cur = sLon / sLat;
      if (cur < target) { const add = (sLat * target - sLon) / 2; lonMin -= add; lonMax += add; }
      else if (cur > target) { const add = (sLon / target - sLat) / 2; latMin -= add; latMax += add; }
      BOUNDS = { lonMin, lonMax, latMin, latMax };
    } else BOUNDS = WORLD_BOUNDS;
    const spanLon = BOUNDS.lonMax - BOUNDS.lonMin, spanLat = BOUNDS.latMax - BOUNDS.latMin;
    // The world plate CONTAINs on width (Japan and Sitka stay on screen; parchment
    // letterboxes top/bottom), with a readability floor on narrow screens. Regional
    // plates are aspect-matched above, so width-fit fills both axes.
    const MIN_MAP_H = 460;                           // px readability floor
    const kContain = vw / spanLon;
    if (regionId !== 'world') { k = kContain; W = vw; }
    else if (kContain * spanLat >= MIN_MAP_H) { k = kContain; W = vw; }
    else { k = MIN_MAP_H / spanLat; W = Math.max(vw, Math.ceil(spanLon * k)); }
    H = vh;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    canvas.width = W * dpr; canvas.height = H * dpr;
    ox = (W - spanLon * k) / 2; oy = (H - spanLat * k) / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildBase();
    renderOverlay();      // the overlay buffer projects through the new bounds
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

    // graticule (the projection grid): every 15° on the world plate, tightening
    // to 10°/5° on regional crops so the grid stays present without crowding.
    // Snap each line's constant axis to a half-pixel so every meridian/parallel
    // renders with identical crispness (otherwise whichever line happens to
    // align to a device pixel looks bolder). Positions computed from ox/k
    // directly — project() wraps +180° back to −180°, which collapsed every
    // parallel to a zero-length line (the S2 full-globe bounds regression).
    // The plate rarely matches the viewport's ratio, so its edges can sit
    // mid-screen in the letterbox parchment; each line overshoots the plate
    // edge there and dissolves over GRAT_FADE px instead of stopping dead
    // (an edge flush with the canvas gets no overshoot — nothing to fade into).
    c.lineWidth = 1;
    const spanLon = BOUNDS.lonMax - BOUNDS.lonMin;
    const step = spanLon >= 120 ? 15 : spanLon >= 60 ? 10 : 5;
    const xL = ox, xR = ox + spanLon * k;
    const yT = oy, yB = oy + (BOUNDS.latMax - BOUNDS.latMin) * k;
    const yT0 = Math.max(0, yT - GRAT_FADE), yB0 = Math.min(H, yB + GRAT_FADE);
    const xL0 = Math.max(0, xL - GRAT_FADE), xR0 = Math.min(W, xR + GRAT_FADE);
    for (let lon = Math.ceil(BOUNDS.lonMin / step) * step; lon <= BOUNDS.lonMax; lon += step) {
      const x = Math.round(ox + (lon - BOUNDS.lonMin) * k) + 0.5;
      gratLine(c, true, x, yT0, yT, yB, yB0);
    }
    for (let lat = Math.ceil(BOUNDS.latMin / step) * step; lat <= BOUNDS.latMax; lat += step) {
      const y = Math.round(oy + (BOUNDS.latMax - lat) * k) + 0.5;
      gratLine(c, false, y, xL0, xL, xR, xR0);
    }

    // land (clipped to the plate rectangle on regional crops — no mat bleed)
    c.lineJoin = 'round';
    const landClip = beginPlateClip(c);
    for (const f of land.features) drawGeom(c, f.geometry);
    // the Great Lakes: cut as inland water (sea paper + tint) with a shore stroke
    c.lineWidth = 0.7;
    for (const lake of GREAT_LAKES) {
      c.beginPath();
      for (let i = 0; i < lake.length; i++) { const [x, y] = project(lake[i][0], lake[i][1]); i ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.closePath();
      c.fillStyle = PAPER; c.fill();
      c.fillStyle = SEA_TINT; c.fill();
      c.strokeStyle = LAND_EDGE; c.stroke();
    }
    if (landClip) c.restore();

    // ports: compute each label's placement now (collision-avoiding, once per
    // resize) and cache it in portDraw; the dots + labels are drawn per-frame in
    // drawPorts(), each inked normally or greyed by whether traffic reached the
    // port in the past sim-year. Placement caches per (resize, name-year):
    // era-named ports (Louisbourg=St John's, Kingston=Port Royal…) change text
    // width when the flowing year crosses a rename, so drawPorts rebuilds then.
    // dots use the DISPLAY coord (snapped to the coastline in build-data) so a
    // port whose routing coord sits offshore still draws on the shore.
    portScreen = ports.map(p => { const [x, y] = project(p.displayLon ?? p.lon, p.displayLat ?? p.lat); return { id: p.id, x, y, kind: p.kind, zone: p.zone }; });
    computePortLabels(c, labelYear);
  }

  // Decide where each port's name sits, caching the result in portDraw. With 66
  // ports the labels crowd Europe badly, so each tries anchors best-first — right
  // of the dot, then left, above, below — taking the first that clears the chart
  // edges, the labels already placed, and the neighbouring dots. A label with
  // nowhere to go is dropped (the dot still shows); ports like Acapulco (hard by
  // Veracruz) now find a spot instead of vanishing.
  function computePortLabels(c, year) {
    c.save();
    c.font = `11px "Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif`;
    const placed = [];   // committed label rects
    const dots = portScreen.map(ps => ({ x0: ps.x - 5, y0: ps.y - 5, x1: ps.x + 5, y1: ps.y + 5 }));
    portDraw = ports.map((p, i) => ({ id: p.id, x: portScreen[i].x, y: portScreen[i].y, name: displayName(p, year), label: null, kind: p.kind, zone: p.zone }));
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
  // is supplied) are inked normally. `lifecycle` = {existing, ruined} from
  // world.portLifecycleAt: a port not yet founded is absent from the chart
  // entirely; a destroyed/abandoned one draws as a faint ruin mark (the chart
  // remembers) — dashed open ring, label only while selected via the panel.
  // `named` = the set of ports whose NAME should be drawn (the port-names policy,
  // computed in main.js: decade-active ports in 'default', the busiest in 'active',
  // empty in 'none'). null = draw every name. A selected port always shows its
  // name regardless, so a clicked-but-quiet port can still be identified.
  function drawPorts(active, lifecycle, selectedPortId, year, named) {
    // rebuild label text+placement when the flowing year moves (era renames
    // change label widths); integer-year granularity keeps this rare and cheap
    if (year != null && year !== labelYear) { labelYear = year; computePortLabels(ctx, year); }
    const showName = pd => pd.label && (pd.id === selectedPortId || !named || named.has(pd.id));
    for (const pd of portDraw) {
      if (!inPlate(pd.x, pd.y, 4)) continue;   // dot outside the regional crop
      if (lifecycle && !lifecycle.existing.has(pd.id)) {
        if (!lifecycle.ruined.has(pd.id)) continue;        // not yet founded
        drawRuin(pd.x, pd.y);                               // fell / abandoned
        if (pd.id === selectedPortId && pd.label)
          label(ctx, pd.name, pd.label.ax, pd.label.ay, 11, INK_DIM, pd.label.align);
        continue;
      }
      const on = !active || active.has(pd.id);
      const col = on ? INK : INK_DIM;
      // a whaling ground is an AREA, not a harbour: draw it as a soft dashed
      // zone with a fluke at its heart, and hang the name above the oval.
      if (pd.kind === 'grounds') {
        const [rx, ry] = zoneRadii(pd);
        drawGroundsZone(pd.x, pd.y, rx, ry, col, on);
        if (pd.id === selectedPortId || !named || named.has(pd.id))
          label(ctx, pd.name, pd.x, pd.y - ry - 5, 11, col, 'center');
        continue;
      }
      ctx.save();
      ctx.fillStyle = col; ctx.strokeStyle = col;
      ctx.beginPath(); ctx.arc(pd.x, pd.y, 2.6, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = on ? 0.5 : 0.35; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(pd.x, pd.y, 5.2, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      if (showName(pd)) label(ctx, pd.name, pd.label.ax, pd.label.ay, 11, col, pd.label.align);
    }
  }

  // Zone extent in px: the grounds' geographic size (degrees) times the current
  // projection scale, so the oval grows on regional crops and shrinks on the
  // world plate — a real area, not a fixed blob. Floored so it stays legible.
  function zoneRadii(pd) {
    const z = pd.zone || { rx: 6, ry: 4 };
    return [Math.max(11, z.rx * k), Math.max(8, z.ry * k)];
  }
  // A whaling-ground zone: faint fill, a dashed rim, and a small whale-fluke at
  // the nominal centre.
  function drawGroundsZone(x, y, rx, ry, col, on) {
    ctx.save();
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(90,70,45,0.06)'; ctx.fill();
    ctx.setLineDash([4, 3.5]); ctx.lineWidth = 1; ctx.strokeStyle = col;
    ctx.globalAlpha = on ? 0.55 : 0.4; ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = on ? 0.7 : 0.45; ctx.lineWidth = 1.1;
    // a minimal fluke: two shallow lobes dipping from a central notch
    const f = 4.2;
    ctx.beginPath();
    ctx.moveTo(x - f, y - f * 0.5);
    ctx.quadraticCurveTo(x - f * 0.3, y + f * 0.2, x, y - f * 0.15);
    ctx.quadraticCurveTo(x + f * 0.3, y + f * 0.2, x + f, y - f * 0.5);
    ctx.stroke();
    ctx.restore();
  }

  // A destroyed / abandoned port: the chart remembers where it stood but marks it
  // a ruin — a broken (dashed) ring struck through by a small cross, in faded ink.
  function drawRuin(x, y) {
    ctx.save();
    ctx.strokeStyle = INK_DIM; ctx.globalAlpha = 0.6; ctx.lineWidth = 1;
    ctx.setLineDash([2.4, 2.4]);
    ctx.beginPath(); ctx.arc(x, y, 3.8, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); ctx.lineWidth = 0.9; ctx.globalAlpha = 0.5;
    const r = 1.7;
    ctx.beginPath();
    ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r);
    ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r);
    ctx.stroke();
    ctx.restore();
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

  // A graticule stroke whose ends dissolve: full ink between a1..b1 (the plate
  // interior), fading to nothing across the overshoot to a0/b0 (the letterbox
  // bleed). `pos` is the line's constant coordinate; vertical picks the axis.
  const GRAT_FADE = 56;                        // px of dissolve past the plate edge
  const INK_FAINT_0 = 'rgba(58,44,28,0)';      // INK_FAINT, fully transparent
  function gratLine(c, vertical, pos, a0, a1, b1, b0) {
    const span = b0 - a0;
    if (span <= 0) return;
    const t = v => Math.min(1, Math.max(0, (v - a0) / span));
    const g = vertical ? c.createLinearGradient(0, a0, 0, b0)
                       : c.createLinearGradient(a0, 0, b0, 0);
    g.addColorStop(0, INK_FAINT_0);
    g.addColorStop(t(a1), INK_FAINT);
    g.addColorStop(t(b1), INK_FAINT);
    g.addColorStop(1, INK_FAINT_0);
    c.strokeStyle = g;
    if (vertical) line(c, [pos, a0], [pos, b0]);
    else line(c, [a0, pos], [b0, pos]);
  }

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
  // The overlay is drawn to its own offscreen canvas and blitted per frame:
  // lane weights drift era-slow, so main.js refreshes it on the ~5 Hz HUD
  // throttle (and at toggle/filter time) via setOverlay — 261 polylines cost
  // one drawImage per frame, not a re-stroke. overlayData = { season,
  // laneWeights, visible }: this world's realized flow weight per era-active
  // lane (world.laneWeightsAt) — the overlay shows the traffic the sim is
  // actually sampling — and `visible`, an optional Set of lane ids (the layers
  // filter; null = every lane). Faint→bold so the busiest lanes sit on top;
  // brightness normalizes within the VISIBLE set, so an isolated basin's own
  // hierarchy reads instead of drowning under the Atlantic's.
  let overlay = null, overlayData = null;
  function setOverlay(data) { overlayData = data; renderOverlay(); }
  function renderOverlay() {
    if (!overlayData) { overlay = null; return; }
    const { season, laneWeights, visible } = overlayData;
    const wts = laneWeights || {};
    if (!overlay) overlay = document.createElement('canvas');
    if (overlay.width !== W * dpr || overlay.height !== H * dpr) {
      overlay.width = W * dpr; overlay.height = H * dpr;
    }
    const c = overlay.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    const active = [];
    let maxEff = 0;
    for (const rl of routeLines) {
      if (visible && !visible.has(rl.id)) continue;   // layer toggled off
      const eff = wts[rl.id];
      if (!eff) continue;                        // era-inactive or zero-flow lane
      active.push({ rl, eff });
      if (eff > maxEff) maxEff = eff;
    }
    if (!maxEff) return;
    active.sort((a, b) => a.eff - b.eff);
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (const { rl, eff } of active) {
      const coords = rl.coordsBySeason[season] || rl.coordsBySeason.jja || Object.values(rl.coordsBySeason)[0];
      if (!coords) continue;
      const f = eff / maxEff;
      c.strokeStyle = hexA(rl.color, 0.22 + 0.5 * f);
      c.lineWidth = 1.2 + 5.5 * f;
      c.beginPath();
      tracePath(c, coords);
      c.stroke();
    }
  }

  // ---- dynamic frame ------------------------------------------------------
  function draw(snapshot, selectedId, selectedPortId, t, activePorts, selectedWreckId, lifecycle, namedPorts) {
    if (base) ctx.drawImage(base, 0, 0, W, H);
    // display year: clamped through the epilogue reset ramp (1850→1860), as
    // everything era-keyed is — port names/lifecycle read the era-end year there.
    const dispYear = snapshot.reset > 0 ? 1850 : snapshot.year;
    // The dynamic layer (ports, overlay, ships, wrecks) is clipped to the plate
    // rectangle on regional crops, matching the base land — so nothing renders in
    // the parchment mat outside the crop.
    const dynClip = beginPlateClip(ctx);
    drawPorts(activePorts, lifecycle, selectedPortId, dispYear, namedPorts);

    const vessels = snapshot.vessels;
    if (overlay) ctx.drawImage(overlay, 0, 0, W, H);
    if (selectedPortId) drawPortFocus(snapshot, selectedPortId);
    const selected = vessels.find(v => v.id === selectedId);
    if (selected) drawSelectedRoute(selected, t);

    if (showWrecks) drawWrecks(snapshot.wrecks || [], snapshot.simClock, selectedWreckId);
    for (const v of vessels) drawVessel(v, v.id === selectedId, t);
    if (dynClip) ctx.restore();

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
    // wake (length is a perf knob; 0 = none — drop any history so a re-enable
    // later doesn't streak a stale line across the chart)
    if (!perf.wakeLength) { wakes.delete(v.id); }
    else {
      let w = wakes.get(v.id); if (!w) { w = []; wakes.set(v.id, w); }
      const last = w[w.length - 1];
      if (!last || Math.hypot(last[0] - x, last[1] - y) > 1.5) { w.push([x, y]); if (w.length > perf.wakeLength) w.shift(); }
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
  function pickAt(px, py, snapshot, lifecycle) {
    let vBest = null, vd = 15 * 15;
    for (const v of snapshot.vessels) {
      if (v.status === 'lost') continue;
      const [x, y] = project(v.pos.lon, v.pos.lat);
      const d = (x - px) ** 2 + (y - py) ** 2;
      if (d < vd) { vd = d; vBest = v.id; }
    }
    let wBest = null, wd = 12 * 12;
    for (const w of (showWrecks ? snapshot.wrecks || [] : [])) {
      const [x, y] = project(w.lon, w.lat);
      const d = (x - px) ** 2 + (y - py) ** 2;
      if (d < wd) { wd = d; wBest = w.id; }
    }
    let pBest = null, pd = 13 * 13;
    for (const ps of portScreen) {
      // a not-yet-founded port isn't on the chart and can't be clicked; a
      // ruined one keeps its mark and stays inspectable
      if (lifecycle && !lifecycle.existing.has(ps.id) && !lifecycle.ruined.has(ps.id)) continue;
      if (ps.kind === 'grounds') {
        // a zone picks anywhere inside its oval (mapped into the point metric)
        const [rx, ry] = zoneRadii(ps);
        const nd = ((px - ps.x) / rx) ** 2 + ((py - ps.y) / ry) ** 2;
        if (nd <= 1) { const d = nd * 100; if (d < pd) { pd = d; pBest = ps.id; } }
        continue;
      }
      const d = (ps.x - px) ** 2 + (ps.y - py) ** 2;
      if (d < pd) { pd = d; pBest = ps.id; }
    }
    // Ports are precise, PERMANENT targets: a click right on the dot (inside
    // its outer ring, ~8px) takes the port even when a transient ship is
    // drifting fractionally nearer — she'll have moved by the next click; the
    // port is what was aimed at. Beyond the ring, nearest-wins as before.
    if (pBest != null && pd <= 8 * 8) return { type: 'port', id: pBest };
    const cands = [];
    if (vBest != null) cands.push({ type: 'vessel', id: vBest, d: vd });
    if (wBest != null) cands.push({ type: 'wreck', id: wBest, d: wd });
    if (pBest != null) cands.push({ type: 'port', id: pBest, d: pd });
    if (!cands.length) return null;
    cands.sort((a, b) => a.d - b.d);
    return { type: cands[0].type, id: cands[0].id };
  }

  function setWrecks(v) { showWrecks = !!v; }
  return { resize, draw, pickAt, project, setPerf, setRegion, setOverlay, setWrecks };
}
