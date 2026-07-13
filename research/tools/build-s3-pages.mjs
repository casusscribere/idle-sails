// PLAN-3 S3 — the historiography surfaced: two reference pages in the house
// parchment style.
//   silences.html        — the silences register, rendered ("The chart's silences")
//   flow-prominence.html — per-decade port prominence DERIVED from the flow
//                          matrix (an output, not an input), sim-sailable marked
//   node research/tools/build-s3-pages.mjs

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const ROOT = "/home/kirk/REPOS_LINUX/idle_sails";
const load = (p) => JSON.parse(readFileSync(`${ROOT}/${p}`, "utf8"));
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const CSS = `
:root{--paper:#e8dcc0;--paper-2:#f1e7d0;--card:#efe4cc;--ink:#3a2c1c;--ink-soft:#6d5837;--faint:#8a7452;--edge:#c3ab82;--rule:#a98f66;--accent:#9e2b25;--grid-line:rgba(90,70,45,.16);--serif:"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif;--sans:"Avenir Next","Segoe UI",system-ui,-apple-system,sans-serif}
@media (prefers-color-scheme:dark){:root{--paper:#211711;--paper-2:#2a1f15;--card:#2c2016;--ink:#ecdcbc;--ink-soft:#b39a74;--faint:#8f7a58;--edge:#463527;--rule:#5c472f;--accent:#e0937a;--grid-line:rgba(230,214,180,.12)}}
:root[data-theme="light"]{--paper:#e8dcc0;--paper-2:#f1e7d0;--card:#efe4cc;--ink:#3a2c1c;--ink-soft:#6d5837;--faint:#8a7452;--edge:#c3ab82;--rule:#a98f66;--accent:#9e2b25;--grid-line:rgba(90,70,45,.16)}
:root[data-theme="dark"]{--paper:#211711;--paper-2:#2a1f15;--card:#2c2016;--ink:#ecdcbc;--ink-soft:#b39a74;--faint:#8f7a58;--edge:#463527;--rule:#5c472f;--accent:#e0937a;--grid-line:rgba(230,214,180,.12)}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans);line-height:1.55;background-image:radial-gradient(120% 80% at 50% -10%,var(--paper-2),var(--paper) 70%)}
.wrap{max-width:960px;margin:0 auto;padding:40px 22px 70px}
.eyebrow{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-soft)}
h1{font-family:var(--serif);font-size:clamp(26px,4.6vw,40px);line-height:1.12;margin:8px 0 10px;text-wrap:balance}
.dek{font-family:var(--serif);font-style:italic;font-size:16.5px;color:var(--ink-soft);max-width:64ch;margin:0 0 8px}
.rule{height:2px;background:var(--rule);opacity:.5;margin:20px 0}
.card{background:var(--card);border:1px solid var(--edge);border-radius:5px;padding:16px 18px;margin:14px 0}
.card h2{font-family:var(--serif);font-size:19px;margin:0 0 4px}
.badges{margin:0 0 8px}
.badge{display:inline-block;font-size:10px;letter-spacing:.13em;text-transform:uppercase;border:1px solid var(--edge);border-radius:3px;padding:2px 8px;margin-right:6px;color:var(--ink-soft)}
.badge.asserted{background:rgba(158,43,37,.1);color:var(--accent);border-color:var(--accent)}
.badge.gestured{background:rgba(90,70,45,.08)}
.card p{margin:6px 0 0;font-size:14.5px;max-width:76ch}
.pointer{font-size:12.5px;color:var(--ink-soft);font-style:italic}
.note{font-size:13.5px;color:var(--ink-soft);max-width:76ch}
table{border-collapse:collapse;width:100%;font-size:13.5px;min-width:680px}
.tablewrap{overflow-x:auto;border:1px solid var(--edge);border-radius:4px;background:var(--card);margin-top:12px}
th,td{padding:6px 9px;border-bottom:1px solid var(--grid-line);white-space:nowrap;text-align:left}
thead th{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft);background:var(--paper-2);position:sticky;top:0}
td.dec{color:var(--faint);font-variant-numeric:tabular-nums}
.port{font-family:var(--serif)}
.unsail{opacity:.62}
.unsail .port::after{content:" °";color:var(--accent)}
.foot{margin-top:34px;font-size:12.5px;color:var(--faint)}
a{color:var(--ink)}`;

// ═══ 1. The chart's silences ═══
const S = load("research/flows/silences.json");
const TREAT_LABEL = { asserted: "answered — asserted", gestured: "gestured", excluded: "excluded, on record" };
const REASON_LABEL = { "excluded-by-basis": "excluded by a declared basis", "unrecorded": "never recorded", "evasion": "silent by evasion", "fishery-not-trade": "a fishery, not a lane", "not-yet-reconstructed": "not yet reconstructed" };
const cards = S.silences.map(e => `
<div class="card">
  <h2>${esc(e.note.split(" — ")[0].split(".")[0].length < 70 ? e.id.replace(/-/g, " ") : e.id.replace(/-/g, " "))}</h2>
  <p class="badges"><span class="badge ${e.treatment}">${esc(TREAT_LABEL[e.treatment] || e.treatment)}</span><span class="badge">${esc(REASON_LABEL[e.reason] || e.reason)}</span><span class="badge">${esc(e.scope)}</span></p>
  <p>${esc(e.note)}</p>
  ${e.pointer ? `<p class="pointer">Answered by the flow system <b>${esc(e.pointer)}</b> — its voyages sail the chart, and their ledgers say so.</p>` : ""}
</div>`).join("");

const silencesHtml = `<!doctype html><meta charset="utf-8"><title>The chart's silences — Idle Sails research</title>
<style>${CSS}</style>
<div class="wrap">
<p class="eyebrow">Idle Sails · research · the flow matrix</p>
<h1>The chart&rsquo;s silences</h1>
<p class="dek">The archive is not the past. Every dataset behind this chart began as someone&rsquo;s decision to
count — a toll register, a customs house, a company ledger — and the seas those institutions did not watch
left no numbers behind. This page records the flows we know existed and cannot (or choose not to) quantify:
each with the reason for its silence, and what the chart does about it.</p>
<p class="note">Every trade in the simulation carries an <b>evidence class</b> — <i>counted</i> (a surviving series),
<i>proxied</i> (inferred from adjacent records), <i>reconstructed</i> (scholarship&rsquo;s estimate), or
<i>asserted</i> (our own stated guess, wide bounds, reasoning on record). The rule beneath them all:
<b>a known trade is never silently zero</b> — because in a living chart, zero is not neutrality;
it is a claim, repeated every simulated day, that the ships weren&rsquo;t there.</p>
<div class="rule"></div>
${cards}
<p class="foot">Idle Sails · PLAN-3 (flows, evidence, and silences) · data: research/flows/silences.json ·
after M.-R. Trouillot, <i>Silencing the Past</i> — silences enter at the making of sources, of archives,
of narratives, and of history. ° An unsailable port on the companion prominence page marks the same thing at sea.</p>
</div>`;
writeFileSync(`${ROOT}/research/silences.html`, silencesHtml);
console.log(`✓ silences.html (${S.silences.length} entries)`);

// ═══ 2. Flow-derived prominence ═══
const basins = readdirSync(`${ROOT}/research/flows`).filter(f => f.endsWith(".json") && f !== "silences.json");
const simPorts = new Set(load("data-src/ports.json").ports.map(p => p.id));
const prom = {}, names = {}, sailable = {};
for (const f of basins) {
  const B = load(`research/flows/${f}`);
  const proxy = Object.fromEntries(B.ports.map(p => [p.id, p.simProxy]));
  for (const p of B.ports) { names[p.id] = p.name; sailable[p.id] = p.simProxy !== null && simPorts.has(p.simProxy); }
  for (const s of B.systems) for (const [d, v] of Object.entries(s.byDecade)) {
    const mid = (v.voyagesPerYear[0] + v.voyagesPerYear[1]) / 2;
    for (const l of s.lanes) for (const pid of [l.from, l.to]) {
      prom[pid] = prom[pid] || {}; prom[pid][d] = (prom[pid][d] || 0) + mid * l.share / 2;
    }
  }
}
const DEC = []; for (let d = 1550; d <= 1810; d += 10) DEC.push(d);
const rows = DEC.map(d => {
  const top = Object.entries(prom).map(([p, m]) => [p, m[d] || 0]).sort((a, b) => b[1] - a[1]).slice(0, 10);
  return `<tr><td class="dec">${d}s</td>${top.map(([p, v]) =>
    `<td class="${sailable[p] ? "" : "unsail"}"><span class="port">${esc(names[p] || p)}</span> <span style="color:var(--faint);font-variant-numeric:tabular-nums">${Math.round(v)}</span></td>`).join("")}</tr>`;
}).join("");

const promHtml = `<!doctype html><meta charset="utf-8"><title>Flow-derived port prominence, 1550–1815 — Idle Sails research</title>
<style>${CSS}</style>
<div class="wrap">
<p class="eyebrow">Idle Sails · research · the flow matrix</p>
<h1>Port prominence, derived from the flows</h1>
<p class="dek">Under PLAN-3 a port&rsquo;s prominence is an <b>output</b> — the sum of trade-system voyages
touching it per decade (midpoints of the authored ranges) — not a load-bearing input. This is the world
the flow matrix describes; compare it with the <a href="ports-1550-1815.html">counted-record rankings</a>
to see what the European archive could and could not show.</p>
<p class="note">Figures are voyage-touches per year (each voyage counts half to each endpoint).
A <b>°</b> marks a port not yet sailable in the simulation (no baked routes — its flows are recorded,
not rendered). Istanbul, Shanghai, and Tianjin in the early decades are the point of the whole exercise:
ports the ranked record could not represent, restored by evidence-classed reconstruction.</p>
<div class="tablewrap"><table>
<thead><tr><th>Decade</th>${Array.from({ length: 10 }, (_, i) => `<th>#${i + 1}</th>`).join("")}</tr></thead>
<tbody>${rows}</tbody></table></div>
<p class="foot">Idle Sails · PLAN-3 · derived from research/flows/*.json (60 systems × 27 decades) ·
regenerate with research/tools/build-s3-pages.mjs · see also <a href="silences.html">The chart&rsquo;s silences</a></p>
</div>`;
writeFileSync(`${ROOT}/research/flow-prominence.html`, promHtml);
console.log("✓ flow-prominence.html");
