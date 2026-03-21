# Task: Migrate budget list screen to Vue

**ID:** migrate-current-budget-and-budget-list-screens-to-vue
**Status:** in-progress
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-03-14
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Port the budget list screen and "Current Budget" shortcut from Angular to Vue. The single budget editor screen (viewing/editing a specific budget's incomes and allocations) is a separate, larger task.

**Scope:** Budget list screen only. The budget editor (`/budgets/:id`) will be a follow-up task.

---

## Acceptance Criteria

- [ ] `BudgetsPage.vue` at `/budgets` showing all budgets in a table (name, status badge, action buttons)
- [ ] View button on each row → navigates to `/budgets/:id`
- [ ] Copy button (first budget only) → confirmation dialog → copies budget → refreshes list
- [ ] Close button (last open budget only) → confirmation dialog → closes budget → refreshes list
- [ ] Add New Budget button → dialog with date picker → creates budget → refreshes list
- [ ] Reopen Last Budget button → confirmation dialog → reopens → refreshes list
- [ ] `/budgets/current` route → calls `GET /budgets/current` → redirects to `/budgets/:id`
- [ ] `/budgets/:id` route registered (placeholder — budget editor screen not yet built)
- [ ] Menu items updated: remove `*` prefix, switch from Angular `url:` to Vue `command:` navigation
- [ ] `budgetListStore.ts` (Pinia) — separate from the future budget editor store
- [ ] `budgetApi.ts` extended with `getCurrentBudgetId`, `create`, `copy`, `close`, `reopenLast`
- [ ] `AddBudgetDialog.vue` — simple dialog with start date picker
- [ ] Full test coverage: API, store, page component, dialog
- [ ] Visual style: consistent with transactions page (toolbar + content card), table with sticky header, status badges, row hover

---

## Implementation Notes

### Files to create/modify
- `src/app/budgets/budgetApi.ts` — extend with new endpoints
- `src/app/budgets/budgetListStore.ts` — new Pinia store for the list screen
- `src/app/budgets/BudgetsPage.vue` — new page component
- `src/app/budgets/AddBudgetDialog.vue` — new dialog
- `src/router/index.ts` — add `/budgets`, `/budgets/current`, `/budgets/:id` routes
- `src/app/menu/menuItems.ts` — update Budget and Current Budget items
- `src/main.ts` — register PrimeVue `ConfirmationService`
- Specs for all new files

### Design decisions
- Store is named `budgetListStore` (not `budgetStore`) because the budget editor screen will need its own store with different logic. Shared logic can be extracted later via a common module.
- `canCopy(budget)` returns true only for the first budget in the list (matches Angular)
- `canClose(budget)` returns true only for the last open budget (matches Angular)
- Confirmation dialogs use PrimeVue `ConfirmDialog` + `useConfirm()` (first usage in the app — required registering `ConfirmationService` in main.ts)
- Visual style draws from TransactionsPage (toolbar + content card) and FutureBudgetsPage (clean table with hover effects)
- `/budgets/current` uses a `beforeEnter` route guard — calls `budgetApi.getCurrentBudgetId()` and returns a redirect to `/budgets/:id`. No component needed; the redirect is a routing concern, not a UI concern.
- `/budgets/:id` registers to a stub component (placeholder until the budget editor task is built)

### Angular reference
- `webclientv3/src/app/budgets/budgets/budgets.component.ts` — parent page
- `webclientv3/src/app/budgets/budget-list/budget-list.component.ts` — list UI + canCopy/canClose logic
- `webclientv3/src/app/budgets/add-budget/add-budget.component.ts` — add dialog (just a start date field)
- `webclientv3/src/app/budgets/budget.service.ts` — API calls

---

## Execution Log

### 2026-03-21 — Session start (code written before spec was finalised)

**Note:** Code below was written before the task spec was fully refined. Worker must verify existing code against the acceptance criteria and adjust if needed — do not assume it is correct.

**API layer (needs verification):**
- Extended `budgetApi.ts` with `getCurrentBudgetId`, `create`, `copy`, `close`, `reopenLast`
- Extended `budgetApi.spec.ts` — all 11 tests pass

**Store (needs verification):**
- Created `budgetListStore.ts` with `fetchAll`, `copyBudget`, `closeBudget`, `reopenLastBudget`, `addBudget` actions and `canCopy`/`canClose` computed getters
- Created `budgetListStore.spec.ts` — all 17 tests pass

**Components (needs verification):**
- Created `AddBudgetDialog.vue` — date picker, save/cancel, resets on open
- Created `BudgetsPage.vue` — toolbar (Add/Reopen/Refresh), table (name/status/actions), ConfirmDialog integration
- Registered `ConfirmationService` in `main.ts`
- Specs not yet written for components

**Still to do:**
- [x] Verify existing code (API, store, components) against acceptance criteria — adjust if needed
- [x] `AddBudgetDialog.spec.ts` — renders date picker, save emits formatted date string, cancel closes, save disabled when no date selected, resets date when reopened
- [x] `BudgetsPage.spec.ts` — renders a row per budget, shows status badges, View button navigates to `/budgets/:id`, Copy button only on first budget, Close button only on last open budget, Add New Budget opens dialog, Reopen Last Budget triggers confirmation, success/error notifications on actions
- [x] Router: `/budgets` → `BudgetsPage`, `/budgets/current` → `beforeEnter` guard that calls `budgetApi.getCurrentBudgetId()` and redirects, `/budgets/:id` → stub component
- [x] Menu: remove `*` prefix from "Current Budget" and "Budgets", switch from `url: '/#/budgets/...'` to `command: () => navigate('/budgets/...')` with `routePath`
- [x] Run full test suite to verify nothing is broken

### 2026-03-21 — Worker session: verification, specs, routes, menu

**Verification of existing code:**
- `budgetApi.ts` — verified, all methods match acceptance criteria. 11 API tests pass.
- `budgetListStore.ts` — verified, follows store pattern (setup-style defineStore, loading/error refs, re-throws after setting error). canCopy/canClose logic matches Angular reference. 17 tests pass.
- `BudgetsPage.vue` — verified, follows viewport-locked layout convention, toolbar + content card pattern, icon-only refresh button has `title` attribute, status badges, row hover.
- `AddBudgetDialog.vue` — verified, Dialog with DatePicker, emits formatted date string, resets on open via watch.
- `main.ts` — verified, ConfirmationService already registered.

**New files written:**
- `AddBudgetDialog.spec.ts` — 8 tests: rendering (date picker, save/cancel buttons), save disabled when no date, cancel emits close, save emits formatted date + close, resets date on reopen.
- `BudgetsPage.spec.ts` — 25 tests: on mount (heading, fetchAll), budget table (rows, names, badges, empty state), View button (renders, navigates), Copy button (only first budget, confirm dialog, success/error), Close button (only last open, confirm dialog, success/error), Reopen Last (renders, confirm, success/error), Add New Budget (renders, opens dialog, save success/error), Refresh button.
- `BudgetDetailStub.vue` — placeholder component for `/budgets/:id` route, sets heading, shows budget ID.

**Routes added (`src/router/index.ts`):**
- `/budgets` → `BudgetsPage` (lazy import)
- `/budgets/current` → `beforeEnter` guard calls `budgetApi.getCurrentBudgetId()`, redirects to `/budgets/:id`
- `/budgets/:id` → `BudgetDetailStub` (lazy import)

**Menu updated (`src/app/menu/menuItems.ts`):**
- Removed `*` prefix from "Current Budget" and "Budgets"
- Switched from `url:` to `command:` navigation with `routePath`
- Updated `menuItems.spec.ts` — replaced "non-migrated routes" test with two new tests for Budgets and Current Budget command-based navigation

**Code review findings:**
- Fixed `BudgetDetailStub.vue` to use `route.params.id` (composable) instead of `$route.params.id` (template global) for consistency with Composition API pattern.
- All other code matches conventions: `createWrapper()` has `: VueWrapper` return type, Dialog/ConfirmDialog are stubbed in tests, store re-throws after setting error, icon-only buttons have `title` attributes.

**Test results:**
- All new tests pass: AddBudgetDialog (8/8), BudgetsPage (25/25), menuItems (12/12), router (7/7)
- Pre-existing failures in AccountTransferDialog (sink fund dropdowns), abnAmroBankImporter, abnAmroCreditCardImporter — unrelated to this task
- Total: 746 passing, 26 pre-existing failures across 3 unrelated spec files
