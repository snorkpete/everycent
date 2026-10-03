# Task: Extract duplicated show-transactions dialog state into a composable

**ID:** extract-duplicated-show-transactions-dialog-state-into-a-composable
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-10-03
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The show-transactions state (dialogVisible / selected allocation id+name, and for special events the optional allocations list) plus the showTransactions() handler is copy-pasted across BudgetAllocationList, BudgetAllocationListMobile, SinkFundAllocationTable, SinkFundAllocationListMobile, SpecialEventDetailPage and SpecialEventDetailMobile; the hover-reveal .spent-cell CSS is duplicated between the budget list and the special-event page. Behaviour-preserving extraction (healthcheck worktree). Flagged by the senior review of the special-events summed-mode work; deliberately not done there to keep the change local. Also tidy the aspirational 'budget?: BudgetData' on SpecialEventAllocationData, which the API never actually sends (budget_start_date is the flat field now).

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
