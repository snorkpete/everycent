# Task: Migrate page tests to mock APIs not stores

**ID:** migrate-page-tests-to-mock-apis-not-stores
**Status:** done
**Autonomous:** false
**Priority:** high
**Captured:** 2026-03-28
**Parent:** none
**Depends on:** create-shared-test-data-factories, extract-shared-test-stubs-dialogstub-etc
**Idea:** none
**Spec refs:** none

---

## What This Task Is

TEST-01: TransactionsPage, ImportPage etc mock entire stores. Mock at API boundary instead, use real stores. Raises test confidence from 65% to 85%+. Gradual migration — new tests use real stores immediately, existing tests migrate as source files are touched.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
