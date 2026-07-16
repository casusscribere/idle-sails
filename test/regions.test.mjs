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
    'kaffa', 'stockholm', 'st-petersburg', 'danzig', 'arkhangelsk'],
  'caribbean': ['havana', 'veracruz', 'kingston', 'bridgetown', 'cartagena',
    'portobelo', 'st-eustatius', 'cap-francais'],
  'east-indies': ['batavia', 'manila', 'makassar', 'banda-neira', 'canton',
    'macau', 'amoy', 'dejima', 'naha']
};

test('every regional plate contains the ports it exists for', () => {
  for (const [rid, portIds] of Object.entries(MUST_CONTAIN)) {
    const region = REGIONS.find(r => r.id === rid);
    assert.ok(region, `region ${rid} exists`);
    const b = region.bounds;
    for (const pid of portIds) {
      const p = portById.get(pid);
      assert.ok(p, `port ${pid} exists in the dataset`);
      assert.ok(p.lon > b.lonMin && p.lon < b.lonMax && p.lat > b.latMin && p.lat < b.latMax,
        `${rid} contains ${pid} (${p.lon}, ${p.lat})`);
    }
  }
});

test('flows bundle: every system carries a basin; the fold covers most lanes', () => {
  const KNOWN = new Set(['atlantic', 'baltic-north-sea', 'mediterranean',
    'indian-ocean-west', 'bengal-se-asia', 'east-asia']);
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
