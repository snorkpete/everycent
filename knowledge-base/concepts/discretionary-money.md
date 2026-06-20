---
type: concept
title: Discretionary money & the budget gap
description: >-
  Discretionary/personal money is intentionally NOT modeled as an allocation. It
  is the remainder of income minus allocations, split between the two users, and
  visible only as actual transfer transactions. The budget target is a deliberate
  non-zero gap, not zero.
tags: [domain, budgeting, discretionary, zero-based, reporting]
timestamp: 2026-06-17T00:00:00Z
---

# Discretionary money & the budget gap

This concept corrects a literal reading of "zero-based budgeting" that the schema
and the word *zero-based* would otherwise imply. It is **non-obvious and
load-bearing** — an agent that misses it will mis-report balanced budgets as
errors.

## Philosophy vs. implementation

EveryCent **is** zero-based in *concept*: every cent of income has a job. But in
*implementation*, one job — **discretionary / personal money** — is deliberately
**never modeled as an allocation**.

Discretionary money is the **remainder**:

```
discretionary_total = income_total − Σ(allocations)
```

There is **no allocation row** for it and **no planning-side record** of it. It
exists in the data only as **actual transfer transactions** moving money out of
the budget/joint account into each user's individual spending account.

## The target is a non-zero gap, not zero

Because discretionary money is the remainder, **budgeting does not aim for zero
unallocated.** It aims for a deliberate **positive gap** — e.g. ~200, so that
each of the two users gets ~100 in personal money.

**Therefore:** `income − allocations > 0` is **not** an unbudgeted shortfall to
fix. It **is** the discretionary pool, by design. Any "you have unallocated money"
or "budget doesn't balance" logic must account for this, or it will be wrong.

## What is and isn't stored

| Thing | Stored? | Where |
|---|---|---|
| Whether to split discretionary (1- vs 2-person household) | Yes | `settings.family_type` |
| The split math / per-user transfer amounts | **No** | Budget-screen UI only |
| The target gap amount | **No** | A couple's decision; may vary per budget, rarely does |
| The discretionary remainder as a plan figure | **No** | Derived, never persisted |
| The actual movement of personal money | Yes | As transfer [transactions](/tables/transactions.md) with **no `allocation_id`** |

## Why discretionary money stays out of reporting: allocation_id = budget membership

> This is a **system-wide invariant**, surfaced here but broader than this
> concept. It should anchor the future `transactions` concept and likely be
> promoted to its own concept then. See [open questions](/tracking/open-questions.md).

**A transaction's `allocation_id` is the marker of budget membership:**

- `allocation_id` **present** ⇒ the transaction is **part of the budget** and
  counts in allocation/spend reporting.
- `allocation_id` **absent** ⇒ the transaction is **not budget-related** and must
  **not** appear in any allocation-based reporting.

Both legs of discretionary money fall in the second bucket:

1. The **transfer out** of the joint/budget account into a personal account — no
   `allocation_id`.
2. Any **spending from** those personal accounts — also no `allocation_id`.

So discretionary money is excluded from allocation reporting automatically,
simply because none of its transactions carry an `allocation_id`. The NLQ /
reporting layer should treat missing `allocation_id` as "outside the budget,"
consistent with how the `bookkeeping` allocation class excludes internal money
movement — see [allocations](/tables/allocations.md).

## Related

- [budgets](/tables/budgets.md), [allocations](/tables/allocations.md),
  [incomes](/tables/incomes.md) — their zero-based framing is qualified by this concept.
- `settings.family_type` — the only persisted input to the split (table not yet documented).
