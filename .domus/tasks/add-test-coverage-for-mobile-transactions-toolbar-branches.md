# Task: Add test coverage for mobile transactions toolbar branches

**ID:** add-test-coverage-for-mobile-transactions-toolbar-branches
**Status:** raw
**Autonomous:** false
**Priority:** high
**Captured:** 2026-04-04
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

TransactionsPage.spec.ts: isMobile defaults to false in test env (matchMedia mock). All new mobile paths are uncovered: initMobileSearch URL/defaults, emitMobileFetch, import popup menu, mobile add button. Add at least happy-path tests with isMobile=true.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
