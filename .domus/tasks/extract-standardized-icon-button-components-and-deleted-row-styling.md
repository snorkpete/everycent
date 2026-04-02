# Task: Extract standardized icon button components and deleted-row styling

**ID:** extract-standardized-icon-button-components-and-deleted-row-styling
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

Extract a family of standardized icon button components to ensure UX consistency across the app:

1. **EcIconButton** — Generic building block. Standardizes how icon buttons look and behave in tables (hover reveal, sizing, cursor, optional tooltip via `v-tooltip`). This is a presentational leaf component that owns its CSS.

2. **Semantic wrappers** — Thin components that pin a specific icon and tooltip for a recurring action:
   - `EcShowTransactionsButton` — always uses the eye icon for "show transactions for this row"
   - `EcToggleFixedButton` — always uses the lock icon for "show/hide fixed allocations" (potential, confirm during refinement)

3. **EcDeleteButton** — More opinionated than a simple icon button. Encapsulates the toggle delete/restore behaviour: switches its own icon based on item's deleted state, toggles the `deleted` flag on the item, and always applies a known CSS class (`.ec-deleted`) to signal the row's visual state. The Angular app had this and it pulled its weight.

4. **Global `.ec-deleted` baseline** — A global/shared CSS class providing `opacity + strikethrough` baseline for deleted rows. Applied automatically by EcDeleteButton. Lists can layer on top for layout-specific adjustments, but the baseline gives consistency for free.

**UX consistency argument:** The "show transactions" interaction and "delete/restore row" interaction should feel identical everywhere they appear. Currently identical but implemented independently — will diverge over time.

---

## Current State (from audit 2026-04-02)

- `.eye-btn` CSS duplicated in BudgetAllocationList.vue:387-405 and SinkFundAllocationTable.vue:327-345 (18 lines identical)
- `.deleted-row` styling duplicated in BudgetAllocationList.vue:441, SinkFundAllocationTable.vue:387, TransactionList.vue:317, BudgetIncomeList.vue:187
- Delete toggle behaviour implemented independently in each component

---

## Acceptance Criteria

- [ ] EcIconButton component exists with hover-reveal, sizing, cursor, tooltip support
- [ ] EcShowTransactionsButton wraps EcIconButton with eye icon
- [ ] EcDeleteButton encapsulates delete/restore toggle, icon state, applies .ec-deleted class
- [ ] Global .ec-deleted CSS baseline exists (opacity + strikethrough)
- [ ] All current .eye-btn usages migrated to EcShowTransactionsButton
- [ ] All current .deleted-row usages migrated to use EcDeleteButton + .ec-deleted
- [ ] Can be split into subtasks if needed during refinement
