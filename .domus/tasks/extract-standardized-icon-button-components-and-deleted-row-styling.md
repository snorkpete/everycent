# Task: Extract standardized icon button components and deleted-row styling

**Status:** done
**Branch:** task/extract-standardized-icon-button-components-and-deleted-row-styling
**ID:** extract-standardized-icon-button-components-and-deleted-row-styling
**Status:** proposed
**Autonomous:** true
**Priority:** high
**Captured:** 2026-04-02
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Extract standardized components for two recurring UX patterns — deleted row styling and semantic icon buttons — so they look and behave identically everywhere and can be changed from a single place.

---

## Design (refined 2026-04-03)

### Part 1: Global `.ec-deleted` CSS

A global/shared CSS class providing the deleted row baseline:
```css
.ec-deleted {
  opacity: 0.4;
  text-decoration: line-through;
}
```

Currently duplicated under 4 different class names across 4 files:
- `.transaction-row--deleted` (TransactionList.vue)
- `.row-deleted td` (BudgetIncomeList.vue)
- `.deleted-row` (BudgetAllocationList.vue, SinkFundAllocationTable.vue)

Also covers `.closed-row` in SinkFundAllocationTable.vue (identical styling for `status === 'closed'`).

**Migration:** Replace all 4 class definitions with `.ec-deleted`. Update template `:class` bindings to use `'ec-deleted'`.

### Part 2: EcDeleteButton

Encapsulates the delete/restore toggle pattern used in 5 files. Currently each file independently implements:
- Icon swap: `pi-trash` (delete) ↔ `pi-undo` (restore)
- Severity swap: `danger` ↔ `secondary`
- Tooltip swap: "Delete this X" ↔ "Restore this deleted X"
- Click handler toggles a `deleted` flag

**Component API:**
```vue
<EcDeleteButton
  :deleted="item.deleted"
  item-label="transaction"
  @toggle="store.toggleDelete(item)"
/>
```

Props:
- `deleted: boolean` — current deleted state
- `itemLabel?: string` — used in tooltip text ("Delete this {itemLabel}" / "Restore this deleted {itemLabel}")

Emits:
- `toggle` — fired on click, parent handles the actual state change

The component is a PrimeVue Button with fixed props (`text`, `size="small"`) and dynamic icon/severity/tooltip based on `deleted` state. No generic EcIconButton layer underneath — just a direct PrimeVue Button wrapper.

**Consumers to migrate:**
- TransactionList.vue (individual + "delete all" header button — delete all stays custom, it's a different pattern)
- BudgetIncomeList.vue
- BudgetAllocationList.vue
- SinkFundAllocationTable.vue
- ImportPage.vue

### Part 3: EcShowTransactionsButton

Pins the "show transactions for this allocation" interaction to a consistent icon and tooltip.

**Component API:**
```vue
<EcShowTransactionsButton @click="showTransactions(allocation)" />
```

Fixed: eye icon (`pi pi-eye`), tooltip ("Show transactions for this allocation"), PrimeVue Button with `text`, `size="small"`, `severity="secondary"`.

Currently implemented as raw `<button>` with `<i class="pi pi-eye">` in 2 files:
- BudgetAllocationList.vue (`.eye-btn` CSS)
- SinkFundAllocationTable.vue (`.eye-btn` CSS, 18 lines identical)

**Migration:** Replace both raw buttons + `.eye-btn` CSS with the component.

### Not in scope

- **No generic EcIconButton layer** — YAGNI. If we need shared behaviour across multiple semantic buttons later, extract then.
- **EcToggleFixedButton** — only used in 1 place (BudgetAllocationList), not worth extracting yet.

---

## Acceptance Criteria

- [x] Global `.ec-deleted` CSS exists (shared stylesheet or scoped utility)
- [x] All 4 duplicated deleted-row class definitions replaced with `.ec-deleted`
- [x] EcDeleteButton component with `deleted` prop, `itemLabel` prop, `toggle` emit
- [x] EcDeleteButton spec with full coverage (both states, tooltip text, icon/severity switching)
- [x] All 5 files' delete/restore buttons migrated to EcDeleteButton
- [x] EcShowTransactionsButton component with fixed icon/tooltip, emits click
- [x] EcShowTransactionsButton spec
- [x] Both raw `<button>` eye button usages migrated, `.eye-btn` CSS removed
- [x] All existing tests pass
