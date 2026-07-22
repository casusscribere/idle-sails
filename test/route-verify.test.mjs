// Tests for the route verification harness itself (PLAN-7 F-41).
//
// These test the HARNESS, not the router. The question of whether route
// verification should gate commits is decision D-22 and is still open; what is
// tested here is that the instrument works — because a harness that reports
// "no failures" is worthless until you have proved it is capable of reporting
// a failure at all.
//
// The negative controls below are the important half: each one feeds the
// harness a corpus asserting something the baked routes demonstrably do NOT
// satisfy, and requires it to say so.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const TOOL = join(ROOT, 'research', 'tools', 'route-verify.mjs');
const TMP = mkdtempSync(join(tmpdir(), 'route-verify-'));

function run(args = [], { allowFail = false } = {}) {
  try {
    return execFileSync(process.execPath, [TOOL, ...args], { cwd: ROOT, encoding: 'utf8' });
  } catch (e) {
    if (allowFail) return e.stdout || '';
    throw e;
  }
}
const runJSON = (args = []) => JSON.parse(run(['--json', ...args]));

function corpusFile(name, entries) {
  const p = join(TMP, name);
  writeFileSync(p, JSON.stringify({ entries }, null, 1));
  return p;
}

test('harness: deterministic — same bundle + corpus ⇒ byte-identical report', () => {
  const a = run(['--json']);
  const b = run(['--json']);
  assert.equal(a, b, 'two runs differ; something time- or order-dependent leaked in');
  // and specifically: no timestamp anywhere
  assert.ok(!/\d{4}-\d{2}-\d{2}T\d{2}:/.test(a), 'report contains an ISO timestamp — that breaks determinism');
});

test('harness: emits NO global score (PLAN-7 §2.3)', () => {
  const r = runJSON();
  const banned = /score|passRate|overall|grade|accuracy/i;
  for (const k of Object.keys(r))
    assert.ok(!banned.test(k), `top-level key "${k}" looks like a global score`);
  for (const k of Object.keys(r.byTier))
    assert.ok(typeof r.byTier[k] === 'object', 'per-tier results must stay structured, not collapsed to a number');
  // the whole report, flattened, must contain no single overall figure
  assert.equal(r.total, undefined);
  assert.equal(r.summary, undefined);
});

test('harness: coverage is reported and unverified lanes are NOT counted as passing', () => {
  const r = runJSON();
  assert.ok(r.coverage.lanes > 0, 'coverage must state the lane total');
  assert.ok(r.coverage.lanesWithAnyEvidence < r.coverage.lanes,
    'the seed corpus covers only a few lanes — if this is ever equal, coverage is being over-claimed');
  // no result may carry a verdict of 'unverified' — unverified is the ABSENCE
  // of a result, which is what keeps it out of any pass tally
  for (const res of r.results)
    assert.ok(['pass', 'fail', 'inapplicable', 'error'].includes(res.verdict), `bad verdict ${res.verdict}`);
  const covered = new Set(r.results.map(x => x.lane));
  assert.equal(covered.size, r.coverage.lanesWithAnyEvidence,
    'lanes with results must equal lanes reported as covered');
});

test('negative control: a required waypoint the route does NOT pass is caught', () => {
  // The London→Canton Indiaman does not call anywhere near Iceland.
  const p = corpusFile('bad-waypoint.json', [{
    id: 'impossible-waypoint', tier: 'T1', kind: 'waypoint-constraint', class: 'asserted',
    era: { from: 1700, to: 1850 }, lanes: ['china-lon-can'],
    waypoints: [{ name: 'Reykjavik', lon: -21.9, lat: 64.1, tolKm: 200, required: true }]
  }]);
  const r = JSON.parse(run(['--json', `--corpus=${p}`]));
  const res = r.results.find(x => x.entry === 'impossible-waypoint');
  assert.ok(res, 'entry was not evaluated at all');
  assert.equal(res.verdict, 'fail', 'harness failed to notice a route missing a required waypoint');
});

test('negative control: a forbidden waypoint the route DOES pass is caught', () => {
  // china-lon-can is baked via madeira → cape-town → anjer, so forbidding Table
  // Bay must fail.
  const p = corpusFile('bad-forbidden.json', [{
    id: 'forbids-a-real-call', tier: 'T1', kind: 'waypoint-constraint', class: 'asserted',
    era: { from: 1700, to: 1850 }, lanes: ['china-lon-can'],
    waypoints: [{ name: 'Table Bay', lon: 18.42, lat: -33.92, tolKm: 350, required: false, forbidden: true }]
  }]);
  const r = JSON.parse(run(['--json', `--corpus=${p}`]));
  assert.equal(r.results.find(x => x.entry === 'forbids-a-real-call').verdict, 'fail',
    'harness failed to notice a route calling somewhere it must avoid');
});

test('negative control: a corridor the route DOES cross is caught', () => {
  // A box straddling the Cape of Good Hope, which every Europe→Asia lane rounds.
  const p = corpusFile('bad-corridor.json', [{
    id: 'forbids-the-cape', tier: 'T1', kind: 'forbidden-corridor', class: 'asserted',
    era: { from: 1700, to: 1850 }, lanes: ['china-lon-can'],
    corridors: [{ name: 'Cape of Good Hope', forbidden: true, box: [15, -40, 25, -30] }]
  }]);
  const r = JSON.parse(run(['--json', `--corpus=${p}`]));
  assert.equal(r.results.find(x => x.entry === 'forbids-the-cape').verdict, 'fail',
    'harness failed to notice a route entering a forbidden corridor');
});

test('negative control: an impossible passage duration is caught', () => {
  const p = corpusFile('bad-duration.json', [{
    id: 'impossible-duration', tier: 'T2', kind: 'passage-duration', class: 'asserted',
    era: { from: 1700, to: 1850 }, lanes: ['china-lon-can'],
    duration: { days: [1, 3], n: 1, basis: 'deliberately impossible' }
  }]);
  const r = JSON.parse(run(['--json', `--corpus=${p}`]));
  const res = r.results.find(x => x.entry === 'impossible-duration');
  assert.equal(res.verdict, 'fail', 'a 178-day passage was accepted as 1–3 days');
  const d = res.variants[0].detail[0];
  assert.ok(d.marginDays > 0, 'the signed margin should report how far outside the range it fell');
});

test('negative control: demanding asymmetry from a lane against ITSELF is caught', () => {
  const p = corpusFile('bad-asymmetry.json', [{
    id: 'self-asymmetry', tier: 'T3', kind: 'prescribed-route', class: 'asserted',
    era: { from: 1700, to: 1850 }, lanes: ['china-lon-can'],
    asymmetryWith: 'china-lon-can', minSeparationKm: 200
  }]);
  const r = JSON.parse(run(['--json', `--corpus=${p}`]));
  assert.equal(r.results.find(x => x.entry === 'self-asymmetry').verdict, 'fail',
    'a track was judged meaningfully different from itself');
});

test('harness: a stale lane id is an ERROR, not a silent skip', () => {
  const p = corpusFile('stale-lane.json', [{
    id: 'stale', tier: 'T1', kind: 'waypoint-constraint', class: 'asserted',
    era: { from: 1700, to: 1850 }, lanes: ['no-such-lane-exists'],
    waypoints: [{ name: 'x', lon: 0, lat: 0, tolKm: 100, required: true }]
  }]);
  const r = JSON.parse(run(['--json', `--corpus=${p}`]));
  const res = r.results.find(x => x.entry === 'stale');
  assert.equal(res.verdict, 'error', 'a corpus referencing a nonexistent lane must fail loudly');
});

test('harness: an entry whose era does not overlap the lane is not applied', () => {
  // china-lon-can runs 1700–1834; a claim about 1550–1600 must not touch it.
  const p = corpusFile('era-miss.json', [{
    id: 'wrong-era', tier: 'T1', kind: 'waypoint-constraint', class: 'asserted',
    era: { from: 1550, to: 1600 }, lanes: ['china-lon-can'],
    waypoints: [{ name: 'Reykjavik', lon: -21.9, lat: 64.1, tolKm: 200, required: true }]
  }]);
  const r = JSON.parse(run(['--json', `--corpus=${p}`]));
  assert.equal(r.results.find(x => x.entry === 'wrong-era'), undefined,
    'an out-of-era claim was applied anyway');
  assert.equal(r.coverage.lanesWithAnyEvidence, 0,
    'an out-of-era claim must not count as coverage either');
});

test('--strict exits nonzero when something fails, zero when nothing does', () => {
  const bad = corpusFile('strict-bad.json', [{
    id: 'x', tier: 'T1', kind: 'waypoint-constraint', class: 'asserted',
    era: { from: 1700, to: 1850 }, lanes: ['china-lon-can'],
    waypoints: [{ name: 'Reykjavik', lon: -21.9, lat: 64.1, tolKm: 200, required: true }]
  }]);
  let code = 0, out = '';
  try { out = execFileSync(process.execPath, [TOOL, '--strict', `--corpus=${bad}`], { cwd: ROOT, encoding: 'utf8' }); }
  catch (e) { code = e.status; out = e.stdout || ''; }
  assert.equal(code, 1, '--strict should exit 1 on failure');
  // …and for the RIGHT reason: a crash also exits 1, so require a real report
  assert.match(out, /ROUTE VERIFICATION/, '--strict exited 1 without producing a report — it crashed');
  assert.match(out, /FAILURES/, '--strict exited 1 but reported no failure');
  // the real corpus currently passes
  execFileSync(process.execPath, [TOOL, '--strict'], { cwd: ROOT, stdio: 'ignore' });
});

test('the seed corpus passes against the CURRENT engine (fixture sanity)', () => {
  // PLAN-7 §11 acceptance criterion 5: the seed set encodes waystop calls the
  // baker already implements as `via` chains, so the current engine SHOULD pass
  // them. A harness failing its own known-good fixtures is broken — this is a
  // check on the instrument, not a claim about the router's quality.
  const r = runJSON();
  const fails = r.results.filter(x => x.verdict === 'fail' || x.verdict === 'error');
  assert.deepEqual(fails.map(f => `${f.entry}/${f.lane}`), [],
    'the seed corpus should pass against the current bake');
  assert.ok(r.results.length > 0, 'the seed corpus evaluated nothing at all');
});
