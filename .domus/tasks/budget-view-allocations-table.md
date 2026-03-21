# Task: Budget view — allocations table

**ID:** budget-view-allocations-table
**Status:** proposed
**Autonomous:** false
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
