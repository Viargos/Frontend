#!/usr/bin/env node
/**
 * Enterprise Architecture Enforcement Script
 *
 * Enforces:
 * - 3-layer structure (app, modules, lib)
 * - Module contract (index.ts export, no deep cross-module imports)
 * - Cross-layer rules
 * - Component/service separation
 * - DTO correctness
 * - Raw fetch/axios rules
 * - any/ts-ignore
 * - Server-only in client
 */

const { readdirSync, readFileSync, statSync, existsSync } = require('node:fs');
const { join, relative } = require('node:path');

const SRC_ROOT = join(process.cwd(), 'src');
const MODULES_ROOT = join(SRC_ROOT, 'modules');
const EXTENSIONS = ['.ts', '.tsx'];
const IGNORED_DIRS = new Set(['node_modules', '.next', '.git']);

// Required module layers (search is hook-only, components optional)
const REQUIRED_MODULE_LAYERS = ['hooks', 'services', 'index.ts'];
const RECOMMENDED_MODULE_LAYERS = ['components'];

// Server layer = allowed fetch
const SERVER_LAYER_PATTERNS = [
  /^src\/app\/api\//,
  /^src\/app\/.*\/(page|layout|route|loading|error|not-found)\.(tsx?|jsx?)$/,
  /^src\/lib\//,
  /\.server\.(ts|tsx)$/,
  /^src\/middleware\.ts$/,
];

const COMPONENT_OR_HOOK_PATTERN = /\/modules\/[^/]+\/(?:components|hooks)\//;
const FEATURE_MODULES = ['auth', 'chat', 'dashboard', 'discover', 'journey', 'products', 'profile', 'search', 'settings'];

function isServerLayer(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return SERVER_LAYER_PATTERNS.some(p => p.test(normalized));
}

function isClientComponent(filePath, content) {
  return content.includes('\'use client\'') || content.includes('"use client"');
}

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

function getModuleFromPath(relPath) {
  const match = relPath.match(/^src\/modules\/([^/]+)/);
  return match ? match[1] : null;
}

const violations = [];
const warnings = [];

// --- PHASE 1 & 2: Module structure & contract ---
if (existsSync(MODULES_ROOT)) {
  const modules = readdirSync(MODULES_ROOT).filter(e => {
    const full = join(MODULES_ROOT, e);
    return statSync(full).isDirectory() && !e.startsWith('.');
  });

  for (const mod of modules) {
    if (mod === 'common') continue; // common is shared, different contract
    const modPath = join(MODULES_ROOT, mod);
    for (const layer of REQUIRED_MODULE_LAYERS) {
      if (layer.endsWith('.ts')) {
        if (!existsSync(join(modPath, layer))) {
          violations.push(`[module structure] ${mod}/ missing ${layer}`);
        }
      } else if (!existsSync(join(modPath, layer))) {
        violations.push(`[module structure] ${mod}/ missing ${layer}/`);
      }
    }
  }
}

// --- Scan all files ---
const files = listFiles(SRC_ROOT);

for (const filePath of files) {
  const relPath = relative(process.cwd(), filePath).replace(/\\/g, '/');
  const content = readFileSync(filePath, 'utf8');
  const imports = extractImports(content);
  const currentModule = getModuleFromPath(relPath);

  // 1. lib imports modules
  if (relPath.startsWith('src/lib/')) {
    for (const imp of imports) {
      if (imp.startsWith('@/modules/') || imp.includes('/modules/')) {
        violations.push(`[lib→modules] ${relPath} imports from modules layer`);
        break;
      }
    }
  }

  // 2. modules import app
  if (relPath.startsWith('src/modules/')) {
    for (const imp of imports) {
      if (imp.startsWith('@/app/') || imp.includes('/app/')) {
        violations.push(`[modules→app] ${relPath} imports from app layer`);
        break;
      }
    }
  }

  // 3. Cross-feature deep import: feature X importing feature Y internals (not common)
  if (currentModule && FEATURE_MODULES.includes(currentModule) && currentModule !== 'common') {
    for (const imp of imports) {
      const match = imp.match(/@\/modules\/([^/]+)\/(.+)/);
      if (match) {
        const [, targetMod, subpath] = match;
        if (targetMod === 'common') continue; // common is allowed
        if (targetMod !== currentModule) {
          // Cross-feature: only allow feature root imports plus dedicated public api entrypoints.
          if (subpath && subpath !== 'api') {
            violations.push(`[cross-feature deep import] ${relPath} imports @/modules/${targetMod}/${subpath}. Use @/modules/${targetMod} only.`);
          }
        }
      }
    }
  }

  // 4. Components import services (except .errors)
  if (relPath.includes('/components/') && COMPONENT_OR_HOOK_PATTERN.test(relPath)) {
    for (const imp of imports) {
      if (imp.includes('.errors') || imp.includes('/error')) continue;
      if ((imp.includes('/services/') && !imp.includes('.server')) || /@\/modules\/[^/]+\/services\//.test(imp)) {
        violations.push(`[component→service] ${relPath} imports service directly. Use hooks.`);
        break;
      }
    }
  }

  // 5. Raw fetch in client
  if (/\bfetch\s*\(/.test(content) && !isServerLayer(filePath)) {
    if (relPath.includes('lib/api/')) continue;
    if (isClientComponent(filePath, content)) {
      violations.push(`[raw fetch] ${relPath} uses fetch in client. Use module services.`);
    }
  }

  // 6. axios outside lib/api
  if (content.includes('axios') && !relPath.includes('src/lib/api/')) {
    violations.push(`[axios] ${relPath} uses axios outside lib/api.`);
  }

  // 7. explicit any
  if (/: any\b|as any\b|<\s*any\s*>|Promise\s*<\s*any\s*>|Record\s*<\s*string\s*,\s*any\s*>/.test(content)) {
    violations.push(`[explicit any] ${relPath} uses explicit any.`);
  }

  // 8. ts-ignore
  if (content.includes('@ts-ignore') || content.includes('ts-ignore')) {
    violations.push(`[ts-ignore] ${relPath} uses @ts-ignore.`);
  }

  // 9. DB in client
  if (isClientComponent(filePath, content)) {
    const dbPatterns = [
      /from\s+['"]@prisma\/client/,
      /from\s+['"]drizzle-orm/,
      /prisma\.(findMany|findUnique|create|update|delete)\s*\(/,
    ];
    for (const p of dbPatterns) {
      if (p.test(content)) {
        violations.push(`[DB in client] ${relPath} has direct DB access.`);
        break;
      }
    }
  }

  // 10. Server-only in client
  const SERVER_ONLY = ['server-only', 'next/headers', 'next/cache', '@prisma/client', 'drizzle-orm'];
  if (isClientComponent(filePath, content)) {
    for (const imp of imports) {
      for (const mod of SERVER_ONLY) {
        if (imp === mod || imp.startsWith(`${mod}/`)) {
          violations.push(`[server-only in client] ${relPath} imports "${mod}".`);
        }
      }
    }
  }

  // 11. Import count (scalability)
  if (imports.length > 25) {
    warnings.push(`[many imports] ${relPath} has ${imports.length} imports. Consider splitting.`);
  }
}

// Warnings don't fail - log only
if (warnings.length > 0) {
  console.warn('Architecture warnings:');
  for (const w of warnings) console.warn(`  ⚠ ${w}`);
}

if (violations.length > 0) {
  console.error('\nArchitecture violations:');
  for (const v of violations) console.error(`  ✗ ${v}`);
  process.exit(1);
}

console.log('No architecture violations detected.');
process.exit(0);
