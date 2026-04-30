import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const PROJECT_ROOT = process.cwd();
const SRC_ROOT = path.join(PROJECT_ROOT, 'src');
const FILE_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'];

function extractImportSpecifiers(source) {
  const specifiers = [];
  const lines = source.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('import ') && !trimmed.startsWith('export ')) {
      continue;
    }

    const quoteStart = trimmed.includes('\'') ? trimmed.indexOf('\'') : trimmed.indexOf('"');

    if (quoteStart < 0) {
      continue;
    }

    const quoteChar = trimmed[quoteStart];
    const quoteEnd = trimmed.indexOf(quoteChar, quoteStart + 1);
    if (quoteEnd < 0) {
      continue;
    }

    const specifier = trimmed.slice(quoteStart + 1, quoteEnd);
    if (specifier.length > 0) {
      specifiers.push(specifier);
    }
  }

  return specifiers;
}

function listFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (entry === '.next' || entry === 'node_modules' || entry === 'dist') {
        continue;
      }

      files.push(...listFiles(fullPath));
      continue;
    }

    if (FILE_EXTENSIONS.includes(path.extname(fullPath))) {
      files.push(fullPath);
    }
  }

  return files;
}

function tryResolvePath(basePath) {
  if (FILE_EXTENSIONS.includes(path.extname(basePath))) {
    return statExists(basePath) ? basePath : null;
  }

  for (const extension of FILE_EXTENSIONS) {
    const withExt = `${basePath}${extension}`;
    if (statExists(withExt)) {
      return withExt;
    }
  }

  for (const extension of FILE_EXTENSIONS) {
    const indexFile = path.join(basePath, `index${extension}`);
    if (statExists(indexFile)) {
      return indexFile;
    }
  }

  return null;
}

function statExists(targetPath) {
  try {
    return statSync(targetPath).isFile();
  } catch {
    return false;
  }
}

function resolveImport(fromFile, specifier) {
  if (specifier.startsWith('@/')) {
    return tryResolvePath(path.join(SRC_ROOT, specifier.slice(2)));
  }

  if (specifier.startsWith('.')) {
    return tryResolvePath(path.resolve(path.dirname(fromFile), specifier));
  }

  return null;
}

function buildGraph(files) {
  const graph = new Map();

  for (const filePath of files) {
    const source = readFileSync(filePath, 'utf8');
    const imports = new Set();
    const specifiers = extractImportSpecifiers(source);

    for (const specifier of specifiers) {
      const resolved = resolveImport(filePath, specifier);
      if (resolved) {
        imports.add(resolved);
      }
    }
    graph.set(filePath, [...imports]);
  }

  return graph;
}

function detectCycles(graph) {
  const visiting = new Set();
  const visited = new Set();
  const stack = [];
  const cycles = [];
  const cycleKeys = new Set();

  function dfs(node) {
    if (visited.has(node)) {
      return;
    }

    visiting.add(node);
    stack.push(node);

    for (const dependency of graph.get(node) ?? []) {
      if (!graph.has(dependency)) {
        continue;
      }

      if (visiting.has(dependency)) {
        const cycleStart = stack.indexOf(dependency);
        const cyclePath = [...stack.slice(cycleStart), dependency];
        const cycleKey = cyclePath.join('->');

        if (!cycleKeys.has(cycleKey)) {
          cycleKeys.add(cycleKey);
          cycles.push(cyclePath);
        }
        continue;
      }

      dfs(dependency);
    }

    stack.pop();
    visiting.delete(node);
    visited.add(node);
  }

  for (const node of graph.keys()) {
    dfs(node);
  }

  return cycles;
}

const files = listFiles(SRC_ROOT);
const graph = buildGraph(files);
const cycles = detectCycles(graph);

if (cycles.length === 0) {
  console.log('No circular dependencies detected.');
  process.exit(0);
}

console.error(`Detected ${cycles.length} circular dependency cycle(s):`);
for (const cycle of cycles) {
  const formatted = cycle.map(filePath => path.relative(PROJECT_ROOT, filePath)).join(' -> ');
  console.error(`- ${formatted}`);
}

process.exit(1);
