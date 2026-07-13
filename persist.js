// persist.js — Milestone 6: localStorage save/restore + offline accrual.
//
// The world serializes completely (world.serialize() — plain JSON including the
// spawn-RNG word), so a restored session continues identically to one that never
// closed. On load we additionally fast-forward by the real time the tab was shut,
// converted at the player's last speed setting and CAPPED, so an absence reads as
// "some weeks passed at sea" rather than skipping whole historical eras.
//
// Storage is injectable for Node tests; the browser default is localStorage.

const KEY = 'idle-sails-save';
const SAVE_VERSION = 1;

// Offline catch-up cap (sim-days). Generous enough to feel like an idler,
// small enough that the flowing 1550–1815 clock keeps narrative continuity.
export const CATCHUP_CAP_DAYS = 30;
const SEC_PER_DAY = 86400;

const defaultStorage = () => (typeof localStorage !== 'undefined' ? localStorage : null);

// Sim-seconds to fast-forward after an absence: real seconds elapsed × the last
// speed multiplier, capped. Pure — tested directly in Node.
export function accrualSeconds(elapsedRealSec, lastSpeed, capDays = CATCHUP_CAP_DAYS) {
  if (!(elapsedRealSec > 0) || !(lastSpeed > 0)) return 0;
  return Math.min(elapsedRealSec * lastSpeed, capDays * SEC_PER_DAY);
}

// meta: { speed (sim-sec per real-sec multiplier, drives accrual),
//         slider (raw slider position, restores the UI), datasetVersion }.
export function saveWorld(world, { speed = 0, slider = null, datasetVersion = 0 } = {}, storage = defaultStorage()) {
  if (!storage) return false;
  try {
    storage.setItem(KEY, JSON.stringify({
      version: SAVE_VERSION,
      datasetVersion,
      savedAt: Date.now(),
      speed, slider,
      state: world.serialize()
    }));
    return true;
  } catch { return false; }   // quota / private-mode — the idler just runs unsaved
}

// → { seed, state, savedAt, speed, slider } or null (absent, corrupt, or stale-
// versioned — a version mismatch discards the save rather than resuming into
// changed data).
export function loadSave({ datasetVersion = 0 } = {}, storage = defaultStorage()) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s.version !== SAVE_VERSION || s.datasetVersion !== datasetVersion) return null;
    if (!s.state || typeof s.state.simClock !== 'number' || typeof s.state.seed !== 'number') return null;
    return { seed: s.state.seed, state: s.state, savedAt: s.savedAt, speed: s.speed, slider: s.slider };
  } catch { return null; }
}

export function clearSave(storage = defaultStorage()) {
  if (storage) try { storage.removeItem(KEY); } catch { /* ignore */ }
}

// Wire periodic + lifecycle saving for a live session. Returns a disposer.
export function autoSave(world, getMeta, { intervalMs = 10_000 } = {}) {
  const doSave = () => saveWorld(world, getMeta());
  const timer = setInterval(doSave, intervalMs);
  const onHide = () => { if (document.visibilityState === 'hidden') doSave(); };
  document.addEventListener('visibilitychange', onHide);
  addEventListener('beforeunload', doSave);
  return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onHide); removeEventListener('beforeunload', doSave); };
}
