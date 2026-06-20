---
type: table
title: households
term: household
definition: "Tenancy boundary. Everything belongs to exactly one household; full isolation, no cross-household actions."
lexicon: true
description: >-
  The tenant root and isolation boundary. Almost every live table is scoped to a
  household via a direct household_id foreign key.
resource: everycent:table:households
tags: [table, tenancy, core]
timestamp: 2026-06-17T00:00:00Z
---

# households

The **tenant root** of EveryCent and the **isolation boundary** the entire app
is scoped by. Structurally thin (just `name` + timestamps), but semantically
central: it is the unit of multi-tenancy.

In practice the app is multi-tenant, scoped per household. Multi-tenancy was added
later (the app was originally single-tenant), which explains why some older
tables are not household-scoped — see [Trinidad banking
model](/legacy/trinidad-banking-model.md).

## Schema

| Column | Meaning |
|---|---|
| `id` | Primary key. |
| `name` | Human label for the household. |
| `created_at` / `updated_at` | Timestamps. |

## The tenancy boundary

**Every live table is scoped to a household.** Almost all do so via a direct
`household_id` foreign key (declared `on_update: :cascade`). Models enforce this
with `acts_as_tenant :household`.

**One exception: `sessions`.** It has no `household_id`. It scopes *transitively*
through `user_id` → `users.household_id`. An agent querying sessions per
household must **join through `users`**; it cannot filter `sessions` by
`household_id` directly. Whether this stays transitive is an
[open question](/tracking/open-questions.md) pending the auth migration.

**Tables that are NOT scoped at all** (`payees`, `recurring_allocations`,
`recurring_incomes`) are **abandoned**, not a tenancy gap — they predate
multi-tenancy and hold no live data. See [dead schema](/tracking/dead-schema.md)
and [Trinidad banking model](/legacy/trinidad-banking-model.md).

## Relationships

Parent to nearly everything: budgets, incomes, allocations, allocation
categories, bank accounts, transactions, institutions, settings, users,
special events, and the AI/chat tables all carry `household_id`.
