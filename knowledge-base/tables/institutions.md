---
type: table
title: institutions
term: institution
definition: "Bank or financial entity that issues bank accounts. A simple reference/lookup entity."
lexicon: true
description: >-
  Household-scoped lookup of financial institutions (e.g. a retail bank).
  Informational; bank accounts optionally reference one. Nothing keys off it
  functionally.
resource: everycent:table:institutions
tags: [table, lookup, informational]
timestamp: 2026-06-17T00:00:00Z
---

# institutions

A household-scoped lookup of financial institutions (e.g. a retail bank). Purely
**informational** — it records which institution a [bank
account](/tables/bank_accounts.md) is from. No functional behavior keys off it.

`acts_as_tenant :household`. `name` is required and **unique per household**
(case-insensitive) — same pattern as [allocation_categories](/tables/allocation_categories.md).
`bank_account belongs_to :institution, optional`, so an account need not have one.

## Schema

| Column | Meaning |
|---|---|
| `id` | Primary key. |
| `name` | Institution name. Required, unique per household (case-insensitive). |
| `household_id` | Tenant scope. |
| `created_at` / `updated_at` | Timestamps. |

(The model's `fix_name` callback is a dead commented-out no-op, as on several
other models.)
