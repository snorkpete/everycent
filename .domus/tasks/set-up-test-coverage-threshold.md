# Task: Set up test coverage threshold

**ID:** set-up-test-coverage-threshold
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-04-02
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

TEST-08 from the system audit. No coverage tooling is configured. Steps:
1. Install `@vitest/coverage-v8` as a dev dependency
2. Configure coverage in `vitest.config.ts` (or equivalent) — include `src/` files, exclude test files
3. Run full test suite with coverage to establish baseline numbers
4. Set initial thresholds at or slightly below the baseline (so it passes today but prevents regression)
5. Document the coverage numbers and threshold rationale

---

## Acceptance Criteria

- [ ] `@vitest/coverage-v8` installed
- [ ] Coverage configured in vitest config
- [ ] Baseline coverage measured and documented
- [ ] Threshold set (lines, branches, functions) — must pass with current test suite
- [ ] `npm run test:coverage` script added (or similar)
