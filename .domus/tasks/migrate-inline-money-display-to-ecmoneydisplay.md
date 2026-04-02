# Task: Migrate inline money display to EcMoneyDisplay

**ID:** migrate-inline-money-display-to-ecmoneydisplay
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

DUP-CSS-08 from the 2026-04-02 audit. Multiple files format money inline with `centsToDollars()` and define their own CSS colour classes (.amount-positive, .amount-negative, .amount-muted, .amount-zero, .positive, .negative). Same semantic meaning, different class names across files.

EcMoneyDisplay already handles money colouring via `highlightMode`. The fix is to migrate all inline money formatting to EcMoneyDisplay. For edge cases where EcMoneyDisplay doesn't fit today (e.g. inside a `<th>` or summary footer), extend the component rather than working around it.

**Principle:** EcMoneyDisplay is the single source of truth for how money looks. If it can't handle a context, we extend it.

**Current duplication:**
- SinkFundAllocationTable.vue:289-300 (.amount-positive, .amount-negative, .amount-muted)
- FutureBudgetsPage.vue:551-563 (.amount-positive, .amount-negative, .amount-zero)
- BudgetSummaryStrip.vue:137-147 (.amount-positive, .amount-negative, .amount-zero)
- SpecialEventsPage.vue:209-214 (.negative, .positive)

---

## Acceptance Criteria

- [ ] All inline centsToDollars() + colour class usages identified
- [ ] EcMoneyDisplay extended if needed for summary/th/footer contexts
- [ ] All files migrated to EcMoneyDisplay
- [ ] All duplicated money colour CSS classes removed
