/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [vue()],
  server: {
    port: 4200,
    host: '127.0.0.1',
  },
  build: {
    outDir: '../public',
    emptyOutDir: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    // ESLint rule tests in tools/ use node:test (not vitest) — RuleTester conflicts
    // with vitest's describe/it tracking. Exclude tools/ entirely. The other entries
    // are vitest defaults that must be restated when overriding exclude.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      'tools/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'src/test/**',
        'src/**/*.spec.ts',
        'src/**/*.d.ts',
        'src/**/*.types.ts',
        'src/main.ts',
      ],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 85,
        lines: 90,
      },
    },
  },
});
