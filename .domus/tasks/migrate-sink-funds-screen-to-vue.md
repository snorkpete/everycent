# Task: Migrate sink funds screen to Vue

**ID:** migrate-sink-funds-screen-to-vue
**Status:** proposed
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-03-14
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Port the sink funds screen from Angular to Vue. This is a parent task — the work is broken into 5 subtasks. The sink funds screen lets users view and manage sink fund accounts (bank accounts earmarked for long-term savings goals/obligations). Each sink fund has allocations with names, targets, and running balances. Users can edit allocation details, transfer money between allocations, and view transactions per allocation.

**Scope:** New `SinkFundsPage.vue` at `/sink-funds`, replacing the Angular sink funds screen.

---

## Subtasks

1. **Page shell, store, API, types, route** — skeleton page with sink fund selector dropdown, data layer, toolbar with edit/save/cancel, route
2. **Sink fund allocations table** — the main table showing all allocations with columns: Name, Current Balance, Target, Outstanding, Comment, Status, Actions
3. **Summary section** — account balance row, unassigned money row, and totals footer
4. **Transfer dialog** — "Transfer Money" dialog for moving money between sink fund allocations
5. **Show transactions dialog** — eye icon on Current Balance column opens compact transaction list for that allocation

**Dependencies:** 1 is the foundation. 2, 3, and 5 depend on 1. 4 depends on 1. 2 and 3 can run in parallel. 5 depends on 2 (eye icon lives in the table).

---

## Acceptance Criteria

Parent task is done when all 5 subtasks are done and:
- [ ] Sink funds screen accessible at `/sink-funds` route
- [ ] Menu item updated from `url: '/#/sink-funds'` to `command: () => navigate('/sink-funds')` with `routePath`
- [ ] Sink fund selector dropdown lists all sink fund accounts
- [ ] Selecting a sink fund loads its detail (allocations, balances)
- [ ] Allocations table shows Name, Current Balance, Target, Outstanding, Comment, Status
- [ ] Edit mode: inline editing of Name, Target, Comment, Status; add/delete allocations
- [ ] "Show Closed Obligations" toggle controls visibility of closed (status != 'open') allocations
- [ ] Summary rows: Account Balance, Unassigned Money at top; Totals at bottom
- [ ] Transfer Money dialog: from/to allocation selectors (including "Unassigned Money"), amount field, save/cancel
- [ ] Show transactions dialog: eye icon on Current Balance opens compact transaction list
- [ ] Save persists allocation changes via `PUT /sink_funds/:id`
- [ ] Success/error notifications on save and transfer operations
- [ ] Full test coverage on all new files

---

## Design Decisions

- **Store:** `sinkFundStore.ts` — single Pinia store holding the list of sink funds, the currently selected sink fund detail, edit mode state, and show-deactivated toggle.
- **Selector pattern:** follows TransactionsPage — a dropdown at the top of the page selects a sink fund. URL sync with `?sink_fund_id=X` query param (same pattern as TransactionSearchForm).
- **Edit mode:** in-place editing with explicit save — same as budget view. `cancelEdit()` re-fetches from server.
- **Save payload:** `PUT /sink_funds/:id` with `{ sink_fund: { id, sink_fund_allocations: [...] } }` — the server expects allocations nested under `sink_fund` key (see `extract_sink_fund_params` in `app/models/concerns/sink_fund.rb`).
- **Transfer:** `POST /sink_funds/:id/transfer_allocation` with `{ existing_allocation_id, new_allocation_id, amount }`. This is a separate API from the bank account transfer dialog — it moves money between allocations within the same sink fund.
- **Show/hide closed:** toggle for closed allocations (status != 'open'). Angular calls this "deactivated" — we simplify to "closed". Affects visibility and total calculations.

---

## Implementation Notes

### Angular reference
- `webclientv3/src/app/sink-funds/sink-funds.component.ts` — page shell with selector
- `webclientv3/src/app/sink-funds/sink-fund/sink-fund.component.ts` — main component (table, edit, save, transfer, show transactions)
- `webclientv3/src/app/sink-funds/sink-fund-selector/sink-fund-selector.component.ts` — dropdown selector
- `webclientv3/src/app/sink-funds/add-transfer-form/add-transfer-form.component.ts` — transfer dialog
- `webclientv3/src/app/sink-funds/sink-fund-data.model.ts` — sink fund data model
- `webclientv3/src/app/sink-funds/sink-fund-allocation-data.model.ts` — allocation data model
- `webclientv3/src/app/sink-funds/sink-fund-transfer-data.model.ts` — transfer data model
- `webclientv3/src/app/sink-funds/sink-fund-calculator.service.ts` — calculator (totals, unassigned balance, outstanding)
- `webclientv3/src/app/sink-funds/sink-fund.service.ts` — API service
- `webclientv3/src/app/shared-transactions/shared-transaction.service.ts` — transactions by sink fund allocation

### API endpoints

**GET /sink_funds** — list all sink funds (returns array of bank accounts with `account_type: 'sink_fund'`)
- Optional param: `include_closed=true` to include closed sink funds
- Response: array of `SinkFundData`

**GET /sink_funds/:id** — get a single sink fund with nested allocations
- Response shape (via SinkFundSerializer):
```json
{
  "bank_account": {
    "id": 5,
    "name": "Savings Account",
    "account_type": "sink_fund",
    "account_type_description": "Sink Fund",
    "account_category": "savings",
    "account_no": null,
    "institution_id": 1,
    "opening_balance": 0,
    "closing_balance": 500000,
    "current_balance": 500000,
    "sink_fund_allocation_balance": 450000,
    "is_sink_fund": true,
    "institution": { "id": 1, "name": "Some Bank" },
    "sink_fund_allocations": [
      { "id": 1, "name": "Car Fund", "amount": 200000, "bank_account_id": 5, "comment": "", "spent": 50000, "remaining": 150000, "status": "open", "target": 300000, "current_balance": 250000, "difference": -50000 }
    ]
  }
}
```
Note: the response wraps in `bank_account` key (SinkFundSerializer sets `type 'bank_account'`).

**PUT /sink_funds/:id** — save sink fund allocations
- Request payload:
```json
{
  "sink_fund": {
    "id": 5,
    "sink_fund_allocations": [
      { "id": 1, "name": "Car Fund", "amount": 200000, "target": 300000, "comment": "", "status": "open" },
      { "id": 0, "name": "New Goal", "amount": 0, "target": 100000, "comment": "", "status": "open" },
      { "id": 2, "name": "Old Goal", "deleted": true }
    ]
  }
}
```
- Permitted allocation params: `id, name, amount, target, comment, status, deleted`

**POST /sink_funds/:id/transfer_allocation** — transfer money between allocations
- Request payload:
```json
{
  "existing_allocation_id": 1,
  "new_allocation_id": 2,
  "amount": 5000
}
```
- `0` for `existing_allocation_id` means "from unassigned money"
- `0` for `new_allocation_id` means "to unassigned money"

**GET /transactions/by_sink_fund_allocation?sink_fund_allocation_id=X** — transactions for a specific allocation
- Response: array of `TransactionData`

### File structure
```
src/app/sink-funds/
  sinkFund.types.ts           — SinkFundData, SinkFundAllocationData, SinkFundTransferData
  sinkFundApi.ts              — API functions
  sinkFundApi.spec.ts
  sinkFundStore.ts            — Pinia store
  sinkFundStore.spec.ts
  SinkFundsPage.vue           — page shell with selector and toolbar
  SinkFundsPage.spec.ts
  SinkFundAllocationTable.vue — allocations table
  SinkFundAllocationTable.spec.ts
  SinkFundSummary.vue         — summary rows (or inline in table — design TBD per subtask)
  SinkFundTransferDialog.vue  — transfer dialog
  SinkFundTransferDialog.spec.ts
  SinkFundTransactionsDialog.vue — show transactions dialog
  SinkFundTransactionsDialog.spec.ts
```

### Vue patterns to follow
- Store: `budgetStore.ts` — setup-style defineStore with loading/error/isEditMode
- API: `budgetApi.ts` — plain functions with `.then(r => r.data)`
- Page with selector: `TransactionsPage.vue` — dropdown at top, URL sync
- Transfer dialog: `AccountTransferDialog.vue` — PrimeVue Dialog with Select dropdowns, amount field
- Show transactions dialog: `AllocationTransactionsDialog.vue` in budgets — compact transaction list in a dialog
- Calculator logic: put as computed properties in the store (no separate calculator class)
