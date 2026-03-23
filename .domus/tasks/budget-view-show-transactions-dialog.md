# Task: Budget view — show transactions dialog

**ID:** budget-view-show-transactions-dialog
**Status:** done
**Branch:** task/budget-view-show-transactions-dialog
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-21
**Parent:** migrate-budget-viewedit-screen-to-vue
**Depends on:** budget-view-allocations-table
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Wire up the placeholder eye icon in the allocations table to open a dialog showing the transactions for that allocation. The icon already exists from subtask 3 — this task makes it functional.

---

## Acceptance Criteria

- [ ] Clicking the eye icon on the Spent column opens a PrimeVue Dialog
- [ ] Dialog header shows "Transactions for {allocation name}" (e.g. "Transactions for Groceries")
- [ ] Dialog displays a compact transaction list: Date, Description, Amount columns
- [ ] Transactions fetched via API: `GET /transactions/by_allocation?allocation_id=X`
- [ ] Amount column displays `net_amount` field from each transaction
- [ ] Total row at bottom summing displayed amounts
- [ ] Loading state while fetching
- [ ] Empty state when no transactions exist for the allocation
- [ ] Dialog is modal, closable via X button
- [ ] `BudgetAllocationList.vue` updated: eye icon click emits/triggers the dialog
- [ ] Full test coverage for the dialog component

**Not in scope:** Editing transactions from within this dialog. Navigation to the full transactions screen.

---

## Implementation Notes

### Files to create/modify
- `src/app/budgets/AllocationTransactionsDialog.vue` — new dialog component
- `src/app/budgets/AllocationTransactionsDialog.spec.ts` — new spec
- `src/app/budgets/BudgetAllocationList.vue` — wire eye icon click to open dialog
- `src/app/budgets/budgetApi.ts` — add `getTransactionsForAllocation(allocationId)` if not already available

### API
The Angular version uses `SharedTransactionService.transactionsForAllocation(allocation.id)` which hits `GET /transactions/by_allocation?allocation_id=X`. This is a custom route, not the standard transactions index.

### Design decisions
- Compact table inside a Dialog — local state in the dialog component (fetch on open, display results). Can access the page's budget store if needed.
- Dialog width ~500px (matches Angular's compact transaction list dialog)
- Reuse `TransactionData` type from `transaction.types.ts`
- Amounts displayed with `centsToDollars`

### Angular reference
- The eye icon in `allocation-list.component.ts` opens a `CompactTransactionListComponent` via `MatDialog`
- Transactions fetched via `SharedTransactionService.transactionsForAllocation(allocation.id)`
