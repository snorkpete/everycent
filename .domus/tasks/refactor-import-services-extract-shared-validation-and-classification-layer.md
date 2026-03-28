# Task: Refactor import services: extract shared validation and classification layer

**ID:** refactor-import-services-extract-shared-validation-and-classification-layer
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-03-28
**Parent:** none
**Depends on:** fix-allocation_id-test-code-mismatch-in-import-save-service
**Idea:** none
**Spec refs:** none

---

## What This Task Is

RAIL-02: Preview and save services duplicate IBAN validation, date parsing, duplicate detection, period checking. Extract TransactionClassifier for single-pass classification. Extract shared validation module. Unify error handling philosophy (classify, don't raise for individual transactions). Addresses RAIL-02, RAIL-03 (permitted fields), RAIL-04 (response schema) from audit.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
