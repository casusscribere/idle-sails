// Node tests for feature pass 2's data-facing pieces: the regional-view
// presets (render.js REGIONS must actually contain the ports each plate is
// for) and the basin metadata the layers panel filters by (every flow system
// in the bundle must carry its basin, and the fold must cover most lanes).
//   node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { REGIONS } from '../render.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const datasets = JSON.parse(readFileSync(join(HERE, '..', 'data', 'datasets.json'), 'utf8'));
const portById = new Map(datasets.ports.map(p => [p.id, p]));

test('region presets: world first, ids unique, boxes well-formed', () => {
  assert.equal(REGIONS[0].id, 'world', 'the world plate leads the list');
  assert.ok(!REGIONS[0].bounds, 'the world plate uses the data-fit crop, not a preset box');
  assert.equal(new Set(REGIONS.map(r => r.id)).size, REGIONS.length, 'region ids are unique');
  for (const r of REGIONS.slice(1)) {
    assert.ok(r.bounds, `${r.id} carries a preset box`);
    assert.ok(r.bounds.lonMin < r.bounds.lonMax && r.bounds.latMin < r.bounds.latMax,
      `${r.id} box is non-degenerate`);
    assert.ok(r.name && typeof r.name === 'string', `${r.id} carries a display name`);
  }
});

// Each plate exists FOR its crowded ports — a preset that drifts away from the
// data (a port moved, renamed, or added) must fail here, not on the chart.
const MUST_CONTAIN = {
  'europe': ['london', 'amsterdam', 'nantes', 'lisbon', 'cadiz', 'venice', 'istanbul',
    'kaffa', 'stockholm', 'st-petersburg', 'danzig', 'arkhangelsk',
    // the full-Med extension (2026-07-20): the North African shore is in frame
    'algiers', 'tunis', 'tripoli', 'alexandria'],
  'caribbean': ['havana', 'veracruz', 'kingston', 'bridgetown', 'cartagena',
    'portobelo', 'st-eustatius', 'cap-francais'],
  'east-indies': ['batavia', 'manila', 'makassar', 'banda-neira', 'canton',
    'macau', 'amoy', 'dejima', 'naha'],
  // Arabia & India keeps Gulf/Red-Sea headroom for PLAN-4 E2/E6 (no re-crop on
  // adoption). Its 2026-07-16 sibling 'na-northeast' was CUT 2026-07-21 (F-33):
  // hidden, 5 ports, and the Grand-Banks fishery traffic that would justify it
  // waits on the grounds-node primitive (F-15).
  'arabia-india': ['mocha', 'muscat', 'surat', 'bombay', 'madras',
    'tranquebar', 'calcutta'],
  // the Phase-1 (increment 7) SW Pacific / Tasman plate frames Sydney
  'australasia': ['sydney'],
  // the antimeridian-crossing Pacific plate: both rims — East Asia THROUGH the
  // open ocean to the Americas (whose lon normalizes to 225–290 in-frame)
  'pacific': ['batavia', 'canton', 'manila', 'dejima', 'naha',
    'sitka', 'nootka', 'acapulco', 'guayaquil', 'callao', 'valparaiso', 'pacific-grounds']
};

test('every regional plate contains the ports it exists for', () => {
  for (const [rid, portIds] of Object.entries(MUST_CONTAIN)) {
    const region = REGIONS.find(r => r.id === rid);
    assert.ok(region, `region ${rid} exists`);
    const b = region.bounds;
    // a plate spanning past the antimeridian (lonMax > 180) normalizes longitude
    // into [lonMin, lonMin+360) — mirror render.js normLon so the American rim,
    // at negative raw longitudes, tests inside the Pacific frame.
    const nlon = lon => b.lonMax > 180 ? b.lonMin + ((lon - b.lonMin) % 360 + 360) % 360 : lon;
    for (const pid of portIds) {
      const p = portById.get(pid);
      assert.ok(p, `port ${pid} exists in the dataset`);
      const L = nlon(p.lon);
      assert.ok(L > b.lonMin && L < b.lonMax && p.lat > b.latMin && p.lat < b.latMax,
        `${rid} contains ${pid} (${p.lon}→${L.toFixed(0)}, ${p.lat})`);
    }
  }
});

test('flows bundle: every system carries a basin; the fold covers most lanes', () => {
  // must stay in step with BASIN_ORDER/BASIN_LABEL in main.js — a basin the UI
  // does not know renders its raw id as a layer-toggle label
  const KNOWN = new Set(['atlantic', 'baltic-north-sea', 'mediterranean',
    'indian-ocean-west', 'bengal-se-asia', 'east-asia', 'pacific']);
  const systems = datasets.flows.systems;
  assert.ok(systems.length > 0, 'flow systems present');
  for (const s of systems)
    assert.ok(KNOWN.has(s.basin), `system ${s.id} carries a known basin (got ${s.basin})`);
  // the layers filter groups lanes by their folded basin; lanes outside the
  // matrix gather under 'other' — that group must stay a minority
  const folded = new Set();
  for (const s of systems) for (const lid of Object.keys(s.lanes)) folded.add(lid);
  assert.ok(folded.size > datasets.routes.length * 0.7,
    `most lanes fold onto a basin (${folded.size}/${datasets.routes.length})`);
});
