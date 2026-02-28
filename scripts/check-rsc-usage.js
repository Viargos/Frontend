#!/usr/bin/env node
/**
 * Server Component enforcement script.
 * Rules:
 * - Files under src/app should NOT use "use client" (except error.tsx, global-error.tsx, providers)
 * - Allow exceptions for interactive pages (error boundaries, providers)
 * - Fail if client components import server-only modules
 * - Fail if server components import client-only hooks (useState, useEffect, etc. without "use client")
 */

const { readdirSync, readFileSync, statSync } = require('node:fs');
const { join, relative } = require('node:path');

const SRC_ROOT = join(process.cwd(), 'src');
const EXTENSIONS = ['.ts', '.tsx'];
const IGNORED_DIRS = new Set(['node_modules', '.next', '.git']);

// Allowed "use client" in app: error.tsx, global-error.tsx, error boundary, providers
const ALLOWED_CLIENT_IN_APP = [
  'error.tsx',
  'global-error.tsx',
  'providers.tsx',
];

const SERVER_ONLY_MODULES = [
  'server-only',
  'next/headers',
  'next/cache',
  'next/server',
  '@prisma/client',
  'drizzle-orm',
];

const CLIENT_ONLY_HOOKS = [
  'useState',
  'useEffect',
  'useLayoutEffect',
  'useReducer',
  'useCallback',
  'useMemo',
  'useRef',
  'useImperativeHandle',
  'useDebugValue',
  'useSyncExternalStore',
  'useTransition',
  'useDeferredValue',
  'useId',
  'useInsertionEffect',
];

function listFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (!IGNORED_DIRS.has(entry)) {
        files.push(...listFiles(fullPath));
      }
      continue;
    }

    if (EXTENSIONS.includes(entry.slice(entry.lastIndexOf('.')))) {
      files.push(fullPath);
    }
  }

  return files;
}

function hasUseClient(content) {
  return content.includes('\'use client\'') || content.includes('"use client"');
}

function extractImports(content) {
  const imports = [];
  const fromRegex = /from\s+['"]([^'"]+)['"]/g;
  let m = fromRegex.exec(content);
  while (m !== null) {
    imports.push(m[1]);
    m = fromRegex.exec(content);
  }
  return imports;
}

function isAllowedClientInApp(filePath) {
  const fileName = filePath.split(/[/\\]/).pop();
  return ALLOWED_CLIENT_IN_APP.includes(fileName);
}

const violations = [];

const files = listFiles(SRC_ROOT);

for (const filePath of files) {
  const relPath = relative(process.cwd(), filePath).replace(/\\/g, '/');
  const content = readFileSync(filePath, 'utf8');

  // 1. Files under src/app using "use client" - only allow error.tsx, global-error.tsx, providers.tsx
  if (relPath.startsWith('src/app/')) {
    if (hasUseClient(content) && !isAllowedClientInApp(filePath)) {
      violations.push(`[RSC] ${relPath} uses "use client" in app layer. Prefer server components; use client only for interactive page wrappers.`);
    }
  }

  // 2. Client components importing server-only modules
  if (hasUseClient(content)) {
    const imports = extractImports(content);
    for (const imp of imports) {
      for (const mod of SERVER_ONLY_MODULES) {
        if (imp === mod || imp.startsWith(`${mod}/`)) {
          violations.push(`[server-only in client] ${relPath} imports "${mod}" (server-only).`);
        }
      }
    }
  }

  // 3. Server components (no "use client") using client-only hooks
  if (!hasUseClient(content) && relPath.startsWith('src/app/')) {
    for (const hook of CLIENT_ONLY_HOOKS) {
      const hookRegex = new RegExp(`\\b${hook}\\s*\\(`);
      if (hookRegex.test(content)) {
        violations.push(`[client hook in RSC] ${relPath} uses ${hook} without "use client".`);
        break;
      }
    }
  }
}

if (violations.length > 0) {
  console.error('RSC usage violations detected:');
  for (const v of violations) {
    console.error(`  - ${v}`);
  }
  process.exit(1);
}

console.log('No RSC usage violations detected.');
process.exit(0);
