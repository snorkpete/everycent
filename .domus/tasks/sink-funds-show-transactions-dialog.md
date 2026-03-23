# Task: Sink funds — show transactions dialog

**ID:** sink-funds-show-transactions-dialog
**Status:** proposed
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-21
**Parent:** migrate-sink-funds-screen-to-vue
**Depends on:** sink-funds-allocations-table
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Wire up the placeholder eye icon in the allocations table to open a dialog showing the transactions for that sink fund allocation. The icon already exists from subtask 2 — this task makes it functional.

---

## Acceptance Criteria

- [ ] Clicking the eye icon on the Current Balance column opens a PrimeVue Dialog
- [ ] Dialog header shows "Transactions for {allocation name}" (e.g. "Transactions for Car Fund")
- [ ] Dialog displays a compact transaction list: Date, Description, Amount columns
- [ ] Transactions fetched via API: `GET /transactions/by_sink_fund_allocation?sink_fund_allocation_id=X`
- [ ] Amount column displays `net_amount` field from each transaction (or `deposit_amount - withdrawal_amount` if `net_amount` is not available)
- [ ] Total row at bottom summing displayed amounts
- [ ] Loading state while fetching
- [ ] Empty state when no transactions exist for the allocation ("No transactions found")
- [ ] Dialog is modal, closable via X button, width ~500px
- [ ] `SinkFundAllocationTable.vue` updated: eye icon click opens the dialog (pass allocation id and name)
- [ ] Full test coverage for the dialog component

**Not in scope:** Editing transactions from within this dialog. Navigation to the full transactions screen.

---

## Implementation Notes

### Files to create/modify
- `src/app/sink-funds/SinkFundTransactionsDialog.vue` — new dialog component
- `src/app/sink-funds/SinkFundTransactionsDialog.spec.ts` — new spec
- `src/app/sink-funds/SinkFundAllocationTable.vue` — wire eye icon click to open dialog (emit or local state)
- `src/app/sink-funds/sinkFundApi.ts` — add `getTransactionsForAllocation(sinkFundAllocationId)` if not already present

### API

Add to `sinkFundApi.ts`:
```typescript
getTransactionsForAllocation: (sinkFundAllocationId: number) =>
  apiGateway.get('/transactions/by_sink_fund_allocation', {
    params: { sink_fund_allocation_id: sinkFundAllocationId }
  }).then(r => r.data)
```

This returns an array of `TransactionData` (reuse the type from `src/app/transactions/transaction.types.ts`).

### Dialog design
- Compact table inside a Dialog — local state in the dialog component (fetch on open, display results)
- Dialog receives `allocationId` and `allocationName` as props (or via v-model pattern)
- On open (watch `visible` becoming true), fetch transactions
- Display in a simple `<table>` with Date, Description, Amount columns
- Footer row with total amount

### Angular reference
- `webclientv3/src/app/sink-funds/sink-fund/sink-fund.component.ts` — `showTransactionsFor()` method (lines 306–317)
- `webclientv3/src/app/shared-transactions/shared-transaction.service.ts` — `getTransactionsForSinkFundAllocation()`
- `webclientv3/src/app/shared-transactions/compact-transaction-list/compact-transaction-list.component.ts` — the dialog content component used by both budget allocations and sink fund allocations

### Vue patterns to follow
- Follow `src/app/budgets/AllocationTransactionsDialog.vue` — this is the exact same pattern but for budget allocations instead of sink fund allocations. The dialog structure, loading state, empty state, and table layout should be nearly identical.
- Stub Dialog in tests per `webclientv4/CLAUDE.md` convention
- Use `centsToDollars` for amount formatting
