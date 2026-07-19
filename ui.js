// ui.js — the spectator's entire control surface: a speed instrument and a
// click-to-inspect vessel ledger, plus ambient counters, an optional legend,
// and an optional events log (losses + wars).
// Pure DOM; reads world snapshots handed in by main.js.

import { shipGlyphPath } from './render.js';

const $ = (id) => document.getElementById(id);
const SEASON_LABEL = { djf: 'Winter', mam: 'Spring', jja: 'Summer', son: 'Autumn' };
const SEC_PER_DAY = 86400;

// era-honest port name (ctx carries the clamped flowing year + world.portNameAt)
const eraName = (ctx, port) =>
  ((ctx.portNameAt && ctx.year != null) ? ctx.portNameAt(port, ctx.year) : port.name).replace(/\s*\(.*\)/, '');

// Era label for the flowing 1550–1850 clock: the period the world is sailing
// through, keyed by first year. During the epilogue reset ramp (year > 1850, a
// designed 10-year decade 1850→1860, PLAN-6) the age of sail winds down and the
// chart is redrawn back to the 1550s — steam is a DECLARED BOUNDARY surfaced here,
// never sailed (the wind engine cannot make a steamer; see research/about.html).
const ERAS = [
  [1550, 'the Iberian age'],
  [1602, 'the Dutch golden age'],
  [1652, 'the contest for trade'],
  [1700, 'the Atlantic system'],
  [1756, 'the wars for empire'],
  [1793, 'the Napoleonic wars'],
  [1815, 'the long peace']
];
function eraLabel(year, reset) {
  if (reset > 0) return '1850 — the age of sail closes; steam begins beyond this chart';
  let label = ERAS[0][1];
  for (const [from, name] of ERAS) { if (year >= from) label = name; else break; }
  return label;
}

// Speed slider (0–1000) → sim-seconds per real-second, log scale. 0 = paused.
const SPD_MIN = 8640;              // 0.1 sim-day / real-sec
const SPD_MAX = 5_184_000;         // 60 sim-days / real-sec
export function speedFromSlider(s) {
  if (s <= 0) return 0;
  return SPD_MIN * Math.pow(SPD_MAX / SPD_MIN, (s - 1) / 999);
}
function speedLabel(mult) {
  if (mult <= 0) return 'paused';
  const dps = mult / SEC_PER_DAY;
  if (dps >= 1) return `≈ ${dps < 10 ? dps.toFixed(1) : Math.round(dps)} days / sec`;
  return `≈ ${(mult / 3600).toFixed(1)} hours / sec`;
}

export function createUI({ onSpeed, onClose, onSelectVessel, onTogglePin, onSelectTracked }) {
  const els = {
    date: $('date'), season: $('season'), era: $('era'),
    cSea: $('c-sea'), cArr: $('c-arr'), cLost: $('c-lost'),
    speed: $('speed'), speedRead: $('speed-read'),
    ledger: $('ledger'), ledgerBody: $('ledger-body'),
    hint: $('hint')
  };

  els.speed.addEventListener('input', () => {
    const mult = speedFromSlider(+els.speed.value);
    els.speedRead.textContent = speedLabel(mult);
    onSpeed(mult);
  });
  // initialise readout from the markup's default value
  els.speedRead.textContent = speedLabel(speedFromSlider(+els.speed.value));

  $('ledger-close').addEventListener('click', () => { hideLedger(); onClose && onClose(); });
  // clicking a vessel row in the port view opens that vessel's ledger; the
  // follow/unfollow control pins her to the tracker
  els.ledgerBody.addEventListener('click', (e) => {
    const pb = e.target.closest('[data-pin]');
    if (pb && onTogglePin) { onTogglePin(+pb.dataset.pin); return; }
    const li = e.target.closest('[data-vid]');
    if (li && onSelectVessel) onSelectVessel(+li.dataset.vid);
  });
  // clicking a tracker row opens that vessel's ledger (live or kept record)
  const trackerBody = $('tracker-body');
  if (trackerBody) trackerBody.addEventListener('click', (e) => {
    const li = e.target.closest('[data-tid]');
    if (li && onSelectTracked) onSelectTracked(+li.dataset.tid);
  });

  function updateHUD(snap) {
    els.date.textContent = snap.date;
    els.season.textContent = SEASON_LABEL[snap.season] || '';
    if (els.era) els.era.textContent = eraLabel(snap.year, snap.reset);
    els.cSea.textContent = snap.counters.atSea;
    els.cArr.textContent = snap.counters.arrived;
    els.cLost.textContent = snap.counters.lost;
  }

  function showLedger(v, ctx) {
    const { portById, cargoById, simClock } = ctx;
    const flag = `<span class="flag" style="background:${v.flagColor}"></span>`;
    const cargoTxt = v.cargoId === 'ballast' ? 'in ballast (empty)' : v.cargoName;

    const legs = v.schedule.map((seg, i) => {
      const from = eraName(ctx, portById.get(seg.from));
      const to = eraName(ctx, portById.get(seg.to));
      const days = Math.round((seg.arrive - seg.depart) / SEC_PER_DAY);
      const now = i === v.pos.legIndex && v.status === 'sailing';
      let eta = '';
      if (now) { const rem = Math.max(0, Math.round((seg.arrive - simClock) / SEC_PER_DAY)); eta = ` · ~${rem}d to run`; }
      return `<li class="${now ? 'now' : ''}"><span>${from} → ${to}</span><span class="dur">${days}d${eta}</span></li>`;
    }).join('');

    let status = '';
    if (v.status === 'lost') status = `<p class="war">Lost — ${escapeHtml(v.fate.cause)}${v.fate.war ? ' (' + escapeHtml(v.fate.war.name) + ')' : ''}.</p>`;
    else if (v.status === 'arrived') status = `<p>Safely arrived.</p>`;

    // PLAN-3 S3 — the historiography, one sober line: what kind of evidence
    // stands behind the trade this voyage samples.
    const EVIDENCE_LINE = {
      counted: 'This voyage samples a counted trade — a surviving series records it.',
      proxied: 'This voyage samples a proxied trade — inferred from adjacent records.',
      reconstructed: 'This voyage stands for a reconstructed trade — scholarship’s estimate, not a surviving ledger.',
      asserted: 'This voyage stands for an asserted trade — a stated estimate where the archive is silent.',
      state: 'A state voyage — outside the commercial record.'
    };
    const evidence = v.evidence && EVIDENCE_LINE[v.evidence]
      ? `<p class="evidence">${escapeHtml(EVIDENCE_LINE[v.evidence])}</p>` : '';

    let mp = '';
    if (v.middlePassage) {
      const fr = cargoById.get('enslaved-people').framing;
      // Atlantic lanes carry the Middle-Passage framing; other coerced flows
      // (the Black Sea trade at Kaffa) carry their lane's own sober text.
      const atlantic = v.system === 'atlantic-slave' || v.system === 'middle-passage';
      const title = atlantic ? 'The Middle Passage' : 'Coerced human transport';
      const body = (!atlantic && v.laneFraming) ? v.laneFraming : fr.description;
      mp = `<div class="mp-note"><strong>${escapeHtml(title)}</strong>${escapeHtml(body)}</div>`;
    }

    // follow/unfollow: pins her to the tracker so her story is kept (ctx
    // carries pinState only when a tracker exists — the pin cap is a
    // performance setting)
    const ps = ctx.pinState;
    const pin = ps
      ? `<button class="pin-btn" data-pin="${v.id}"${!ps.pinned && !ps.canPin ? ' disabled title="No more pins at this performance setting"' : ''}>${ps.pinned ? 'Unfollow' : 'Follow'}</button>`
      : '';

    // the shipmaster (feature pass 3): naval commanders are captains, merchant
    // shipmasters are masters; cultures whose title travels in the name
    // (Nakhoda …, … Reis, Daeng …) read correctly under either label
    const master = v.captain
      ? `<dt>${v.isNaval ? 'Captain' : 'Master'}</dt><dd>${escapeHtml(v.captain)}</dd>` : '';

    els.ledgerBody.innerHTML = `
      ${pin}
      <h2>${escapeHtml((v.prefix ? v.prefix + ' ' : '') + v.name)}</h2>
      <p class="type">${escapeHtml(v.typeName)} · ${escapeHtml(v.rig)} · of ${v.year}</p>
      <dl>
        <dt>Allegiance</dt><dd>${flag}${escapeHtml(v.powerName)}</dd>
        ${master}
        <dt>Tonnage</dt><dd>${v.tonnage} tons</dd>
        <dt>Cargo</dt><dd>${escapeHtml(cargoTxt)}</dd>
        <dt>Company</dt><dd>${v.guns} guns · ${v.crew} hands</dd>
      </dl>
      ${status}
      <p class="section-h">Itinerary — ${escapeHtml(v.laneName)}</p>
      <ul class="leglist">${legs}</ul>
      ${evidence}
      ${mp}`;
    els.ledger.hidden = false;
    els.hint && els.hint.classList.add('gone');
  }
  // Port view: the ships currently outbound from this port (on a leg that left
  // here) and inbound to it (on a leg headed here). Current leg only — vessels
  // that merely called here on an earlier leg are not shown.
  function showPort(port, traffic, ctx) {
    const { portById, powerById, simClock, year } = ctx;
    const nm = (id) => eraName(ctx, portById.get(id));
    const power = powerById.get(port.power);

    // Port lifecycle: a bounded port shows its window; one past its end shows a
    // ruin banner + its note instead of traffic lists (there is no traffic).
    const lifeline = port.active
      ? `<p class="type">est. ${port.active.from}${port.active.to < 1850 ? ` · until ${port.active.to}` : ''}</p>` : '';
    if (port.active && year != null && year > port.active.to) {
      els.ledgerBody.innerHTML = `
        <h2>${escapeHtml(nm(port.id))}</h2>
        <p class="type">${escapeHtml(power ? power.name : port.power)} · ${escapeHtml(port.region.replace(/-/g, ' '))}</p>
        ${lifeline}
        <p class="war">In ruin — this harbour's trade ended in ${port.active.to}.</p>
        ${port.note ? `<p class="muted">${escapeHtml(port.note)}</p>` : ''}`;
      els.ledger.hidden = false;
      els.hint && els.hint.classList.add('gone');
      return;
    }

    const row = (v, dir) => {
      const seg = v.schedule[v.pos.legIndex];
      let when, other;
      if (dir === 'out') {
        const ago = Math.max(0, Math.round((simClock - seg.depart) / SEC_PER_DAY));
        other = `for ${nm(v.pos.to)}`; when = ago === 0 ? 'sailed today' : `sailed ${ago}d ago`;
      } else {
        const due = Math.max(0, Math.round((seg.arrive - simClock) / SEC_PER_DAY));
        other = `from ${nm(v.pos.from)}`; when = due === 0 ? 'due today' : `due ~${due}d`;
      }
      return `<li data-vid="${v.id}" tabindex="0">
        <span><span class="flag" style="background:${v.flagColor}"></span>${escapeHtml((v.prefix ? v.prefix + ' ' : '') + v.name)} <em>${escapeHtml(v.typeName)}</em></span>
        <span class="dur">${escapeHtml(other)} · ${when}</span></li>`;
    };
    const list = (arr, dir, empty) => arr.length
      ? `<ul class="leglist portlist">${arr.slice(0, 30).map(v => row(v, dir)).join('')}</ul>${arr.length > 30 ? `<p class="muted">…and ${arr.length - 30} more</p>` : ''}`
      : `<p class="muted">${empty}</p>`;

    // Port history (feature pass 1): the recorded calls already in the past —
    // world.portHistoryOf, depth bounded by the performance setting. Distinct
    // from the live lists above: this is the port's MEMORY, not its present.
    const hist = ctx.portHistory && ctx.portHistory.length ? `
      <p class="section-h">Lately called</p>
      <ul class="leglist">${ctx.portHistory.slice(0, 12).map(e => {
        const ago = Math.max(0, Math.round((simClock - e.t) / SEC_PER_DAY));
        const agoTxt = ago === 0 ? 'today' : `${ago}d ago`;
        return `<li><span>${escapeHtml(e.name)} <em>${escapeHtml(e.type)}</em></span><span class="dur">${e.dir === 'out' ? 'sailed' : 'came in'} · ${agoTxt}</span></li>`;
      }).join('')}</ul>` : '';

    els.ledgerBody.innerHTML = `
      <h2>${escapeHtml(nm(port.id))}</h2>
      <p class="type">${escapeHtml(power ? power.name : port.power)} · ${escapeHtml(port.region.replace(/-/g, ' '))}</p>
      ${lifeline}
      <p class="section-h">Outbound — lately sailed (${traffic.outbound.length})</p>
      ${list(traffic.outbound, 'out', 'No vessels have lately cleared this port.')}
      <p class="section-h">Inbound — standing in (${traffic.inbound.length})</p>
      ${list(traffic.inbound, 'in', 'No vessels are presently bound here.')}
      ${hist}`;
    els.ledger.hidden = false;
    els.hint && els.hint.classList.add('gone');
  }

  // Wreck view: what ship was lost here, on what day, and how. Static — the
  // loss is a fact of the past; nothing in it ticks.
  function showWreck(w, ctx) {
    const { portById, simClock } = ctx;
    const flag = `<span class="flag" style="background:${w.flagColor}"></span>`;
    const near = portById.get(w.nearPortId);
    const daysAgo = Math.max(0, Math.round((simClock - w.at) / SEC_PER_DAY));
    const agoTxt = daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo} days since`;
    const cargoTxt = w.cargoId === 'ballast' ? 'in ballast (empty)' : w.cargoName;

    // Sober treatment where the loss is also a mass death of captives: factual,
    // no value framing — the Middle-Passage charter extends to the wreck.
    let mp = '';
    if (w.middlePassage) {
      const atlantic = w.system === 'atlantic-slave' || w.system === 'middle-passage';
      const title = atlantic ? 'The Middle Passage' : 'Coerced human transport';
      mp = `<div class="mp-note"><strong>${escapeHtml(title)}</strong>She sailed with enslaved people held captive aboard; they were lost with the ship.</div>`;
    }

    els.ledgerBody.innerHTML = `
      <h2>${escapeHtml((w.prefix ? w.prefix + ' ' : '') + w.name)}</h2>
      <p class="type">${escapeHtml(w.typeName)} · wreck</p>
      <p class="war">Lost ${escapeHtml(w.date)} — ${escapeHtml(w.cause)}${w.war ? ' (' + escapeHtml(w.war) + ')' : ''}${(w.nearPortName || near) ? ', off ' + escapeHtml((w.nearPortName || near.name).replace(/\s*\(.*\)/, '')) + ' approaches' : ''}.</p>
      <dl>
        <dt>Allegiance</dt><dd>${flag}${escapeHtml(w.powerName)}</dd>
        ${w.captain ? `<dt>${w.isNaval ? 'Captain' : 'Master'}</dt><dd>${escapeHtml(w.captain)}</dd>` : ''}
        <dt>Tonnage</dt><dd>${w.tonnage} tons</dd>
        <dt>Cargo</dt><dd>${escapeHtml(cargoTxt)}</dd>
        <dt>Company</dt><dd>${w.crew} hands</dd>
        <dt>Wrecked</dt><dd>${escapeHtml(agoTxt)}</dd>
      </dl>
      ${mp}`;
    els.ledger.hidden = false;
    els.hint && els.hint.classList.add('gone');
  }

  function hideLedger() { els.ledger.hidden = true; }

  // Events log: the notable entries only — losses and wars. Departures and
  // arrivals stay out (the old ship ticker was removed on purpose; this panel
  // must not quietly rebuild it). Entries arrive pre-merged and time-sorted.
  function renderEvents(entries) {
    const body = $('events-body');
    if (!body) return;
    body.innerHTML = entries.length
      ? entries.map(e => `<li class="${e.kind === 'war-begin' || e.kind === 'loss' ? 'ev-bad' : ''}">
          <span class="ev-date">${escapeHtml(e.date)}</span><span>${escapeHtml(e.text)}</span></li>`).join('')
      : '<li class="ev-empty">The sea is quiet — no losses, no wars.</li>';
  }

  // Statistics: fleet totals, the hardest passages (losses by route), and the
  // cargo distribution. Pure display of the world's observation-layer tallies;
  // main.js shapes the view. Coerced human cargo appears factually in the
  // distribution, never framed as value — the charter extends here.
  function renderStats(view) {
    const body = $('stats-body');
    if (!body) return;
    const routes = view.routes.length ? `
      <p class="section-h">Hardest passages — losses by route</p>
      <ul class="st-list">${view.routes.map(r =>
        `<li><span>${escapeHtml(r.name)}</span><span class="dur">${r.lost} of ${r.spawned} · ${r.pct}%</span></li>`).join('')}</ul>` : '';
    const cargoes = view.cargoes.length ? `
      <p class="section-h">Cargoes carried</p>
      <ul class="st-list">${view.cargoes.map(c =>
        `<li><span>${escapeHtml(c.name)}</span><span class="dur">${c.pct}%</span></li>`).join('')}</ul>` : '';
    body.innerHTML = `
      <dl>
        <dt>Sailed</dt><dd>${view.spawned}</dd>
        <dt>Arrived</dt><dd>${view.arrived}</dd>
        <dt>Lost</dt><dd>${view.lost}${view.spawned ? ` · ${view.lossPct}% of sailings` : ''}</dd>
      </dl>
      ${routes}${cargoes}`;
  }

  // Tracker: the followed fleet — live vessels with their destination, retired
  // ones with their outcome. Click a row → her ledger (kept after she's gone).
  function renderTracker(rows) {
    const body = $('tracker-body');
    if (!body) return;
    body.innerHTML = rows.length ? `<ul class="leglist portlist">${rows.map(r => {
      const st = r.status === 'sailing' ? `for ${r.where}` : r.status === 'lost' ? 'lost' : 'arrived';
      return `<li data-tid="${r.id}" tabindex="0">
        <span><span class="flag" style="background:${r.flagColor}"></span>${escapeHtml((r.prefix ? r.prefix + ' ' : '') + r.name)} <em>${escapeHtml(r.typeName)}</em></span>
        <span class="dur${r.status === 'lost' ? ' war' : ''}">${escapeHtml(st)}</span></li>`;
    }).join('')}</ul>` : '<p class="muted">No vessels followed — open a ship’s ledger and follow her.</p>';
  }

  return { updateHUD, showLedger, showPort, showWreck, hideLedger, renderEvents, renderStats, renderTracker };
}

// ---- legend (static — built once from the same vocabulary the chart draws) --
// Shape = ship category (the five glyphs of render.js), colour = allegiance.
const LEGEND_GLYPHS = [
  ['merchant', 'Merchantman · brig · snow · sloop'],
  ['indiaman', 'Indiaman · fluyt · galleon · junk'],
  ['warship', 'Frigate · sloop-of-war'],
  ['line', 'Ship of the line'],
  ['slaver', 'Slave ship']
];
export function buildLegend({ powers }) {
  const body = $('legend-body');
  if (!body) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const glyphRow = ([cat, label]) => {
    const cw = 30, ch = 16;
    const c = document.createElement('canvas');
    c.width = cw * dpr; c.height = ch * dpr;
    c.style.width = cw + 'px'; c.style.height = ch + 'px';
    const g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.translate(cw / 2 - 1, ch / 2);
    const s = 6.5;
    shipGlyphPath(g, cat, s);
    g.fillStyle = '#d9c9a3'; g.fill();          // neutral hull — colour means flag
    g.lineWidth = 0.9; g.strokeStyle = '#3a2c1c'; g.stroke();
    if (cat === 'slaver') {                      // the sober transverse beam bar
      g.beginPath(); g.moveTo(0.05 * s, 0.52 * s); g.lineTo(0.05 * s, -0.52 * s);
      g.lineWidth = 1; g.stroke();
    }
    const row = document.createElement('div');
    row.className = 'lg-row';
    row.appendChild(c);
    const span = document.createElement('span');
    span.textContent = label;
    row.appendChild(span);
    return row;
  };
  // sections carry ids so the menu's toggle tree can show/hide each
  const ships = document.createElement('div');
  ships.id = 'lg-ships';
  ships.appendChild(sectionH('Ship types'));
  for (const gl of LEGEND_GLYPHS) ships.appendChild(glyphRow(gl));

  const flags = document.createElement('div');
  flags.id = 'lg-flags';
  flags.appendChild(sectionH('Allegiance'));
  const grid = document.createElement('div');
  grid.className = 'lg-flags';
  for (const p of [...powers].filter(p => p.color).sort((a, b) => a.name.localeCompare(b.name))) {
    const row = document.createElement('div');
    row.className = 'lg-row';
    row.innerHTML = `<span class="flag" style="background:${p.color}"></span><span>${escapeHtml(p.name)}</span>`;
    grid.appendChild(row);
  }
  flags.appendChild(grid);

  body.replaceChildren(ships, flags);
  function sectionH(text) {
    const h = document.createElement('p');
    h.className = 'section-h'; h.textContent = text;
    return h;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
