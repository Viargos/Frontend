import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import antfu from '@antfu/eslint-config';
import jsdoc from 'eslint-plugin-jsdoc';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import playwright from 'eslint-plugin-playwright';
import storybook from 'eslint-plugin-storybook';
import tailwind from 'eslint-plugin-tailwindcss';

export default antfu(
  {
    react: true,
    nextjs: true,
    typescript: true,

    // Configuration preferences
    lessOpinionated: true,
    isInEditor: false,

    // Code style
    stylistic: {
      semi: true,
    },

    // Format settings
    formatters: {
      css: true,
    },

    // Ignored paths
    ignores: [
      'migrations/**/*',
      'docs/**',
      '**/*.md',
      'lighthouserc.js',
    ],
  },
  // --- Accessibility Rules ---
  jsxA11y.flatConfigs.recommended,
  // --- Tailwind CSS Rules ---
  ...tailwind.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: {
        config: `${dirname(fileURLToPath(import.meta.url))}/src/styles/global.css`,
      },
    },
  },
  // --- E2E Testing Rules ---
  {
    files: [
      '**/*.spec.ts',
      '**/*.e2e.ts',
    ],
    ...playwright.configs['flat/recommended'],
  },
  // --- Storybook Rules ---
  ...storybook.configs['flat/recommended'],
  // --- Custom Rule Overrides ---
  {
    rules: {
      // --- JSDoc Rules ---
      // To avoid redefine errors with Antfu, JSDoc rules are added here
      ...jsdoc.configs['flat/recommended-typescript'].rules,

      'antfu/no-top-level-await': 'off', // Allow top-level await
      'style/brace-style': ['error', '1tbs'], // Use the default brace style
      'ts/consistent-type-definitions': ['error', 'type'], // Use `type` instead of `interface`
      'react/prefer-destructuring-assignment': 'off', // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
      'react-hooks/incompatible-library': 'off', // Disable warning for compilation skipped
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      '@eslint-react/no-nested-component-definitions': 'error',
      'node/prefer-global/process': 'off', // Allow using `process.env`
      'ts/no-explicit-any': 'error', // Disallow `any`
      'test/padding-around-all': 'error', // Add padding in test files
      'test/prefer-lowercase-title': 'off', // Allow using uppercase titles in test titles
      'jsdoc/require-jsdoc': 'off', // JSDoc comments are optional
      'jsdoc/require-returns': 'off', // Return types are optional
      'jsdoc/require-hyphen-before-param-description': 'error', // Enforce hyphen before param description
      // Pixel-lock safety: keep legacy utility strings and media markup unchanged.
      'tailwindcss/no-custom-classname': 'off',
      '@next/next/no-img-element': 'error',
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-head-element': 'error',
      'no-console': 'warn',
      'no-restricted-syntax': ['error', {
        selector: 'MemberExpression[object.name="window"][property.name="location"]',
        message: 'Prefer next/navigation for routing. Use router.replace/push. For origin use getAppUrl or env.',
      }],
    },
  },
  // Allow window.location in lib/api (auth redirects, origin)
  {
    files: ['src/lib/api/**/*.ts', 'src/lib/api/**/*.tsx'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  // Allow console in server layer and scripts only
  {
    files: ['src/app/api/**/*.ts', 'src/app/api/**/*.tsx', 'src/lib/**/*.ts', 'src/lib/**/*.tsx', '**/*.server.ts', '**/*.server.tsx', 'src/middleware.ts', 'scripts/**/*.js', 'scripts/**/*.mjs'],
    rules: {
      'no-console': 'off',
    },
  },
  // Block axios except in lib/api
  {
    files: ['src/**/*.{ts,tsx}', '!src/lib/api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [
          {
            name: 'axios',
            importNames: ['default'],
            message: 'Use lib/api http-client. axios is only allowed in src/lib/api.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: [
              '@/modules/*/constants/**',
              '@/modules/*/dto/**',
              '@/modules/*/enums/**',
              '@/modules/*/helpers/**',
              '@/modules/*/hooks/**',
              '@/modules/*/infra/**',
              '@/modules/*/mappers/**',
              '@/modules/*/query-keys',
              '@/modules/*/schemas/**',
              '@/modules/*/services/**',
              '@/modules/*/types/**',
              '@/modules/*/validation/**',
              '@/modules/*/validations/**',
            ],
            message: 'App routes cannot import module internals directly. Use feature public API or route PageView components.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/modules/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/app/**'],
            message: 'Modules layer cannot import from app layer.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/modules/**/{components,hooks}/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/app/**'],
            message: 'Modules layer cannot import from app layer.',
          },
          {
            group: ['@/lib/api/**'],
            message: 'UI and hooks cannot import lib/api directly. Use module services.',
          },
          {
            group: ['next/headers'],
            message: 'next/headers is server-only and not allowed in component/hook trees.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/lib/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/app/**'],
            message: 'lib layer cannot import app layer.',
          },
          {
            group: ['@/modules/**'],
            message: 'lib layer cannot import modules layer.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/modules/auth/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/app/**'],
            message: 'Modules layer cannot import from app layer.',
          },
          {
            group: ['@/modules/*/*', '!@/modules/*/api', '!@/modules/auth/**', '!@/modules/common/**'],
            message: 'Cross-feature deep imports are blocked. Import other features from @/modules/<feature>.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/modules/chat/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/app/**'],
            message: 'Modules layer cannot import from app layer.',
          },
          {
            group: ['@/modules/*/*', '!@/modules/*/api', '!@/modules/chat/**', '!@/modules/common/**'],
            message: 'Cross-feature deep imports are blocked. Import other features from @/modules/<feature>.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/modules/dashboard/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/app/**'],
            message: 'Modules layer cannot import from app layer.',
          },
          {
            group: ['@/modules/*/*', '!@/modules/*/api', '!@/modules/dashboard/**', '!@/modules/common/**'],
            message: 'Cross-feature deep imports are blocked. Import other features from @/modules/<feature>.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/modules/discover/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/app/**'],
            message: 'Modules layer cannot import from app layer.',
          },
          {
            group: ['@/modules/*/*', '!@/modules/*/api', '!@/modules/discover/**', '!@/modules/common/**'],
            message: 'Cross-feature deep imports are blocked. Import other features from @/modules/<feature>.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/modules/journey/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/app/**'],
            message: 'Modules layer cannot import from app layer.',
          },
          {
            group: ['@/modules/*/*', '!@/modules/*/api', '!@/modules/journey/**', '!@/modules/common/**'],
            message: 'Cross-feature deep imports are blocked. Import other features from @/modules/<feature>.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/modules/products/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/app/**'],
            message: 'Modules layer cannot import from app layer.',
          },
          {
            group: ['@/modules/*/*', '!@/modules/*/api', '!@/modules/products/**', '!@/modules/common/**'],
            message: 'Cross-feature deep imports are blocked. Import other features from @/modules/<feature>.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/modules/profile/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/app/**'],
            message: 'Modules layer cannot import from app layer.',
          },
          {
            group: ['@/modules/*/*', '!@/modules/*/api', '!@/modules/profile/**', '!@/modules/common/**'],
            message: 'Cross-feature deep imports are blocked. Import other features from @/modules/<feature>.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/modules/settings/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/app/**'],
            message: 'Modules layer cannot import from app layer.',
          },
          {
            group: ['@/modules/*/*', '!@/modules/*/api', '!@/modules/settings/**', '!@/modules/common/**'],
            message: 'Cross-feature deep imports are blocked. Import other features from @/modules/<feature>.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/modules/common/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/app/**'],
            message: 'Modules layer cannot import from app layer.',
          },
          {
            group: ['@/modules/*/*', '!@/modules/*/api', '!@/modules/common/**'],
            message: 'Common module cannot deep import feature internals.',
          },
        ],
      }],
    },
  },
  // Ensure docs, markdown, and guard scripts are never linted as code
  {
    ignores: ['**/docs/**', '**/*.md', '**/lighthouserc.js', '**/postcss.config.mjs', 'scripts/check-architecture.js', 'scripts/check-rsc-usage.js', 'scripts/check-rsc-ratio.js', 'scripts/check-performance.js', 'scripts/governance-report.js'],
  },
);
