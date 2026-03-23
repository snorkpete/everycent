# Task: Sink funds — transfer dialog

**ID:** sink-funds-transfer-dialog
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

PrimeVue Dialog for transferring money between sink fund allocations (or to/from "Unassigned Money"). This is an internal transfer within a single sink fund — it does not move money between bank accounts. The dialog is opened via the "Transfer Money" button in the toolbar.

---

## Acceptance Criteria

- [ ] `SinkFundTransferDialog.vue` as a standalone dialog component
- [ ] Dialog header: "Transfer Money"
- [ ] Dialog is modal, closable via X button, width ~350px
- [ ] **"Transfer From" dropdown** (PrimeVue `Select`):
  - First option: "Unassigned Money - {formatted unassigned balance}" (value: `0`)
  - Remaining options: each sink fund allocation showing `"{name} ({formatted current_balance})"` (value: `allocation.id`)
- [ ] **"Transfer To" dropdown** (PrimeVue `Select`):
  - Same options as "Transfer From"
- [ ] **Amount field** — `EcMoneyField` with `editMode: true`
- [ ] **Save button** — calls `POST /sink_funds/:id/transfer_allocation` with `{ existing_allocation_id, new_allocation_id, amount }`
  - `existing_allocation_id = 0` means "from unassigned money"
  - `new_allocation_id = 0` means "to unassigned money"
- [ ] On successful save:
  - Show success notification: "Transfer complete."
  - Close the dialog
  - Refresh the sink fund detail (re-fetch from server to get updated balances)
- [ ] On save failure: show error notification: "Transfer failed: {error}"
- [ ] **Cancel button** — closes dialog, shows "Transfer cancelled." notification
- [ ] Validation: Save button disabled when from === to, or amount is 0 or not set, or from/to not selected
- [ ] Dialog resets form when opened (clear previous selections)
- [ ] `SinkFundsPage.vue` updated: "Transfer Money" button opens this dialog
- [ ] Full test coverage for the dialog component

**Not in scope:** Transfers between different bank accounts (that's `AccountTransferDialog`). Editing allocations.

---

## Implementation Notes

### Files to create/modify
- `src/app/sink-funds/SinkFundTransferDialog.vue` — new dialog component
- `src/app/sink-funds/SinkFundTransferDialog.spec.ts` — new spec
- `src/app/sink-funds/SinkFundsPage.vue` — wire "Transfer Money" button to open dialog

### API call

The transfer API is already defined in subtask 1's `sinkFundApi.ts`:
```typescript
transfer: (sinkFundId: number, data: SinkFundTransferData) =>
  apiGateway.post(`/sink_funds/${sinkFundId}/transfer_allocation`, data)
    .then(r => r.data.bank_account)
```

The `SinkFundTransferData` type:
```typescript
interface SinkFundTransferData {
  existing_allocation_id: number;
  new_allocation_id: number;
  amount: number;
}
```

### Transfer flow
1. User clicks "Transfer Money" button (visible only when NOT in edit mode)
2. Dialog opens with empty form
3. User selects "From" allocation (or Unassigned), "To" allocation (or Unassigned), enters amount
4. User clicks Save → API call → on success, close dialog + refresh sink fund
5. Updated balances reflected immediately after refresh

### Unassigned balance display
The dialog needs the `unassignedBalance` computed from the store to display in the dropdown option label. Import and use `useSinkFundStore()` inside the dialog component.

### Angular reference
- `webclientv3/src/app/sink-funds/add-transfer-form/add-transfer-form.component.ts` — full dialog template and logic
- `webclientv3/src/app/sink-funds/sink-fund.service.ts` — `transfer()` method

### Vue patterns to follow
- Dialog pattern: follow `src/app/transactions/AccountTransferDialog.vue` — PrimeVue Dialog with `visible` prop, `update:visible` emit, form state, save/cancel
- Money field: `EcMoneyField` with `:edit-mode="true"`
- Notifications: `useNotifications()` for success/error
- Stub Dialog in tests per `webclientv4/CLAUDE.md` convention
- `centsToDollars` for formatting balances in dropdown labels
