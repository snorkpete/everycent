# Task: Budget view — page shell, store, and API

**ID:** budget-view-page-shell-store-and-api
**Status:** done
**Branch:** task/budget-view-page-shell-store-and-api
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-21
**Parent:** migrate-budget-viewedit-screen-to-vue
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Create the page shell, Pinia store, and API layer for the budget view/edit screen. This is the foundation that subtasks 2–5 build on.

---

## Acceptance Criteria

- [ ] `BudgetPage.vue` replaces `BudgetDetailStub.vue` at `/budgets/:id`
- [ ] `budgetStore.ts` (Pinia) with:
  - `fetch(budgetId)` — loads budget via `GET /budgets/:id` (returns nested incomes + allocations) and allocation categories via `GET /allocation_categories` in parallel
  - `budget`, `allocationCategories`, `loading`, `error` refs
  - `isEditMode` ref with `enterEditMode()` / `exitEditMode()`
  - `save()` — sends `PUT /budgets/:id` with budget + incomes + allocations, exits edit mode on success
  - `cancelEdit()` — re-fetches from server, exits edit mode
- [ ] `budgetApi.ts` extended with:
  - `get(id)` → `GET /budgets/:id` — returns `BudgetDetailData` (budget with nested incomes and allocations)
  - `save(budget)` → `PUT /budgets/:id` with `{ incomes: [...], allocations: [...] }` as top-level params
- [ ] `budget.types.ts` extended with `BudgetDetailData` (includes `incomes: IncomeData[]` and `allocations: AllocationData[]`), `IncomeData` type
- [ ] Heading set to "Edit Budget: {budget name}"
- [ ] Toolbar with:
  - "Back to Budget List" button → navigates to `/budgets`
  - "View Transactions" button → navigates to `/transactions?budget_id={id}`
  - Edit button (when not editing) → enters edit mode
  - Save + Cancel buttons (when editing) → save calls API, cancel refreshes from server
- [ ] Success/error notifications on save ("Budget saved" / "Failed to save budget")
- [ ] Page layout: consistent with TransactionsPage (toolbar at top, content card below)
- [ ] Incomes and allocations sections rendered as placeholder areas (subtasks 2 and 3 fill them in)
- [ ] Full test coverage: API, store, page component
- [ ] Delete `BudgetDetailStub.vue` — no longer needed

**Not in scope:** income/allocation table contents, soft delete filtering on save, summary section.

---

## Implementation Notes

### Files to create/modify
- `src/app/budgets/budget.types.ts` — add `BudgetDetailData`, `IncomeData`
- `src/app/budgets/budgetApi.ts` — add `get(id)`, `save(budget)`
- `src/app/budgets/budgetApi.spec.ts` — add tests for new endpoints
- `src/app/budgets/budgetStore.ts` — new store
- `src/app/budgets/budgetStore.spec.ts` — new spec
- `src/app/budgets/BudgetPage.vue` — new page component (replaces BudgetDetailStub.vue)
- `src/app/budgets/BudgetPage.spec.ts` — new spec
- `src/router/index.ts` — update `/budgets/:id` route to point to BudgetPage
- Delete `src/app/budgets/BudgetDetailStub.vue`

### API shapes

**GET /budgets/:id** response (BudgetSerializer):
```json
{
  "budget": {
    "id": 213,
    "name": "Mar 25 - Apr 24, 2026",
    "start_date": "2026-03-25",
    "end_date": "2026-04-24",
    "status": "open",
    "incomes": [
      { "id": 1, "name": "Salary", "amount": 500000, "budget_id": 213, "bank_account_id": 10, "comment": "" }
    ],
    "allocations": [
      { "id": 1, "name": "Groceries", "amount": 100000, "budget_id": 213, "spent": 72052, "allocation_category_id": 5, "allocation_type": "regular", "is_standing_order": false, "bank_account_id": null, "comment": "", "allocation_class": "RegularAllocation", "is_fixed_amount": true, "allocation_category": { "id": 5, "name": "Food - Groceries" } }
    ]
  }
}
```

**PUT /budgets/:id** — save payload sends incomes and allocations as **top-level arrays** (not nested under `budget`):
```json
{
  "incomes": [
    { "id": 1, "name": "Salary", "amount": 500000, "bank_account_id": 10, "budget_id": 213, "comment": "", "deleted": false }
  ],
  "allocations": [
    { "id": 1, "name": "Groceries", "amount": 100000, "budget_id": 213, "allocation_category_id": 5, "comment": "", "deleted": false, "is_fixed_amount": true }
  ]
}
```
Note: `deleted: true` items are handled server-side. The Angular client filters out `dummyTransaction` rows before saving but sends `deleted` items through for the server to handle.

### Type additions

```typescript
// Extends BudgetData with nested relations (from BudgetSerializer)
interface BudgetDetailData extends BudgetData {
  incomes: IncomeData[];
  allocations: AllocationData[];
}

interface IncomeData {
  id?: number;
  name?: string;
  amount?: number;
  budget_id?: number;
  bank_account_id?: number;
  comment?: string;
  deleted?: boolean;
}
```

`AllocationData` already exists in `transaction.types.ts` — reuse it. It needs `deleted?: boolean` and `is_fixed_amount?: boolean` added if not already present. Also needs `allocation_class?: string`.

### Design decisions
- Store is `budgetStore` (distinct from `budgetListStore`)
- `save()` sends the full budget payload — the store is responsible for assembling the top-level `incomes` and `allocations` arrays
- Edit mode is in-place (no draft records). `cancelEdit()` re-fetches rather than restoring a snapshot — keeps it simple and matches Angular behaviour
- `AllocationData` type is shared with transactions — extend it rather than duplicating

### Angular reference
- `webclientv3/src/app/budgets/budget/budget.component.ts` — page shell, routing, save/cancel
- `webclientv3/src/app/budgets/budget.service.ts` — `getBudget()`, `saveBudget()`, `getAllocationCategories()`
- `app/controllers/budgets_controller.rb` — update action extracts incomes/allocations as top-level params
- `app/controllers/concerns/parameter_extraction.rb` — permitted params for save

---

## Execution Log

### 2026-03-21 — Implementation complete

**Types extended:**
- `transaction.types.ts` — added `allocation_class`, `is_fixed_amount`, `deleted` to `AllocationData`
- `budget.types.ts` — added `IncomeData`, `BudgetDetailData` types; added import for `AllocationData`

**API extended:**
- `budgetApi.ts` — added `get(id)` (GET /budgets/:id, unwraps `budget` key) and `save(budget)` (PUT /budgets/:id with top-level incomes/allocations arrays)
- `budgetApi.spec.ts` — 4 new tests for get and save endpoints (15 total, all passing)

**Store created:**
- `budgetStore.ts` — Pinia setup store with `budget`, `allocationCategories`, `isEditMode`, `loading`, `error` refs. Actions: `fetch(budgetId)` loads budget + categories in parallel, `save()` sends via API and exits edit mode, `enterEditMode()`, `exitEditMode()`, `cancelEdit()` (exits edit mode then re-fetches)
- `budgetStore.spec.ts` — 22 tests covering initial state, fetch, save, edit mode, cancelEdit (all passing)

**Page component created:**
- `BudgetPage.vue` — replaces BudgetDetailStub. Toolbar with Back/View Transactions/Edit/Save/Cancel buttons. Content card with incomes and allocations placeholder sections. Heading set to "Edit Budget: {name}". Success/error notifications on save. Layout consistent with TransactionsPage.
- `BudgetPage.spec.ts` — 16 tests covering mount, layout, navigation, edit mode, save/cancel (all passing)

**Router updated:**
- `src/router/index.ts` — `/budgets/:id` now points to `BudgetPage` instead of `BudgetDetailStub`

**Remaining manual step:**
- `BudgetDetailStub.vue` needs to be deleted manually (Bash permission denied for `rm` command). The router no longer references it.

**Test results:**
- All 53 new/modified tests pass (budgetApi: 15, budgetStore: 22, BudgetPage: 16)
- Full suite: 754 passed, 16 failed (all failures pre-existing in AccountTransferDialog and abnAmroCreditCardImporter specs)

**Code review:**
- `senior-code-reviewer` skill not found in project or global skills. Manual review against vue-coding-rules.md confirmed:
  - Store uses setup-style defineStore with loading/error refs
  - Actions re-throw after setting error.value
  - API uses plain functions with `.then(r => r.data)` unwrapping
  - createWrapper() has explicit `: VueWrapper` return type
  - No icon-only buttons without title attributes (all buttons have labels)
  - Feature code in `src/app/budgets/`
  - Page layout follows viewport-locked pattern with internal overflow
