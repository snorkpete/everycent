# Task: Budget view — summary section

**ID:** budget-view-summary-section
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

Standalone `BudgetSummary.vue` component rendered below the allocations table, showing discretionary amounts and a needs/wants/savings breakdown.

---

## Acceptance Criteria

**Discretionary Amount section:**
- [ ] `BudgetSummary.vue` as a standalone component, rendered inside `BudgetPage.vue` below the allocations
- [ ] Shows "Total Discretionary Amount" = total income − total allocations
- [ ] For `family_type: 'couple'`: shows "{wife}'s Amount" and "{husband}'s Amount" (half each)
- [ ] For `family_type: 'single'`: shows "{single_person}'s Amount" (full amount)
- [ ] Person names read from settings (`wife`, `husband`, `single_person` fields)

**Wants Summary section:**
- [ ] Table with columns: Need/Want/Savings, Amount, Percentage
- [ ] Rows: Needs (sum of allocations where `allocation_class` maps to need), Wants (want), Savings (savings)
- [ ] Percentage = class total / total income × 100, displayed as integer with % suffix
- [ ] Amounts in currency format

**Integration:**
- [ ] Reads `budget.incomes`, `budget.allocations` from `budgetStore`
- [ ] Reads settings from `settingsStore` (already exists — `useSettingsStore`)
- [ ] `BudgetPage.vue` fetches settings on mount and renders `BudgetSummary` below allocations
- [ ] Full test coverage

**Not in scope:** Edit mode — this section is read-only.

---

## Implementation Notes

### Files to create/modify
- `src/app/budgets/BudgetSummary.vue` — new component
- `src/app/budgets/BudgetSummary.spec.ts` — new spec
- `src/app/budgets/BudgetPage.vue` — import and render `BudgetSummary`, fetch settings on mount

### Allocation class mapping
The `allocation_class` field from the API returns values like `"RegularAllocation"`. The Angular version maps this to the `allocation_type` field or uses a separate `allocation_class` dropdown (Want/Need/Savings). Check what value the API actually returns — the summary groups by the class value displayed in the Class column of the allocations table.

### Percentage calculation
`percentage = Math.round((classTotal / totalIncome) * 100)` — integer, no decimals.

### Visual style
Two small tables stacked vertically, similar to the Angular layout. Right-aligned amounts, consistent with the rest of the budget screen. No card border — these sit directly below the allocations card.

### Angular reference
- `webclientv3/src/app/budgets/budget-editor/allocations/allocation-list-summary.component.ts` — discretionary + wants summary
- Uses `SettingsService.getSettings()` for `family_type`, `wife`, `husband`, `single_person`

---

## Execution Log

### 2026-03-21 — Implementation complete

**Files created:**
- `src/app/budgets/BudgetSummary.vue` — standalone read-only component with two sections:
  1. Discretionary Amount: couple mode shows total + wife/husband halves; single mode shows single person's full amount
  2. Wants Summary: table with Needs/Wants/Savings rows, amounts and percentages
- `src/app/budgets/BudgetSummary.spec.ts` — 19 tests covering couple mode, single mode, amounts, percentages, and edge cases (null budget, zero income, missing settings, no allocation_class)

**Files modified:**
- `src/app/budgets/BudgetPage.vue` — imported BudgetSummary + useSettingsStore, added `settingsStore.fetchAll()` to `onMounted` (parallel with budget fetch via `Promise.all`), rendered `<BudgetSummary />` below allocations section
- `src/app/budgets/BudgetPage.spec.ts` — added mock for settingsStore to avoid test failure from new `fetchAll()` call

**Allocation class mapping finding:** The Angular code filters allocations by `allocation_class` using values `"need"`, `"want"`, and `"savings"` (lowercase strings). The `"want"` amount is calculated as totalIncome - needs - savings (not by filtering allocations). This ensures unclassified allocations are counted as wants. Same pattern used here.

**Code review findings (self-review):**
1. Bug found: `wantsPercentage` returned `100` when income was zero (100 - 0 - 0 = 100). Fixed by adding zero-income guard. The test was passing falsely because `toContain('0%')` matched `100%` as a substring. Fixed test to use cell-level `toBe('0%')` assertion.
2. No other issues found. SFC order is correct (template/script/style), styles are scoped, types are properly imported, computed properties handle null/undefined gracefully.

**Final test results:** All 272 budget tests pass (13 test files). Pre-existing failures in AccountTransferDialog.spec.ts are unrelated.
