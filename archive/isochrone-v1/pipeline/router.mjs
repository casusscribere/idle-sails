// Least-time sailing router: Dijkstra over the ocean grid with anisotropic edge
// costs from the seasonal wind field, the vessel polar, and surface currents.
import { GRID } from './config.mjs';
import { haversine, bearing, angDiff, makeGridIndex } from './geo.mjs';
import { windAt, currentAt } from './windfield.mjs';
import { boatSpeed } from './polar.mjs';

const gi = makeGridIndex(GRID);
const { cols, rows } = GRID;
const D2R = Math.PI / 180;
const NB = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

// Minimal binary min-heap keyed by float priority.
class Heap {
  constructor() { this.p = []; this.v = []; }
  get size() { return this.p.length; }
  push(pr, val) {
    const p = this.p, v = this.v; let i = p.length; p.push(pr); v.push(val);
    while (i > 0) { const j = (i - 1) >> 1; if (p[j] <= p[i]) break;[p[i], p[j]] = [p[j], p[i]];[v[i], v[j]] = [v[j], v[i]]; i = j; }
  }
  pop() {
    const p = this.p, v = this.v, n = p.length - 1, top = v[0];
    p[0] = p[n]; v[0] = v[n]; p.pop(); v.pop();
    let i = 0; const m = p.length;
    while (true) {
      let l = 2 * i + 1, r = l + 1, s = i;
      if (l < m && p[l] < p[s]) s = l;
      if (r < m && p[r] < p[s]) s = r;
      if (s === i) break;[p[i], p[s]] = [p[s], p[i]];[v[i], v[s]] = [v[s], v[i]]; i = s;
    }
    return top;
  }
}

export function snapToOcean(mask, lon, lat) {
  let c = gi.colOf(lon), r = gi.rowOf(lat);
  if (mask[gi.idx(c, r)] === 0) return [c, r];
  for (let rad = 1; rad < 12; rad++)
    for (let dr = -rad; dr <= rad; dr++)
      for (let dc = -rad; dc <= rad; dc++) {
        const cc = (c + dc + cols) % cols, rr = r + dr;
        if (rr >= 0 && rr < rows && mask[gi.idx(cc, rr)] === 0) return [cc, rr];
      }
  return [c, r];
}

// Returns { time: Float64Array (seconds), prev: Int32Array (source cell index) }.
export function route(mask, vessel, season, srcCol, srcRow) {
  const N = cols * rows;
  const time = new Float64Array(N).fill(Infinity);
  const prev = new Int32Array(N).fill(-1);
  const done = new Uint8Array(N);
  const src = gi.idx(srcCol, srcRow);
  time[src] = 0;
  const heap = new Heap(); heap.push(0, src);

  while (heap.size) {
    const u = heap.pop();
    if (done[u]) continue; done[u] = 1;
    const uc = u % cols, ur = (u / cols) | 0;
    const ulat = gi.latOf(ur), ulon = gi.lonOf(uc);
    for (const [dc, dr] of NB) {
      const vr = ur + dr; if (vr < 0 || vr >= rows) continue;
      const vc = (uc + dc + cols) % cols;
      const vv = gi.idx(vc, vr);
      if (mask[vv] === 1 || done[vv]) continue;
      const vlat = gi.latOf(vr), vlon = gi.lonOf(vc);
      const mlat = (ulat + vlat) / 2, mlon = (ulon + vlon) / 2;
      const dist = haversine(ulat, ulon, vlat, vlon);
      const hdg = bearing(ulat, ulon, vlat, vlon);
      const w = windAt(mlat, mlon, season);
      const twa = angDiff(hdg, w.wdir);
      let spd = boatSpeed(vessel, twa, w.wspd);
      const cur = currentAt(mlat, mlon, season);
      if (cur.cspd > 0) spd += cur.cspd * Math.cos(angDiff(hdg, cur.cdir) * D2R);
      if (spd < 0.4) spd = 0.4; // light-air working floor (~0.8 kn: steerage way, tacking, drift)
      const nt = time[u] + dist / spd;
      if (nt < time[vv]) { time[vv] = nt; prev[vv] = u; heap.push(nt, vv); }
    }
  }
  return { time, prev };
}
