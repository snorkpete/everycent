# Task: Link transactions to budgets by foreign key instead of date range

**ID:** link-transactions-to-budgets-by-foreign-key-instead-of-date-range
**Status:** deferred
**Autonomous:** false
**Priority:** low
**Captured:** 2026-03-17
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Currently transactions are associated with a budget purely by their date falling within the budget's start/end range. Change this so transactions record the budget_id they belong to directly. The date range becomes validation only, not the primary relationship. Requires a Rails migration (add budget_id to transactions), API changes, and frontend updates.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
