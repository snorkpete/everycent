---
type: concept
title: Placeholder allocations
description: >-
  Allocations budgeted at 10 cents or less are placeholders for expenses funded
  from sink funds rather than the current month's income. Spending against them
  is intentional, not overspend.
tags: [domain, allocations, sink-funds, overspend]
timestamp: 2026-06-17T00:00:00Z
---

# Placeholder allocations

A **placeholder allocation** is an [allocation](/tables/allocations.md) budgeted
at **≤ 10 cents** (`PLACEHOLDER_MAX_CENTS = 10`, in
[minor units](/concepts/money-units.md) — i.e. 0.01-style amounts).

## What it represents

The expense **exists and will be spent**, but it is **funded from a sink fund**,
not from this month's income. The tiny budgeted amount is a marker so the line
shows up in the budget without claiming a real slice of this month's inflow.

## Why an agent must handle it specially

Because the budgeted amount is ~0 but real spending flows through it,
**spending against a placeholder is by design, not overspend.** Any
overspend/variance calculation must **exclude placeholders**.

The model exposes a helper for this:

- `non_placeholder_amount_sql(column)` → `"#{column} > 10"` — use it to filter
  placeholders out of overspend logic.

## Related

- Links allocations to sink funds (`sink_fund_allocations`, not yet documented) —
  placeholders are the budget-side marker of a sink-fund-funded expense.
- Note the separate `(SF)` marker convention in allocation names — see
  [allocation naming conventions](/concepts/allocation-naming-conventions.md).
  (Whether `(SF)` and the placeholder threshold always coincide is not yet
  confirmed.)
