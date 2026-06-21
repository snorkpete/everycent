---
type: table
title: recurring_allocations
status: dead
description: >-
  Abandoned v1 templates for auto-populating a new budget's allocations on create.
  Never truly implemented; replaced by copy budget. Empty in prod, no model, no
  household_id.
resource: everycent:table:recurring_allocations
tags: [table, dead, deprecated]
timestamp: 2026-06-21T00:00:00Z
---

# recurring_allocations

**Dead table.** Part of the v1 answer to *"how do we create a new budget easily?"* —
templates that would auto-populate a new budget's allocations on create. Trinidad-era,
but a budget-creation concern that would have applied to any household. **Never truly
implemented**; see [recurring allocation](/concepts/recurring-allocation.md) for the
idea and [copy budget](/concepts/copy-budget.md) for what replaced it (months are
similar enough that copy-and-tweak beat maintaining templates).

State today: **predates multi-tenancy** (no `household_id`), no model, **empty in
prod, no live code** — only a stale `household has_many :recurring_allocations` and
`allocation_category has_many :recurring_allocations`. Registered in [dead
schema](/tracking/dead-schema.md).

## Schema

| Column | Meaning |
|---|---|
| `id` | Primary key (`serial`). |
| `name` | Template name (required). |
| `amount` | Planned amount (integer minor units). |
| `frequency` | Default `"monthly"`. |
| `allocation_type` | Default `"expense"`. |
| `is_standing_order` | Trinidad-era standing-order flag. |
| `allocation_category_id` | Intended grouping category. |
| `bank_account_id` | Intended account. |
| `created_at` / `updated_at` | Timestamps. |
