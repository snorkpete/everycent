---
type: concept
title: Budget close & balance checkpointing
description: >-
  Closing a budget is both an accounting step and a performance mechanism: it
  stores per-bank-account balance checkpoints so open budgets only sum their own
  period's transactions instead of all history.
tags: [domain, performance, accounting, balances, budget-lifecycle]
timestamp: 2026-06-17T00:00:00Z
status: partial
---

# Budget close & balance checkpointing

This concept is **invisible in the schema** but governs how the entire balance
system performs and stays correct. An agent that doesn't know this will write
naive `SUM(transactions)` queries that are either slow or double-count.

## The problem it solves

Bank balances are **derived by summing transactions** — there is no stored
running balance per transaction. With ~12 years of accumulated transactions, a
naive sum over all history gets progressively slower.

## The mechanism

Closing a [budget](/tables/budgets.md) (a manual step) does accounting cleanup
**and** writes a **checkpoint**: the per-bank-account totals of everything up to
and including that closed period.

So an **open** budget computes balances as:

```
balance = checkpoint(sum of all prior closed budgets) + sum(this period's transactions only)
```

This bounds the work to one period's transactions regardless of how deep the
history goes.

**Reopening** a closed budget invalidates and recomputes the checkpoint by
re-summing up to **but not including** the reopened budget.

## Why closed budgets must not have amounts edited

Because closed-period amounts are baked into checkpoints, editing an amount on a
closed budget's allocation/income corrupts settled balances. The system does
**not** currently block this — see [bugs](/tracking/bugs.md) (B3).

## OPEN: where checkpoints are physically stored

**Not yet confirmed.** No obvious per-period, per-account totals column has been
seen so far. `bank_accounts` has singular `opening_balance` / `closing_balance` /
`closing_date` columns that *smell* related but are singular, not per-budget —
so either those columns are rewritten on each close, or there is a storage
location in a table not yet examined. **Resolve when documenting `bank_accounts`
and `transactions`.** Until then, do not assert the storage shape.
