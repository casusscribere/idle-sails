/* Age of Sail isochronic passage chart — front-end.
   Loads precomputed Uint16 "hours-to-reach" fields, contours them client-side
   (d3-contour), traces best-fit routes by walking downhill on the time surface,
   and supports a destination-lookup (inverse) mode. */

const PALETTE = ['#1a9850','#66bd63','#a6d96a','#d9ef8b','#f7f7ac','#fee08b',
  '#fdae61','#f46d43','#d73027','#b2182b','#8c1010','#5f0016','#3a0020','#1c0012'];

const state = { set:'setA', portId:null, vesselId:'brig', seasonId:'jja', mode:'port' };
let M, G, TH, portsById={}, portsBySet={}, fieldCache=new Map(), curField=null, markers=[];
const $ = s => document.querySelector(s);

const map = new maplibregl.Map({
  container:'map',
  style:{ version:8, sources:{}, layers:[{id:'bg',type:'background',paint:{'background-color':'#a9bccf'}}] },
  center:[-20,25], zoom:1.6, minZoom:1, maxZoom:6, renderWorldCopies:true, attributionControl:false
});
map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');

/* ---- grid helpers ---- */
const cr2idx = (c,r) => r*G.cols + c;
const col = lon => { let x=Math.floor((((lon+180)%360+360)%360)/G.res); return Math.min(G.cols-1,Math.max(0,x)); };
const row = lat => Math.min(G.rows-1, Math.max(0, Math.floor((lat-G.lat0)/G.res)));
const lonOf = c => G.lon0 + (c+0.5)*G.res;
const latOf = r => G.lat0 + (r+0.5)*G.res;
const cell = (lon,lat) => cr2idx(col(lon),row(lat));

async function loadField(portId,vesselId,seasonId){
  const key = `${portId}_${vesselId}_${seasonId}`;
  if(fieldCache.has(key)) return fieldCache.get(key);
  const buf = await (await fetch(`data/fields/${key}.bin`)).arrayBuffer();
  const arr = new Uint16Array(buf);
  fieldCache.set(key,arr);
  return arr;
}

/* ---- isochrone contours ---- */
function buildContours(field){
  const n=G.cols*G.rows, vals=new Float64Array(n);
  for(let i=0;i<n;i++){ const h=field[i]; vals[i] = (h>=65535)? -1 : h/24; } // days; -1 = land/unreachable
  const contours = d3.contours().size([G.cols,G.rows]).thresholds(TH)(vals);
  const t=(X,Y)=>[G.lon0+(X+0.5)*G.res, G.lat0+(Y+0.5)*G.res]; // grid pt -> cell-center lon/lat
  const feats=[];
  contours.forEach((geo,i)=>{
    const coords=geo.coordinates.map(poly=>poly.map(ring=>ring.map(([x,y])=>t(x,y))));
    feats.push({type:'Feature',properties:{color:PALETTE[Math.min(i,PALETTE.length-1)]},
      geometry:{type:'MultiPolygon',coordinates:coords}});
  });
  return {type:'FeatureCollection',features:feats};
}

/* ---- downhill route reconstruction ---- */
const NB=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
function routeFrom(field,startIdx){
  if(field[startIdx]>=65535) return null;
  const pts=[]; let cur=startIdx, guard=0, prevLon=null;
  while(guard++<40000){
    const c=cur%G.cols, r=(cur/G.cols)|0;
    let lon=lonOf(c);
    if(prevLon!==null){ while(lon-prevLon>180)lon-=360; while(lon-prevLon<-180)lon+=360; }
    prevLon=lon; pts.push([lon,latOf(r)]);
    if(field[cur]===0) break;
    let best=cur,bv=field[cur];
    for(const [dc,dr] of NB){ const rr=r+dr; if(rr<0||rr>=G.rows)continue;
      const cc=(c+dc+G.cols)%G.cols, id=cr2idx(cc,rr);
      if(field[id]<bv){bv=field[id];best=id;} }
    if(best===cur) break; cur=best;
  }
  return pts;
}

/* ---- rendering ---- */
function setLineData(id,features){ map.getSource(id).setData({type:'FeatureCollection',features}); }

function showIsochrones(){
  map.getSource('iso').setData(curField ? buildContours(curField) : {type:'FeatureCollection',features:[]});
}

function drawPortMarkers(){
  markers.forEach(m=>m.remove()); markers=[];
  for(const p of portsBySet[state.set]){
    const el=document.createElement('div');
    const dot=document.createElement('div'); dot.className='portdot';
    const lab=document.createElement('div'); lab.className='portlabel'; lab.textContent=p.name;
    el.appendChild(dot); el.appendChild(lab);
    if(p.id===state.portId) dot.style.transform='scale(1.5)';
    const mk=new maplibregl.Marker({element:el,anchor:'center'}).setLngLat([p.srcLon,p.srcLat]).addTo(map);
    el.style.cursor='pointer';
    el.addEventListener('click',e=>{e.stopPropagation(); if(state.set===state.set){ $('#portSel').value=p.id; onPortChange(p.id);} });
    markers.push(mk);
  }
}

/* ---- mode: port isochrones (hover routes) ---- */
let rafPending=false;
function onMouseMovePort(e){
  if(state.mode!=='port'||!curField){return;}
  if(rafPending) return; rafPending=true;
  requestAnimationFrame(()=>{ rafPending=false;
    const idx=cell(e.lngLat.lng,e.lngLat.lat);
    const h=curField[idx];
    const tip=$('#tooltip');
    if(h>=65535){ tip.style.display='none'; setLineData('route',[]); return; }
    const days=h/24, rt=routeFrom(curField,idx);
    setLineData('route', rt?[{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:rt}}]:[]);
    const port=portsById[state.portId];
    tip.style.display='block'; tip.style.left=(e.point.x+14)+'px'; tip.style.top=(e.point.y+10)+'px';
    tip.innerHTML=`<b>${fmtDays(days)}</b><br><span style="font-size:11px;color:#6b5d47">from ${port.name}</span>`;
  });
}

/* ---- mode: destination lookup (inverse) ---- */
async function onClickDest(e){
  if(state.mode!=='dest') return;
  const idx=cell(e.lngLat.lng,e.lngLat.lat);
  const ports=portsBySet[state.set];
  const fields=await Promise.all(ports.map(p=>loadField(p.id,state.vesselId,state.seasonId)));
  const rows=[]; const routes=[];
  ports.forEach((p,i)=>{
    const f=fields[i], h=f[idx];
    if(h<65535){ rows.push({p,days:h/24}); const rt=routeFrom(f,idx); if(rt) routes.push({rt,days:h/24}); }
  });
  rows.sort((a,b)=>a.days-b.days);
  routes.sort((a,b)=>a.days-b.days);
  setLineData('route', routes.map((o,i)=>({type:'Feature',
    properties:{w:i===0?3:1.4,op:i===0?1:0.5}, geometry:{type:'LineString',coordinates:o.rt}})));
  map.getSource('destpt').setData({type:'FeatureCollection',
    features:[{type:'Feature',geometry:{type:'Point',coordinates:[e.lngLat.lng,e.lngLat.lat]}}]});
  const tip=$('#tooltip'); tip.style.display='none';
  renderRank(rows, e.lngLat);
}

function renderRank(rows,ll){
  const el=$('#rank');
  if(!rows.length){ el.innerHTML=`<div class="hint">No modelled sea route reaches that point from these ports.</div>`; return; }
  let h=`<label class="l">Times to ${ll.lat.toFixed(1)}°, ${ll.lng.toFixed(1)}° · ${vLabel()} · ${sLabel()}</label><table>`;
  rows.forEach((r,i)=>{ h+=`<tr><td><span class="rk">${i+1}</span>${r.p.name}</td><td class="d">${fmtDays(r.days)}</td></tr>`; });
  el.innerHTML=h+'</table>';
}

/* ---- misc ---- */
const vLabel=()=>M.vessels.find(v=>v.id===state.vesselId).name;
const sLabel=()=>M.seasons.find(s=>s.id===state.seasonId).label;
function fmtDays(d){ if(d<1) return '<1 day'; const w=d/7; if(d<21) return `${Math.round(d)} days`;
  if(d<120) return `${Math.round(d)} days (${w.toFixed(1)} wk)`; const mo=d/30.44; return `${Math.round(d)} days (${mo.toFixed(1)} mo)`; }

async function refresh(){
  $('#loading').style.display='block';
  curField = await loadField(state.portId,state.vesselId,state.seasonId);
  showIsochrones();
  setLineData('route',[]);
  if(state.mode==='dest') $('#rank').innerHTML='<div class="hint">Click any sea point to rank passage times from every port.</div>';
  else $('#rank').innerHTML='';
  $('#loading').style.display='none';
}
function onPortChange(id){ state.portId=id; $('#portNote').textContent=portsById[id].note||''; drawPortMarkers(); refresh(); }

function buildLegend(){
  const labels=['<7d','1–2 wk','2–3 wk','3–4 wk','4–6 wk','6–8 wk','8–13 wk','13–17 wk','17–21 wk','25 wk','~6 mo','~8 mo','~10 mo','>1 yr'];
  $('#legend').innerHTML=PALETTE.map((c,i)=>`<div class="lg"><span class="sw" style="background:${c}"></span>${labels[i]||''}</div>`).join('');
}
function buildValReport(){
  let h='<table><tr><th>class</th><th>leg</th><th>err</th></tr>';
  for(const rep of M.validation){ for(const l of rep.legs){
    h+=`<tr><td>${rep.vessel}</td><td>${l.leg}</td><td>${l.errPct>0?'+':''}${l.errPct}% <span class="tag">${l.role}</span></td></tr>`; } }
  $('#valreport').innerHTML=h+'</table>';
}

function populate(){
  const ps=$('#portSel'); ps.innerHTML=portsBySet[state.set].map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  $('#vesselSel').innerHTML=M.vessels.map(v=>`<option value="${v.id}">${v.name}</option>`).join('');
  $('#seasonSel').innerHTML=M.seasons.map(s=>`<option value="${s.id}">${s.label}</option>`).join('');
  $('#vesselSel').value=state.vesselId; $('#seasonSel').value=state.seasonId;
  state.portId=portsBySet[state.set][0].id; ps.value=state.portId;
  $('#portNote').textContent=portsById[state.portId].note||'';
}

/* ---- wiring ---- */
async function init(){
  M = await (await fetch('manifest.json')).json();
  G = M.grid; TH=[0.5,...M.isoDays];
  for(const k of ['setA','setB']){ portsBySet[k]=M.ports[k]; for(const p of M.ports[k]) portsById[p.id]=p; }
  const land = await (await fetch('assets/land.geojson')).json();

  map.addSource('iso',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
  map.addLayer({id:'iso',type:'fill',source:'iso',
    paint:{'fill-color':['get','color'],'fill-opacity':0.72,'fill-antialias':false}});
  map.addSource('land',{type:'geojson',data:land});
  map.addLayer({id:'land',type:'fill',source:'land',paint:{'fill-color':'#e8dcc0','fill-outline-color':'#b9a884'}});
  map.addSource('route',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
  map.addLayer({id:'route',type:'line',source:'route',
    paint:{'line-color':'#3a2f22','line-width':['coalesce',['get','w'],2.2],'line-opacity':['coalesce',['get','op'],0.9],'line-dasharray':[2,1.3]}});
  map.addSource('destpt',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
  map.addLayer({id:'destpt',type:'circle',source:'destpt',
    paint:{'circle-radius':5,'circle-color':'#1c1c1c','circle-stroke-color':'#f4ecd8','circle-stroke-width':2}});

  populate(); buildLegend(); buildValReport(); drawPortMarkers();
  await onPortChangeInit();

  $('#portSel').addEventListener('change',e=>onPortChange(e.target.value));
  $('#vesselSel').addEventListener('change',e=>{state.vesselId=e.target.value; refresh();});
  $('#seasonSel').addEventListener('change',e=>{state.seasonId=e.target.value; refresh();});
  $('#setSeg').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b)return;
    [...e.currentTarget.children].forEach(x=>x.classList.remove('on')); b.classList.add('on');
    state.set=b.dataset.set; populate(); drawPortMarkers(); onPortChange(state.portId);});
  $('#modeSeg').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b)return;
    [...e.currentTarget.children].forEach(x=>x.classList.remove('on')); b.classList.add('on');
    state.mode=b.dataset.mode; setLineData('route',[]); map.getSource('destpt').setData({type:'FeatureCollection',features:[]});
    $('#modeHint').textContent = state.mode==='port'
      ? 'Hover the sea to trace the best-fit route and read the passage time.'
      : 'Click any sea point to rank passage times from every port in the collection.';
    $('#tooltip').style.display='none';
    $('#rank').innerHTML = state.mode==='dest' ? '<div class="hint">Click any sea point to rank passage times from every port.</div>' : '';
  });
  map.on('mousemove',onMouseMovePort);
  map.on('mouseout',()=>{$('#tooltip').style.display='none';});
  map.on('click',onClickDest);
}
async function onPortChangeInit(){ state.portId=portsBySet[state.set][0].id; $('#portSel').value=state.portId; await refresh(); }

map.on('load',init);
