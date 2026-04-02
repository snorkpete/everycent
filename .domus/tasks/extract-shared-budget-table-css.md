# Task: Extract shared budget table CSS

**ID:** extract-shared-budget-table-css
**Status:** raw
**Autonomous:** false
**Priority:** high
**Captured:** 2026-04-02
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

DUP-CSS-09 + DUP-CSS-10 + DUP-CSS-11 + EXT-07 from the 2026-04-02 audit. The budget table family is the single largest source of CSS duplication in the codebase.

**Shared patterns:**
- `.add-link` / `.add-row` — "add new row" link at bottom of category groups (BudgetAllocationList.vue:447-468, FutureBudgetsPage.vue:628-649)
- `.fixed-subtotal-row` / `.fixed-total-row` — collapsed fixed allocation summary rows (BudgetAllocationList.vue:483-497, FutureBudgetsPage.vue:571-585)
- `.fixed-icon` — lock icon for fixed allocations (BudgetAllocationList.vue:476-481, FutureBudgetsPage.vue:617-625)
- Sticky headers with box-shadow, category header accent bars, footer sticky positioning, amount cell alignment
- Z-index scale for sticky elements (currently undocumented values: 1, 5, 9, 10, 15, 20 across budget tables). Define named CSS custom properties (e.g. `--z-table-header`, `--z-category-header`) so the stacking hierarchy is explicit and consistent.

**Approach:** TBD during refinement. Could be a shared CSS file imported by budget table components, individual small components, or a mix. Start scoped to budget tables — promote higher if patterns appear elsewhere.

**Files affected:**
- BudgetAllocationList.vue (289-503, 215 lines of CSS)
- FutureBudgetsPage.vue (351-650, 300 lines of CSS)
- SinkFundAllocationTable.vue (215-421, 207 lines of CSS)
- BudgetIncomeList.vue (109-198)
- AccountCategoryTable.vue

---

## Acceptance Criteria

- [ ] Shared budget table CSS patterns identified and consolidated
- [ ] Implementation approach decided during refinement
- [ ] All budget table components use shared CSS
- [ ] Duplicated CSS removed from individual components
- [ ] Z-index scale defined as named CSS custom properties
