# Task: Migrate all spec.ts files to use test factories

**ID:** migrate-all-spects-files-to-use-test-factories
**Status:** raw
**Autonomous:** false
**Priority:** low
**Captured:** 2026-04-05
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Replace all inline test data object literals in webclientv4/**/*.spec.ts with builders from src/test/factories/. Gradual migration strategy agreed 2026-03-29: migrate-on-touch. This task tracks the completion criterion so the 'migrate on touch' rule in vue-testing-patterns.md can be retired once all specs are migrated. Done when no spec.ts file contains hand-built inline domain-type literals (BankAccount, Transaction, etc.) that a factory exists for.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
