# Task: Migrate account balances screen to Vue

**ID:** migrate-account-balances-screen-to-vue
**Status:** proposed
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-14
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Port the account balances screen from Angular to Vue. This is a single task (no subtasks) — the screen is mostly read-only display with computed totals and one dialog for adjusting balances.

**Scope:** New `AccountBalancesPage.vue` at `/account-balances`. Displays all bank accounts grouped by category (Current Accounts, Cash Assets, Non Cash Assets, Credit Cards, Loans), with per-group totals and a net worth summary. Includes a toggle to show/hide closed accounts and a dialog to manually adjust account balances.

---

## Acceptance Criteria

- [ ] `AccountBalancesPage.vue` at route `/account-balances`
- [ ] `accountBalanceApi.ts` with:
  - `getAll(includeClosed?)` → `GET /account_balances` (optionally with `?include_closed=true`) — returns `AccountBalanceData[]`
  - `adjustBalances(adjustments)` → `POST /bank_accounts/manually_adjust_balances` with `{ adjustments: [...] }` — returns `{ success: boolean }`
- [ ] `accountBalanceApi.spec.ts` with full test coverage
- [ ] `accountBalance.types.ts` with:
  - `AccountBalanceData` — id, name, account_type, account_category, is_cash, closing_date, next_closing_date, closing_balance, expected_closing_balance, current_balance, institution (optional `{ id: number, name: string }`)
  - `BalanceAdjustmentData` — bank_account_id, new_balance, currentBalance (client-only, for filtering unchanged)
  - `BalanceAdjustmentsParams` — `{ adjustments: BalanceAdjustmentData[] }`
- [ ] `accountBalanceStore.ts` (Pinia) with:
  - `accounts` ref — `AccountBalanceData[]`
  - `includeClosed` ref — toggle for closed accounts
  - `loading`, `error` refs
  - `fetch()` — loads accounts via `getAll(includeClosed)`, called on mount and when toggle changes
  - `adjustBalances(adjustments)` — filters out unchanged (where `new_balance === currentBalance`), sends `POST`, refreshes accounts on success
  - Computed: `currentAccounts` — `account_category === 'current'`
  - Computed: `cashAssetAccounts` — `account_category === 'asset' && is_cash`
  - Computed: `nonCashAssetAccounts` — `account_category === 'asset' && !is_cash`
  - Computed: `creditCardAccounts` — `account_category === 'liability' && is_cash`
  - Computed: `loanAccounts` — `account_category === 'liability' && !is_cash`
  - Computed: `totalAssets` — sum of `current_balance` for accounts where `account_category === 'asset'`
  - Computed: `totalLiabilities` — sum of `current_balance` for accounts where `account_category === 'liability'`
  - Computed: `netCurrentCash` — sum of `current_balance` for accounts where `account_category === 'current'` OR (`account_category === 'liability' && is_cash`)
  - Computed: `netCashAssets` — sum of `current_balance` for accounts where `account_category === 'asset' && is_cash`
  - Computed: `netNonCashAssets` — sum of `current_balance` for accounts where (`account_category === 'asset' || account_category === 'liability') && !is_cash`
  - Computed: `netWorth` — sum of `current_balance` for ALL accounts
- [ ] `accountBalanceStore.spec.ts` with full test coverage
- [ ] `AccountBalancesPage.vue` with:
  - Page heading: "Account Balances"
  - Toolbar row with:
    - "Include Closed Accounts?" toggle (PrimeVue ToggleSwitch) — toggling re-fetches accounts
    - "Adjust Account Balances" button → opens `AdjustBalancesDialog`
  - Five `AccountCategoryTable` sections rendered in order: Current Accounts, Cash Assets, Non Cash Assets, Credit Cards, Loans
  - "Total Assets" line after Non Cash Assets section (before Credit Cards)
  - Net worth summary after Loans section: Total Liabilities, Net Current Cash, Net Cash Assets, Net Non Cash Assets, Net Worth
  - Layout: viewport-locked with internal scroll, consistent with TransactionsPage
- [ ] `AccountBalancesPage.spec.ts` with full test coverage
- [ ] `AccountCategoryTable.vue` — reusable table component receiving props:
  - `heading: string` — section heading
  - `accounts: AccountBalanceData[]` — filtered list of accounts for this category
  - Columns: Name (link to transactions), Institution, Account Type, Category, Balance At {closing_date}, Balance At {next_closing_date}, Current Balance
  - Name column links to `/transactions?bank_account_id={id}`
  - Footer row with totals for closing_balance, expected_closing_balance, current_balance
  - Closing date headers read from the first account in the list (all accounts in a household share the same budget dates)
  - Amounts displayed with `ecMoney` formatting
- [ ] `AccountCategoryTable.spec.ts` with full test coverage
- [ ] `AdjustBalancesDialog.vue` — PrimeVue Dialog with:
  - Title: "Adjust Account Balances"
  - Table with account names as column headers (horizontal layout — accounts are columns, not rows)
  - Row 1: "Current Balance" — read-only display of each account's `current_balance`
  - Row 2: "New Account Balance" — editable `EcMoneyField` for each account
  - Save button: filters out unchanged balances, calls `store.adjustBalances()`, shows success notification, closes dialog
  - Cancel button: closes dialog
- [ ] `AdjustBalancesDialog.spec.ts` with full test coverage
- [ ] Route added to `src/router/index.ts`: `{ path: '/account-balances', name: 'account-balances', component: () => import('...AccountBalancesPage.vue') }`
- [ ] Menu item in `src/app/menu/menuItems.ts` updated: change `{ label: '* Account Balances', icon: Icon.ACCOUNT_BALANCES, url: '/#/account-balances' }` to `{ label: 'Account Balances', icon: Icon.ACCOUNT_BALANCES, command: () => navigate('/account-balances'), routePath: '/account-balances' }` (remove the `*` prefix and switch from `url` to `command`)
- [ ] Success/error notifications: "Balances adjusted." on successful adjust, error message on failure

---

## Design Decisions

- **No subtasks:** This screen is mostly read-only with computed totals and one dialog. The entire feature fits in a single task.
- **Separate API type:** `AccountBalanceData` is defined in `accountBalance.types.ts`, not reusing `BankAccountData` from bank-accounts. The `/account_balances` endpoint returns a different serializer (`AccountBalanceSerializer`) with different fields (closing_date, next_closing_date, expected_closing_balance) that don't exist on the main bank accounts type.
- **Store computeds for category filtering and totals:** The Angular service has `totalAssets()`, `totalLiabilities()`, `netCurrentCash()`, etc. as methods. These become store computeds in Vue — no separate calculator class.
- **Horizontal dialog layout:** The adjust balances dialog uses accounts as columns (matching Angular). This works because the household typically has a small number of accounts.
- **Adjust endpoint reuse:** The `POST /bank_accounts/manually_adjust_balances` endpoint already exists on the bank accounts controller. The Vue API function lives in `accountBalanceApi.ts` (not `bankAccountApi.ts`) because it's conceptually part of the account balances feature.
- **Client-side filtering before save:** The Angular client filters out adjustments where `new_balance === currentBalance` before posting. The Vue implementation does the same in the store action.

---

## Implementation Notes

### Files to create/modify
- `src/app/account-balances/accountBalance.types.ts` — new types file
- `src/app/account-balances/accountBalanceApi.ts` — new API file
- `src/app/account-balances/accountBalanceApi.spec.ts` — new spec
- `src/app/account-balances/accountBalanceStore.ts` — new store
- `src/app/account-balances/accountBalanceStore.spec.ts` — new spec
- `src/app/account-balances/AccountBalancesPage.vue` — new page component
- `src/app/account-balances/AccountBalancesPage.spec.ts` — new spec
- `src/app/account-balances/AccountCategoryTable.vue` — reusable category table
- `src/app/account-balances/AccountCategoryTable.spec.ts` — new spec
- `src/app/account-balances/AdjustBalancesDialog.vue` — adjust balances dialog
- `src/app/account-balances/AdjustBalancesDialog.spec.ts` — new spec
- `src/router/index.ts` — add `/account-balances` route
- `src/app/menu/menuItems.ts` — update Account Balances menu item

### API endpoints

**GET /account_balances** — list all bank accounts with balance info
- Optional param: `include_closed=true` to include closed accounts
- Server orders by `account_category, name`
- Response: array of `AccountBalanceData` (via `AccountBalanceSerializer`)
```json
[
  {
    "id": 10,
    "name": "Joint Account",
    "account_type": "savings_account",
    "account_category": "current",
    "is_cash": true,
    "closing_date": "2026-03-24",
    "next_closing_date": "2026-04-24",
    "closing_balance": 164215,
    "expected_closing_balance": 150000,
    "current_balance": 164215,
    "institution": { "id": 1, "name": "ABN Amro" }
  }
]
```

**POST /bank_accounts/manually_adjust_balances** — adjust account balances
- Request payload:
```json
{
  "adjustments": [
    { "bank_account_id": 10, "new_balance": 170000 },
    { "bank_account_id": 12, "new_balance": 50000 }
  ]
}
```
- Response: `{ "success": true }` on success, `{ "success": false }` with status 400 on failure
- Note: only include accounts whose balance actually changed (filter client-side)

### Type definitions

```typescript
export interface AccountBalanceData {
  id: number;
  name: string;
  account_type: string;
  account_category: string;
  is_cash: boolean;
  closing_date: string;
  next_closing_date: string;
  closing_balance: number;
  expected_closing_balance: number;
  current_balance: number;
  institution?: { id: number; name: string };
}

export interface BalanceAdjustmentData {
  bank_account_id: number;
  new_balance: number;
  currentBalance: number; // client-only — used to filter unchanged before posting
}

export interface BalanceAdjustmentsParams {
  adjustments: BalanceAdjustmentData[];
}
```

### Category filtering logic (from Angular service)

These are the exact category/is_cash filter rules:
- **Current Accounts:** `account_category === 'current'`
- **Cash Assets:** `account_category === 'asset' && is_cash === true`
- **Non Cash Assets:** `account_category === 'asset' && is_cash === false`
- **Credit Cards:** `account_category === 'liability' && is_cash === true`
- **Loans:** `account_category === 'liability' && is_cash === false`

Summary totals:
- **Total Assets:** sum `current_balance` where `account_category === 'asset'`
- **Total Liabilities:** sum `current_balance` where `account_category === 'liability'`
- **Net Current Cash:** sum `current_balance` where `account_category === 'current'` OR (`account_category === 'liability' && is_cash`)
- **Net Cash Assets:** sum `current_balance` where `account_category === 'asset' && is_cash`
- **Net Non Cash Assets:** sum `current_balance` where (`account_category === 'asset' || account_category === 'liability') && !is_cash`
- **Net Worth:** sum `current_balance` for ALL accounts

### Angular reference
- `webclientv3/src/app/account-balances/account-balances/account-balances.component.ts` — page shell, category filtering, toggle, dialog open
- `webclientv3/src/app/account-balances/account-list/account-list.component.ts` — reusable category table with heading, columns, footer totals
- `webclientv3/src/app/account-balances/account-balance-totals/account-balance-totals.component.ts` — net worth summary section
- `webclientv3/src/app/account-balances/adjust-balances/adjust-balances.component.ts` — adjust balances dialog (horizontal layout)
- `webclientv3/src/app/account-balances/account-balances.service.ts` — API calls + calculation methods
- `webclientv3/src/app/account-balances/bank-account.model.ts` — Angular type
- `webclientv3/src/app/account-balances/bank-account-adjustment.model.ts` — adjustment type

### Backend reference
- `app/controllers/account_balances_controller.rb` — index action, includes institution + transactions, filters by status
- `app/serializers/account_balance_serializer.rb` — id, name, account_type, account_category, is_cash, closing_date, next_closing_date, closing_balance, expected_closing_balance, current_balance, institution
- `app/controllers/bank_accounts_controller.rb` — `manually_adjust_balances` action
- `app/models/concerns/manual_balance_adjustments.rb` — `BankAccount.manually_adjust_balances(adjustments)` class method

### Vue patterns to follow
- Store: `src/app/budgets/budgetStore.ts` — setup-style defineStore with loading/error
- API: `src/app/budgets/budgetApi.ts` — plain functions with `.then(r => r.data)`
- Page layout: `src/app/transactions/TransactionsPage.vue` — toolbar + content card, viewport-locked
- Dialog: `src/app/transactions/AccountTransferDialog.vue` — PrimeVue Dialog with form fields, save/cancel
- Money display: use `ecMoney` filter/formatter for all monetary values
- Table: plain HTML `<table>` (like `AccountCategoryTable` in Angular) — PrimeVue DataTable is overkill for simple read-only tables
