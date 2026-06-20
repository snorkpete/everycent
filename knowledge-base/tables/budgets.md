---
type: table
title: budgets
description: >-
  The monthly period container at the heart of the zero-based engine. Incomes
  and allocations attach to a budget; transactions link only indirectly.
resource: everycent:table:budgets
tags: [table, core, zero-based, period]
timestamp: 2026-06-17T00:00:00Z
---

# budgets

The **period container** at the heart of the zero-based engine. Each row is one
budgeting cycle — in practice **one month**. It is the envelope that
[incomes](/tables/incomes.md) and [allocations](/tables/allocations.md) attach
to. EveryCent is zero-based in *concept*, but allocations do **not** fully
consume income in *implementation*: the unallocated remainder is deliberate
discretionary money. See
[discretionary money & the budget gap](/concepts/discretionary-money.md). This is
all measured *within* one budget.

## Schema

| Column | Meaning |
|---|---|
| `id` | Primary key. |
| `name` | **Display only.** System-controlled, format `"month day - month day, year"`. **No system logic reads or parses it.** Dates are the sole source of truth for the period. An agent must never derive a budget's period, ordering, or identity from `name`. |
| `start_date` / `end_date` | The period bounds. **Source of truth** for which period a budget covers. |
| `status` | `open` or `closed`. See lifecycle below. Default `open`. |
| `household_id` | Tenant scope. |
| `created_at` / `updated_at` | Timestamps. |

`start_date` is indexed (ascending). Note budgets are displayed in **reverse**
start-date order, so the index direction may be wrong — see
[bugs](/tracking/bugs.md) (B1).

## Status lifecycle

`status ∈ {open, closed}`.

- **`open`** = editable. Allocations and incomes can be added/changed;
  transactions still land and get categorized.
- **`closed`** = conceptually read-only and **finalized**.

**Editability caveat (important):** the read-only rule is *not enforced* by the
system — see [bugs](/tracking/bugs.md) (B3). Editing **descriptions** of a closed
budget's incomes/allocations is harmless. Editing **amounts** is not blocked but
produces incorrect accounting, because those amounts feed settled balances.

Closing is a **manual** step that performs accounting cleanup and writes balance
checkpoints. The full mechanic — and what reopening does — is its own concept:
[budget close & balance checkpointing](/concepts/budget-close-checkpointing.md).

## Period invariant (assumed, not enforced)

Budget periods are **contiguous: no gaps, no overlaps**. The next budget is
created by a **clone function** that derives it from the previous one.

This invariant is enforced **by convention, not by the system** — nothing
prevents manually creating an overlapping or gapped budget. So "the budget for
date X is unique" is true *in practice* but not *guaranteed*. See
[bugs](/tracking/bugs.md) (B2). If/when that hole is closed, this graduates from
assumed to enforced.

## Relationship to actuals

[Incomes](/tables/incomes.md) and [allocations](/tables/allocations.md) point at
a budget via `budget_id`. **Transactions do not.** A transaction links to an
allocation (`transactions.allocation_id`), so a transaction's budget membership
is **derived through its allocation** — there is no `transactions.budget_id`. An
agent should not look for one.
