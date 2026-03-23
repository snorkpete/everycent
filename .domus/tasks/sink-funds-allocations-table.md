# Task: Sink funds — allocations table

**ID:** sink-funds-allocations-table
**Status:** proposed
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-21
**Parent:** migrate-sink-funds-screen-to-vue
**Depends on:** sink-funds-page-shell-store-api-types-route
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Standalone `SinkFundAllocationTable.vue` component rendering the allocations table for a sink fund. Shows each allocation with name, current balance, target, outstanding amount, comment, and status. Supports inline editing in edit mode.

---

## Acceptance Criteria

**View mode:**
- [ ] `SinkFundAllocationTable.vue` as a standalone component, rendered inside `SinkFundsPage.vue`
- [ ] Table with columns: Name (25%), Current Balance (10%), Target (10%), Outstanding (10%), Comment (20%), Status (5%), Actions (10%)
- [ ] Column widths match Angular proportions (`table-layout: fixed; width: 100%`)
- [ ] Rows filtered by `visibleAllocations` from store (respects `showDeactivated` toggle)
- [ ] Current Balance column: shows `allocation.current_balance` in currency format
- [ ] Current Balance column: eye icon next to the value (placeholder no-op click — subtask 5 wires it up)
- [ ] Eye icon button has `title` attribute: "Show transactions for this allocation"
- [ ] Target column: shows `allocation.target` in currency format
- [ ] Outstanding column: computed as `target === 0 ? 0 : current_balance - target`
- [ ] Outstanding column: highlight positive values (positive = green/ahead of target, negative = red/behind target). Use `highlightMode: 'positive'` logic
- [ ] Comment column: shows `allocation.comment`
- [ ] Status column: shows `allocation.status`
- [ ] Amounts in currency format (cents to dollars), `font-variant-numeric: tabular-nums`
- [ ] Sticky table header (top of scroll container)

**Edit mode:**
- [ ] Name → text input
- [ ] Target → `EcMoneyField`
- [ ] Comment → text input
- [ ] Current Balance and Outstanding are read-only even in edit mode
- [ ] Status is read-only in edit mode (managed via deactivation button, not manual text editing)
- [ ] Delete button (icon, trash) per row — toggles `allocation.deleted` flag; shows undo icon when deleted
- [ ] Delete button has `title` attribute: "Delete this obligation" / "Undo delete"
- [ ] Deleted rows visually indicated (dimmed/strikethrough)
- [ ] Deactivate/reactivate button per row — toggles `allocation.status` between `'open'` and `'closed'`
- [ ] Deactivate button has `title` attribute: "Close this obligation" / "Reopen this obligation"

**Integration:**
- [ ] Reads `visibleAllocations`, `isEditMode` from `sinkFundStore`
- [ ] Edits are in-place on the store's data (no local copy)
- [ ] `SinkFundsPage.vue` updated to render `SinkFundAllocationTable` in the content area
- [ ] Full test coverage for the component

**Not in scope:** Summary rows (subtask 3 — account balance, unassigned, totals). Show transactions dialog functionality (subtask 5 — icon is placeholder only). "Add Obligation" button lives in the page shell toolbar (subtask 1).

---

## Implementation Notes

### Files to create/modify
- `src/app/sink-funds/SinkFundAllocationTable.vue` — new component
- `src/app/sink-funds/SinkFundAllocationTable.spec.ts` — new spec
- `src/app/sink-funds/SinkFundsPage.vue` — import and render `SinkFundAllocationTable` in content area

### Outstanding calculation
The Angular version computes outstanding per row:
```typescript
allocation.target == 0 ? 0 : allocation.current_balance - allocation.target
```
When target is 0 (no target set), outstanding shows 0. Otherwise it's `current_balance - target`:
- Positive = ahead of target (has more than needed)
- Negative = behind target (needs more money)

### Deactivation vs deletion
Angular has two separate action buttons per row:
1. **Delete** — marks `allocation.deleted = true`, server removes on save. Intended for new/unwanted allocations.
2. **Deactivate** — sets `allocation.status = 'closed'`. The allocation is preserved but hidden unless "Show Closed Obligations" is toggled on. Persisted on save.

Implement both in Vue:
- Delete button (trash icon) → toggles `deleted` flag
- Deactivate button (archive/power-off icon) → toggles status between `'open'` and `'closed'`
Both are only visible in edit mode.

### Angular reference
- `webclientv3/src/app/sink-funds/sink-fund/sink-fund.component.ts` — template with table structure, column widths, edit mode bindings (lines 55–210)

### Vue patterns to follow
- Table structure: follow `src/app/budgets/BudgetAllocationList.vue` — native `<table>` with sticky thead
- Edit mode inputs: same pattern as BudgetAllocationList (text inputs, EcMoneyField, delete button with title)
- Icon buttons with `title` attributes per project convention
