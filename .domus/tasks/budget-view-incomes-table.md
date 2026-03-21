# Task: Budget view — incomes table

**ID:** budget-view-incomes-table
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

Standalone `BudgetIncomeList.vue` component rendering the incomes section of the budget view/edit screen. Displayed inside `BudgetPage.vue`.

---

## Acceptance Criteria

**View mode:**
- [ ] `BudgetIncomeList.vue` as a standalone component, rendered inside `BudgetPage.vue`
- [ ] Table with columns: Name, Amount, Comment
- [ ] Sticky header row
- [ ] Footer row showing "Total" with summed income amount
- [ ] Amounts displayed in currency format (cents → dollars) using `centsToDollars`

**Edit mode:**
- [ ] Name → text input (EcTextField or native input)
- [ ] Amount → `EcMoneyField`
- [ ] Comment → text input
- [ ] Delete button (icon, trash) per row — toggles `income.deleted` flag; shows undo icon when deleted
- [ ] Delete button has `title` attribute explaining what it does
- [ ] Deleted rows visually indicated (dimmed/strikethrough)
- [ ] "Add Income" button — adds a new blank income row to the store's budget.incomes array
- [ ] New incomes have `id: 0, name: '', amount: 0, budget_id: <current budget id>`

**Integration:**
- [ ] Reads `budget.incomes` and `isEditMode` from `budgetStore`
- [ ] Edits are in-place on the store's data (no local copy)
- [ ] `BudgetPage.vue` updated to render `BudgetIncomeList` in the content area
- [ ] Full test coverage for the component

**Not in scope:** Bank Account column (never used in practice — skipped). Save logic (handled by the page shell store).

---

## Implementation Notes

### Files to create/modify
- `src/app/budgets/BudgetIncomeList.vue` — new component
- `src/app/budgets/BudgetIncomeList.spec.ts` — new spec
- `src/app/budgets/BudgetPage.vue` — import and render `BudgetIncomeList`

### Design decisions
- Component reads directly from `budgetStore` — no props needed for the income data or edit mode
- Edits mutate the store's `budget.incomes` array in place (same pattern as Angular — no draft state)
- Soft delete: `income.deleted = true` toggles the flag; the store's `save()` action sends deleted items to the server which handles removal
- Add Income pushes a new object onto `budget.incomes` — the table re-renders reactively
- Visual style: same table styling as the allocations table and future budgets (sticky header, row hover, `font-variant-numeric: tabular-nums` on amounts, border/rounded card)

### Angular reference
- `webclientv3/src/app/budgets/budget-editor/incomes/income-list.component.ts` — parent component
- `webclientv3/src/app/budgets/budget-editor/incomes/income-list-row.component.ts` — row with inline editing
- `webclientv3/src/app/budgets/budget-editor/incomes/income-list-header.component.ts` — header
- `webclientv3/src/app/budgets/budget-editor/incomes/income-list-footer.component.ts` — total footer
