// The flow matrix validates as part of the suite.
//
// `research/tools/validate-flows.mjs` enforces the PLAN-3 charter on the
// evidence data itself: evidence classes, a stated basis per system, lane
// shares summing to 1, decade coverage with no gaps or strays, the sober
// framing block on any system carrying coerced human movement, the silences
// register's shape, and the per-basin historical cross-checks.
//
// It was a MANUAL tool until 2026-07-18, and it had been sitting red — three
// errors had accumulated unnoticed because nothing ran it. The data is as much
// the project as the code is, so it fails the build like the code does.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

test('flow matrix: validate-flows passes (charter rules + cross-checks)', () => {
  let out;
  try {
    out = execFileSync('node', [join('research', 'tools', 'validate-flows.mjs')],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    // the validator prints its errors to stderr and its notes to stdout
    assert.fail(`validate-flows failed:\n${e.stderr || ''}${e.stdout || ''}`);
  }
  assert.match(out, /✓ flows valid:/);
  // a cross-check that silently stopped running would also "pass" — assert the
  // bands were actually evaluated
  assert.ok(/cross-check —/.test(out), 'expected the per-basin cross-checks to run');
  assert.ok(!/OUT OF BAND/.test(out), 'a cross-check band was violated');
});
