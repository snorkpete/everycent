---
type: concept
title: Budget close & balance checkpointing
description: >-
  Closing a budget is both an accounting step and a performance mechanism: it
  rolls each bank account's single closing_balance forward so open budgets only
  sum their own period's transactions instead of all history.
tags: [domain, performance, accounting, balances, budget-lifecycle]
timestamp: 2026-06-17T00:00:00Z
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

## Why closed budgets must not have amounts edited

Because closed-period amounts are baked into checkpoints, editing an amount on a
closed budget's allocation/income corrupts settled balances. The system does
**not** currently block this — see [bugs](/tracking/bugs.md) (B3).

## Where the checkpoint is stored

The checkpoint is a **single rolling per-account balance**, not per-budget
history: `bank_accounts.closing_balance` as of `bank_accounts.closing_date`.

**Close** (`Budget#close`): for each account, `update_balance(budget_id, end_date)`
adds the period's net `Σ(deposit − withdrawal)` to `closing_balance` and advances
`closing_date`; then `add_brought_forward_transactions` carries over unpaid
credit-card charges (see [brought-forward](/concepts/brought-forward.md)); then
the budget `status` becomes `closed`.

**Reopen** is **last-closed-budget only** (`Budget#reopen_last_budget`): it
recomputes `closing_balance = opening_balance + Σ(deposit − withdrawal)` over
transactions *before* the reopened budget's start, sets
`closing_date = start_date − 1`, and calls `remove_brought_forward_transactions`.

### Dual sign convention

Balances use **deposit-positive** (`deposit − withdrawal`); allocation `spent`
uses **withdrawal-positive** (`withdrawal − deposit`). This is by design — the
two frames must not be mixed.

## Known limitation: past-budget UI totals

Because the checkpoint is a single rolling value (latest closed budget only),
**UI totals for *past* budgets that rely on closing balance can be wrong** —
there is no per-budget stored total to restore them from. A long-standing design
idea is a **per-budget totals table** — see
[refactor candidates](/tracking/refactor-candidates.md) (R6). No real-world
trigger yet. Note also that closed budgets "should not be edited" but this is
**not enforced** — see [bugs](/tracking/bugs.md) (B3).
