# Task: Allocation auto-suggest in import preview

**ID:** allocation-auto-suggest-in-import-preview
**Status:** raw
**Autonomous:** false
**Priority:** high
**Captured:** 2026-03-22
**Parent:** none
**Depends on:** import-page-ui
**Idea:** none
**Spec refs:** none

---

## What This Task Is

V2 feature: during import preview, suggest allocation_id for each transaction by fuzzy-matching description against previous budget's transactions. Two-hop lookup: match description (starts-with/contains) to find previous transaction's allocation, then resolve to current budget's allocation by name. Auto-assigned in preview, user fixes exceptions before save. Sink fund accounts excluded from auto-suggest (sink_fund_allocation_id assignment doesn't follow same pattern).

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
