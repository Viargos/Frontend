import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const targetRoots = ['src', 'scripts'];
const ignoredDirs = new Set(['node_modules', '.next', '.git']);
const emojiRegex = /\p{Extended_Pictographic}/u;

const offenders = [];

function collectFiles(root) {
  const files = [];
  const entries = readdirSync(root);

  for (const entry of entries) {
    const fullPath = join(root, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (!ignoredDirs.has(entry)) {
        files.push(...collectFiles(fullPath));
      }
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

for (const root of targetRoots) {
  for (const file of collectFiles(root)) {
    if (!['.ts', '.tsx', '.js', '.jsx', '.css', '.mdx', '.mjs'].includes(extname(file))) {
      continue;
    }

    const source = readFileSync(file, 'utf8');
    if (!emojiRegex.test(source)) {
      continue;
    }

    const lines = source.split('\n');
    for (let index = 0; index < lines.length; index += 1) {
      if (emojiRegex.test(lines[index] ?? '')) {
        offenders.push(`${file}:${index + 1}`);
      }
    }
  }
}

if (offenders.length > 0) {
  console.error('Emoji usage detected in source files:');
  for (const offender of offenders) {
    console.error(`- ${offender}`);
  }
  process.exit(1);
}

console.log('No emoji usage detected.');
