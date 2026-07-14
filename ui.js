// ui.js — the spectator's entire control surface: a speed instrument and a
// click-to-inspect vessel ledger, plus ambient counters.
// Pure DOM; reads world snapshots handed in by main.js.

const $ = (id) => document.getElementById(id);
const SEASON_LABEL = { djf: 'Winter', mam: 'Spring', jja: 'Summer', son: 'Autumn' };
const SEC_PER_DAY = 86400;

// Era label for the flowing 1550–1815 clock: the period the world is sailing
// through, keyed by first year. During the 5-year reset ramp (year > 1815) the
// chart is "redrawn" back to the 1550s.
const ERAS = [
  [1550, 'the Iberian age'],
  [1602, 'the Dutch golden age'],
  [1652, 'the contest for trade'],
  [1700, 'the Atlantic system'],
  [1756, 'the wars for empire'],
  [1793, 'the Napoleonic wars']
];
function eraLabel(year, reset) {
  if (reset > 0) return 'the chart is redrawn…';
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

export function createUI({ onSpeed, onClose, onSelectVessel }) {
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
  // clicking a vessel row in the port view opens that vessel's ledger
  els.ledgerBody.addEventListener('click', (e) => {
    const li = e.target.closest('[data-vid]');
    if (li && onSelectVessel) onSelectVessel(+li.dataset.vid);
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
      const from = portById.get(seg.from).name.replace(/\s*\(.*\)/, '');
      const to = portById.get(seg.to).name.replace(/\s*\(.*\)/, '');
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

    els.ledgerBody.innerHTML = `
      <h2>${escapeHtml((v.prefix ? v.prefix + ' ' : '') + v.name)}</h2>
      <p class="type">${escapeHtml(v.typeName)} · ${escapeHtml(v.rig)} · of ${v.year}</p>
      <dl>
        <dt>Allegiance</dt><dd>${flag}${escapeHtml(v.powerName)}</dd>
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
    const { portById, powerById, simClock } = ctx;
    const nm = (id) => portById.get(id).name.replace(/\s*\(.*\)/, '');
    const power = powerById.get(port.power);

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

    els.ledgerBody.innerHTML = `
      <h2>${escapeHtml(nm(port.id))}</h2>
      <p class="type">${escapeHtml(power ? power.name : port.power)} · ${escapeHtml(port.region.replace(/-/g, ' '))}</p>
      <p class="section-h">Outbound — lately sailed (${traffic.outbound.length})</p>
      ${list(traffic.outbound, 'out', 'No vessels have lately cleared this port.')}
      <p class="section-h">Inbound — standing in (${traffic.inbound.length})</p>
      ${list(traffic.inbound, 'in', 'No vessels are presently bound here.')}`;
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
      <p class="war">Lost ${escapeHtml(w.date)} — ${escapeHtml(w.cause)}${w.war ? ' (' + escapeHtml(w.war) + ')' : ''}${near ? ', off ' + escapeHtml(near.name.replace(/\s*\(.*\)/, '')) + ' approaches' : ''}.</p>
      <dl>
        <dt>Allegiance</dt><dd>${flag}${escapeHtml(w.powerName)}</dd>
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

  return { updateHUD, showLedger, showPort, showWreck, hideLedger };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
