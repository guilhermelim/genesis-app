import { defineConfig, globalIgnores } from 'eslint/config'
import gitignore from 'eslint-config-flat-gitignore'
import eslintConfigPrettier from 'eslint-config-prettier'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  gitignore(),
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'always', allowObjectTypes: 'never' }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  eslintConfigPrettier,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts', 'ddd-boilerplate/**']),
])
