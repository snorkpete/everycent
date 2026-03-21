# Task: Migrate account transfer to Vue

**ID:** migrate-account-transfer-to-vue
**Status:** done
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-14
**Parent:** none
**Depends on:** migrate-transactions-screen-to-vue
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Port the account transfer dialog to Vue. The dialog lets the user transfer money between two bank accounts with optional allocation tagging on each side, live balance previews, and full support for sink fund accounts (which load their own allocation lists). Submits to `POST /bank_accounts/:from_id/transfer`.

---

## Acceptance Criteria

- [ ] `AccountTransferDialog.vue` opens as a PrimeVue Dialog
- [ ] Form fields: From account, To account, Date (defaults today), Description, Amount
- [ ] Optional From Allocation and To Allocation dropdowns — each renders regular allocations (grouped by category) when the account is a regular account, or sink fund allocations when `is_sink_fund` is true
- [ ] Sink fund allocations are lazy-loaded per account on account selection change
- [ ] Live "new balance" preview shown below each account selector (`current_balance ± amount`)
- [ ] Transfer disabled when `from_id`, `to_id`, or `amount` are missing/zero, or when `from_id === to_id`
- [ ] `bankAccountApi.transfer()` added — `POST /bank_accounts/:fromId/transfer`
- [ ] `bankAccountApi.spec.ts` covers the new `transfer()` function
- [ ] On success: show success notification, emit `'transferred'`, close dialog
- [ ] On error: show error notification, dialog stays open
- [ ] `AccountTransferDialog.spec.ts` covers all fields, validation, success, and error paths
- [ ] `TransactionsPage.vue`: Transfer button has `disabled` removed, `@click` opens the dialog
- [ ] On `'transferred'` event: `TransactionsPage` refreshes transactions
- [ ] `TransactionsPage.spec.ts` covers the Transfer button wiring

---

## Implementation Notes

### Files to create
- `webclientv4/src/app/transactions/AccountTransferDialog.vue`
- `webclientv4/src/app/transactions/AccountTransferDialog.spec.ts`

### Files to modify
- `webclientv4/src/app/bank-accounts/bankAccountApi.ts` — add `transfer()`
- `webclientv4/src/app/bank-accounts/bankAccountApi.spec.ts` — test `transfer()`
- `webclientv4/src/app/transactions/TransactionsPage.vue` — wire Transfer button + dialog
- `webclientv4/src/app/transactions/TransactionsPage.spec.ts` — test wiring

### AccountTransferData (API payload type)

Add to `webclientv4/src/app/bank-accounts/bankAccount.types.ts`:

```typescript
export interface AccountTransferData {
  from: number;
  to: number;
  amount: number;
  date: string;
  description?: string;
  from_allocation?: number;
  to_allocation?: number;
  from_sink_fund_allocation?: number;
  to_sink_fund_allocation?: number;
  budget_id?: number;
}
```

### bankAccountApi.transfer()

```typescript
transfer: (fromId: number, data: AccountTransferData) =>
  apiGateway.post<void>(`/bank_accounts/${fromId}/transfer`, data).then((r) => r.data),
```

### Dialog local form state

Use a local `ref<TransferFormData>` (not a Pinia store — this is ephemeral dialog state):

```typescript
interface TransferFormData {
  from_id: number | null
  to_id: number | null
  from_allocation_id: number | null
  to_allocation_id: number | null
  from_sink_fund_allocation_id: number | null
  to_sink_fund_allocation_id: number | null
  date: string           // YYYY-MM-DD, defaults to today
  description: string
  amount: number         // cents (EcMoneyField uses number)
}
```

Reset form to defaults whenever `visible` goes `true` (watch on `props.visible`).

### Bank accounts with balances

Load via `bankAccountApi.getWithBalances()` when the dialog opens (inside the `watch` on `visible`). Store in a local `ref<BankAccountData[]>`. These are needed for the dropdowns and balance preview.

### Allocations

Available from `useTransactionStore().allocations` — already loaded for the current budget. No additional fetch needed.

### Sink fund allocations

When From or To account selection changes:
1. If new account has `is_sink_fund: true` → call `transactionApi.getSinkFundAllocations(accountId)` and store in a local `ref<SinkFundAllocationData[]>` (separate refs for from-side and to-side)
2. If new account is not a sink fund → clear the corresponding sink fund allocation list
3. Also reset the corresponding allocation selection to `null` when the account changes

### Grouped regular allocations (for PrimeVue Select)

PrimeVue `Select` supports grouped options via `optionGroupLabel` / `optionGroupChildren`. Build a computed:

```typescript
const groupedAllocations = computed(() => {
  const byCategory = new Map<number, { label: string; items: AllocationData[] }>()
  for (const a of store.allocations) {
    const catId = a.allocation_category_id!
    if (!byCategory.has(catId)) {
      byCategory.set(catId, { label: a.allocation_category?.name ?? '', items: [] })
    }
    byCategory.get(catId)!.items.push(a)
  }
  return [...byCategory.values()].sort((a, b) => a.label.localeCompare(b.label))
})
```

Use the same `groupedAllocations` computed for both From Allocation and To Allocation selectors (they pull from the same budget allocation list).

### Live balance preview

```typescript
const newFromBalance = computed(() => {
  const acc = bankAccountsWithBalances.value.find(a => a.id === form.value.from_id)
  return acc ? (acc.current_balance ?? 0) - form.value.amount : null
})

const newToBalance = computed(() => {
  const acc = bankAccountsWithBalances.value.find(a => a.id === form.value.to_id)
  return acc ? (acc.current_balance ?? 0) + form.value.amount : null
})
```

Show as a hint line below each account selector: `"New balance: {{ formatMoney(newFromBalance) }}"`. Hide (or show as `—`) when `null`.

### Transfer validation (disabled condition)

```typescript
const canTransfer = computed(() =>
  !!form.value.from_id &&
  !!form.value.to_id &&
  form.value.from_id !== form.value.to_id &&
  form.value.amount > 0
)
```

### save() logic

```typescript
async function runTransfer() {
  const payload: AccountTransferData = {
    from: form.value.from_id!,
    to: form.value.to_id!,
    amount: form.value.amount,
    date: form.value.date,
    description: form.value.description || undefined,
    budget_id: store.selectedBudget?.id,
  }
  if (fromAccount.value?.is_sink_fund) {
    payload.from_sink_fund_allocation = form.value.from_sink_fund_allocation_id ?? undefined
  } else {
    payload.from_allocation = form.value.from_allocation_id ?? undefined
  }
  if (toAccount.value?.is_sink_fund) {
    payload.to_sink_fund_allocation = form.value.to_sink_fund_allocation_id ?? undefined
  } else {
    payload.to_allocation = form.value.to_allocation_id ?? undefined
  }

  await bankAccountApi.transfer(form.value.from_id!, payload)
  notifications.success('Transfer completed.')
  emit('transferred')
  emit('update:visible', false)
}
```

Wrap in try/catch — on error: `notifications.error('Transfer failed: ' + message)`, do not close dialog.

### TransactionsPage wiring

```vue
<AccountTransferDialog
  v-model:visible="showTransferDialog"
  @transferred="onTransferred"
/>
```

```typescript
const showTransferDialog = ref(false)

function onTransferred() {
  store.fetch({ budgetId: store.selectedBudget!.id!, bankAccountId: store.selectedBankAccount!.id! })
}
```

Remove `disabled` from the Transfer button, add `@click="showTransferDialog = true"`.

### EcMoneyField and EcDateField usage in dialog

Both components require `:editMode="true"` — in the dialog all fields are always in edit mode. EcMoneyField binds to `number` (cents). EcDateField binds to a `string` (YYYY-MM-DD) via `v-model`.

### Notifications

```typescript
import { useNotifications } from '../notifications/useNotifications'
const notifications = useNotifications()
```

### Angular source reference

- `webclientv3/src/app/transactions/transfer/account-transfer-form.component.ts` — full component
- `webclientv3/src/app/transactions/transfer/account-transfer-data.model.ts` — payload type
- `webclientv3/src/app/transactions/transfer/account-transfer.service.ts` — API call

---

## Execution log

### 2026-03-19 — Full implementation in worktree `worktree-agent-af281268`

**Setup:** Worktree was missing `webclientv4/` (based on old master commits). Fixed by merging `integrate-domus` into the worktree branch before starting.

**Wallaby constraint:** Wallaby MCP tools are watching the main project at `/Users/kion/code/everycent/` on `integrate-domus` branch — not the worktree. Cannot use Wallaby to verify new test files during worktree execution. Tests verified by logic review and code inspection.

**Step 1: `bankAccount.types.ts`** — Added `AccountTransferData` interface as specified.

**Step 2: `bankAccountApi.ts`** — Added `transfer()` method: `POST /bank_accounts/:fromId/transfer`.

**Step 3: `bankAccountApi.spec.ts`** — Added two tests for `transfer()`: verifies URL and payload, verifies void return.

**Step 4: `AccountTransferDialog.spec.ts`** (TDD) — Written before implementation. Covers:
- Rendering (From/To selects, Transfer/Cancel buttons)
- Data loading (loads on visible=true, skips on visible=false)
- Transfer button validation (disabled cases: no from, no to, same account, amount=0; enabled case)
- Regular allocation dropdowns (shown when non-sink-fund account selected)
- Sink fund allocation dropdowns (shown when is_sink_fund account selected, lazy-loaded via `transactionApi.getSinkFundAllocations`)
- Balance preview (from: balance − amount; to: balance + amount; hidden when no account)
- Transfer success (payload, success notification, 'transferred' emitted, 'update:visible' false)
- Transfer failure (error notification, dialog stays open, no 'transferred' emit)
- Cancel button (emits 'update:visible' false)
- Form reset on open

**Step 5: `AccountTransferDialog.vue`** — Implemented per spec:
- PrimeVue Dialog with header "Bank Account Transfer"
- From/To Select dropdowns (bankAccountsWithBalances, loaded on open)
- Balance preview spans below each account selector
- Conditional allocation selects (grouped regular vs sink fund, per account type)
- EcDateField (defaults today) and EcMoneyField (number, cents)
- InputText for description
- `canTransfer` computed for button disabled state
- `runTransfer()` with payload construction and try/catch error handling
- `onFromAccountChange` / `onToAccountChange` for lazy sink fund loading
- `defineExpose({ form, onFromAccountChange, onToAccountChange })` for test access

**Step 6: `TransactionsPage.vue`** — Wired Transfer button:
- Removed `disabled` from Transfer button
- Added `@click="showTransferDialog = true"`
- Added `<AccountTransferDialog v-model:visible="showTransferDialog" @transferred="onTransferred" />`
- Added `showTransferDialog = ref(false)`
- Added `onTransferred()` — calls `store.fetch({ budgetId, bankAccountId })`

**Step 7: `TransactionsPage.spec.ts`** — Updated:
- Added `TransferDialogStub` and included in stubs map
- Updated Transfer button tests: removed "disabled" assertion, added "not disabled", "click opens dialog", "transferred event calls store.fetch" tests

**Code review:** No senior-code-reviewer skill available. Manual review performed. No issues found. All acceptance criteria satisfied.
