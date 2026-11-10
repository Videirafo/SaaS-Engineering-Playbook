import { lstatSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const REQUIRED = Object.freeze([
  'AGENTS.md',
  'docs/PRD.md',
  'docs/DESIGN_SYSTEM.md',
  'docs/ARCHITECTURE.md',
  'docs/DATABASE.md',
  'docs/SECURITY.md',
  'docs/CODE_STYLE.md',
  'docs/TESTING.md',
]);

export const OPTIONAL = Object.freeze([
  'docs/UX_FLOWS.md',
  'docs/API.md',
]);

function regularNonemptyFile(path) {
  try {
    const stat = lstatSync(path);
    return stat.isFile() && stat.size > 0;
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') return false;
    throw error;
  }
}

export function auditBlueprint(directory, options = {}) {
  const root = resolve(directory);
  const rootStat = lstatSync(root);
  if (!rootStat.isDirectory()) throw new Error('Target must be a directory');
  const required = REQUIRED.map((path) => ({
    path,
    present: regularNonemptyFile(join(root, path)),
  }));
  const optional = OPTIONAL.map((path) => ({
    path,
    present: regularNonemptyFile(join(root, path)),
    applicable: path.endsWith('UX_FLOWS.md') ? Boolean(options.ux) : Boolean(options.api),
  }));
  const missingRequired = required.filter((entry) => !entry.present).map((entry) => entry.path);
  const missingApplicable = optional.filter((entry) => entry.applicable && !entry.present).map((entry) => entry.path);
  const advisory = [];
  if (!required[0].present && regularNonemptyFile(join(root, 'docs/AGENTS.md'))) {
    advisory.push('docs/AGENTS.md found, but root AGENTS.md is needed for tool discovery');
  }
  return {
    root, status: missingRequired.length || missingApplicable.length ? 'INCOMPLETE' : 'STRUCTURE_PRESENT',
    qualityVerified: false,
    required, optional, missingRequired, missingApplicable, advisory,
  };
}

function main(argv) {
  if (argv.includes('--help')) {
    process.stdout.write('Usage: node tools/blueprint-audit.mjs [directory] [--json] [--ux] [--api]\n');
    return 0;
  }
  const unknown = argv.filter((item) => item.startsWith('--') && !['--json', '--ux', '--api'].includes(item));
  if (unknown.length) throw new Error('Unknown flags: ' + unknown.join(', '));
  const paths = argv.filter((item) => !item.startsWith('--'));
  if (paths.length > 1) throw new Error('Provide only one target directory');
  const result = auditBlueprint(paths[0] || process.cwd(), {
    ux: argv.includes('--ux'), api: argv.includes('--api'),
  });
  if (argv.includes('--json')) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    process.stdout.write(result.status + ' — ' + result.root + '\n');
    for (const item of result.required) process.stdout.write((item.present ? '[OK] ' : '[MISSING] ') + item.path + '\n');
    for (const item of result.optional) process.stdout.write((item.present ? '[OK] ' : item.applicable ? '[MISSING] ' : '[OPTIONAL] ') + item.path + '\n');
    for (const warning of result.advisory) process.stdout.write('NOTE: ' + warning + '\n');
    process.stdout.write('Only file presence/size was checked; quality and functional behavior NOT VERIFIED.\n');
  }
  return result.status === 'STRUCTURE_PRESENT' ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write('Blueprint audit error: ' + error.message + '\n');
    process.exitCode = 2;
  }
}
