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

## Where the 0.01 amount actually comes from

The tiny amount is a **UI workaround from the mass-edit allocations feature**,
not a designed sentinel. Mass-edit matches allocations across budgets by name,
with one amount field per budget; in that form **amount 0 means "remove this
allocation from this budget."** Entering **0.01** keeps a near-zero allocation
alive without triggering that delete.

`PLACEHOLDER_MAX_CENTS = 10` / the `> 10` filter is therefore the **model
tolerating that UI artifact** — so workaround amounts don't count as real spend
or real budget. It *coincides* with sink-fund-funded lines (which legitimately
want ~0 in the monthly budget) but the 0.01 itself is incidental, not semantic.

This may disappear if the "amount 0 = delete" behavior is replaced by an
explicit per-budget delete — see
[refactor candidates](/tracking/refactor-candidates.md) (R2).

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
