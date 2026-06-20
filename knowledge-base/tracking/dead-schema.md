---
type: tracking-register
title: Dead schema
description: >-
  Vestigial tables and columns that exist in the schema but are unused by live
  code and safe (eventually) to drop. Most trace to the deprecated Trinidad
  banking model.
tags: [tracking, dead-schema, cleanup, deprecated]
timestamp: 2026-06-17T00:00:00Z
---

# Dead schema (D)

Tables and columns that exist but are **not used by live code**. Cleanup /
migration candidates. Most trace to the [Trinidad banking
model](/legacy/trinidad-banking-model.md).

An agent should treat these as **non-functional**: do not infer behavior from
them, do not populate them.

| ID | Item | Kind | Notes |
|---|---|---|---|
| — | `payees`, `recurring_allocations`, `recurring_incomes` | Tables | Abandoned. Predate multi-tenancy (no `household_id`). Empty in prod, no live code. The problem they targeted was solved differently (to be pinned when that solution's table is documented). |
| D1 | `incomes.bank_account_id` | Column | Trinidad vestige. See [incomes](/tables/incomes.md). |
| D2 | `allocations.is_standing_order` | Column | Trinidad vestige (standing orders). |
| D3 | `allocations.bank_account_id` | Column | Trinidad vestige. The `clear_bank_account_if_not_standing_order` callback now always nulls it. |
| D4 | `allocations.allocation_type` | Column | Dead. Referenced nowhere in the `Allocation` model. Purpose no longer known. |
| D5 | `allocation_categories.percentage` | Column | Dead percentage-tracking attempt; stopped being used in the Trinidad era. Related to the unmodeled 50/30/20 target — see [allocations](/tables/allocations.md). |

See [allocations](/tables/allocations.md) for context on D2–D5.
