import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHECK_NAME, EXPECTED_REPOSITORY, evaluateAttestation, attestPullRequest,
} from './app-check-attestor.mjs';

const SHA = 'a'.repeat(40);
const BASE = Object.freeze({
  number: 29, state: 'open', changed_files: 1,
  base: { ref: 'main', repo: { full_name: EXPECTED_REPOSITORY } },
  head: { sha: SHA },
});
const FILE = { filename: 'pilots/agent-engineering-core/validate.mjs', status: 'modified' };
const evaluate = (files, extra = {}) => evaluateAttestation({
  repositoryFullName: EXPECTED_REPOSITORY,
  pull: { ...BASE, changed_files: files.length, ...extra },
  files,
});

test('app policy attests complete pilot-only file inventory and exact HEAD', () => {
  assert.deepEqual(evaluate([FILE]), {
    ok: true, conclusion: 'success',
    summary: 'PASS_TRUSTED_SCOPE: 1 files; source and destination paths verified',
    headSha: SHA,
  });
});

test('app policy allows unrelated PRs, without accepting mixed pilot changes', () => {
  assert.match(evaluate([{ filename: 'README.md', status: 'modified' }]).summary, /^NOT_APPLICABLE/);
  const mixed = evaluate([FILE, { filename: 'src/auth.ts', status: 'modified' }]);
  assert.equal(mixed.conclusion, 'failure');
  assert.match(mixed.summary, /src\/auth\.ts/);
});

test('app policy rejects both directions of out-of-scope renames', () => {
  const intoPilot = evaluate([{ ...FILE, status: 'renamed', previous_filename: 'src/auth.ts' }]);
  const outOfPilot = evaluate([{ filename: 'src/auth.ts', status: 'renamed', previous_filename: FILE.filename }]);
  assert.equal(intoPilot.conclusion, 'failure');
  assert.equal(outOfPilot.conclusion, 'failure');
  assert.match(outOfPilot.summary, /src\/auth\.ts/);
});

test('app policy rejects missing rename origin and hidden pilot files', () => {
  assert.match(evaluate([{ ...FILE, status: 'renamed' }]).summary, /missing rename source/);
  for (const path of ['pilots/agent-engineering-core/.env', 'pilots/agent-engineering-core/src/.token']) {
    assert.equal(evaluate([{ filename: path }]).conclusion, 'failure');
  }
});

test('app policy fails closed for truncated, oversize or malformed inventory', () => {
  const one = [FILE];
  assert.equal(evaluateAttestation({ repositoryFullName: EXPECTED_REPOSITORY, pull: { ...BASE, changed_files: 2 }, files: one }).conclusion, 'failure');
  assert.equal(evaluate(one, { changed_files: 3000 }).conclusion, 'failure');
  assert.equal(evaluate(one, { changed_files: '1' }).conclusion, 'failure');
  assert.equal(evaluate(one, { changed_files: -1 }).conclusion, 'failure');
  assert.equal(evaluate(one, { changed_files: 0 }).conclusion, 'failure');
});

test('app policy rejects wrong repo, base, closed state and malformed SHA', () => {
  assert.equal(evaluateAttestation({ repositoryFullName: 'Untrusted/fork', pull: BASE, files: [FILE] }).conclusion, 'failure');
  assert.equal(evaluate([FILE], { state: 'closed' }).conclusion, 'failure');
  assert.equal(evaluate([FILE], { base: { ref: 'attacker', repo: { full_name: EXPECTED_REPOSITORY } } }).conclusion, 'failure');
  assert.equal(evaluate([FILE], { head: { sha: 'not-a-commit' } }).conclusion, 'failure');
});

test('app policy rejects malformed paths and object records', () => {
  for (const filename of [
    'pilots/agent-engineering-core/../auth.ts',
    'pilots/agent-engineering-core//auth.ts',
    'pilots/agent-engineering-core/\\auth.ts',
    'pilots/agent-engineering-core/valid.mjs ',
  ]) {
    assert.equal(evaluate([{ filename }]).conclusion, 'failure', filename);
  }
  assert.equal(evaluate([null]).conclusion, 'failure');
});

function makeApi({ files = [FILE], pulls, rejectCheck = false } = {}) {
  const calls = [];
  const states = pulls || [BASE, BASE];
  let index = 0;
  return {
    calls,
    getPull: async () => {
      calls.push('getPull');
      return states[Math.min(index++, states.length - 1)];
    },
    listFiles: async () => {
      calls.push('listFiles');
      return files;
    },
    createCheck: async (args) => {
      calls.push({ createCheck: args });
      if (rejectCheck) throw new Error('GitHub check creation rejected');
      return { id: 42 };
    },
  };
}

test('trusted external adapter emits a named check on verified PR SHA only', async () => {
  const api = makeApi();
  const result = await attestPullRequest({ repositoryFullName: EXPECTED_REPOSITORY, pullNumber: 29, api });
  assert.equal(result.ok, true);
  assert.equal(result.checkId, 42);
  assert.deepEqual(api.calls.slice(0, 3), ['getPull', 'listFiles', 'getPull']);
  assert.deepEqual(api.calls[3].createCheck, {
    owner: 'Videirafo', repo: 'SaaS-Engineering-Playbook',
    name: CHECK_NAME, head_sha: SHA,
    status: 'completed', conclusion: 'success',
    output: { title: 'Trusted scope policy passed', summary: result.summary },
  });
});

test('external adapter reports blocked scope as FAILURE, never SUCCESS', async () => {
  const api = makeApi({ files: [{ ...FILE, status: 'renamed', previous_filename: 'src/auth.ts' }] });
  const result = await attestPullRequest({ repositoryFullName: EXPECTED_REPOSITORY, pullNumber: 29, api });
  assert.equal(result.conclusion, 'failure');
  assert.equal(api.calls[3].createCheck.conclusion, 'failure');
});

test('external adapter refuses stale HEAD and emits no check', async () => {
  const api = makeApi({ pulls: [BASE, { ...BASE, head: { sha: 'b'.repeat(40) } }] });
  await assert.rejects(attestPullRequest({ repositoryFullName: EXPECTED_REPOSITORY, pullNumber: 29, api }), /head moved/);
  assert.equal(api.calls.some((c) => typeof c === 'object'), false);
});

test('external adapter fails on mismatched PR numbers, invalid invocations and API errors', async () => {
  const mismatch = makeApi({ pulls: [{ ...BASE, number: 30 }] });
  await assert.rejects(attestPullRequest({ repositoryFullName: EXPECTED_REPOSITORY, pullNumber: 29, api: mismatch }), /number mismatch/);
  assert.equal(mismatch.calls.some((c) => typeof c === 'object'), false);
  await assert.rejects(attestPullRequest({ repositoryFullName: EXPECTED_REPOSITORY, pullNumber: 0, api: makeApi() }), /Invalid trusted/);
  await assert.rejects(attestPullRequest({ repositoryFullName: EXPECTED_REPOSITORY, pullNumber: 29, api: makeApi({ rejectCheck: true }) }), /rejected/);
});

test('external adapter must refuse a missing or invalid SHA, without creating a check', async () => {
  const api = makeApi({ pulls: [{ ...BASE, head: { sha: null } }] });
  await assert.rejects(attestPullRequest({ repositoryFullName: EXPECTED_REPOSITORY, pullNumber: 29, api }), /Invalid PR head SHA/);
  assert.equal(api.calls.some((c) => typeof c === 'object'), false);
});
