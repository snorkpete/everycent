# Task: Budget view — allocations table

**ID:** budget-view-allocations-table
**Status:** done
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-21
**Parent:** migrate-budget-viewedit-screen-to-vue
**Depends on:** budget-view-page-shell-store-and-api
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Standalone `BudgetAllocationList.vue` component rendering the allocations section of the budget view/edit screen, grouped by allocation category with sticky sub-headers.

---

## Acceptance Criteria

**View mode:**
- [ ] `BudgetAllocationList.vue` as a standalone component, rendered inside `BudgetPage.vue`
- [ ] Table with columns: Name, Amount, Spent, Remaining, Class, Fixed Amount?, Comment
- [ ] Rows grouped by allocation category — each category has a sticky sub-header row (like FutureBudgetsPage category headers)
- [ ] Category sub-header shows: category name, subtotals for Amount, Spent, Remaining
- [ ] Sticky table header (top of scroll container)
- [ ] Sticky category sub-headers (below table header, push each other off as you scroll — same z-index pattern as FutureBudgetsPage)
- [ ] Grand total footer row: Amount total, Spent total, Remaining total
- [ ] "Unallocated" badge in footer showing `total income - total allocations` (uses `budgetStore.budget.incomes` for income total)
- [ ] Remaining column: green for positive, red for negative (colour classes)
- [ ] Spent column: placeholder eye icon next to the value (no-op click — subtask 4 wires it up)
- [ ] Eye icon button has `title` attribute: "Show transactions for this allocation"
- [ ] Amounts in currency format (cents → dollars), `font-variant-numeric: tabular-nums`

**Edit mode:**
- [ ] Name → text input
- [ ] Amount → `EcMoneyField`
- [ ] Class → dropdown/Select with options: Want, Need, Savings
- [ ] Fixed Amount? → checkbox
- [ ] Comment → text input
- [ ] Spent and Remaining are read-only even in edit mode
- [ ] Delete button (icon, trash) per row — toggles `allocation.deleted` flag; shows undo icon when deleted
- [ ] Delete button has `title` attribute
- [ ] Deleted rows visually indicated (dimmed/strikethrough)
- [ ] "Add {Category Name} Allocation" link/button per category section
- [ ] New allocations have `id: 0, name: '', amount: 0, spent: 0, budget_id: <current>, allocation_category_id: <category id>`

**Integration:**
- [ ] Reads `budget.allocations`, `allocationCategories`, and `isEditMode` from `budgetStore`
- [ ] Edits are in-place on the store's data (no local copy)
- [ ] `BudgetPage.vue` updated to render `BudgetAllocationList` in the content area (below incomes)
- [ ] Full test coverage for the component

**Not in scope:** Show transactions dialog functionality (subtask 4 — icon is placeholder only). Summary section (subtask 5).

---

## Implementation Notes

### Files to create/modify
- `src/app/budgets/BudgetAllocationList.vue` — new component
- `src/app/budgets/BudgetAllocationList.spec.ts` — new spec
- `src/app/budgets/BudgetPage.vue` — import and render `BudgetAllocationList` below `BudgetIncomeList`

### Grouping logic
Allocations are grouped by `allocation_category_id`. The store provides `allocationCategories` (fetched alongside the budget). Iterate categories, filter allocations per category, render category header + rows + add button per group. This is display-side grouping — the store's `budget.allocations` stays flat.

The Angular version injects dummy "header rows" and "add button rows" into the allocations array. **Do not do this.** In Vue, use `v-for` over categories with a nested `v-for` over filtered allocations — cleaner than mutating the data array.

### Sticky sub-header pattern
Follow the exact CSS pattern from `FutureBudgetsPage.vue`:
- `thead th` → `position: sticky; top: 0; z-index: 10`
- `.category-header td` → `position: sticky; top: var(--thead-height); z-index: 5`
- Category header first cell → `z-index: 15` (above sticky first-column if present)
- Left accent bar on category headers via `box-shadow: inset 3px 0 0 var(--p-primary-400)`

### Remaining colour logic
- Positive → green (`color: #16a34a`)
- Negative → red (`color: #dc2626`)
- Zero → muted

### Unallocated badge
Total income (sum of `budget.incomes[].amount`) minus total allocations (sum of non-deleted `budget.allocations[].amount`). Displayed as a badge/pill in the footer row — similar styling to the Angular "Unallocated: 200.00" grey badge.

### Angular reference
- `webclientv3/src/app/budgets/budget-editor/allocations/allocation-list.component.ts` — main table with mat-table multiTemplateDataRows
- `webclientv3/src/app/budgets/budget-editor/allocations/allocation-category-row.component.ts` — category header
- `webclientv3/src/app/budgets/budget-editor/allocations/allocation-list-header.component.ts` — table header
- `webclientv3/src/app/budgets/budget-editor/allocations/allocation-list-footer.component.ts` — total footer

---

## Execution Log

### 2026-03-21 — Implementation complete

**Files created:**
- `src/app/budgets/BudgetAllocationList.vue` — allocations table component
- `src/app/budgets/BudgetAllocationList.spec.ts` — 50 tests, all passing

**Files modified:**
- `src/app/budgets/BudgetPage.vue` — replaced allocations placeholder with `<BudgetAllocationList />`, added import

**What was done:**
- View mode: table with 7 columns (Name, Amount, Spent, Remaining, Class, Fixed Amount?, Comment)
- Rows grouped by allocation category using nested `v-for` (no dummy row injection)
- Category sub-headers with sticky positioning (`top: var(--thead-height); z-index: 5`) and left accent bar
- Sticky thead (`z-index: 10`) and sticky tfoot (`bottom: 0; z-index: 10`)
- Category subtotals for Amount, Spent, Remaining (excludes deleted rows)
- Grand total footer row with Amount, Spent, Remaining totals
- Unallocated badge: total income - total allocations (non-deleted)
- Remaining colour: green positive, red negative, muted zero
- Eye icon placeholder on Spent column (no-op, `title` attribute set)
- Edit mode: name/comment text inputs, EcMoneyField for amount, class dropdown (Want/Need/Savings), fixed amount checkbox
- Spent and Remaining read-only in edit mode
- Delete button toggles `allocation.deleted`; shows undo icon when deleted; deleted rows dimmed/strikethrough
- Add allocation button per category; new allocations pushed to store with correct defaults
- Action column (8th) only renders in edit mode

**Test coverage:**
- View mode layout (5 tests)
- Data display (8 tests)
- Remaining colour classes (3 tests)
- Eye icon (2 tests)
- Category subtotals (3 tests)
- Grand total footer (3 tests)
- Unallocated badge (2 tests)
- Edit mode inputs (8 tests)
- Edit mode delete (8 tests)
- Edit mode add allocation (5 tests)
- Edge cases (3 tests)

**Concurrent modification note:** BudgetPage.vue was modified by another worker (BudgetIncomeList + BudgetSummary). Read fresh before editing — no conflicts.

**All 272 budget test suite tests pass.** Two pre-existing failures in AccountTransferDialog.spec.ts (unrelated).
