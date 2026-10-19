import {defineConfig} from 'vitest/config';

export default defineConfig({
  define: {__GL_PUBLIC_RU__: 'false'},
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    restoreMocks: true,
    reporters: ['default', 'json', 'junit'],
    outputFile: {json: '.qa/study24/unit-results.json', junit: '.qa/study24/unit-results.xml'},
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx,js}'],
      exclude: ['src/**/*.d.ts'],
      reportsDirectory: '.qa/study24/coverage',
      reporter: ['text-summary', 'json-summary', 'html'],
    },
  },
});
