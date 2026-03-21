# Task: Refactor transactions screen components before UX redesign

**ID:** refactor-transactions-screen-components-before-ux-redesign
**Status:** done
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-15
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Refactor the transactions screen before the UX redesign to ensure components have focused responsibilities. The redesign moves Edit/Save/Cancel/Refresh to the toolbar (TransactionsPage level), which requires edit draft state to live above TransactionList.

The broader direction: components should be thin presentation layers; app logic lives in the store (or a model layer wrapping the store). This makes component tests lightweight (just verify display + calling model) and stress-testing of business logic possible without mounting overhead.

**Spec work completed 2026-03-15:** TransactionList.spec and TransactionSearchForm.spec were cleaned up (createWrapper convention, selector constants, substantive paid/unpaid assertions, failing rendering tests fixed). The architectural refactor is the remaining work.

**Refactor completed 2026-03-15:**
- `isEditMode`, `draftTransactions`, `enterEditMode`, `exitEditMode`, `cancelEdit`, `addTransaction`, `deleteTransaction`, `onAllocationChange` added to transactionStore
- `fetch()` now syncs `draftTransactions` from `transactions` after loading, and clears `sinkFundAllocations` before loading (prevents stale data on account switch)
- `TransactionList` is now prop-free; reads all state from store
- `TransactionsPage` drives save via `store.save(store.draftTransactions)` + `store.exitEditMode()`, cancel via `store.cancelEdit()`
- All specs updated; TransactionList.spec restructured around delegation and display tests
- Senior code reviewer ran; two additional fixes applied: `exitEditMode` action (vs direct mutation), `sinkFundAllocations` cleared in `fetch`

---

## Acceptance Criteria

- [x] `isEditMode` moved to transactionStore
- [x] `draftTransactions` (local edit copy) moved to transactionStore
- [x] `enterEditMode`, `addTransaction`, `deleteTransaction`, `onAllocationChange` moved to transactionStore
- [x] `TransactionList` is a pure display component: reads store.draftTransactions, calls store actions for mutations — no local edit state
- [x] `TransactionsPage` handles save/cancel coordination (already does this today; just needs to drive edit mode via store)
- [x] All specs updated to match the new structure
- [x] Run senior-code-reviewer before committing

---

## Implementation Notes

**What NOT to refactor here:**
- `TransactionSearchForm` — the redesign replaces it entirely; refactoring it now is waste
- `TransactionSummary` — layout-only redesign, no logic changes needed
- `TransactionRow` extraction — the redesign doesn't add per-row complexity that justifies this

**Why move edit state to the store?**
The redesign task puts Edit/Save/Cancel/Refresh in the toolbar (TransactionsPage level). Currently TransactionList owns `isEditMode` and `localTransactions`. The toolbar can't drive those without either:
- Lifting state to TransactionsPage (awkward — TransactionList still needs to expose save/cancel)
- Or lifting to the store (clean — both toolbar and list read the same state)

The store approach also aligns with the presentation-component direction: TransactionList becomes display-only, all mutation logic is testable in isolation via store unit tests.

---

**Store additions (`transactionStore.ts`):**

New state:
```typescript
const isEditMode = ref(false)
const draftTransactions = ref<TransactionData[]>([])
```

New actions:
```typescript
function enterEditMode() {
  draftTransactions.value = structuredClone(toRaw(transactions.value))
  isEditMode.value = true
}

function cancelEdit() {
  draftTransactions.value = structuredClone(toRaw(transactions.value))
  isEditMode.value = false
}

function addTransaction() {
  const status = selectedBankAccount.value?.is_credit_card ? 'unpaid' : 'paid'
  draftTransactions.value.push({ withdrawal_amount: 0, deposit_amount: 0, status })
}

function deleteTransaction(transaction: TransactionData) {
  transaction.deleted = true
}

function onAllocationChange(transaction: TransactionData, allocationId: number) {
  transaction.allocation_id = allocationId
  transaction.status = allocationId > 0 ? 'paid' : 'unpaid'
}
```

`cancelEdit` resets `draftTransactions` from `transactions` — this replaces the watcher in TransactionList that currently resets `localTransactions` when `props.transactions` changes after a server refresh.

`deleteTransaction` and `onAllocationChange` mutate the transaction object directly (Pinia allows this since `draftTransactions` is an exposed ref).

Return all new state and actions from the store.

---

**TransactionList changes:**

Remove:
- `isEditMode` ref
- `localTransactions` ref and its watcher
- `enterEditMode`, `addTransaction`, `deleteTransaction`, `onAllocationChange` functions
- `save` and `cancel` emits (TransactionsPage drives these via the store directly)
- `props.budget` (only used by `addTransaction`, which moves to the store)

Add:
- `import { useTransactionStore }` and `const store = useTransactionStore()`
- Template binds to `store.draftTransactions` instead of `localTransactions`
- Template binds to `store.isEditMode` instead of `isEditMode`
- Row-level events call store actions: `store.deleteTransaction(t)`, `store.onAllocationChange(t, id)`, etc.
- Inline field mutations (`transaction.description = $event`) continue to mutate the draft directly — this is fine since `draftTransactions` is a store ref

---

**TransactionsPage changes:**

- `onSave` calls `store.save(store.draftTransactions)` then `store.isEditMode = false` (or a store action that wraps this)
- `onCancel` calls `store.cancelEdit()` (which already resets draft and clears edit mode)
- No props needed for edit mode — components read store directly

---

**Spec changes:**

`transactionStore.spec.ts` — add tests for all moved logic:
- `enterEditMode` creates a deep copy of transactions into draftTransactions
- `cancelEdit` resets draftTransactions and clears isEditMode
- `addTransaction` pushes with correct default status for credit card vs non-credit-card
- `deleteTransaction` sets deleted: true on the transaction
- `onAllocationChange` sets allocation_id and auto-sets status

`TransactionList.spec.ts` — remove all edit mode, save/cancel, add/delete tests (those move to store spec). Keep only:
- Display: renders transaction data correctly
- Display: allocation column header (Allocation vs Sink Fund Allocation)
- Display: shows correct fields for sink fund vs regular accounts
- Delegation: calls store actions when row-level events fire (e.g. delete button calls store.deleteTransaction)
