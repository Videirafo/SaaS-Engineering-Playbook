#!/usr/bin/env node
/**
 * Offline contract validator for Issue #28. No network I/O, exec, env or secrets.
 * Simulated reviewer votes are NOT an independent model evaluation.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REQUIRED_SOURCES = Object.freeze([
  'https://github.com/obra/superpowers',
  'https://github.com/multica-ai/andrej-karpathy-skills',
  'https://github.com/ayghri/i-have-adhd',
  'https://github.com/nyldn/claude-octopus',
]);

const PRINCIPLES = Object.freeze([
  'think_before_coding',
  'simplicity_first',
  'surgical_changes',
  'goal_driven_execution',
]);

const SAFE_PATHS = [
  /^pilots\/agent-engineering-core\//,
  /^docs\/VIDEIRA_AGENT_ENGINEERING_CORE\.md$/,
  /^\.github\/workflows\/agent-engineering-pilot\.yml$/,
];

const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const filled = (v) => typeof v === 'string' && v.trim().length > 0;
const nonempty = (v) => Array.isArray(v) && v.length > 0;

/** Checks only the supplied pilot contract, not the truth of submitted evidence. */
export function validatePilot(data) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  if (!object(data)) {
    return { status: 'BLOCKED', ok: false, production_ready: false, approval_ratio: 0, errors: ['root: object required'] };
  }

  check(data.version === '0.1', 'version: expected 0.1');
  const sources = data.sources;
  check(Array.isArray(sources) && sources.length === REQUIRED_SOURCES.length &&
    new Set(sources).size === REQUIRED_SOURCES.length &&
    REQUIRED_SOURCES.every((url) => sources.includes(url)),
  'sources: exactly the four trusted upstream URLs required');

  const spec = data.spec;
  check(object(spec), 'spec: object required');
  if (object(spec)) {
    check(spec.issue === 'https://github.com/Videirafo/SaaS-Engineering-Playbook/issues/28', 'spec: issue #28 required');
    check(filled(spec.objective), 'spec: objective required');
    check(nonempty(spec.assumptions) && spec.assumptions.every(filled), 'spec: explicit assumptions required');
    check(nonempty(spec.out_of_scope) && spec.out_of_scope.every(filled), 'spec: out_of_scope required');
    check(nonempty(spec.acceptance) && spec.acceptance.every((a) => object(a) && filled(a.id) && filled(a.test)),
      'spec: testable acceptance criteria required');
  }

  const plan = data.plan;
  check(Array.isArray(plan) && plan.length >= 1 && plan.length <= 5 &&
    plan.every((p) => object(p) && filled(p.action) && filled(p.verify)),
  'plan: 1-5 verifiable steps required');

  const tdd = data.tdd;
  check(object(tdd) && filled(tdd.red_test) && filled(tdd.green_test) && filled(tdd.command) &&
    tdd.observed_red === true && tdd.observed_green === true,
  'tdd: declared RED/GREEN evidence required (self-reported fixture only)');

  const karpathy = data.karpathy;
  check(object(karpathy), 'karpathy: object required');
  if (object(karpathy)) {
    for (const principle of PRINCIPLES) {
      check(karpathy[principle] === true, 'karpathy: missing '+ principle);
    }
  }

  const communication = data.communication;
  check(object(communication), 'communication: object required');
  if (object(communication)) {
    check(filled(communication.first_action), 'communication: first_action required');
    check(filled(communication.state), 'communication: state required');
    check(Array.isArray(communication.steps) && communication.steps.length >= 1 &&
      communication.steps.length <= 5 && communication.steps.every(filled),
    'communication: 1-5 non-empty steps required');
    check(filled(communication.next_action), 'communication: next_action required');
  }

  const files = data.changed_files;
  check(nonempty(files) && files.every((p) => filled(p) && SAFE_PATHS.some((re) => re.test(p)) &&
    !p.split('/').includes('..')),
  'changed_files: pilot-scoped paths only');

  const reviews = data.reviews;
  let approvalRatio = 0;
  check(object(reviews) && reviews.mode === 'simulated', 'reviews: simulated mode only');
  if (object(reviews)) {
    const rs = reviews.reviewers;
    check(Array.isArray(rs) && rs.length >= 2 && rs.length <= 12,
      'reviews: 2-12 simulated reviewers required');
    if (Array.isArray(rs) && rs.length > 0) {
      const ids = rs.map((r) => r?.id);
      check(ids.every((id) => filled(id) && id.startsWith('sim:')) && new Set(ids).size === ids.length,
        'reviews: unique sim: identifiers required');
      check(rs.every((r) => object(r) && nonempty(r.evidence) &&
        r.evidence.every((ev) => object(ev) && REQUIRED_SOURCES.includes(ev.source) && filled(ev.claim))),
      'reviews: cited evidence from trusted sources required');
      const approvals = rs.filter((r) => r?.vote === 'approve').length;
      approvalRatio = approvals / rs.length;
      check(rs.every((r) => r?.vote === 'approve'), 'reviews: disagreement, rejection or abstention blocks');
      check(approvalRatio >= 0.75, 'reviews: 75% quorum not met');
    }
  }

  const safety = data.safety;
  check(object(safety), 'safety: object required');
  if (object(safety)) {
    check(safety.external_calls === false, 'safety: external calls forbidden');
    check(safety.secrets_used === false, 'safety: secrets forbidden');
    check(safety.production_writes === false, 'safety: production writes forbidden');
    check(safety.deploy_requested === false, 'safety: deploy forbidden');
    check(safety.human_review_required === true, 'safety: human review must remain mandatory');
  }

  return {
    status: errors.length ? 'BLOCKED' : 'PASS_PILOT',
    ok: errors.length === 0,
    production_ready: false,
    review_mode: 'simulated',
    approval_ratio: Number(approvalRatio.toFixed(3)),
    errors,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 3) throw new Error('usage: node validate.mjs path/to/fixture.json');
    const input = JSON.parse(readFileSync(resolve(process.argv[2]), 'utf8'));
    const result = validatePilot(input);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({ status: 'BLOCKED', production_ready: false, errors: [String(error.message)] }));
    process.exitCode = 1;
  }
}
