/**
 * Tests for no-api-gateway-outside-api-modules ESLint rule.
 *
 * NOTE: These tests use node:test (not vitest). Run with:
 *   node --test tools/eslint-rules/no-api-gateway-outside-api-modules.test.mjs
 *
 * RuleTester internally calls describe()/it() which conflicts with vitest's
 * suite-nesting restrictions. The tools/ directory is excluded from vitest
 * via vite.config.ts, so this file is intentionally not picked up by vitest.
 * See no-api-gateway-outside-api-modules.test.mjs for the actual tests.
 */

// This file is intentionally empty — tests are in .test.mjs
export {};
