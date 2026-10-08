import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validatePilot } from './validate.mjs';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/valid.json', import.meta.url), 'utf8'));
const copy = () => structuredClone(fixture);
const expectBlocked = (change, reason) => {
  const data = copy();
  change(data);
  const result = validatePilot(data);
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.production_ready, false);
  assert.ok(result.errors.some((e) => e.includes(reason)), result.errors.join('; '));
};

test('valid pilot contract passes but never authorizes production', () => {
  const result = validatePilot(copy());
  assert.equal(result.status, 'PASS_PILOT');
  assert.equal(result.ok, true);
  assert.equal(result.production_ready, false);
  assert.equal(result.review_mode, 'simulated');
  assert.equal(result.approval_ratio, 1);
  assert.deepEqual(result.errors, []);
});

test('rejects root missing', () => {
  assert.equal(validatePilot(null).status, 'BLOCKED');
});

test('Superpowers: missing acceptance proof blocks', () => {
  expectBlocked((x) => { x.spec.acceptance = []; }, 'testable acceptance');
});

test('Superpowers: missing declared RED/GREEN blocks', () => {
  expectBlocked((x) => { x.tdd.observed_red = false; }, 'RED/GREEN');
});

test('Karpathy: missing one principle blocks', () => {
  expectBlocked((x) => { x.karpathy.surgical_changes = false; }, 'surgical_changes');
});

test('Karpathy: changes outside isolated pilot block', () => {
  expectBlocked((x) => { x.changed_files.push('src/auth.ts'); }, 'pilot-scoped');
});

test('ADHD: long action list blocks', () => {
  expectBlocked((x) => { x.communication.steps = Array.from({length: 6}, (_, i) => 'Passo ' + i); }, '1-5');
});

test('ADHD: next action is mandatory', () => {
  expectBlocked((x) => { x.communication.next_action = ''; }, 'next_action');
});

test('sources: missing trusted origin blocks', () => {
  expectBlocked((x) => { x.sources.pop(); }, 'four trusted');
});

test('sources: untrusted extra origin blocks', () => {
  expectBlocked((x) => { x.sources.push('https://untrusted.example'); }, 'four trusted');
});

test('Octopus: one reviewer is insufficient', () => {
  expectBlocked((x) => { x.reviews.reviewers.pop(); }, '2-12');
});

test('Octopus: duplicate identities block', () => {
  expectBlocked((x) => { x.reviews.reviewers[1].id = x.reviews.reviewers[0].id; }, 'unique');
});

test('Octopus: disagreement blocks even with enough approvals', () => {
  expectBlocked((x) => { x.reviews.reviewers.push(...[3,4].map((i) => ({
    id:'sim:reviewer-'+i, vote:'approve',
    evidence:[{source:x.sources[0],claim:'Review fixture '+i}]
  }))); x.reviews.reviewers[0].vote = 'reject'; }, 'disagreement');
});

test('Octopus: abstention blocks', () => {
  expectBlocked((x) => { x.reviews.reviewers[0].vote = 'abstain'; }, 'disagreement');
});

test('Octopus: unsupported citation blocks', () => {
  expectBlocked((x) => { x.reviews.reviewers[0].evidence[0].source = 'https://untrusted.example'; }, 'cited evidence');
});

test('Octopus: missing evidence blocks', () => {
  expectBlocked((x) => { x.reviews.reviewers[0].evidence = []; }, 'cited evidence');
});

test('Octopus: live model claim is invalid in this pilot', () => {
  expectBlocked((x) => { x.reviews.mode = 'live'; }, 'simulated mode only');
});

test('Trust Gate: production write blocks', () => {
  expectBlocked((x) => { x.safety.production_writes = true; }, 'production writes');
});

test('Trust Gate: deploy request blocks', () => {
  expectBlocked((x) => { x.safety.deploy_requested = true; }, 'deploy forbidden');
});

test('Trust Gate: external requests block', () => {
  expectBlocked((x) => { x.safety.external_calls = true; }, 'external calls');
});

test('Trust Gate: secrets block', () => {
  expectBlocked((x) => { x.safety.secrets_used = true; }, 'secrets forbidden');
});

test('Trust Gate: human review remains mandatory', () => {
  expectBlocked((x) => { x.safety.human_review_required = false; }, 'human review');
});

test('Trust Gate: paths with traversal block', () => {
  expectBlocked((x) => { x.changed_files = ['pilots/agent-engineering-core/../other']; }, 'pilot-scoped');
});
