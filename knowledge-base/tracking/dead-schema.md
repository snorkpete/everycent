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
| — | `payees`, `recurring_allocations`, `recurring_incomes` | Tables | Abandoned v1 ideas, Trinidad-era but separate from the banking model. Predate multi-tenancy (no `household_id`). Empty in prod, no live code. Solved differently: [recurring_allocations](/tables/recurring_allocations.md)/[recurring_incomes](/tables/recurring_incomes.md) → [copy budget](/concepts/copy-budget.md); [payees](/tables/payees.md) → [auto-allocation](/concepts/auto-allocation.md). |
| D1 | `incomes.bank_account_id` | Column | Trinidad vestige. See [incomes](/tables/incomes.md). |
| D2 | `allocations.is_standing_order` | Column | Trinidad vestige (standing orders). |
| D3 | `allocations.bank_account_id` | Column | Trinidad vestige. The `clear_bank_account_if_not_standing_order` callback now always nulls it. |
| D4 | `allocations.allocation_type` | Column | Dead. Referenced nowhere in the `Allocation` model. Purpose no longer known. |
| D5 | `allocation_categories.percentage` | Column | Dead percentage-tracking attempt; stopped being used in the Trinidad era. Related to the unmodeled 50/30/20 target — see [allocations](/tables/allocations.md). |
| D6 | `transactions.payee_id` | Column | Points at the abandoned normalized `payees` table. See [transactions](/tables/transactions.md). |
| D7 | `bank_accounts.user_id` | Column | Model TODO marks it "not used anymore." See [bank_accounts](/tables/bank_accounts.md). |
| D8 | `bank_accounts.allow_default_allocations`, `bank_accounts.default_sub_account_amount` | Columns | Trinidad / sub-account vestiges. See [bank_accounts](/tables/bank_accounts.md). |
| D9 | `bank_accounts.account_type_description` | Column | Dead. See [bank_accounts](/tables/bank_accounts.md). |
| D10 | `settings.bank_charges_allocation_name` | Column | Trinidad-era auto-categorization of bank-charge transactions by description; dead (possibly never fully built). See [settings](/tables/settings.md), [Trinidad banking model](/legacy/trinidad-banking-model.md). |

See [allocations](/tables/allocations.md) for context on D2–D5.

## Quarantined (held for possible salvage)

Distinct from plain dead schema: this is **not** an auto-recommend-to-drop item —
it is held for possible salvage before any deletion.

| ID | Item | Kind | Notes |
|---|---|---|---|
| D-Trinidad | `transactions.payee_code` | Column | Trinidad artifact with data: ~1,297 rows, **TT household only** (suspected per-transaction bank refs in the wrong column, not payee IDs). Held for salvage pending analysis of old Trinidad data — this blocks dropping the `payees` table. Do **not** auto-recommend dropping. See [transactions](/tables/transactions.md). |
