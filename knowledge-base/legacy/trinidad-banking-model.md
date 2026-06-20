---
type: concept
title: Trinidad banking model (deprecated)
description: >-
  A deprecated domain that predates the current household setup. It dealt with
  individual accounts, standing orders, and transfers into a joint account.
  Explains a whole class of empty/unused schema.
tags: [legacy, deprecated, banking, standing-orders]
timestamp: 2026-06-17T00:00:00Z
status: deprecated
---

# Trinidad banking model (deprecated)

Before the current single-joint-household setup (Netherlands), EveryCent ran in a
**Trinidad** context with a different banking reality: **individual accounts**,
**standing orders**, and the need to **transfer income from personal accounts
into a joint account** while leaving enough behind to cover standing orders plus
personal money.

That whole problem domain was **ripped out** when the household model changed.
This concept exists so that the schema it left behind is explained **in one
place** rather than field by field.

## Schema left behind by this model

All of the following are dead **because of this deprecation**, not because of a
modeling gap. See [dead schema](/tracking/dead-schema.md) for the register.

- `incomes.bank_account_id` (D1)
- `allocations.is_standing_order` (D2)
- `allocations.bank_account_id` (D3) — plus the
  `clear_bank_account_if_not_standing_order` callback that now always nulls it
- `allocation_categories.percentage` (D5) — the percentage-tracking attempt;
  technically stopped being used in the Trinidad era
- The abandoned tables `recurring_allocations`, `recurring_incomes`, `payees`
  (these predate multi-tenancy and have no `household_id`; empty in prod, no live
  code)

## Why an agent should care

When an agent encounters an empty or seemingly purposeless field in the list
above, the explanation is **here** — it is residue of a removed domain, safe to
ignore for current behavior, and a cleanup/migration candidate.
