/**
 * check-api-ownership.mjs
 *
 * Scans all *Api.ts files in src/ and verifies that each endpoint URL is owned
 * by exactly one api module. Exits 1 and reports violations if any URL appears
 * in more than one file. Exits 0 if the invariant holds.
 *
 * Run: node tools/check-api-ownership.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = fileURLToPath(new URL('.', import.meta.url));
const srcDir = join(scriptDir, '..', 'src');

// Match: apiGateway.(get|post|put|delete|patch)<optional generic>('url' or `/url`)
//
// Assumes the URL literal sits on the same logical line as the apiGateway call,
// after optional whitespace and an optional generic. If anyone ever formats a
// call across multiple lines (e.g. with a multi-line generic argument), the
// regex will miss it and this script will silently under-report. Switch to a
// real AST parse if that becomes a problem.
const endpointRegex =
  /apiGateway\.(get|post|put|delete|patch)\s*(?:<[^>]*>)?\s*\(\s*[`'"]([^`'"]+)[`'"]/g;

/**
 * Normalise a URL by replacing ${...} interpolations with :id so that
 * /institutions/${id} and /institutions/${foo.bar} collapse to the same identity.
 */
function normalise(url) {
  return url.replace(/\$\{[^}]+\}/g, ':id');
}

/** Recursively collect all *Api.ts files, excluding *.spec.ts */
function collectApiFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectApiFiles(full));
    } else if (
      (entry.endsWith('api.ts') || entry.endsWith('Api.ts')) &&
      !entry.endsWith('.spec.ts')
    ) {
      results.push(full);
    }
  }
  return results;
}

const apiFiles = collectApiFiles(srcDir);

/** Map<normalisedUrl, string[]> — which files own each endpoint */
const ownership = new Map();

for (const file of apiFiles) {
  const source = readFileSync(file, 'utf8');
  const relPath = relative(join(scriptDir, '..'), file);
  let match;
  while ((match = endpointRegex.exec(source)) !== null) {
    const url = normalise(match[2]);
    const owners = ownership.get(url) ?? [];
    if (!owners.includes(relPath)) {
      owners.push(relPath);
    }
    ownership.set(url, owners);
  }
}

const duplicates = [...ownership.entries()].filter(([, owners]) => owners.length > 1);

if (duplicates.length === 0) {
  console.log('check-api-ownership: OK — all endpoints have a single owner');
  process.exit(0);
}

console.error('check-api-ownership: FAIL — the following endpoints appear in more than one api module:');
for (const [url, owners] of duplicates) {
  console.error(`  ${url}`);
  for (const owner of owners) {
    console.error(`    - ${owner}`);
  }
}
process.exit(1);
