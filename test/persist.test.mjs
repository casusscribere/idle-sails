// Node tests for persist.js (Milestone 6): save/load round-trip via an injected
// fake storage, offline-accrual math + cap, and version-mismatch rejection.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createWorld, _internals } from '../world.js';
import { saveWorld, loadSave, clearSave, accrualSeconds, CATCHUP_CAP_DAYS } from '../persist.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, '..', 'data');
const datasets = JSON.parse(readFileSync(join(DATA, 'datasets.json'), 'utf8'));
const routes = JSON.parse(readFileSync(join(DATA, 'routes.json'), 'utf8'));
const data = { datasets, routes };
const DAY = _internals.SEC_PER_DAY;

// minimal in-memory Storage
const fakeStorage = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
};

test('save → load round-trip restores an identical, identically-continuing world', () => {
  const store = fakeStorage();
  const a = createWorld({ seed: 77, data });
  for (let i = 0; i < 100; i++) a.tick(0.8 * DAY);

  assert.ok(saveWorld(a, { speed: 12345, slider: 560, datasetVersion: datasets.version }, store));
  const saved = loadSave({ datasetVersion: datasets.version }, store);
  assert.ok(saved, 'save loads back');
  assert.equal(saved.seed, 77);
  assert.equal(saved.speed, 12345);
  assert.equal(saved.slider, 560);
  assert.ok(Number.isFinite(saved.savedAt));

  const b = createWorld({ seed: saved.seed, data, restore: saved.state });
  assert.equal(a.fingerprint(), b.fingerprint(), 'restored == saved');
  for (let i = 0; i < 90; i++) { a.tick(1.1 * DAY); b.tick(1.1 * DAY); }
  assert.equal(a.fingerprint(), b.fingerprint(), 'restored world continues identically');
});

test('offline accrual: elapsed × speed, hard-capped', () => {
  // 1 real hour at 2 sim-days/real-sec would be 7200 sim-days → capped
  assert.equal(accrualSeconds(3600, 2 * DAY), CATCHUP_CAP_DAYS * DAY);
  // a short absence under the cap accrues linearly
  assert.equal(accrualSeconds(60, 1000), 60_000);
  // paused, negative, or nonsense elapsed ⇒ no accrual
  assert.equal(accrualSeconds(3600, 0), 0);
  assert.equal(accrualSeconds(-5, 1000), 0);
  assert.equal(accrualSeconds(NaN, 1000), 0);
});

test('offline accrual applied as big ticks == the same time ticked live', () => {
  const store = fakeStorage();
  const a = createWorld({ seed: 9, data });
  for (let i = 0; i < 50; i++) a.tick(DAY);
  saveWorld(a, { speed: 500, datasetVersion: datasets.version }, store);
  const saved = loadSave({ datasetVersion: datasets.version }, store);

  // "reopen after an absence": accrue in one big tick…
  const acc = accrualSeconds(7200, saved.speed);           // 2 h at 500× < cap
  const b = createWorld({ seed: saved.seed, data, restore: saved.state });
  b.tick(acc);
  // …vs. the same sim-time advanced in many small live ticks
  const c = createWorld({ seed: saved.seed, data, restore: JSON.parse(JSON.stringify(saved.state)) });
  const n = 600; for (let i = 0; i < n; i++) c.tick(acc / n);
  assert.equal(b.fingerprint(), c.fingerprint(), 'offline catch-up == having stayed open');
});

test('stale or corrupt saves are rejected, clearSave clears', () => {
  const store = fakeStorage();
  const w = createWorld({ seed: 3, data });
  w.tick(10 * DAY);
  saveWorld(w, { speed: 1, datasetVersion: datasets.version }, store);

  // dataset-version bump invalidates the save
  assert.equal(loadSave({ datasetVersion: datasets.version + 1 }, store), null);
  // corrupt payload → null, not a throw
  store.setItem('idle-sails-save', '{not json');
  assert.equal(loadSave({ datasetVersion: datasets.version }, store), null);
  // empty → null
  clearSave(store);
  assert.equal(loadSave({ datasetVersion: datasets.version }, store), null);
});
