# Task: Sink funds — page shell, store, API, types, route

**ID:** sink-funds-page-shell-store-api-types-route
**Status:** proposed
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-21
**Parent:** migrate-sink-funds-screen-to-vue
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Create the page shell, Pinia store, API layer, TypeScript types, and route for the sink funds screen. This is the foundation that subtasks 2–5 build on.

---

## Acceptance Criteria

- [ ] `SinkFundsPage.vue` at route `/sink-funds`
- [ ] `sinkFund.types.ts` with:
  - `SinkFundData` — id, name, account_type, account_type_description, account_category, account_no, institution_id, opening_balance, closing_balance, current_balance, sink_fund_allocation_balance, is_sink_fund, institution (optional `{ id: number, name: string }`), sink_fund_allocations (array)
  - `SinkFundAllocationData` — id, name, amount, bank_account_id, comment, spent, remaining, status, target, current_balance, difference, deleted (optional), unsaved (optional)
  - `SinkFundTransferData` — existing_allocation_id, new_allocation_id, amount
- [ ] `sinkFundApi.ts` with:
  - `getAll()` → `GET /sink_funds` — returns `SinkFundData[]`
  - `get(id)` → `GET /sink_funds/:id` — returns `SinkFundData` (unwrap `bank_account` key)
  - `save(sinkFund)` → `PUT /sink_funds/:id` with `{ sink_fund: { id, sink_fund_allocations } }` — returns `SinkFundData`
  - `transfer(sinkFundId, transferData)` → `POST /sink_funds/:id/transfer_allocation` — returns `SinkFundData`
- [ ] `sinkFundApi.spec.ts` with full test coverage for all endpoints
- [ ] `sinkFundStore.ts` (Pinia) with:
  - `sinkFunds` ref — list of all sink funds (for selector dropdown)
  - `sinkFund` ref — currently selected sink fund detail (with nested allocations)
  - `loading`, `error` refs
  - `isEditMode` ref with `enterEditMode()` / `exitEditMode()`
  - `showDeactivated` ref — toggle for showing closed allocations
  - `fetchList()` — loads all sink funds via `getAll()`
  - `fetchDetail(id)` — loads a single sink fund via `get(id)`
  - `save()` — sends `PUT /sink_funds/:id`, refreshes data, exits edit mode
  - `cancelEdit()` — exits edit mode, re-fetches from server
  - Computed: `visibleAllocations` — filters `sinkFund.sink_fund_allocations` by status when `showDeactivated` is false (only show `status === 'open'`)
  - Computed: `totalAssignedBalance` — sum of all allocations' `current_balance`
  - Computed: `unassignedBalance` — `sinkFund.current_balance - totalAssignedBalance`
  - Computed: `totalTarget` — sum of visible allocations' `target` (only where `target > 0`)
  - Computed: `totalOutstanding` — sum of visible allocations' `(current_balance - target)` (only where `target > 0`)
- [ ] `sinkFundStore.spec.ts` with full test coverage
- [ ] `SinkFundsPage.vue` with:
  - Page heading: "Sink Fund Obligations"
  - Sink fund selector: PrimeVue `Select` dropdown listing all sink funds by name
  - URL sync: `?sink_fund_id=X` query param (read on init, update on selection change)
  - Selecting a sink fund calls `fetchDetail(id)` and updates URL
  - Toolbar with:
    - Edit button (when not editing) → enters edit mode
    - Save + Cancel buttons (when editing) → save calls API, cancel refreshes
    - "Add Obligation" button (when editing) → adds new empty allocation
    - "Transfer Money" button (when not editing) → placeholder (subtask 4 wires it up)
  - Content area: placeholder sections for table and summary (subtasks 2, 3 fill them in)
  - "Show Closed Obligations?" toggle (PrimeVue ToggleSwitch or checkbox)
  - Success/error notifications on save
  - Layout consistent with TransactionsPage (toolbar at top, content card below, viewport-locked with internal scroll)
- [ ] `SinkFundsPage.spec.ts` with full test coverage
- [ ] Route added to `src/router/index.ts`: `{ path: '/sink-funds', name: 'sink-funds', component: () => import('...SinkFundsPage.vue') }`
- [ ] Menu item in `src/app/menu/menuItems.ts` updated: change `{ label: '* Sink Funds', icon: Icon.SINK_FUND, url: '/#/sink-funds' }` to `{ label: 'Sink Funds', icon: Icon.SINK_FUND, command: () => navigate('/sink-funds'), routePath: '/sink-funds' }` (remove the `*` prefix and switch from `url` to `command`)

**Not in scope:** Allocations table contents (subtask 2), summary rows (subtask 3), transfer dialog functionality (subtask 4), show transactions dialog (subtask 5).

---

## Implementation Notes

### Files to create/modify
- `src/app/sink-funds/sinkFund.types.ts` — new types file
- `src/app/sink-funds/sinkFundApi.ts` — new API file
- `src/app/sink-funds/sinkFundApi.spec.ts` — new spec
- `src/app/sink-funds/sinkFundStore.ts` — new store
- `src/app/sink-funds/sinkFundStore.spec.ts` — new spec
- `src/app/sink-funds/SinkFundsPage.vue` — new page component
- `src/app/sink-funds/SinkFundsPage.spec.ts` — new spec
- `src/router/index.ts` — add `/sink-funds` route
- `src/app/menu/menuItems.ts` — update Sink Funds menu item

### API response unwrapping

**Important:** The SinkFundSerializer sets `type 'bank_account'`, so the response from `GET /sink_funds/:id` wraps the data in a `bank_account` key:
```json
{ "bank_account": { "id": 5, "name": "...", ... } }
```

The `get(id)` function must unwrap this: `.then(r => r.data.bank_account)`.

For `GET /sink_funds` (index), Rails/AMS typically wraps in `bank_accounts` (plural) for collections. Check the actual response and unwrap accordingly. It may also just return an array directly depending on AMS config — test against the running server.

For `PUT /sink_funds/:id`, the response also wraps in `bank_account`. The `save()` function must unwrap: `.then(r => r.data.bank_account)`.

For `POST /sink_funds/:id/transfer_allocation`, same unwrapping.

### Save payload structure

The server expects allocations nested under `sink_fund`:
```typescript
sinkFundApi.save = (sinkFund: SinkFundData) =>
  apiGateway.put(`/sink_funds/${sinkFund.id}`, {
    sink_fund: {
      id: sinkFund.id,
      sink_fund_allocations: sinkFund.sink_fund_allocations,
    },
  }).then(r => r.data.bank_account)
```

Permitted allocation params on the server: `id, name, amount, target, comment, status, deleted`.

### URL sync pattern

Follow `TransactionSearchForm.vue`:
- On mount, read `route.query.sink_fund_id` — if present, select that sink fund
- On selection change, call `router.replace({ query: { sink_fund_id: selectedId } })`

### Angular reference
- `webclientv3/src/app/sink-funds/sink-funds.component.ts` — page shell with selector
- `webclientv3/src/app/sink-funds/sink-fund-selector/sink-fund-selector.component.ts` — dropdown
- `webclientv3/src/app/sink-funds/sink-fund.service.ts` — API calls (getSinkFunds, refreshSinkFund, save, transfer)
- `webclientv3/src/app/sink-funds/sink-fund-data.model.ts` — data model
- `webclientv3/src/app/sink-funds/sink-fund-allocation-data.model.ts` — allocation model
- `webclientv3/src/app/sink-funds/sink-fund-calculator.service.ts` — calculator (put as store computeds instead)

### Vue patterns to follow
- Store: `src/app/budgets/budgetStore.ts` — setup-style defineStore, loading/error/isEditMode
- API: `src/app/budgets/budgetApi.ts` — plain functions
- Page with selector: `src/app/transactions/TransactionsPage.vue` — dropdown + URL sync
- URL sync: `src/app/transactions/TransactionSearchForm.vue` — reference implementation
