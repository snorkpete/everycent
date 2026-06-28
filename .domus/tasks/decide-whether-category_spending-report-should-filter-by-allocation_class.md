# Task: Decide whether category_spending report should filter by allocation_class

**ID:** decide-whether-category_spending-report-should-filter-by-allocation_class
**Status:** raw
**Autonomous:** false
**Priority:** high
**Captured:** 2026-06-21
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

`app/models/report.rb` category_spending sums budgeted vs spent per category/period across all `allocation_class`es with no class filter, so savings and bookkeeping line items appear as "spending". Decide (product call) whether to filter to spend-relevant classes (excluding non-spend classes like savings and bookkeeping). If yes, implement the filter and update any dependent KB/reports docs.

---

## Acceptance Criteria

- [ ] Product decision recorded
- [ ] If filtering is adopted: implement the filter + rspec green + update the knowledge-base reports doc
- [ ] If not: record the rationale for including all allocation_classes

---

## Implementation Notes

_Remove if empty._
