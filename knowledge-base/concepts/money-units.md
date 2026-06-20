---
type: concept
title: Money units
description: >-
  All monetary values in EveryCent are stored as integer minor units (cents),
  not decimal currency. Every monetary field links back to this concept.
tags: [foundational, money, convention]
timestamp: 2026-06-17T00:00:00Z
---

# Money units

**Every monetary value in the database is stored as an integer number of minor
units (cents).** A stored value of `30000` means 300.00 in the display currency.

This applies to every `amount` and every `*_amount` column across the schema —
`allocations.amount`, `incomes.amount`, `transactions.withdrawal_amount`,
`transactions.deposit_amount`, `special_events.budget_amount`, and so on.

## Why this matters for an agent

- Never treat a stored amount as a decimal currency value. Divide by 100 only at
  display time.
- Comparisons and thresholds are expressed in cents. For example, the
  placeholder threshold is `PLACEHOLDER_MAX_CENTS = 10` (i.e. 0.10) — see
  [placeholder allocations](/concepts/placeholder-allocations.md).
- Sums and arithmetic across amounts stay in integer cents end-to-end; there is
  no rounding step inside the data model.
