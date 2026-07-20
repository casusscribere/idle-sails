// settings.js — device-local presentation & performance settings.
//
// Separate from persist.js by design: the save is the WORLD (versioned against
// the data bundles, discarded on a re-bake); settings are the PLAYER'S DEVICE
// (panel visibility, performance tier) and must survive every save reset.
//
// The performance tier only ever touches two layers:
//   render layer      — how much is drawn (ship density, wakes);
//   observation layer — how much the world RECORDS (log length, wreck linger).
// It never changes what the sim computes: spawns, fates, and movement are
// identical at every tier (same seed ⇒ same world, whatever the setting).
// Medium is exactly the pre-slider behaviour.
//
// Storage is injectable for Node tests; the browser default is localStorage.

const KEY = 'idle-sails-settings';

export const PERF_TIERS = {
  //        drawn ships   wake points  log entries  wreck linger   port memory  pins
  low:    { shipDensity: 0.5, wakeLength: 0,  logCap: 50,  wreckLingerDays: 90,     portHistoryDepth: 0,   pinCap: 3 },
  medium: { shipDensity: 1,   wakeLength: 14, logCap: 200, wreckLingerDays: 365.25, portHistoryDepth: 40,  pinCap: 10 },
  high:   { shipDensity: 1,   wakeLength: 14, logCap: 500, wreckLingerDays: 365.25, portHistoryDepth: 200, pinCap: 25 }
};

export const PERF_NOTES = {
  low: 'Half the sails drawn, no wakes, no port memory — the same sea, lighter on the brush.',
  medium: 'The standard chart.',
  high: 'A longer log, deeper port memory, more ships followed.'
};

const DEFAULT_PANELS = { legend: false, events: false, stats: false, tracker: false, counters: true, helm: true };

const defaultStorage = () => (typeof localStorage !== 'undefined' ? localStorage : null);

export function defaultSettings() {
  // furled: the cartouche collapsed to a small title card, all ambient
  // panels stowed — the chart alone. Click it again to unfurl.
  // legend.{ships,flags}: the legend's sections, independently toggleable.
  // collapsed.{…}: per-panel header collapse (title bar only, in place).
  // region: the active chart view ('world' or a render.js REGIONS preset id —
  // validated against the presets by main.js, so settings.js stays layout-only).
  // layers: the routes overlay's per-basin toggles, keyed by basin id; a key is
  // stored only when switched OFF (absent = on), so new basins default visible.
  // portNames: the chart's name-labelling policy — 'default' (a name shows only
  // while its port has seen traffic within the past decade, so quiet ports go
  // nameless but keep their dot), 'none' (no names), 'active' (only the most
  // active ports this cycle). Display-only; never touches the sim.
  return {
    perfTier: 'medium',
    panels: { ...DEFAULT_PANELS },
    furled: false,
    region: 'world',
    layers: {},
    portNames: 'default',
    legend: { ships: true, flags: true },
    collapsed: { legend: false, events: false, stats: false, tracker: false }
  };
}

export function loadSettings(storage = defaultStorage()) {
  const out = defaultSettings();
  if (!storage) return out;
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return out;
    const s = JSON.parse(raw);
    if (s && PERF_TIERS[s.perfTier]) out.perfTier = s.perfTier;
    if (s && s.panels && typeof s.panels === 'object')
      for (const k of Object.keys(out.panels))
        if (typeof s.panels[k] === 'boolean') out.panels[k] = s.panels[k];
    if (s && typeof s.furled === 'boolean') out.furled = s.furled;
    if (s && typeof s.region === 'string' && /^[a-z0-9-]{1,40}$/.test(s.region)) out.region = s.region;
    if (s && (s.portNames === 'default' || s.portNames === 'none' || s.portNames === 'active')) out.portNames = s.portNames;
    if (s && s.layers && typeof s.layers === 'object')
      for (const k of Object.keys(s.layers).slice(0, 64))
        if (typeof s.layers[k] === 'boolean' && /^[a-z0-9-]{1,40}$/.test(k)) out.layers[k] = s.layers[k];
    // legacy (pre-2026-07-16): statistics was a drawer under the counters
    // (statsOpen) — an open drawer carries over as the statistics panel
    if (s && typeof s.statsOpen === 'boolean' && !(s.panels && typeof s.panels.stats === 'boolean'))
      out.panels.stats = s.statsOpen;
    if (s && s.legend && typeof s.legend === 'object')
      for (const k of Object.keys(out.legend))
        if (typeof s.legend[k] === 'boolean') out.legend[k] = s.legend[k];
    if (s && s.collapsed && typeof s.collapsed === 'object')
      for (const k of Object.keys(out.collapsed))
        if (typeof s.collapsed[k] === 'boolean') out.collapsed[k] = s.collapsed[k];
    return out;
  } catch { return out; }
}

export function saveSettings(settings, storage = defaultStorage()) {
  if (!storage) return false;
  try { storage.setItem(KEY, JSON.stringify(settings)); return true; }
  catch { return false; }   // quota / private mode — settings just don't stick
}

export function perfValues(settings) {
  return PERF_TIERS[settings.perfTier] || PERF_TIERS.medium;
}
