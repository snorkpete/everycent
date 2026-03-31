# Task: Break down BudgetAllocationList (515 lines)

**ID:** break-down-budgetallocationlist-515-lines
**Status:** done
**Branch:** task/break-down-budgetallocationlist-515-lines
**Autonomous:** true
**Priority:** high
**Captured:** 2026-03-28
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

COMP-01: `BudgetAllocationList.vue` (~610 lines) mixes category grouping, allocation filtering (fixed vs adjustable), subtotal/total calculations, dialog integration, and CRUD actions. Extract the grouping/filtering/totals concern into a `useAllocationGrouping` composable. Move allocation classes to a shared constant.

---

## Acceptance Criteria

- [x] `useAllocationGrouping` composable exists at `src/app/budgets/useAllocationGrouping.ts`
- [x] Composable accepts reactive inputs: `allocations`, `categories`, `totalIncome`
- [x] Composable accepts an options object with `displayDeletedAllocations` and `includeDeletedInTotals` (both `boolean | Ref<boolean>`, default `false`)
- [x] Composable exposes `fixedAllocations(category)` — returns fixed allocations for a category (respects `displayDeletedAllocations`)
- [x] Composable exposes `adjustableAllocations(category)` — returns non-fixed allocations for a category (respects `displayDeletedAllocations`)
- [x] Composable exposes `categoryTotals(category)` — returns `{ amount, spent, remaining }` for all non-deleted allocations in a category (or all if `includeDeletedInTotals` is true)
- [x] Composable exposes `fixedCategoryTotals(category)` — same shape, scoped to fixed allocations only
- [x] Composable exposes `grandTotals` — computed `{ amount, spent, remaining }` across all categories
- [x] Composable exposes `fixedTotals` — computed `{ amount, spent, remaining }` for all fixed allocations
- [x] Composable exposes `unallocated` — computed `totalIncome - grandTotals.amount`
- [x] Composable exposes `isFixedDetailVisible` (ref), `showFixedDetail()`, `hideFixedDetail()` for controlling whether fixed allocations render as individual rows or as a collapsed subtotal
- [x] `allocationClasses` constant moves to `src/app/shared/constants/allocationClasses.ts`
- [x] `remainingClass` utility moves to `src/app/shared/util/remaining-class.ts`
- [x] `titleCase` utility moves to `src/app/shared/util/title-case.ts`
- [x] `BudgetAllocationList.vue` uses the composable — `<script setup>` reduced to glue code (store wiring, dialog state, CRUD actions)
- [x] `variableOnly` prop is removed — replaced by the composable's `isFixedDetailVisible` state, with the toggle living inside `BudgetAllocationList`
- [x] Composable has its own spec (`useAllocationGrouping.spec.ts`) covering grouping, totals, deleted filtering, and fixed visibility toggle
- [x] Existing `BudgetAllocationList.spec.ts` still passes — tests remain focused on rendering and interaction
- [x] All extracted utilities have specs
- [x] No TypeScript errors (`npm run type-check`)
- [x] All tests pass (`npm run test`)

---

## Implementation Notes

### Composable signature

```ts
interface AllocationTotals {
  amount: number
  spent: number
  remaining: number
}

interface AllocationGroupingOptions {
  displayDeletedAllocations?: boolean | Ref<boolean>  // default false
  includeDeletedInTotals?: boolean | Ref<boolean>     // default false
}

function useAllocationGrouping(
  allocations: ComputedRef<AllocationData[]>,
  categories: ComputedRef<AllocationCategoryData[]>,
  totalIncome: ComputedRef<number>,
  options?: AllocationGroupingOptions,
)
```

### How the component wires it up

```ts
const store = useBudgetStore()
const allocations = computed(() => store.budget?.allocations ?? [])
const categories = computed(() => store.allocationCategories)
const totalIncome = computed(() =>
  store.budget?.incomes?.reduce((sum, i) => sum + (i.amount ?? 0), 0) ?? 0,
)

const grouping = useAllocationGrouping(allocations, categories, totalIncome, {
  displayDeletedAllocations: computed(() => store.isEditMode),
})
```

### What stays in the component

- Store wiring (the `computed` refs above)
- Dialog state: `dialogVisible`, `selectedAllocationId`, `selectedAllocationName`, `showTransactions()`
- CRUD: `addAllocation(category)`, `toggleDeleted(allocation)`
- Edit mode rendering decisions (`store.isEditMode` for input vs span)
- Template and styles

### What `variableOnly` prop becomes

The parent no longer passes a prop. The component includes a toggle (button/switch) that calls `grouping.hideFixedDetail()` / `grouping.showFixedDetail()`. The template uses `grouping.isFixedDetailVisible` to decide between individual rows and collapsed subtotal rows.

### Naming rationale

- "fixed" vs "adjustable" — domain terms that match the `is_fixed_amount` flag meaning
- `displayDeletedAllocations` / `includeDeletedInTotals` — explicit about what each flag controls; the composable doesn't know about "edit mode"
- `categoryTotals` / `fixedCategoryTotals` — parallel structure, clear scope

### Reference implementations

- Composable pattern: `src/app/budgets/useWantsNeedsBudgetBreakdown.ts`
- Composable spec pattern: follow the `setup()` helper pattern (see memory: composable specs use `setup({ ...options })`)
- Utility pattern: `src/app/shared/util/cents-to-dollars.ts`
