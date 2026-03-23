# Task: Redesign transactions screen UX

**ID:** redesign-transactions-screen-ux
**Status:** done
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-15
**Parent:** none
**Depends on:** add-highlightzero-prop-to-ecmoneyfield
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Implement the agreed UX redesign for the transactions screen. The full spec is in the body of migrate-transactions-screen-to-vue task. Covers: toolbar layout, summary bar (3-column 2-row), calculator mode trigger (Σ toggle + reserved checkbox column), table density, wrap/truncate toggle, edit mode button placement.

---

## Acceptance Criteria

- [ ] Toolbar: dropdowns + Go to Budget + icon buttons (⇔, Σ, ↺, Edit) all in one compact row
- [ ] Edit mode: Edit button becomes Save, Cancel appears alongside it
- [ ] ↺ Refresh re-fetches from server and wipes local state
- [ ] Summary bar: 2 rows × 3 columns, correct fields per account type (primary / credit card / regular)
- [ ] Diff sits directly below Bank Balance (column 3)
- [ ] Diff coloured red when non-zero, green when zero (money field handles this natively — no custom colour logic)
- [ ] Calculator mode (Σ): reserved 32px column always present; Σ button toggles column visibility only — no checkbox logic, no running total (that's the calculator task)
- [ ] Table density matches Future Budgets (0.4rem padding, 0.875rem font)
- [ ] Sticky table header
- [ ] Description column truncates with ellipsis by default
- [ ] ⇔ toggle switches between truncate and wrap mode
- [ ] Paid column shows ✓ icon in view mode, checkbox in edit mode
- [ ] "Add New Transaction" appears only in edit mode (table footer)
- [ ] Import and Transfer buttons visible but disabled in toolbar

---

## Implementation Notes

Read the full UX spec in `.domus/tasks/migrate-transactions-screen-to-vue.md` under "UX Redesign — Agreed Design (2026-03-15)" before starting. That section has the complete layout, summary bar logic, calculator behaviour, and colour rules.

Files to modify:
- `webclientv4/src/app/transactions/TransactionsPage.vue` — new layout structure
- `webclientv4/src/app/transactions/TransactionSearchForm.vue` — replace with toolbar
- `webclientv4/src/app/transactions/TransactionSummary.vue` — new 2-row bar layout
- `webclientv4/src/app/transactions/TransactionList.vue` — density, reserved col, paid icon, wrap toggle

Update specs for all modified components. Run senior-code-reviewer before committing.

---

## Execution Log

### 2026-03-15 — Started

Read all current transaction files. Key findings:
- TransactionSearchForm: card with title, two dropdowns, "Go to Budget" link, emits `fetch` event
- TransactionList: table with list-actions footer (Edit/Save/Cancel/Add/Import/Transfer buttons), emits `save`/`cancel`
- TransactionSummary: vertical list of label-value pairs, uses centsToDollars (not EcMoneyField)
- TransactionsPage: two-column grid (search form + summary side by side, list below)
- Store already has: `refresh()`, `enterEditMode()`, `exitEditMode()`, `cancelEdit()`, `isEditMode`

Design decisions:
1. Keep TransactionSearchForm as a component but remove card styling — renders inline into toolbar
2. Toolbar buttons (Edit/Save/Cancel/Refresh + wrap/calc toggles) move to TransactionsPage
3. TransactionList: remove list-actions footer; add calculator col (reserved 32px, visibility toggled via prop), wrap/truncate toggle via prop
4. TransactionSummary: two-row three-column grid, use EcMoneyField (display-only, no edit-mode) with highlightMode="zero" for Diff
5. TransactionsPage: three-zone stacked layout

Starting with spec updates (TDD), then implementing.

### Implementation complete

All four components updated. All tests passing (0 failures, 92.72% overall coverage, 100% on all modified files). Code review applied — fixed `!important` smell in toolbar active state styles.

Files modified:
- `TransactionSearchForm.vue` — removed card styling, now renders inline via `display: contents`
- `TransactionSummary.vue` — two-row 3-column grid, uses EcMoneyField (display only), `highlightMode="zero"` on Diff fields
- `TransactionList.vue` — removed list-actions footer (Edit/Save/Cancel moved to page), added calculator column (32px reserved, checkbox visibility toggled by prop), description truncate/wrap prop, paid icon in view mode, Add button in tfoot
- `TransactionsPage.vue` — three-zone layout (toolbar / summary / table), toolbar has search form inline + icon buttons (wrap, calculator, refresh) + Edit/Save/Cancel + Import/Transfer (disabled)
- All four corresponding spec files updated

Ready for user review. Do not commit yet.
