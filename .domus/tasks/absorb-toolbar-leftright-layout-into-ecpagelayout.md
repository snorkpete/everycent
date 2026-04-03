# Task: Absorb toolbar left/right layout into EcPageLayout

**ID:** absorb-toolbar-leftright-layout-into-ecpagelayout
**Status:** done
**Autonomous:** false
**Priority:** high
**Captured:** 2026-04-02
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

DUP-CSS-01 + DUP-CSS-03 from the 2026-04-02 audit. Six pages (BudgetPage, TransactionsPage, ImportPage, SinkFundsPage, AccountBalancesPage, BudgetsPage) all define identical `.toolbar-left` and `.toolbar-right` CSS for splitting toolbar content. Two pages (TransactionsPage, SinkFundsPage) also duplicate `.toolbar-separator` CSS for vertical dividers.

EcPageLayout already has a toolbar slot. It should own the flex layout that splits toolbar content into left/right zones. Pages would use `toolbar-left` and `toolbar-right` named slots instead of wrapping divs with repeated CSS. The existing `toolbar` slot remains as an escape hatch for fully custom layouts.

**Current duplication:**
- `.toolbar-left` + `.toolbar-right`: BudgetPage.vue:109-122, TransactionsPage.vue:204-217, ImportPage.vue:396-410, SinkFundsPage.vue:131-148, AccountBalancesPage.vue:103-117, BudgetsPage.vue:202-212
- `.toolbar-separator`: TransactionsPage.vue:224-231, SinkFundsPage.vue:146-153

---

## Acceptance Criteria

- [ ] EcPageLayout provides toolbar-left and toolbar-right slots with built-in flex layout
- [ ] Toolbar separator styling available within EcPageLayout
- [ ] All 6 pages migrated to use new slots
- [ ] Duplicated toolbar CSS removed from all page files
- [ ] Existing toolbar slot still works as escape hatch
