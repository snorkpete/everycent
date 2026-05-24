# Task: Extract useBudgetTotals composable

**ID:** extract-usebudgettotals-composable
**Status:** done
**Autonomous:** false
**Priority:** low
**Captured:** 2026-04-10
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

[HC §1.6] Consolidate budget total computations shared by BudgetSummary and BudgetSummaryStrip; verify includeDeleted behaviour is intentional in each caller.

---

## Situation

Three components compute budget totals:

- **BudgetSummaryStrip** (desktop) and **BudgetSummaryStripMobile** both call `useBudgetSummary()`, which filters out deleted allocations/incomes (`!a.deleted`).
- **BudgetSummary** computes `totalIncome`, `totalAllocations`, and `totalDiscretionaryAmount` inline in its `<script setup>`, using **all** allocations (including deleted). A comment on line 67 says: "Includes all allocations (even deleted) — BudgetSummary shows the full budget picture."

Both paths then call `useWantsNeedsBudgetBreakdown(allocations, totalIncome)` — but with different allocation sets.

### The `includeDeleted` divergence

`useBudgetSummary` (Strip): excludes deleted from both incomes and allocations.
`BudgetSummary.vue` (panel): includes all allocations (no filter), and also does not filter incomes by deleted.

This is the core design question: **is `BudgetSummary` intentionally including deleted items, or is this an oversight from the original port?** The inline comment claims it's intentional, but it was written during migration — needs human confirmation before the extraction locks in either behaviour.

### What would be shared

Both components compute the same three quantities (just over different allocation sets):
1. `totalIncome` — sum of `income.amount` across incomes
2. `totalAllocations` — sum of `allocation.amount` across allocations
3. `discretionaryTotal` / `totalDiscretionaryAmount` — income minus allocations

Both also compute NWS breakdown via `useWantsNeedsBudgetBreakdown`.

`BudgetSummary` additionally has couple/single discretionary-split logic inline in its template (`Math.floor(totalDiscretionaryAmount / 2)`), which duplicates what `useBudgetSummary` does via `perPersonAmount`. The family-type settings (`familyType`, `wife`, `husband`) are also duplicated.

---

## Acceptance Criteria

- [ ] `BudgetSummary.vue` uses a composable for its totals instead of inline computeds
- [ ] `useBudgetSummary` and the new composable share the core total-computation logic (no duplication of the reduce patterns)
- [ ] The `includeDeleted` behaviour is preserved exactly as-is for each caller (resolved before implementation — see decision needed below)
- [ ] `BudgetSummary.vue` no longer has inline `Math.floor(totalDiscretionaryAmount / 2)` in the template — uses a computed from the composable
- [ ] All existing tests pass without changes to assertions (behaviour is unchanged)
- [ ] New/updated composable has spec coverage for the `includeDeleted` parameter path
- [ ] `useWantsNeedsBudgetBreakdown` remains as a separate composable (it has a distinct responsibility — NWS classification — and accepts allocations/income as params, so it's already clean)
- [ ] No new files in `src/composables/` — composable stays in `src/app/budgets/` (co-located with its feature)

---

## Implementation Notes

### Decision needed before implementation

**Confirm with the user:** Is `BudgetSummary` correct to include deleted allocations/incomes? The comment says yes, but it was likely written during migration, not from a product decision. If the answer is "no, filter them out", the extraction simplifies to just having `BudgetSummary` call `useBudgetSummary()` directly (like the Strip does).

### Proposed composable signature (if `includeDeleted` is kept)

The simplest approach: add an `includeDeleted` option to the existing `useBudgetSummary`:

```ts
interface BudgetSummaryOptions {
  includeDeleted?: boolean; // default: false
}

export function useBudgetSummary(options?: BudgetSummaryOptions) {
  const includeDeleted = options?.includeDeleted ?? false;
  // ...filter or not based on flag
}
```

`BudgetSummary.vue` calls `useBudgetSummary({ includeDeleted: true })`.
`BudgetSummaryStrip.vue` and `BudgetSummaryStripMobile.vue` call `useBudgetSummary()` (unchanged).

This avoids creating a second composable. The "useBudgetTotals" name from the original capture is fine too, but widening the existing `useBudgetSummary` keeps the API surface smaller.

### What changes in BudgetSummary.vue

- Remove inline `totalIncome`, `totalAllocations`, `totalDiscretionaryAmount` computeds
- Remove direct `useWantsNeedsBudgetBreakdown` call
- Remove duplicated `familyType`, `wife`, `husband` settings reads
- Call `useBudgetSummary({ includeDeleted: true })` and destructure everything it needs
- Replace template `Math.floor(totalDiscretionaryAmount / 2)` with `perPersonAmount` from the composable

### Test expectations

- `useBudgetSummary.spec.ts` — add tests for `includeDeleted: true` path (deleted allocations/incomes are counted)
- `BudgetSummary.spec.ts` — existing tests should pass unchanged (behaviour is identical)
- `useWantsNeedsBudgetBreakdown.spec.ts` — no changes needed (it's parameterised by inputs, unaffected)
