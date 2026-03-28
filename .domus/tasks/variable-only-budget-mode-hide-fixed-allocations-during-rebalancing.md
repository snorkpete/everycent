# Task: Variable-only budget mode — hide fixed allocations during rebalancing

**ID:** variable-only-budget-mode-hide-fixed-allocations-during-rebalancing
**Status:** done
**Branch:** task/variable-only-budget-mode-hide-fixed-allocations-during-rebalancing
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-28
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

When rebalancing a budget, hide fixed allocations to focus on the ones with variable play. Fixed means "can't pull money from this allocation during rebalancing" — not that the amount never changes.

## Core Mechanics

### The toggle
- View mode toggle in the toolbar on both Budget Editor and Future Budgets screens
- Switches between "all allocations" (default) and "variable only" mode

### Variable-only mode display (per category)
- Fixed allocations within the category collapse into a single read-only "Fixed" subtotal row
- Variable allocations remain visible and editable
- Categories where every allocation is fixed show the category header + fixed subtotal only (good signal that everything is locked)
- New allocations can be added (they're variable by default)

### Footer
- Overall fixed total row (reference only — sum of all per-category fixed subtotals, not load-bearing for logic)
- Overall budget total still sums everything (fixed + variable) so budget balance is always real

### Totals behavior
- Category totals continue to sum all allocations (fixed + variable) — the per-category fixed subtotal row closes the visual math gap
- Footer totals unchanged — always reflect the full budget

### `is_fixed_amount` flag
- Per allocation, per budget (already exists as boolean column, default false)
- Set via Budget Editor (individual budget) or Future Budgets mass edit
- Mass edit: explicit per-budget value with a "set all" convenience toggle (same UX pattern as amounts)
- No null semantics needed — simple true/false

### Where this lives
1. **Future Budgets** (primary) — main budget setup screen. Toggle + setting the fixed flag
2. **Budget Editor** — same toggle for mid-month rebalancing. Can also set fixed flag for that specific budget

## Screens affected
- FutureBudgetsPage.vue + BudgetMassEditDialog.vue
- BudgetPage.vue + BudgetAllocationList.vue
- BudgetSummaryStrip.vue (may need awareness of mode)

---

## Acceptance Criteria

- [ ] Toggle button in toolbar on Budget Editor and Future Budgets screens
- [ ] Variable-only mode hides individual fixed allocations
- [ ] Per-category "Fixed" subtotal row shows sum of fixed allocations in that category
- [ ] Overall fixed total row in footer (reference only)
- [ ] Category totals still sum all allocations (fixed + variable)
- [ ] Footer totals still reflect full budget
- [ ] New allocations can be added in variable-only mode
- [ ] Spent column visible in variable-only mode
- [ ] `is_fixed_amount` editable in Budget Editor (checkbox already exists in edit mode)
- [ ] `is_fixed_amount` editable in Future Budgets mass edit: checkbox per budget column + "set all" row
- [ ] `FutureAllocationData` type updated to include `is_fixed_amount`
- [ ] Backend `mass_update` accepts and persists `is_fixed_amount` per allocation

---

## Scope Boundaries

- Do NOT extract composables or refactor BudgetAllocationList as part of this task — audit items COMP-01/STOR-06 will address that separately
- Focus on getting it working; the audit/refactor pass will clean up anything this touches

---

## Implementation Notes

### Existing infrastructure
- `is_fixed_amount` column already exists in DB (boolean, default false)
- Already serialized in `AllocationSerializer`
- Already in Vue `AllocationData` type
- Already shows as "Fixed?" checkbox in `BudgetAllocationList.vue` edit mode
- NOT in `FutureAllocationData` type — needs adding

### Changes needed

1. **`FutureAllocationData` type** — add `is_fixed_amount?: boolean`
2. **`BudgetMassEditDialog.vue`** — add `is_fixed_amount` checkbox row per budget column, plus a "set all" row (not a header — an additional row in the form). Include in `MassUpdatePayload`.
3. **`FutureBudgetsPage.vue`** — add toggle button in toolbar. Wire up view mode state.
4. **`BudgetAllocationList.vue`** — respect view mode: filter visible allocations, render per-category fixed subtotal rows, render overall fixed total in footer.
5. **`BudgetPage.vue`** — add toggle button in toolbar.
6. **Backend `Allocation.mass_update`** — check what fields are currently permitted; add `is_fixed_amount` to the mass update payload if not already accepted.

### Risks
- Backend mass update endpoint may need changes to accept `is_fixed_amount` — verify what `Allocation.mass_update` currently permits
- The fixed subtotal rows are purely frontend computation — no new API needed
