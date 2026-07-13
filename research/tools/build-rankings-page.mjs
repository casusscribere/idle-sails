// Regenerates research/ports-1550-1815.html from the canonical JSON (now carrying
// topByDecade 1–10 AND tier2ByDecade 11–20). Renders the ranked top-10 heatmap
// with the unranked second tier as a faint outlined band beneath it.
import { readFileSync, writeFileSync } from "node:fs";
const J=JSON.parse(readFileSync("/home/kirk/REPOS_LINUX/idle_sails/research/port-rankings-1550-1815.json","utf8"));
const DEC=J.decades;
const METRICS=Object.fromEntries(Object.entries(J.metrics).map(([k,m])=>[k,{label:m.label,unit:m.unit,basis:m.basis,top:m.topByDecade,t2:m.tier2ByDecade}]));
const ARCS={
 ships:[["Antwerp's cliff-edge","Pre-eminent northern entrepôt of the mid-16th century, gone from the top tier after the Scheldt was closed in <b>1585</b>."],["Amsterdam's long reign","Top-10 in 26 of 27 decades — the hinge of the Baltic trade and the VOC."],["The second tier","Below the leaders sit the coasting hubs — Rouen, Bremen, the Spanish and Italian ports, Bristol between its peaks."]],
 tonnage:[["The coal fleet","Newcastle's colliers top the tonnage board; Sunderland and Whitby ride the second tier on coal alone."],["Indiamen tip the scale","Batavia and Canton break in on tonnage despite few hulls; Bombay and Madras follow in the second tier."],["Baltic bulk holds","Danzig, Riga and Königsberg keep a tonnage rank the Mediterranean coasters lose."]],
 value:[["Silver first","Seville, then Cádiz, ride the American silver flow near the top of the value board."],["Tea remakes the top","Canton climbs to 2nd by the 1790s; the second tier fills with Madras, Bombay, Manila and the Caribbean sugar ports."],["Bulk falls away","Danzig and the timber ports slide down — their cargoes worth little per ton."]]
};
const data=JSON.stringify({DEC,METRICS,ARCS,SRC:J.sources.map(s=>[s.title,s.author,s.note,s.confidence,s.url])});

const html=`<title>The World's Busiest Ports, 1550–1815 — top 20 by ship count, tonnage & value</title>
<style>
:root{--paper:#e8dcc0;--paper-2:#f1e7d0;--card:#efe4cc;--ink:#3a2c1c;--ink-soft:#6d5837;--faint:#8a7452;--edge:#c3ab82;--rule:#a98f66;--accent:#9e2b25;--brass:#8a6a2c;--t1:#5f3f22;--t2:#9c7642;--t3:#d8c095;--grid-line:rgba(90,70,45,.16);--serif:"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif;--sans:"Avenir Next","Segoe UI",system-ui,-apple-system,sans-serif}
@media (prefers-color-scheme:dark){:root{--paper:#211711;--paper-2:#2a1f15;--card:#2c2016;--ink:#ecdcbc;--ink-soft:#b39a74;--faint:#8f7a58;--edge:#463527;--rule:#5c472f;--accent:#e0937a;--brass:#c8a24e;--t1:#e7c286;--t2:#a9834e;--t3:#5a4630;--grid-line:rgba(230,214,180,.12)}}
:root[data-theme=light]{--paper:#e8dcc0;--paper-2:#f1e7d0;--card:#efe4cc;--ink:#3a2c1c;--ink-soft:#6d5837;--faint:#8a7452;--edge:#c3ab82;--rule:#a98f66;--accent:#9e2b25;--brass:#8a6a2c;--t1:#5f3f22;--t2:#9c7642;--t3:#d8c095;--grid-line:rgba(90,70,45,.16)}
:root[data-theme=dark]{--paper:#211711;--paper-2:#2a1f15;--card:#2c2016;--ink:#ecdcbc;--ink-soft:#b39a74;--faint:#8f7a58;--edge:#463527;--rule:#5c472f;--accent:#e0937a;--brass:#c8a24e;--t1:#e7c286;--t2:#a9834e;--t3:#5a4630;--grid-line:rgba(230,214,180,.12)}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans);line-height:1.55;background-image:radial-gradient(120% 80% at 50% -10%,var(--paper-2),var(--paper) 70%);-webkit-font-smoothing:antialiased}
.wrap{max-width:1160px;margin:0 auto;padding:44px 22px 80px}
.rule{height:2px;background:var(--ink);opacity:.82}.rule.thin{height:1px;opacity:.45}
.eyebrow{font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:var(--ink-soft);margin:12px 0 8px}
h1{font-family:var(--serif);font-weight:600;line-height:1.03;font-size:clamp(30px,5.2vw,54px);margin:0 0 6px;text-wrap:balance}
h1 .yrs{color:var(--accent);font-variant-numeric:tabular-nums}
.dek{font-family:var(--serif);font-style:italic;font-size:clamp(16px,2vw,20px);color:var(--ink-soft);margin:6px 0 14px;max-width:62ch;text-wrap:balance}
h2{font-family:var(--serif);font-weight:600;font-size:24px;margin:48px 0 4px}h2 .n{color:var(--accent);font-variant-numeric:tabular-nums;margin-right:.5em}
.sub{color:var(--ink-soft);font-size:14px;margin:0 0 18px;max-width:72ch}
.switch{display:inline-flex;border:1px solid var(--edge);border-radius:22px;background:var(--card);padding:3px;margin:8px 0 2px;flex-wrap:wrap}
.switch button{font:inherit;font-size:14px;border:none;background:none;color:var(--ink-soft);padding:8px 16px;border-radius:19px;cursor:pointer;font-family:var(--serif)}
.switch button[aria-pressed=true]{background:var(--accent);color:#f4ead0}
.basis{font-size:13.5px;color:var(--ink-soft);max-width:80ch;margin:12px 0 0;min-height:2.6em}.basis b{font-family:var(--serif);color:var(--ink)}
.caution{display:flex;gap:14px;align-items:flex-start;background:var(--card);border:1px solid var(--edge);border-left:3px solid var(--accent);padding:14px 16px;border-radius:3px;margin:22px 0 0;font-size:14.5px}.caution b{font-family:var(--serif)}
.tablewrap{overflow-x:auto;border:1px solid var(--edge);border-radius:4px;background:var(--card)}
table.rank{border-collapse:collapse;width:100%;font-size:14.5px}
table.rank th,table.rank td{padding:9px 14px;text-align:left;border-bottom:1px solid var(--grid-line);white-space:nowrap}
table.rank thead th{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft);font-weight:600;background:var(--paper-2)}
table.rank td.port{font-family:var(--serif);font-size:16px}table.rank .num{text-align:right;font-variant-numeric:tabular-nums}
table.rank tr:last-child td{border-bottom:none}table.rank td .rk{display:inline-block;width:2.2em;color:var(--faint);font-variant-numeric:tabular-nums}
.bar{height:9px;border-radius:2px;background:linear-gradient(90deg,var(--t1),var(--t2));display:inline-block;vertical-align:middle}
.bar.t2b{background:repeating-linear-gradient(90deg,var(--t2),var(--t2) 3px,transparent 3px,transparent 5px);opacity:.7}
.era{color:var(--ink-soft);font-variant-numeric:tabular-nums}
.gridwrap{overflow-x:auto;border:1px solid var(--edge);border-radius:4px;background:var(--card)}
table.grid{border-collapse:separate;border-spacing:0;font-size:12px}
table.grid thead th{position:sticky;top:0;z-index:3;background:var(--paper-2);font-weight:600;color:var(--ink-soft);font-variant-numeric:tabular-nums;font-size:10.5px;height:34px;min-width:26px;border-bottom:1px solid var(--rule);writing-mode:vertical-rl;text-orientation:mixed;padding:6px 0}
table.grid thead th.corner,table.grid thead th.tot{writing-mode:horizontal-tb}
th.rowlab,td.rowlab{position:sticky;left:0;z-index:2;background:var(--paper-2);text-align:left;font-family:var(--serif);font-size:14px;white-space:nowrap;padding:0 14px 0 12px;min-width:140px;border-right:1px solid var(--rule);height:26px}
thead th.corner{z-index:4;left:0;position:sticky;min-width:140px;text-align:left;padding-left:12px;font-family:var(--sans);text-transform:uppercase;letter-spacing:.1em;font-size:10px}
thead th.tot{min-width:52px;padding:0 8px;position:sticky;right:0;z-index:3;border-left:1px solid var(--rule)}
td.tot{position:sticky;right:0;background:var(--paper-2);border-left:1px solid var(--rule);text-align:center;font-variant-numeric:tabular-nums;font-size:12px;border-bottom:1px solid var(--grid-line)}
td.tot b{font-weight:700}td.tot .t2c{color:var(--faint);font-weight:400}
td.cell{width:26px;min-width:26px;height:26px;border-bottom:1px solid var(--grid-line);border-right:1px solid var(--grid-line);text-align:center}
td.cell.t1{background:var(--t1)}td.cell.t2{background:var(--t2)}td.cell.t3{background:var(--t3)}
td.cell.t4{background:transparent;box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--t2) 55%,transparent)}
tr.mid td.rowlab{color:var(--ink-soft);font-style:italic}
tr.prow:hover td.cell,tr.prow:hover td.rowlab{outline:1px solid var(--accent);outline-offset:-1px}
tr.prow td.rowlab .rk{color:var(--faint);font-family:var(--sans);font-size:11px;margin-right:7px;font-variant-numeric:tabular-nums}
.legend{display:flex;gap:18px;flex-wrap:wrap;align-items:center;margin:14px 0 0;font-size:12.5px;color:var(--ink-soft)}
.legend .sw{display:inline-block;width:15px;height:15px;border-radius:3px;vertical-align:-3px;margin-right:6px;border:1px solid var(--rule)}
.legend .sw.t4{background:transparent;box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--t2) 55%,transparent);border-color:transparent}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:8px}
.arc{background:var(--card);border:1px solid var(--edge);border-radius:4px;padding:14px 16px}.arc h3{font-family:var(--serif);font-size:16px;margin:0 0 4px}.arc p{margin:0;font-size:13.5px;color:var(--ink-soft)}.arc b{color:var(--accent)}
.prose p{max-width:72ch;font-size:15px}.prose b{font-family:var(--serif)}
ul.src{list-style:none;padding:0;margin:10px 0 0;max-width:82ch}ul.src li{padding:9px 0;border-bottom:1px solid var(--grid-line);font-size:13.5px;color:var(--ink-soft)}ul.src li b{color:var(--ink);font-family:var(--sans)}
ul.src .conf{display:inline-block;font-size:10px;letter-spacing:.08em;text-transform:uppercase;padding:1px 7px;border-radius:10px;border:1px solid var(--rule);margin-left:6px;vertical-align:1px}
a{color:var(--accent);text-decoration:none;border-bottom:1px solid color-mix(in srgb,var(--accent) 40%,transparent)}a:hover{border-bottom-color:var(--accent)}
footer{margin-top:54px;padding-top:16px;border-top:1px solid var(--rule);font-size:12.5px;color:var(--faint)}
.toggle{position:fixed;top:12px;right:12px;z-index:20;background:var(--card);border:1px solid var(--edge);color:var(--ink-soft);border-radius:20px;padding:6px 12px;font:inherit;font-size:12px;cursor:pointer}
#tip{position:fixed;z-index:30;pointer-events:none;background:var(--ink);color:var(--paper);font-size:12px;padding:5px 9px;border-radius:4px;opacity:0;transition:opacity .1s;white-space:nowrap;font-variant-numeric:tabular-nums}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
<button class="toggle" id="themeBtn" aria-label="Toggle light or dark">◑ theme</button>
<div id="tip" role="status"></div>
<div class="wrap">
<header><div class="rule"></div>
<div class="eyebrow">A decade-by-decade ledger of world shipping · three metrics · top 20</div>
<h1>The World's Busiest Ports<br><span class="yrs">1550 – 1815</span></h1>
<p class="dek">The same 27 decades, ranked three ways — by ships, tonnage and value. The top ten are ranked; the next ten (11–20) form an unranked second tier, shown faint.</p>
<div class="rule thin"></div></header>
<div class="caution"><div>⚓</div><div><b>A scholarly reconstruction, not a census.</b> No single comparable series counts every port's shipping each decade. Anchored to hard regional records where they exist (Sound Toll Registers, Dutch-Asiatic Shipping, the Carrera de Indias, English customs), informed estimate elsewhere. The <b>top ten are ranked</b>; ranks <b>11–20 are a set, not an order</b> — membership is plausible, precise position is not. Switch the metric to see the board change.</div></div>
<div class="switch" id="switch" role="group" aria-label="Ranking metric"></div>
<p class="basis" id="basis"></p>
<section><h2><span class="n">1</span>The persistence ranking</h2>
<p class="sub" id="rankSub"></p>
<div class="tablewrap"><table class="rank"><thead><tr><th>Port</th><th class="num">Decades<br>in top 10</th><th class="num">+ tier 2</th><th>Span in top 10</th><th>Peak</th><th style="width:26%">Presence</th></tr></thead><tbody id="rankBody"></tbody></table></div></section>
<section><h2><span class="n">2</span>The presence grid <span style="font-size:14px;color:var(--faint);font-family:var(--sans);font-weight:400">· top 20</span></h2>
<p class="sub">Every decade's top twenty, read <em>down</em> a column; every port's arc, read <em>across</em>. Solid = ranked top-10 standing; the faint outline = the second tier (11–20). Σ shows top-10 decades · +tier-2.</p>
<div class="legend"><span><span class="sw" style="background:var(--t1)"></span>Leading (≈1–3)</span><span><span class="sw" style="background:var(--t2)"></span>Major (≈4–6)</span><span><span class="sw" style="background:var(--t3)"></span>Top ten (≈7–10)</span><span><span class="sw t4"></span>Second tier (11–20)</span></div>
<div class="gridwrap" style="margin-top:14px"><table class="grid" id="grid"></table></div></section>
<section><h2><span class="n">3</span>What this metric shows</h2><div class="cards" id="arcs"></div></section>
<section class="prose"><h2><span class="n">4</span>Method, units &amp; caveats</h2>
<p><b>Three lenses, three answers.</b> Ship movements favour dense coasting and bulk hubs; tonnage rewards large ships; value rewards rich cargoes. The top ten are a defensible synthesis; the <b>second tier is deliberately unranked</b> — past rank ~10 the evidence can support <em>membership</em> but not fine order.</p>
<p><b>Units are not interchangeable</b>, and per-port granularity is thinnest in the earliest decades (Sound Toll destinations only from the mid-1660s; pre-1618 cargo data unreliable). The 1810s covers 1810–1815.</p>
${J.boundary ? `<p><b>Declared boundary.</b> ${J.boundary.replace(/^DECLARED BOUNDARY \(PLAN-3 §1\): /, "")}</p>` : ""}
<h2 style="font-size:19px;margin-top:30px">Anchoring sources (verified)</h2><ul class="src" id="srcList"></ul></section>
<footer>Compiled for the <b>Idle Sails</b> project · top-20 per-decade synthesis · data: research/port-rankings-1550-1815.json · research/port-top20-1550-1815.csv</footer>
</div>
<script>
const D=${data};
const tierOf=r=>r<=3?1:r<=6?2:3;
const decLabel=d=>(d%100===0?d:"'"+String(d).slice(2))+"s";
const ordN=n=>n+["th","st","nd","rd"][(n%100>>3^1)&&n%10<4?n%10:0];
function stats(m){const P={};
 D.DEC.forEach(d=>{m.top[d].forEach((p,i)=>{(P[p]??=({name:p,t:{},t2:0,c:0,s:0,peak:99,first:9999,last:0}));const r=i+1;P[p].t[d]=r;P[p].c++;P[p].s+=11-r;P[p].peak=Math.min(P[p].peak,r);P[p].first=Math.min(P[p].first,d);P[p].last=Math.max(P[p].last,d);});
  m.t2[d].forEach(p=>{(P[p]??=({name:p,t:{},t2:0,c:0,s:0,peak:99,first:9999,last:0}));P[p].t2++;P[p]["_t2_"+d]=1;});});
 return P;}
let metric="ships";
const sw=document.getElementById('switch');
Object.entries(D.METRICS).forEach(([k,m])=>{const b=document.createElement('button');b.textContent=m.label;b.dataset.k=k;b.setAttribute('aria-pressed',k===metric);b.onclick=()=>{metric=k;render();};sw.appendChild(b);});
function render(){
 const m=D.METRICS[metric],P=stats(m);
 const ranked=Object.values(P).filter(p=>p.c>0).sort((a,b)=>b.c-a.c||b.s-a.s||a.first-b.first);
 const maxC=ranked[0].c;
 [...sw.children].forEach(b=>b.setAttribute('aria-pressed',b.dataset.k===metric));
 document.getElementById('basis').innerHTML="<b>"+m.label+" — "+m.unit+".</b> "+m.basis;
 document.getElementById('rankSub').textContent="Ports by decades in the ranked top ten (of 27), by "+m.label.toLowerCase()+"; the '+ tier 2' column counts decades spent in the 11–20 band.";
 const rb=document.getElementById('rankBody');rb.innerHTML="";
 ranked.forEach((p,i)=>{const w=Math.round(100*p.c/maxC),w2=Math.round(100*p.t2/maxC);const tr=document.createElement('tr');
  tr.innerHTML='<td class="port"><span class="rk">'+(i+1)+'.</span>'+p.name+'</td><td class="num">'+p.c+'</td><td class="num" style="color:var(--faint)">'+(p.t2||'·')+'</td><td class="era">'+p.first+'s – '+(p.last===1810?"1810s*":p.last+"s")+'</td><td class="era">'+ordN(p.peak)+'</td><td><span class="bar" style="width:'+w+'%"></span>'+(p.t2?'<span class="bar t2b" style="width:'+w2+'%"></span>':'')+'</td>';rb.appendChild(tr);});
 // grid rows: ranked ports first, then tier-2-only ports
 const t2only=Object.values(P).filter(p=>p.c===0).sort((a,b)=>b.t2-a.t2||a.first-b.first);
 const all=ranked.concat(t2only);
 let h='<thead><tr><th class="corner">Port ↓ · Decade →</th>';D.DEC.forEach(d=>h+='<th>'+decLabel(d)+'</th>');h+='<th class="tot">Σ</th></tr></thead><tbody>';
 all.forEach((p,i)=>{h+='<tr class="prow'+(p.c===0?' mid':'')+'"><td class="rowlab"><span class="rk">'+(i+1)+'</span>'+p.name+'</td>';
  D.DEC.forEach(d=>{const r=p.t[d];if(r){h+='<td class="cell t'+tierOf(r)+'" data-p="'+p.name+'" data-d="'+decLabel(d)+'" data-r="'+r+'"></td>';}
   else if(p["_t2_"+d]){h+='<td class="cell t4" data-p="'+p.name+'" data-d="'+decLabel(d)+'" data-r="0"></td>';}
   else h+='<td class="cell"></td>';});
  h+='<td class="tot"><b>'+p.c+'</b>'+(p.t2?' <span class="t2c">+'+p.t2+'</span>':'')+'</td></tr>';});
 document.getElementById('grid').innerHTML=h+'</tbody>';
 const ac=document.getElementById('arcs');ac.innerHTML="";D.ARCS[metric].forEach(a=>{const el=document.createElement('div');el.className='arc';el.innerHTML='<h3>'+a[0]+'</h3><p>'+a[1]+'</p>';ac.appendChild(el);});
}
render();
const g=document.getElementById('grid'),tip=document.getElementById('tip');
g.addEventListener('mousemove',e=>{const c=e.target.closest('td.cell');if(c&&c.dataset.p){tip.textContent=c.dataset.p+' · '+c.dataset.d+' · '+(c.dataset.r>0?'~'+ordN(+c.dataset.r):'2nd tier (11–20)');tip.style.opacity=1;tip.style.left=Math.min(e.clientX+12,innerWidth-tip.offsetWidth-8)+'px';tip.style.top=(e.clientY+14)+'px';}else tip.style.opacity=0;});
g.addEventListener('mouseleave',()=>tip.style.opacity=0);
const sl=document.getElementById('srcList');D.SRC.forEach(s=>{const li=document.createElement('li');li.innerHTML='<b>'+s[0]+'</b> <span class="conf">'+s[3]+'</span><br>'+s[1]+' — '+s[2]+' <a href="'+s[4]+'" target="_blank" rel="noopener">source ↗</a>';sl.appendChild(li);});
document.getElementById('themeBtn').onclick=()=>{const c=document.documentElement.getAttribute('data-theme');document.documentElement.setAttribute('data-theme',c?(c==='dark'?'light':'dark'):(matchMedia('(prefers-color-scheme: dark)').matches?'light':'dark'));};
</script>`;
writeFileSync("/home/kirk/REPOS_LINUX/idle_sails/research/ports-1550-1815.html","<!doctype html><meta charset=\"utf-8\">"+html);
writeFileSync("/home/kirk/.claude/jobs/f075e4c1/tmp/ports20.html","<!doctype html><meta charset=\"utf-8\">"+html);
console.log("regenerated research/ports-1550-1815.html with the second tier");
