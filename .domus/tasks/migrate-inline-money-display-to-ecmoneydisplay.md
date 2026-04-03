# Task: Migrate inline money display to EcMoneyDisplay

**ID:** migrate-inline-money-display-to-ecmoneydisplay
**Status:** done
**Branch:** task/migrate-inline-money-display-to-ecmoneydisplay
**Autonomous:** true
**Priority:** high
**Captured:** 2026-04-02
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

DUP-CSS-08 from the 2026-04-02 audit. Multiple files format money inline with `centsToDollars()` and define their own CSS colour classes. EcMoneyDisplay already handles money colouring via `highlightMode`. This task migrates the 8 straightforward files where existing EcMoneyDisplay props are sufficient.

**Principle:** EcMoneyDisplay is the single source of truth for how money looks.

FutureBudgetsPage is excluded — it has a custom `.amount-income` highlight that needs a separate design decision. See `migrate-futurebudgetspage-money-display-to-ecmoneydisplay`.

---

## Files to migrate

1. **AllocationTransactionsDialog.vue** — plain `centsToDollars()` with `.amount-cell` CSS. No colors. → `highlight-mode="None"`
2. **SpecialEventDetailPage.vue** — plain display, bold total. → `emphasis="Total"`, `highlight-mode="None"`
3. **SpecialEventAllocationsEditor.vue** — same pattern as detail page. → `emphasis` varies, `highlight-mode="None"`
4. **ImportPage.vue** — plain display, right-aligned. → `highlight-mode="None"`
5. **BudgetSummary.vue** — plain display in bar chart context, `.bar-amount` CSS. → `highlight-mode="None"`
6. **SpecialEventsPage.vue** — positive/negative via `.positive`/`.negative` classes. → `highlight-mode="Balance"`
7. **BudgetSummaryStrip.vue** — positive/negative/zero via `.amount-*` classes. → `highlight-mode="Balance"`
8. **SinkFundAllocationTable.vue** — positive/negative/muted via `.amount-*` classes. → `highlight-mode="Balance"`

---

## Acceptance Criteria

- [x] All 8 files migrated to use EcMoneyDisplay instead of `centsToDollars()` + custom CSS
- [x] All duplicated money colour CSS classes removed from migrated files
- [x] No new CSS for money display introduced
- [x] All existing tests pass
- [x] Any tests that referenced removed CSS classes are updated
