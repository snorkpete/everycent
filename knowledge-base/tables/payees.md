---
type: table
title: payees
term: payee
definition: "Dead table. The v1 idea for easy transaction tagging — a payee list whose default_allocation_name let a description resolve to an allocation. Never stuck; replaced by description-based auto-allocation."
lexicon: true
status: dead
description: >-
  Abandoned v1 payee list (Trinidad-era). Each payee had a default allocation so a
  transaction could be tagged by resolving its description to a payee. Never built
  out; empty in prod, no model, no household_id. Replaced by auto-allocation.
resource: everycent:table:payees
tags: [table, dead, deprecated]
timestamp: 2026-06-21T00:00:00Z
---

# payees

**Dead table.** It was the v1 answer to *"how do we tag transactions to the right
allocation easily?"* — a list of payees, each with a `default_allocation_name`, so a
transaction's `description` could resolve to a **payee**, which pointed at a default
allocation. It happened in the **Trinidad** timeframe but was a concern of its own
(transaction tagging), not part of the [Trinidad banking
model](/legacy/trinidad-banking-model.md) — it would have applied to the NL household
too. It was never built out and didn't stick.

The replacement carries no payee entity: [auto-allocation](/concepts/auto-allocation.md)
matches a description against the **previous budget's** allocated transactions
directly. See that concept for the live mechanism and the fuller history.

State today: **predates multi-tenancy** (no `household_id`), `Payee` model removed
(2018), **empty in prod, no live code** reads or writes it — only a stale
`household has_many :payees`. Registered in [dead schema](/tracking/dead-schema.md).

## Schema

| Column | Meaning |
|---|---|
| `id` | Primary key (`serial`). |
| `code` | Lookup code (indexed); renamed from `bank_ref` in v1. |
| `name` | Payee name. |
| `status` | Payee status (v1; values no longer known). |
| `default_allocation_name` | The allocation a transaction for this payee would default to — the heart of the tagging idea. |
| `created_at` / `updated_at` | Timestamps. |

## Related dead columns on `transactions`

- `payee_id` (**D6**) — FK at the abandoned normalized payee. Dead.
- `payee_code` (**D-Trinidad**) — quarantined; **TT-household-only data** (~1,297
  rows, suspected per-transaction bank refs in the wrong column). Held for salvage
  pending analysis of old Trinidad data — do **not** auto-recommend dropping.
- `payee_name` — **not dead.** The empty v1 column, **repurposed** for the NLQ
  embedding layer. See [payee-name](/concepts/payee-name.md).
