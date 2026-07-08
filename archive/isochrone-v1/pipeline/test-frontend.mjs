// Headless replica of the front-end's data path: contour a real field and
// reconstruct a downhill route, to validate the client algorithms without a browser.
import fs from 'node:fs';
import { contours as d3contours } from 'd3-contour';

const M = JSON.parse(fs.readFileSync(new URL('../docs/data/manifest.json', import.meta.url)));
const G = M.grid;
const buf = fs.readFileSync(new URL('../docs/data/fields/london_brig_jja.bin', import.meta.url));
const field = new Uint16Array(buf.buffer, buf.byteOffset, buf.length / 2);
const TH = [0.5, ...M.isoDays];

// --- buildContours (mirror of app.js) ---
const n = G.cols * G.rows, vals = new Float64Array(n);
let reach = 0;
for (let i = 0; i < n; i++) { const h = field[i]; if (h >= 65535) vals[i] = -1; else { vals[i] = h / 24; reach++; } }
const cs = d3contours().size([G.cols, G.rows]).thresholds(TH)(vals);
let polys = 0, pts = 0;
for (const g of cs) for (const poly of g.coordinates) for (const ring of poly) { polys++; pts += ring.length; }
console.log(`field: ${reach} reachable cells; contours: ${cs.length} levels, ${polys} rings, ${pts} vertices`);

// --- routeFrom (mirror of app.js) ---
const NB = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
const col = lon => Math.min(G.cols-1, Math.max(0, Math.floor((((lon+180)%360+360)%360)/G.res)));
const rowf = lat => Math.min(G.rows-1, Math.max(0, Math.floor((lat-G.lat0)/G.res)));
const lonOf = c => G.lon0 + (c+0.5)*G.res, latOf = r => G.lat0 + (r+0.5)*G.res;
function routeFrom(startIdx){
  if(field[startIdx]>=65535) return null;
  const pts=[]; let cur=startIdx, guard=0;
  while(guard++<40000){ const c=cur%G.cols, r=(cur/G.cols)|0; pts.push([lonOf(c),latOf(r)]);
    if(field[cur]===0) break; let best=cur,bv=field[cur];
    for(const [dc,dr] of NB){ const rr=r+dr; if(rr<0||rr>=G.rows)continue; const cc=(c+dc+G.cols)%G.cols, id=r*0+rr*G.cols+cc;
      if(field[id]<bv){bv=field[id];best=id;} }
    if(best===cur) break; cur=best; }
  return pts;
}
const kIdx = rowf(17.9)*G.cols + col(-76.8);
const rt = routeFrom(kIdx);
const end = rt[rt.length-1];
console.log(`route London->Kingston: ${rt.length} hops, ends near ${end[0].toFixed(1)},${end[1].toFixed(1)} (London src ~1.5,51.5), reached source=${field[kIdx]>0 && rt.length>2}`);
console.log('days at Kingston:', (field[kIdx]/24).toFixed(1));
