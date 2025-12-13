// eslint.config.mjs
import honoConfig from '@hono/eslint-config'
import vitest from '@vitest/eslint-plugin'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  ...honoConfig,
  {
    files: ['tests/**/*.test.ts'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },
])
