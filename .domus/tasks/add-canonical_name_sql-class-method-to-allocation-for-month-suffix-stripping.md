# Task: Add canonical_name_sql class method to Allocation for month-suffix stripping

**ID:** add-canonical_name_sql-class-method-to-allocation-for-month-suffix-stripping
**Status:** done
**Branch:** chat-prompt-and-overspend-filters
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-05-24
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Add a class method to Allocation that returns a SQL fragment stripping month suffixes like (Mar), (Oct+Mar), (Mon, Mon, ...) from allocation names. Used for grouping in NLQ tools (budget_accuracy, allocation_lifecycle, out_of_budget_analysis, budget_vs_actual) so annual-billing variants are not treated as separate allocations. Query-time only — actual name data stays untouched.

---

## Acceptance Criteria

- [ ] `Allocation.canonical_name_sql` returns a SQL fragment usable in SELECT and GROUP BY
- [ ] Month suffixes stripped: `(Mon)`, `(Mon YYYY)`, `(Mon, Mon, ...)`, `(Mon & Mon)`, `(Mon+Mon)`
- [ ] Actual allocation name data is never modified
- [ ] Works with PostgreSQL REGEXP_REPLACE

---

## Implementation Notes

_Remove if empty._
