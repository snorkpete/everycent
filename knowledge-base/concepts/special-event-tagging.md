---
type: concept
title: Special-event tagging goes through the allocation, not the transaction
description: >-
  A transaction can only be attributed to a special event through its allocation
  (transaction → allocation → special_event). Any transaction with a NULL
  allocation_id is invisible to event tagging even when it is a real cash flow for
  that event.
tags: [domain, invariant, events, allocations, transactions]
timestamp: 2026-06-21T00:00:00Z
---

# Special-event tagging goes through the allocation, not the transaction

`special_event_id` lives on [allocations](/tables/allocations.md), **not** on
[transactions](/tables/transactions.md). There is no direct transaction → event
link. A transaction is attributed to a
[special event](/tables/special_events.md) only **indirectly, through its
allocation**:

```
transaction → allocation → special_event
```

An event `has_many :allocations`; a transaction reaches the event only by first
belonging to one of those allocations (via `allocation_id`).

## Consequence: NULL-allocation transactions are invisible to events

Because the only path runs through the allocation, **any transaction with
`allocation_id = NULL` cannot be tagged to a special event at all** — there is no
allocation to carry the `special_event_id`. This is a direct corollary of the
[budget-membership invariant](/concepts/budget-membership.md): a transaction
without an `allocation_id` is not part of the budget, and event tagging inherits
that same blind spot.

This bites precisely on the cash flows that are *genuine* event spend but never
acquire an allocation:

- **Inter-account transfers** — an event-related movement of money between two of
  a household's own accounts (see [transfers](/concepts/transfer.md)) carries no
  `allocation_id` on either leg.
- **Sink-fund drawdowns** — spend paid out of a
  [sink fund](/concepts/sink-fund.md) references a
  `sink_fund_allocation_id`, not an `allocation_id`, so it is off the event path.
- **Credit-card payments routed through a generic brought-forward allocation** —
  the payment settles against a catch-all
  [brought-forward](/concepts/brought-forward.md) line, so it is not attributable
  to the specific event the original purchase was for.

The worst case is a **large, multi-transaction purchase whose legs all have
`allocation_id = NULL`**. Consider a single big-ticket event outlay split across
several bank movements (a deposit, a balance payment, a transfer to cover it):
if none of those legs ever lands on an allocation, the whole purchase is
**un-attributable to the event**, even though it is unambiguously that event's
cost. There is no partial credit — the event simply never sees the money.

To capture such spend against an event, it has to be modelled as an
allocation first (and that allocation linked to the event); the raw transaction
alone can never carry the tag.

## Why this makes the cached event totals fragile

`special_events.budget_amount` and `special_events.actual_amount` are a
**frontend-computed cache, not authoritative** — the backend stores whatever the
UI sends and has no logic to compute or validate them. This is tracked as **bug
B8** in [special_events](/tables/special_events.md).

The tagging path is the *why* behind that drift. Both cached totals are derived
by rolling up the **allocations bridged to the event** (`Σ allocation.amount` for
plan, `Σ allocation.spent` for actual). Because that rollup is the only source of
the numbers, **any change to which allocations belong to the event — or to their
amounts or underlying transactions — silently invalidates the cached totals**
until the event is re-saved and the frontend recomputes them. Add an event
allocation, retag a transaction onto or off an event allocation, or edit an
amount, and the stored `budget_amount`/`actual_amount` are stale with no signal.

**To answer "what did this event cost," derive from the allocations** rather than
trusting the stored pair — and remember that any real cash flow sitting on a
NULL-allocation transaction is missing from *both* the cache and the derived
rollup, because it never entered the allocation bridge in the first place.
