import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Files to exclude from Knip analysis
  ignore: [
    '.storybook/**/*',
    'src/modules/common/helpers/common.helper.ts',
    'tests/**/*.ts',
    'lighthouserc.js',
    'src/libs/feature-flags.ts',
    'src/modules/counter/constants/**',
    'src/modules/counter/helpers/**',
    'src/libs/monitoring.ts',
    'src/modules/common/validations/common.validation.ts',
    'src/modules/common/types/common.type.ts',
    'src/modules/counter/types/counter.types.ts',
    'src/app/(marketing)/counter/actions.ts',
  ],
  // Dependencies to ignore during analysis
  ignoreDependencies: [
    '@commitlint/types',
    'conventional-changelog-conventionalcommits',
    'vite',
    '@faker-js/faker',
    'npm-run-all',
  ],
  // Binaries to ignore during analysis
  ignoreBinaries: [
    'production', // False positive raised with dotenv-cli
    'dotenv',
    'checkly',
    'lhci',
  ],
  // Ignore exports that are only used in the same file
  ignoreExportsUsedInFile: true,
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join('\n'),
  },
};

export default config;
