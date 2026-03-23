# Task: Sink funds — summary section

**ID:** sink-funds-summary-section
**Status:** proposed
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-21
**Parent:** migrate-sink-funds-screen-to-vue
**Depends on:** sink-funds-page-shell-store-api-types-route
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Add the summary rows to the sink fund allocations table: account balance and unassigned money rows at the top of the table body, and a totals footer row at the bottom. These rows provide the financial context for the allocations list.

---

## Acceptance Criteria

- [ ] Two summary rows rendered at the **top of the table body** (before allocation rows):
  - **Row 1 — "Sink Fund Account Balance":**
    - Name cell: "Sink Fund Account Balance"
    - Current Balance cell: `sinkFund.current_balance` in currency format
    - Comment cell: "Current Account Balance"
    - All other cells empty
    - Bold styling, border top and bottom (`.total` class from Angular)
  - **Row 2 — "Unassigned Money":**
    - Name cell: "Unassigned Money"
    - Current Balance cell: `unassignedBalance` computed from store (= `current_balance - totalAssignedBalance`)
    - Comment cell: "Money not assigned to any financial goal/obligation"
    - All other cells empty
    - Bold styling, border top and bottom
- [ ] One **footer row** in `<tfoot>`:
  - Name cell: "Total"
  - Current Balance cell: `totalAssignedBalance` — sum of all allocations' `current_balance`
  - Target cell: `totalTarget` — sum of visible allocations' `target` (only where `target > 0`)
  - Outstanding cell: `totalOutstanding` — `totalAssignedBalance(visible, target > 0) - totalTarget`
  - All other cells empty
  - Bold styling with double border (top and bottom)
- [ ] Summary rows use the same column structure as the allocations table (7 columns)
- [ ] Amounts in currency format (cents to dollars), `font-variant-numeric: tabular-nums`
- [ ] `totalTarget` and `totalOutstanding` respect the `showDeactivated` toggle (only count visible allocations)
- [ ] `totalAssignedBalance` sums ALL allocations (not just visible — matches Angular behaviour)
- [ ] Full test coverage for the summary computations and rendering

**Not in scope:** Allocation rows (subtask 2). Transfer dialog (subtask 4). Show transactions dialog (subtask 5).

---

## Implementation Notes

### Integration approach

There are two approaches:
1. **Inline in `SinkFundAllocationTable.vue`** — add the summary rows directly to the existing table component's `<tbody>` (top rows) and `<tfoot>` (footer). This is simpler and matches the Angular approach where everything is in one table.
2. **Separate `SinkFundSummary.vue` component** — render above/below the table.

**Recommended: Option 1 (inline).** The Angular version has all rows in a single `<table>`. Splitting would break column alignment. The table component from subtask 2 should already have the `<table>` structure — this subtask adds the summary `<tr>` elements.

If subtask 2 is completed first, modify `SinkFundAllocationTable.vue` to add the rows. If this subtask runs in parallel with subtask 2, the worker should add the summary rows to `SinkFundsPage.vue` as a standalone table section and note that it should be merged into the allocations table when subtask 2 lands.

### Computed values

All computation should live in `sinkFundStore.ts` (already defined in subtask 1):
- `totalAssignedBalance` — `sum(sinkFund.sink_fund_allocations.map(a => a.current_balance))`
- `unassignedBalance` — `sinkFund.current_balance - totalAssignedBalance`
- `totalTarget` — `sum(visibleAllocations.filter(a => a.target > 0).map(a => a.target))`
- `totalOutstanding` — For allocations with `target > 0`, sum `(current_balance - target)`. This equals `sum(current_balance where target > 0) - totalTarget`.

### Angular reference
- `webclientv3/src/app/sink-funds/sink-fund/sink-fund.component.ts` — template lines 80–108 (account balance + unassigned rows), lines 183–209 (footer totals)
- `webclientv3/src/app/sink-funds/sink-fund-calculator.service.ts` — `totalAssignedBalance()`, `unassignedBalance()`, `totalTarget()`, `totalOutstanding()`

### Vue patterns to follow
- Follow `src/app/budgets/BudgetAllocationList.vue` footer pattern for the totals row
- Use `centsToDollars` for formatting
- Bold `.total` class styling consistent with Angular
