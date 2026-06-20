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

A **knowledge register** of known live defects an agent must account for when
reasoning about the affected area — *not* a worklist. Fix-work is tracked in
domus; an entry may reference its domus task. When a defect is fixed, the change
is folded into the relevant concept (the behaviour it described now differs) and
the entry is **removed here, not archived** — git and domus hold the history.

IDs are **stable references** used across concepts, so numbers are never reused
and gaps are expected: a missing id (e.g. B5, B7) is an investigation that turned
out **not** to be a bug.

Distinct from [dead schema](/tracking/dead-schema.md), [incomplete
features](/tracking/incomplete-features.md), and [refactor
candidates](/tracking/refactor-candidates.md).

| ID | Summary | Where | Notes |
|---|---|---|---|
| B1 | `budgets.start_date` index is ascending, but budgets display in **reverse** start-date order. Index direction may be wrong / a descending index may help. | [budgets](/tables/budgets.md) | Access-pattern mismatch. |
| B2 | No constraint prevents **overlapping or gapped** budget periods. The contiguous-periods invariant is enforced by convention (create-first-then-clone), not by the system. | [budgets](/tables/budgets.md) | Hole to close; would make "budget for date X is unique" a guarantee. |
| B3 | Closed budgets are conceptually read-only but the system does **not** block edits. Amount edits on a closed budget's incomes/allocations corrupt settled balances/checkpoints. | [budgets](/tables/budgets.md), [budget close](/concepts/budget-close-checkpointing.md) | Description edits are harmless; guard amount edits when `status = closed`. |
| B4 | `Allocation#spent` sums in Ruby because summing in SQL triggers an N+1 (`includes` doesn't resolve it). | [allocations](/tables/allocations.md) | Has a TODO in the model; performance investigation. |
| B6 | `BankAccount#update_balance` sums `deposit_amount`/`withdrawal_amount` **without nil-guards**, unlike sibling methods that use `|| 0`. | [bank_accounts](/tables/bank_accounts.md) | Low-risk (schema default 0) but inconsistent; could raise on a nil amount. |
| B8 | `special_events.budget_amount`/`actual_amount` are a **frontend-maintained cache** with no backend computation or validation; they drift from the true allocation-derived totals (refresh only on event re-save). | [special_events](/tables/special_events.md) | Fix direction: compute/validate server-side, or derive on read. |
