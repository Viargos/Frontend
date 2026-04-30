#!/usr/bin/env node
/**
 * Performance / Scalability Scan
 * Warns on: large files, missing dynamic(), heavy client trees
 */

const { readdirSync, readFileSync, statSync } = require('node:fs');
const { join, relative } = require('node:path');

const SRC_ROOT = join(process.cwd(), 'src');
const LINE_THRESHOLD = 300;
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

const files = listFiles(SRC_ROOT);
const largeFiles = [];
const clientWithoutDynamic = [];

for (const filePath of files) {
  const relPath = relative(process.cwd(), filePath).replace(/\\/g, '/');
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n').length;
  const hasUseClient = content.includes('\'use client\'') || content.includes('"use client"');

  if (lines > LINE_THRESHOLD) {
    largeFiles.push({ path: relPath, lines });
  }

  // Client components > 200 lines without dynamic import - suggest code-splitting
  if (hasUseClient && lines > 200 && !content.includes('dynamic(') && relPath.includes('/components/')) {
    clientWithoutDynamic.push({ path: relPath, lines });
  }
}

let exitCode = 0;

if (largeFiles.length > 0) {
  console.warn('\n--- Large Files (>300 lines) ---');
  largeFiles.sort((a, b) => b.lines - a.lines);
  for (const f of largeFiles.slice(0, 15)) {
    console.warn(`  ${f.path}: ${f.lines} lines`);
  }
  if (largeFiles.length > 15) console.warn(`  ... and ${largeFiles.length - 15} more`);
  console.warn('Consider splitting large files.\n');
}

if (clientWithoutDynamic.length > 0) {
  console.warn('--- Heavy Client Components (no dynamic) ---');
  for (const f of clientWithoutDynamic.slice(0, 10)) {
    console.warn(`  ${f.path}: ${f.lines} lines`);
  }
  console.warn('Consider dynamic() for heavy client components.\n');
}

process.exit(exitCode);
