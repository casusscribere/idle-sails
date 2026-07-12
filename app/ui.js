// ui.js — the spectator's entire control surface: a speed instrument and a
// click-to-inspect vessel ledger, plus ambient counters and a ship's-log ticker.
// Pure DOM; reads world snapshots handed in by main.js.

const $ = (id) => document.getElementById(id);
const SEASON_LABEL = { djf: 'Winter', mam: 'Spring', jja: 'Summer', son: 'Autumn' };
const SEC_PER_DAY = 86400;

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

export function createUI({ onSpeed, onClose }) {
  const els = {
    date: $('date'), season: $('season'),
    cSea: $('c-sea'), cArr: $('c-arr'), cLost: $('c-lost'),
    speed: $('speed'), speedRead: $('speed-read'),
    logTrack: $('log-track'), ledger: $('ledger'), ledgerBody: $('ledger-body'),
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

  let lastLogKey = '';
  function updateHUD(snap) {
    els.date.textContent = snap.date;
    els.season.textContent = SEASON_LABEL[snap.season] || '';
    els.cSea.textContent = snap.counters.atSea;
    els.cArr.textContent = snap.counters.arrived;
    els.cLost.textContent = snap.counters.lost;

    // refresh the ticker only when the newest event changes (avoid resetting the
    // marquee every frame)
    const key = snap.log[0] ? snap.log[0].t + snap.log[0].text : '';
    if (key !== lastLogKey) {
      lastLogKey = key;
      els.logTrack.innerHTML = snap.log.map(e =>
        `<span class="${e.kind === 'loss' ? 'loss' : e.kind === 'arrive' ? 'arrive' : ''}">${escapeHtml(e.date)} — ${escapeHtml(e.text)}</span>`
      ).join('<span class="sep">✦</span>');
    }
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

    let mp = '';
    if (v.middlePassage) {
      const fr = cargoById.get('enslaved-people').framing;
      mp = `<div class="mp-note"><strong>The Middle Passage</strong>${escapeHtml(fr.description)}</div>`;
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
      ${mp}`;
    els.ledger.hidden = false;
    els.hint && els.hint.classList.add('gone');
  }
  function hideLedger() { els.ledger.hidden = true; }

  return { updateHUD, showLedger, hideLedger };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
