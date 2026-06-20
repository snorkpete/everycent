---
type: table
title: transactions
term: transaction
definition: "Individual money movement with a withdrawal or deposit amount; belongs to a bank account, optionally links an allocation OR a sink-fund allocation (mutually exclusive)."
lexicon: true
description: >-
  One bank transaction — actual money movement synced from real bank data. Where
  plan (allocations) meets reality. Budget membership is by date range, not a
  stored FK. allocation_id presence marks budget membership.
resource: everycent:table:transactions
tags: [table, core, actuals, banking]
timestamp: 2026-06-17T00:00:00Z
---

# transactions

One bank transaction — actual money movement, synced from real bank data. This is
where the **plan** (allocations) meets **reality**; it is the atomic unit
[`Allocation#spent`](/tables/allocations.md) sums over, and the most connected
table in the schema.

`acts_as_tenant :household`.

## Schema

| Column | Meaning |
|---|---|
| `id` | Primary key. |
| `description` | Free text from the bank. Source for `payee_name` derivation at create. |
| `bank_account_id` | Which account it hit. Required (`belongs_to :bank_account`). |
| `transaction_date` | Value date. **The budget-membership mechanism** — see below. |
| `withdrawal_amount` / `deposit_amount` | Integer [minor units](/concepts/money-units.md), default 0. Normally one or the other. Two sign frames exist (by design): `net_amount = deposit − withdrawal` (bank-account view, positive = balance up); `Allocation#spent = withdrawal − deposit` (allocation view, positive = money spent). `withdrawal?` treats **0 as a withdrawal** (`net_amount <= 0`). |
| `bank_ref` | Bank reference; import dedup key via unique `[bank_account_id, bank_ref]`. Manual rows get a generated `MAN-<hex>` ref. |
| `allocation_id` | → allocation. `optional`. **Presence = budget membership** — see [budget membership](/concepts/budget-membership.md). |
| `sink_fund_allocation_id` | → sink-fund allocation. `optional`. Independent axis. A transaction has `allocation_id` **xor** `sink_fund_allocation_id` **xor** neither — never both (see budget-membership concept). |
| `status` | `paid` / `unpaid`. **Credit-card settlement state only**: a CC withdrawal defaults to `unpaid`, everything else to `paid`. `unpaid` = a CC charge not yet covered by a payment. |
| `brought_forward_status` | Tags synthetic carry-forward rows. Values: `brought_forward` (copied originals), `added` (the copies), `adjustment` (the balancing entry). See [brought-forward](/concepts/brought-forward.md). |
| `is_manual_adjustment` | Marks the single balance-reconciliation row. See [manual balance adjustment](/concepts/manual-balance-adjustment.md). Default false. |
| `camt_imported` | Provenance flag: true if the row came via the CAMT backend importer (definitive IDs) vs. manual/copy-paste. Mostly UI-informational. See [transaction import](/concepts/transaction-import.md). |
| `payee_id` | **DEAD (D6)** — the abandoned normalized `payees` table. |
| `payee_code` | **DEAD-but-quarantined (D-Trinidad)** — Trinidad-era artifact; held for possible salvage before deletion. Unused in NL. |
| `payee_name` | **LIVE, forward-looking.** Populated at create from `description` via `PayeeNameResolver` (unless provided). Intended to feed the NLQ embedding layer (semantic queries over transaction detail incl. payee, with historical reach). |
| `household_id` | Tenant scope. |
| `created_at` / `updated_at` | Timestamps. |

## Budget membership = date range

A transaction belongs to a budget if its `transaction_date` falls within that
budget's `start_date .. end_date` for the account (`for_budget_and_bank`). **There
is no `budget_id` column.** Border-date transactions sometimes need date nudging
to land in the right period — replacing this with an explicit `budget_id` is an
[open question](/tracking/open-questions.md) (Q6).

## "Update" = destroy-and-replace

`update_with_params` **deletes all** transactions for a budget+account window and
**recreates** them from the posted set, inside a DB transaction. This is safe
**only because the UI always posts the complete current set** (manual rows
included); it supports the real-time-totals editing model. An agent writing this
path must send the whole window, never a partial. `delete_all` skips callbacks.

## Settlement & carry-forward

`status` (paid/unpaid) tracks CC charge settlement; one card payment typically
clears many charges. Unpaid charges can be **carried forward** into the next
budget when the CC billing cycle doesn't align with the budget period — including
**indefinitely** (carrying the same charge across multiple periods is intended,
if rare). Full mechanics: [brought-forward](/concepts/brought-forward.md).
