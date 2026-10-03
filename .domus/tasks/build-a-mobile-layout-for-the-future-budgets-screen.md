# Task: Build a mobile layout for the Future Budgets screen

**ID:** build-a-mobile-layout-for-the-future-budgets-screen
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

On mobile (real phone and browser device emulation) the Future Budgets screen shows only the row-name column — no budget amount columns are visible. Unlike every other screen, FutureBudgetsPage.vue has no *Mobile.vue variant: it is a single wide table (sticky name column + one column per open budget) whose only mobile concession is EcPageLayout padding. Suspected cause (NOT yet verified in a browser): the figures do render but sit off-screen — all cells are white-space: nowrap and .name-col is min-width 12rem, so the name column stretches to the longest row name and pushes the 8rem budget columns past the viewport; the page itself appears to overflow the device frame, so the horizontal overflow may not be contained to .table-wrapper.

DECIDED: fix is a proper mobile layout as a separate component (per the webclientv4 mobile pattern, reference impl SinkFundsPage.vue), not a scroll/sticky patch on the existing table.

OPEN (needs a design pass before dispatch): what the mobile layout should be. The desktop spreadsheet (budgets as columns) does not translate to a phone. Key constraint to exploit: BudgetMassEditDialog already edits one row across ALL budgets, so the mobile grid only has to support browse + read, not cross-budget editing. Candidate directions: one-budget-at-a-time with a budget selector; expandable row cards showing per-budget amounts on tap; or keep the grid with a properly-scrollable sticky column. Also decide where the section totals (Total Income / Total Allocations / Total Discretionary) and the variable-only + dash-if-zero toggles live on mobile.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
