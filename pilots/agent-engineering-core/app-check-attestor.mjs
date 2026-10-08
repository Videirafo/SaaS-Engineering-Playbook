/**
 * Trust-boundary contract for an external GitHub App check publisher.
 *
 * Must be executed by an independently deployed, authenticated GitHub App
 * handler. The existing App has Commit statuses:write, not Checks:write.
 * Never load this module from an untrusted PR checkout.
 * This module neither accesses credentials nor creates checks without a
 * trusted adapter explicitly supplied by that handler.
 */
export const STATUS_CONTEXT = 'videira/trusted-scope';
export const EXPECTED_REPOSITORY = 'Videirafo/SaaS-Engineering-Playbook';
const MAX_COMPLETE_FILE_COUNT = 2999;
const PILOT_ROOT = 'pilots/agent-engineering-core/';
const EXACT = new Set([
  'docs/VIDEIRA_AGENT_ENGINEERING_CORE.md',
  '.github/workflows/agent-engineering-pilot.yml',
  '.github/workflows/agent-engineering-trusted-scope.yml',
]);

const isPilotManaged = (path) =>
  path === 'pilots/agent-engineering-core' ||
  path.startsWith(PILOT_ROOT) || EXACT.has(path);

const isAllowed = (path) => {
  if (EXACT.has(path)) return true;
  return path.startsWith(PILOT_ROOT) &&
    /^pilots\/agent-engineering-core\/[A-Za-z0-9_.\/-]+$/.test(path) &&
    path.slice(PILOT_ROOT.length).split('/').every((part) =>
      part !== '' && part !== '.' && part !== '..' && !part.startsWith('.'));
};

const fail = (summary, sha = null) =>
  ({ ok: false, conclusion: 'failure', summary, headSha: sha });
const pass = (summary, sha) =>
  ({ ok: true, conclusion: 'success', summary, headSha: sha });

export function evaluateAttestation({ repositoryFullName, pull, files }) {
  if (repositoryFullName !== EXPECTED_REPOSITORY ||
      !pull || pull.state !== 'open' || pull.base?.ref !== 'main' ||
      pull.base?.repo?.full_name !== EXPECTED_REPOSITORY) {
    return fail('Wrong repository, base branch or pull request state');
  }
  const sha = pull.head?.sha;
  if (typeof sha !== 'string' || !/^[a-f0-9]{40}$/i.test(sha)) {
    return fail('Invalid PR head SHA');
  }
  if (!Number.isSafeInteger(pull.changed_files) || pull.changed_files < 1 ||
      pull.changed_files > MAX_COMPLETE_FILE_COUNT ||
      !Array.isArray(files) || files.length !== pull.changed_files) {
    return fail('Incomplete or invalid GitHub PR file inventory', sha);
  }
  const paths = [];
  for (const file of files) {
    if (!file || typeof file.filename !== 'string' ||
        (file.status === 'renamed' && typeof file.previous_filename !== 'string') ||
        (file.previous_filename != null && typeof file.previous_filename !== 'string')) {
      return fail('Invalid changed-file record or missing rename source', sha);
    }
    paths.push(file.filename);
    if (file.previous_filename != null) paths.push(file.previous_filename);
  }
  if (paths.some((path) => !path || path.trim() !== path ||
      path.startsWith('/') || path.includes('\\') ||
      path.includes('//') || path.split('/').some((part) => part === '.' || part === '..' || !part))) {
    return fail('Malformed changed-file path', sha);
  }
  if (!paths.some(isPilotManaged)) {
    return pass('NOT_APPLICABLE: unrelated PR, complete file inventory verified', sha);
  }
  const blocked = paths.filter((path) => !isAllowed(path));
  if (blocked.length) {
    return fail('Pilot scope violation: ' + blocked.join(', '), sha);
  }
  return pass('PASS_TRUSTED_SCOPE: ' + files.length + ' files; source and destination paths verified', sha);
}

/**
 * Adapter contract: getPull, listFiles (all pages), createCheck. No app
 * token is accepted here: credential isolation belongs to the trusted
 * external handler. If a head SHA changes during verification, do not
 * emit any status; GitHub branch protection must fail closed on absence.
 */
export async function attestPullRequest({ repositoryFullName, pullNumber, api }) {
  if (repositoryFullName !== EXPECTED_REPOSITORY ||
      !Number.isSafeInteger(pullNumber) || pullNumber < 1 ||
      !api || typeof api.getPull !== 'function' ||
      typeof api.listFiles !== 'function' || typeof api.createStatus !== 'function') {
    throw new Error('Invalid trusted attestation invocation');
  }
  const [owner, repo] = repositoryFullName.split('/');
  const request = { owner, repo, pull_number: pullNumber };
  const pull = await api.getPull(request);
  if (pull?.number !== pullNumber) throw new Error('PR number mismatch');
  const files = await api.listFiles(request);
  const result = evaluateAttestation({ repositoryFullName, pull, files });
  if (!result.headSha) throw new Error(result.summary);
  const latest = await api.getPull(request);
  if (latest?.head?.sha !== result.headSha || latest?.state !== 'open') {
    throw new Error('PR head moved during trusted attestation');
  }
  const status = await api.createStatus({
    owner, repo, sha: result.headSha,
    context: STATUS_CONTEXT,
    state: result.ok ? 'success' : 'failure',
    description: result.summary.slice(0, 140),
  });
  return { ...result, statusId: status?.id ?? null };
}
