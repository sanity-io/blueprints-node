import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    globals: false,
    include: ['*.test.ts'],
    environment: 'node',

    coverage: {
      reporter: ['text', 'json-summary', 'json'],
      reportOnFailure: true,
    },
  },
})
