import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import jest from 'eslint-plugin-jest';
import jestDom from 'eslint-plugin-jest-dom';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import testingLibrary from 'eslint-plugin-testing-library';
import unusedImports from 'eslint-plugin-unused-imports';

const TEST_FILES = ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'];

const FEATURES = ['onboarding'];
const restrict = (group, message) => ({ group, message });
const sharedBarrelOnly = restrict(
  ['@/shared/*/**'],
  'Import shared layers through their barrel: @/shared/<layer>.',
);
const featureRootOnly = restrict(
  ['@/features/*/**'],
  'Outside a feature only its root barrel is public: @/features/<feature>.',
);
const noFeaturesFromShared = restrict(
  ['@/features/**', '@/app/**'],
  'shared/ and styles/ must not know about features or routes.',
);
const noRoutesFromFeatures = restrict(
  ['@/app/**'],
  'Features must not import routes: app/ composes features, not the other way round.',
);
const featurePatterns = (feature) => [
  sharedBarrelOnly,
  noRoutesFromFeatures,
  restrict(
    ['@/features/*', '@/features/*/**', `!@/features/${feature}`, `!@/features/${feature}/**`],
    'Features are isolated modules: do not import another feature.',
  ),
  restrict(
    [`@/features/${feature}/*/**`],
    'Inside a feature import sub-folders through their barrel: @/features/<feature>/<folder>.',
  ),
];
const noApiFromUi = (feature) =>
  restrict(
    [`@/features/${feature}/api`],
    'UI never calls the API directly: go through the step model.',
  );
const importRules = (patterns) => ({ 'no-restricted-imports': ['error', { patterns }] });

export default defineConfig([
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
    '.stryker-tmp/**',
    'reports/**',
  ]),
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
      // `interface XProps extends YProps {}` is the documented way to derive a prop set (rule 6).
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],
    },
  },
  { files: ['src/**'], rules: importRules([sharedBarrelOnly, featureRootOnly]) },
  {
    files: ['src/shared/**', 'src/styles/**'],
    rules: importRules([sharedBarrelOnly, featureRootOnly, noFeaturesFromShared]),
  },
  ...FEATURES.map((feature) => ({
    files: [`src/features/${feature}/**`],
    rules: importRules(featurePatterns(feature)),
  })),
  ...FEATURES.map((feature) => ({
    files: [`src/features/${feature}/*/ui/**`],
    rules: importRules([...featurePatterns(feature), noApiFromUi(feature)]),
  })),
  { files: ['src/**'], rules: { 'import/no-cycle': 'error' } },
  {
    files: ['src/**/ui/**/*.{ts,tsx}', 'src/shared/form/**/*.{ts,tsx}'],
    rules: { '@typescript-eslint/consistent-type-definitions': ['error', 'interface'] },
  },
  {
    files: ['src/**/*.tsx'],
    rules: { 'jsx-a11y/label-has-associated-control': 'error' },
  },
  { ...testingLibrary.configs['flat/react'], files: TEST_FILES },
  { ...jestDom.configs['flat/recommended'], files: TEST_FILES },
  {
    files: TEST_FILES,
    plugins: { jest },
    rules: {
      'jest/no-focused-tests': 'error',
      'jest/no-disabled-tests': 'error',
    },
  },
  eslintConfigPrettier,
]);
