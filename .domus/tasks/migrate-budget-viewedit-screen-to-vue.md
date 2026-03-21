# Task: Migrate budget view/edit screen to Vue

**ID:** migrate-budget-viewedit-screen-to-vue
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-03-21
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Port the single budget view/edit screen (`/budgets/:id`) from Angular to Vue. This is a parent task — the work is broken into 5 subtasks.

**Scope:** Replaces the `BudgetDetailStub.vue` placeholder created by the budget list migration task.

---

## Subtasks

1. **Page shell, store, and API** — skeleton page, data layer, toolbar, edit/save/cancel
2. **Incomes table** — view + inline edit, add/delete, totals
3. **Allocations table** — view + inline edit, category grouping with sticky sub-headers, add/delete per category, totals + unallocated badge
4. **Show transactions dialog** — eye icon on Spent column opens compact transaction list for that allocation
5. **Summary section** — discretionary amount (split per person for couples), needs/wants/savings breakdown with percentages

**Dependencies:** 1 is the foundation. 2 and 3 depend on 1 and can run in parallel. 4 depends on 3. 5 depends on 1.

---

## Design decisions

- **Edit mode:** in-place editing with explicit save (same as Angular). No draft records — unlike transactions, there's no import function. Edit toggles fields inline; Save posts everything; Cancel refreshes from server.
- **Visual style:** consistent with transactions and future budgets screens. Sticky table headers, sticky category sub-headers (like future budgets), content card with border/rounded corners.
- **Store:** `budgetStore.ts` (separate from `budgetListStore.ts` used by the list screen). May share common API calls via `budgetApi.ts`.

---

## Acceptance Criteria

Parent task is done when all 5 subtasks are done.

---

## Implementation Notes

### Angular reference
- `webclientv3/src/app/budgets/budget/budget.component.ts` — page shell
- `webclientv3/src/app/budgets/budget-editor/budget-editor.component.ts` — editor container
- `webclientv3/src/app/budgets/budget-editor/incomes/` — income list components
- `webclientv3/src/app/budgets/budget-editor/allocations/` — allocation list components + summary
- `webclientv3/src/app/budgets/budget.service.ts` — API calls
