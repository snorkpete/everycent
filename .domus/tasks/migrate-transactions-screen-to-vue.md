# Task: Migrate transactions screen to Vue

**ID:** migrate-transactions-screen-to-vue
**Status:** done
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-14
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Port the core Angular transactions screen to Vue. Covers: types, API layer, store, the main page layout, search form, editable transaction list, summary panel, and route registration. Import, transfer, and the selection calculator are separate dependent tasks.

Follow the types → API → store → components → routes pattern with TDD (write tests first, 100% coverage).

---

## Scope

**In scope:**
- `transaction.types.ts` — TransactionData, AllocationData (in budgets/budget.types.ts), SinkFundAllocationData (in sink-funds/sinkFund.types.ts)
- `transactionApi.ts` — `getAll(params)`, `save(payload)`
- `budgetApi.ts` — `getAll()` (used for budget dropdown), `getAllocations(budgetId)` — shared utility, not future-budgets-specific
- `bankAccountApi.ts` — add `getWithBalances()` if not already present (same `/bank_accounts` endpoint with `include_current_balance: true`)
- `transactionStore.ts` — transactions, allocations, sinkFundAllocations, selectedBankAccount, selectedBudget, loading, error; actions: fetch, save, refresh
- `TransactionsPage.vue` — 2-column grid layout (search | summary / list full-width)
- `TransactionSearchForm.vue` — bank account + budget dropdowns, auto-fetches on change, reads initial state from URL params (`?budget_id=X&bank_account_id=Y`), "Go to Budget" link
- `TransactionList.vue` — editable table: date, description, allocation/sink-fund-allocation (grouped by category, conditional on `bankAccount.is_sink_fund`), withdrawn, deposited, paid status (checkbox), delete. Edit/save/cancel mode toggle. "Add New Transaction" button. "Import" and "Transfer" buttons visible but disabled (pending dependent tasks).
- `TransactionSummary.vue` — last bank balance, transaction total, current bank balance. Conditionally: budget balance + difference (when `bankAccount.id === settings.primary_budget_account_id`). Credit card: unpaid balance + unpaid difference.
- Route: `{ path: '/transactions', name: 'transactions', component: TransactionsPage }`
- Menu: convert the `'* Transactions'` stub in `menuItems.ts` from `url: '/#/transactions'` to `command: () => navigate('/transactions'), routePath: '/transactions'` and remove the `*` prefix

**Out of scope (separate dependent tasks):**
- Transaction import dialog + importer services
- Account transfer dialog
- Transaction selection calculator (floating panel)

---

## Key API Facts

- `GET /transactions?budget_id=X&bank_account_id=Y` — fetch transactions
- `POST /transactions` — bulk save (all transactions at once, including deleted ones with `deleted: true` filtered client-side before posting)
- `GET /budgets` — used client-side to derive "budgets with transactions": last open budget + all closed budgets
- `GET /allocations?budget_id=X` — allocations for categorisation dropdown
- `GET /sink_fund_allocations?bank_account_id=X` — sink fund allocations (only when `bankAccount.is_sink_fund`)
- `GET /bank_accounts` — existing endpoint, already in bankAccountApi
- `GET /bank_accounts?include_current_balance=true` — for transfer form (out of scope here, but add `getWithBalances()` to bankAccountApi so the transfer task can use it)
- `POST /bank_accounts/:id/transfer` — out of scope

**No server-side pagination.** All transactions for the selected budget+account are loaded at once. This is a deliberate design decision.

---

## Data Model Notes

- `AllocationData` fields (beyond FutureAllocationData): `spent`, `allocation_category` (nested), `bank_account` (nested), `special_event_id`, `budget_name`, `allocation_category_name`. These are different types — do not merge with `FutureAllocationData`.
- `TransactionData.deleted` — soft delete flag. Deleted rows are visually struck through and excluded from the POST payload.
- `TransactionData.status` — `"paid"` | `"unpaid"`. Rendered as a checkbox. Auto-set to `"paid"` when an allocation is assigned (non-sink-fund accounts); credit card accounts default new rows to `"unpaid"`.
- `TransactionData.net_amount` — computed server-side (deposit - withdrawal). Used in calculator (out of scope) and summary unpaid balance.

---

## Budget API Pattern

Angular's `BudgetService` is a single service covering both future budgets and current budget operations. In Vue, `futureBudgetsApi.ts` already handles future budget endpoints. Create a separate `budgetApi.ts` for the operations needed here: `getAll()` and `getAllocations(budgetId)`. Do not merge into futureBudgetsApi.

---

## UX Redesign — Agreed Design (2026-03-15)

The initial agent implementation was functional but used the Angular two-column card layout. We reviewed the production screen at everycentapp.com and agreed on a new design. The UX redesign is tracked as a separate task (`redesign-transactions-screen-ux`), but the full spec is here for context.

### Layout

Three stacked zones — no two-column split:

```
┌─ toolbar ──────────────────────────────────────────────────────────┐
│ [Joint Account ▾]  [Feb 25 - Mar 24 ▾]  Go to Budget  [⇔][Σ][↺][Edit] │
├─ summary bar ──────────────────────────────────────────────────────┤
│ Last Balance: 0.00    Transactions: +1,642.15    Bank Balance: 1,642.15 │
│ Budget Balance: 1,657.39    [Σ total when active]    Diff: -15.24  │
├─ table (sticky header, scrollable body) ───────────────────────────┤
│ [□] Date │ Description │ Allocation │ Withdrawn │ Deposited │ ✓ │ × │
│ rows...                                                            │
└────────────────────────────────────────────────────────────────────┘
```

### Toolbar

- Dropdowns inline (bank account + budget), auto-fetch on change
- "Go to Budget" link — navigates to `/budgets/:selectedBudgetId`
- Right-aligned icon buttons (left to right): `⇔` wrap/truncate toggle, `Σ` calculator mode toggle, `↺` refresh, then `[Edit]` primary button
- In edit mode: `[Edit]` becomes `[Save]` + `[Cancel]` appears next to it
- `↺` Refresh = re-fetch from server, wipe all local changes (no separate "cancel" vs "reset" distinction)
- `⇔` and `Σ` are temporary evaluation features — we may remove them later

### Summary Bar

Two rows, three columns. Layout reflects importance hierarchy:

**Primary budget account (Joint Account):**
```
Row 1: Last Balance: X    Transactions: X    Bank Balance: X
Row 2: Budget Balance: X  [empty]            Diff: X
```
- Diff sits directly below Bank Balance — they're the most compared pair
- Middle cell of row 2 intentionally empty (or shows calculator total when Σ active)

**Credit card account:**
```
Row 1: Last Balance: X    Transactions: X    Bank Balance: X
Row 2: Unpaid Balance: X  [empty]            Unpaid Diff: X
```

**Regular account (no primary, no credit card):**
```
Row 1: Last Balance: X    Transactions: X    Bank Balance: X
(no row 2)
```

**Diff colour:** red when non-zero, green when zero. The money field handles negative colouring natively — do not re-implement colouring logic. Bank Balance has no special colour when positive (black/default); red only when negative, handled by the money field automatically.

### Calculator Mode (Σ)

The redesign phase reserves the column space only. Full calculator logic is out of scope — see task `migrate-transaction-calculator-to-vue`.

- A reserved fixed-width column (≈32px) sits at the left of the table. Column space is always reserved — no layout shift when the `Σ` button is toggled.
- The `Σ` button in the toolbar toggles the column between visible (checkboxes shown) and hidden (empty space). No checkbox state, no running total, no highlighting — that all lives in the calculator task.

### Table

- Full-width, sticky header, dense rows (matching Future Budgets density: 0.4rem padding, 0.875rem font)
- Columns: [calculator col 32px] Date | Description | Allocation | Withdrawn | Deposited | Paid | Delete
- Description column: truncates with ellipsis by default; `⇔` toggle switches to wrap mode
- Paid: checkmark icon (✓) in view mode, checkbox in edit mode
- Deleted rows: strikethrough, excluded from POST payload but kept in UI until save
- "Add New Transaction" button appears in table footer only in edit mode
- Import and Transfer buttons: visible in toolbar but disabled (pending dependent tasks)

### Default Bank Account

Backend orders accounts by `account_category_order`: current accounts first, then alphabetically. Vue defaults to `accounts[0]` — no special logic needed. The joint account is first because it's categorised as "current".

---

## Acceptance Criteria

- [ ] `GET /transactions` is called with correct `budget_id` and `bank_account_id` params on selection change
- [ ] Transactions render in table; date, description, allocation, withdrawn, deposited, paid columns present
- [ ] Edit mode toggle: fields become editable; save posts bulk payload; cancel reverts
- [ ] "Add New Transaction" inserts a blank row in edit mode
- [ ] Allocation dropdown groups by category; switches to sink fund allocation list when `bankAccount.is_sink_fund`
- [ ] Summary panel shows correct bank balance, transaction total, current balance
- [ ] Summary conditionally shows budget balance section (primary budget account only)
- [ ] Summary conditionally shows unpaid balance section (credit card accounts only)
- [ ] URL params (`?budget_id` / `?bank_account_id`) pre-select the correct budget and bank account on load
- [ ] Route `/transactions` is registered and accessible from the menu
- [ ] 100% test coverage on all new files
