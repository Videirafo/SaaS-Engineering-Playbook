#!/usr/bin/env node
/**
 * Git-diff path scope gate for Issue #28.
 * Reads NUL-separated filenames on stdin. No commands, network or filesystem changes.
 * Only the CI-provided git diff is evidence of actual changed paths.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const ALLOWED = Object.freeze([
  /^pilots\/agent-engineering-core\/[a-zA-Z0-9_.\/-]+$/,
  /^docs\/VIDEIRA_AGENT_ENGINEERING_CORE\.md$/,
  /^\.github\/workflows\/agent-engineering-pilot\.yml$/,
]);

export function verifyScope(paths) {
  if (!Array.isArray(paths) || paths.length === 0) {
    return { ok: false, status: 'BLOCKED', errors: ['no changed paths supplied'] };
  }
  const errors = [];
  for (const path of paths) {
    if (typeof path !== 'string' || !path ||
        path.trim() !== path || path.includes('\\') ||
        path.includes('//') || path.startsWith('/') ||
        path.split('/').some((part) => part === '..' || part === '.' || part === '') ||
        (path.startsWith('pilots/') && path.split('/').slice(2).some((part) => part.startsWith('.'))) ||
        !ALLOWED.some((pattern) => pattern.test(path))) {
      errors.push('out-of-scope path: ' + JSON.stringify(path));
    }
  }
  return { ok: errors.length === 0, status: errors.length ? 'BLOCKED' : 'PASS_SCOPE', errors };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const raw = readFileSync(0, 'utf8');
    if (!raw.endsWith('\0')) throw new Error('expected NUL-separated git diff filenames');
    const paths = raw.slice(0, -1).split('\0');
    const result = verifyScope(paths);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({ status: 'BLOCKED', ok: false, errors: [String(error.message)] }));
    process.exitCode = 1;
  }
}
