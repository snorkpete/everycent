# Task: Create EcItemList component

**ID:** create-ecitemlist-component
**Status:** ready
**Autonomous:** true
**Priority:** high
**Captured:** 2026-04-02
**Parent:** none
**Depends on:** create-ecpagelayout-component
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Reusable bordered card list component for simple entity lists. Provides the bordered/rounded container, row iteration, row styling (flex, padding, border-bottom). Row content is entirely slotted. Motivation: UX consistency for the "list of items with action buttons" pattern.

Current consumers: BankAccountsPage, AllocationCategoriesPage, InstitutionsPage (all use identical `<ul>` list CSS with different class names). Used inside EcPageLayout's content slot.

---

## Acceptance Criteria

- [ ] `EcItemList.vue` exists at `src/app/shared/layout/EcItemList.vue`
- [ ] Props: `items` (array, required), `keyField` (string, default `'id'`), `actionsRight` (boolean, default `true`)
- [ ] Slots: `item` (scoped `{ item }`)
- [ ] Renders a `<ul>` with bordered/rounded container styling
- [ ] Iterates items, renders each in a `<li>` with consistent row styling (flex row, padding, gap, border-bottom between items)
- [ ] When `actionsRight` is true, last child of each row gets `margin-left: auto`
- [ ] Full test coverage on EcItemList
- [ ] 3 consumers migrated: BankAccountsPage, AllocationCategoriesPage, InstitutionsPage
- [ ] List container and item CSS removed from migrated consumers
- [ ] All existing consumer tests pass after migration

---

## Implementation Notes

### File locations
- Component: `src/app/shared/layout/EcItemList.vue`
- Spec: `src/app/shared/layout/EcItemList.spec.ts`

### CSS values (from current consumers)
Container:
- `list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; border: 1px solid var(--p-surface-200); border-radius: 6px; overflow: hidden`

Item row:
- `display: flex; align-items: center; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--p-surface-200); gap: 0.5rem`
- Last item: no border-bottom

Actions right (when `actionsRight` is true):
- `:last-child { margin-left: auto }` on each row's children — or use CSS `> :last-child` selector on the `<li>`

### Template structure
```
ul.ec-item-list
  li.ec-item-list__item(v-for="item in items" :key="item[keyField]")
    slot(item, { item })
```

### Migration pattern
- Replace `<ul class="xxx-list">` + `<li v-for>` with `<EcItemList :items="data" key-field="id">`
- Move li content into `<template #item="{ item }">`
- Remove list container CSS, item CSS, name CSS (font-size), action button margin-left CSS
- Consumer keeps any item-specific styling (closed account background, status tag, etc.)

### BankAccountsPage specifics
- Has `.account-item--closed` conditional class and closed-state styling — consumer keeps this as scoped CSS on elements inside the slot
- Has `flex-shrink: 0` on list — this was to prevent the list from collapsing in the scrollable page layout; EcPageLayout handles this now

### Test plan
- Renders items with correct keys
- Renders item slot content for each item
- Applies actions-right styling by default
- Does not apply actions-right when `actionsRight` is false
- Renders empty list when items is empty
- Uses custom keyField

### Dependencies
- Should be done after EcPageLayout is merged (consumers will use both)
- Can be done before or after EcFormDialog lands

### Autonomous eligibility
Autonomous-eligible. Simple component, 3 mechanical migrations.
