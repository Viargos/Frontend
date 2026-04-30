#!/usr/bin/env node
/**
 * Governance Report Summary
 * Runs all guards and produces a summary for CI/developer feedback
 */

const { execSync, spawnSync } = require('node:child_process');

const guards = [
  { name: 'guard:types', cmd: 'npm run guard:types' },
  { name: 'guard:lint', cmd: 'npm run guard:lint' },
  { name: 'guard:circular', cmd: 'npm run guard:circular' },
  { name: 'guard:arch', cmd: 'node ./scripts/check-architecture.js' },
  { name: 'guard:rsc', cmd: 'node ./scripts/check-rsc-usage.js' },
];

let allPassed = true;
const results = [];

console.log('\n========== Governance Report ==========\n');

for (const g of guards) {
  try {
    execSync(g.cmd, { stdio: 'pipe', encoding: 'utf8' });
    results.push(`  ✓ ${g.name}`);
  } catch (e) {
    allPassed = false;
    results.push(`  ✗ ${g.name} FAILED`);
    if (e.stdout) console.error(e.stdout);
    if (e.stderr) console.error(e.stderr);
  }
}

results.forEach(r => console.log(r));
console.log('\n----------------------------------------');

if (allPassed) {
  console.log('All guards PASSED.');
} else {
  console.log('One or more guards FAILED. Fix violations before commit.');
  process.exit(1);
}

console.log('========================================\n');
process.exit(0);
