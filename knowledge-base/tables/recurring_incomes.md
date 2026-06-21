---
type: table
title: recurring_incomes
status: dead
description: >-
  Abandoned v1 templates for auto-populating a new budget's incomes on create. The
  income half of recurring allocations; never truly implemented, replaced by copy
  budget. Empty in prod, no model, no household_id.
resource: everycent:table:recurring_incomes
tags: [table, dead, deprecated]
timestamp: 2026-06-21T00:00:00Z
---

# recurring_incomes

**Dead table.** The income counterpart of
[recurring_allocations](/tables/recurring_allocations.md) — templates that would
auto-populate a new budget's incomes on create. Same v1 budget-creation idea, same
fate: **never truly implemented**, replaced by [copy budget](/concepts/copy-budget.md).
See [recurring allocation](/concepts/recurring-allocation.md) for the shared rationale.

State today: **predates multi-tenancy** (no `household_id`), no model, **empty in
prod, no live code** — only a stale `household has_many :recurring_incomes`. Registered
in [dead schema](/tracking/dead-schema.md).

## Schema

| Column | Meaning |
|---|---|
| `id` | Primary key (`serial`). |
| `name` | Template name. |
| `amount` | Planned amount (integer minor units). |
| `frequency` | Default `"monthly"`. |
| `bank_account_id` | Intended account. |
| `created_at` / `updated_at` | Timestamps. |
