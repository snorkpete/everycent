---
type: tracking-register
title: Bugs & investigations
description: >-
  Known live defects and things to investigate. These are correctness/performance
  fixes, distinct from dead schema, incomplete features, and refactors.
tags: [tracking, bugs, maintenance]
timestamp: 2026-06-17T00:00:00Z
---

# Bugs & investigations (B)

Live defects and investigations. Distinct from [dead
schema](/tracking/dead-schema.md), [incomplete
features](/tracking/incomplete-features.md), and [refactor
candidates](/tracking/refactor-candidates.md).

| ID | Summary | Where | Notes |
|---|---|---|---|
| B1 | `budgets.start_date` index is ascending, but budgets display in **reverse** start-date order. Index direction may be wrong / a descending index may help. | [budgets](/tables/budgets.md) | Access-pattern mismatch. |
| B2 | No constraint prevents **overlapping or gapped** budget periods. The contiguous-periods invariant is enforced by convention (create-first-then-clone), not by the system. | [budgets](/tables/budgets.md) | Hole to close; would make "budget for date X is unique" a guarantee. |
| B3 | Closed budgets are conceptually read-only but the system does **not** block edits. Amount edits on a closed budget's incomes/allocations corrupt settled balances/checkpoints. | [budgets](/tables/budgets.md), [budget close](/concepts/budget-close-checkpointing.md) | Description edits are harmless; guard amount edits when `status = closed`. |
| B4 | `Allocation#spent` sums in Ruby because summing in SQL triggers an N+1 (`includes` doesn't resolve it). | [allocations](/tables/allocations.md) | Has a TODO in the model; performance investigation. |
