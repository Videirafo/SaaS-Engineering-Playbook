import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { auditBlueprint, REQUIRED, OPTIONAL } from '../tools/blueprint-audit.mjs';

function withRepo(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'blueprint-audit-'));
  try { return fn(dir); } finally { rmSync(dir, { recursive: true, force: true }); }
}
function put(root, path) {
  const full = join(root, path);
  mkdirSync(join(full, '..'), { recursive: true });
  writeFileSync(full, '# Verified in test\n');
}

test('reports missing required documents', () => withRepo((root) => {
  const result = auditBlueprint(root);
  assert.equal(result.status, 'INCOMPLETE');
  assert.equal(result.qualityVerified, false);
  assert.deepEqual(result.missingRequired, REQUIRED);
  assert.equal(result.missingApplicable.length, 0);
}));

test('accepts nonempty canonical files, but does not claim content is validated', () => withRepo((root) => {
  for (const path of REQUIRED) put(root, path);
  const result = auditBlueprint(root);
  assert.equal(result.status, 'STRUCTURE_PRESENT');
  assert.deepEqual(result.missingRequired, []);
  assert.equal(result.qualityVerified, false);
  assert.equal(result.optional.filter((d) => d.applicable).length, 0);
}));

test('flags applicable UX and API contracts separately', () => withRepo((root) => {
  for (const path of REQUIRED) put(root, path);
  const partial = auditBlueprint(root, { ux: true, api: true });
  assert.deepEqual(partial.missingApplicable, OPTIONAL);
  for (const path of OPTIONAL) put(root, path);
  assert.equal(auditBlueprint(root, { ux: true, api: true }).status, 'STRUCTURE_PRESENT');
}));

test('does not accept empty required files as complete', () => withRepo((root) => {
  for (const path of REQUIRED) put(root, path);
  writeFileSync(join(root, 'AGENTS.md'), '');
  const result = auditBlueprint(root);
  assert.deepEqual(result.missingRequired, ['AGENTS.md']);
}));
