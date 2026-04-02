# Task: Create EcPageLayout component

**ID:** create-ecpagelayout-component
**Status:** in-progress
**Branch:** task/create-ecpagelayout-component
**Autonomous:** true
**Priority:** high
**Captured:** 2026-04-02
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Reusable page wrapper component for CRUD pages. Provides consistent padding, flex column layout, gap, overflow handling, and a toolbar slot. Content area accepts anything (list, DataTable, cards). Motivation: UX consistency — custom page-level CSS is a smell; layout should come from components, not per-page styling.

Current consumers: BankAccountsPage, AllocationCategoriesPage, InstitutionsPage, SpecialEventsPage (all share identical page wrapper CSS with different class names).

---

## Acceptance Criteria

- [ ] `EcPageLayout.vue` exists at `src/app/shared/layout/EcPageLayout.vue`
- [ ] Props: `pageName` (string, required), `variant` (`'scrollable' | 'fixed'`, default `'scrollable'`)
- [ ] Slots: `toolbar`, `default`
- [ ] Toolbar slot wrapper: `display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0`
- [ ] Scrollable variant: `padding: 1rem 1.5rem 1.5rem`, `gap: 1rem`, `height: 100%`, `overflow: auto`
- [ ] Fixed variant: `padding: 0.75rem 1.5rem 0`, `gap: 0`, `height: 100%`, `overflow: hidden`. Default slot wrapped in content card (bordered card, flex: 1, overflow: auto, background, border-radius)
- [ ] Full test coverage on EcPageLayout
- [ ] All 13 pages migrated:
  - Scrollable: InstitutionsPage, AllocationCategoriesPage, BankAccountsPage, FutureBudgetsPage, SettingsPage
  - Fixed: TransactionsPage, BudgetPage, BudgetsPage, SinkFundsPage, ImportPage, AccountBalancesPage, SpecialEventsPage, SpecialEventDetailPage
- [ ] Page-wrapper CSS removed from all migrated consumers
- [ ] Content-card CSS removed from fixed-variant consumers
- [ ] All existing consumer tests pass after migration

---

## Implementation Notes

### File locations
- Component: `src/app/shared/layout/EcPageLayout.vue`
- Spec: `src/app/shared/layout/EcPageLayout.spec.ts`

### Template structure
```
div.ec-page-layout[.ec-page-layout--scrollable | .ec-page-layout--fixed][data-page="pageName"]
  div.ec-page-layout__toolbar (v-if $slots.toolbar)
    slot(toolbar)
  [scrollable]: slot(default)
  [fixed]: div.ec-page-layout__content-card → slot(default)
```

### CSS values
Scrollable:
- `padding: 1rem 1.5rem 1.5rem; gap: 1rem; height: 100%; overflow: auto`

Fixed:
- `padding: 0.75rem 1.5rem 0; gap: 0; height: 100%; overflow: hidden`
- Content card: `flex: 1; display: flex; flex-direction: column; overflow: auto; border: 1px solid var(--p-surface-300); border-radius: 6px; background-color: var(--p-surface-0)`

Toolbar (both variants):
- `display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0`

### Migration pattern
- Replace outer `<div class="xxx-page">` with `<EcPageLayout>` or `<EcPageLayout variant="fixed">`
- Move toolbar/controls/page-actions content into `<template #toolbar>`
- For fixed variant: unwrap content from `.content-card` div (the component provides it)
- Remove page-wrapper and content-card CSS from consumer
- Page-specific CSS stays (toggle labels, event links, column styling, etc.)

### Known deviations to normalize
- SettingsPage uses `gap: 1.5rem` — adopt `1rem` (scrollable default), verify visually
- SpecialEventsPage/SpecialEventDetailPage use `gap: 0.75rem` — adopt `0` (fixed default), adjust after if needed
- BankAccountsPage has `overflow: auto` explicitly — matches scrollable default, no issue

### Migration order
Start with simple pages, build confidence:
1. InstitutionsPage (scrollable, simplest)
2. AllocationCategoriesPage (scrollable, simple)
3. BankAccountsPage (scrollable, has toggle in toolbar)
4. FutureBudgetsPage (scrollable)
5. SettingsPage (scrollable, gap deviation)
6. SpecialEventsPage (fixed, first fixed consumer)
7. SpecialEventDetailPage (fixed)
8. TransactionsPage (fixed)
9. BudgetPage (fixed)
10. BudgetsPage (fixed)
11. SinkFundsPage (fixed)
12. ImportPage (fixed)
13. AccountBalancesPage (fixed)

### Test plan
- Renders toolbar slot when provided
- Does not render toolbar wrapper when no toolbar slot
- Renders default slot content
- Applies scrollable CSS by default
- Applies fixed CSS when variant="fixed"
- Fixed variant wraps default slot in content card
- Scrollable variant does not wrap in content card
- Renders `data-page` attribute with pageName value

### Autonomous eligibility
Autonomous-eligible. Migration is mechanical. Checkpoint after first 5 (scrollable) pages — run full test suite before continuing to fixed pages.
