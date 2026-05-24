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

## Outcome

BudgetSummary.vue was dead code — not imported or rendered anywhere in the app. Only its spec referenced it. The `includeDeleted` divergence was moot. Deleted `BudgetSummary.vue` and `BudgetSummary.spec.ts`. The only live consumers (BudgetSummaryStrip, BudgetSummaryStripMobile) already use `useBudgetSummary()` — no extraction needed.
