#!/usr/bin/env node
/**
 * RSC Ratio Checker
 * Reports percentage of Server vs Client components in src/
 */

const { readdirSync, readFileSync, statSync } = require('node:fs');
const { join, relative } = require('node:path');

const SRC_ROOT = join(process.cwd(), 'src');
const EXTENSIONS = ['.ts', '.tsx'];
const IGNORED_DIRS = new Set(['node_modules', '.next', '.git']);

function listFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      if (!IGNORED_DIRS.has(entry)) files.push(...listFiles(fullPath));
      continue;
    }
    if (EXTENSIONS.includes(entry.slice(entry.lastIndexOf('.')))) files.push(fullPath);
  }
  return files;
}

function hasUseClient(content) {
  return content.includes('\'use client\'') || content.includes('"use client"');
}

const files = listFiles(SRC_ROOT);
const relevant = files.filter(f => (f.endsWith('.tsx') || f.endsWith('.ts')) && f.includes('src/'));

let server = 0;
let client = 0;
const clientFiles = [];

for (const filePath of relevant) {
  const content = readFileSync(filePath, 'utf8');
  if (hasUseClient(content)) {
    client++;
    clientFiles.push(relative(process.cwd(), filePath));
  } else {
    server++;
  }
}

const total = server + client;
const serverPct = total ? ((server / total) * 100).toFixed(1) : 0;
const clientPct = total ? ((client / total) * 100).toFixed(1) : 0;

console.log('\n--- RSC Ratio Report ---');
console.log(`Total component/TS files: ${total}`);
console.log(`Server (no "use client"):  ${server} (${serverPct}%)`);
console.log(`Client ("use client"):     ${client} (${clientPct}%)`);
console.log('------------------------\n');

if (clientPct > 70) {
  console.warn(`⚠ High client ratio (${clientPct}%). Prefer Server Components where possible.`);
}

process.exit(0);
