---
type: table
title: sink_fund_allocations
term: sink-fund-allocation
definition: "One obligation/envelope within a sink fund. Real balance is current_balance = Σ(deposit − withdrawal); persists across budget periods unlike regular allocations."
lexicon: true
description: >-
  Named money-storing envelopes inside a sink-fund bank account. The live balance
  is transaction-derived (current_balance); the amount/target field is near-vestigial
  (display-only, slated for removal).
resource: everycent:table:sink_fund_allocations
tags: [table, sink-fund, envelopes]
timestamp: 2026-06-17T00:00:00Z
---

# sink_fund_allocations

One named envelope inside a sink-fund [bank account](/tables/bank_accounts.md) —
clothing, car repair, vacation. Money parked for irregular/future expenses. See
[sink fund accounts](/concepts/sink-fund.md) for the account-level behavior.

`acts_as_tenant :household`; `belongs_to :bank_account`; `has_many :transactions`.

## Schema

| Column | Meaning |
|---|---|
| `id` | Primary key. |
| `name` | Envelope label. Required. |
| `bank_account_id` | The owning sink-fund account. |
| `amount` | **Near-vestigial.** The old target-driven figure. **Not the envelope balance** and not used in budgeting/accounting logic. Still displayed, and read by one UI "shortfall from target" calculation (`difference`), which is slated for removal. See note below. |
| `comment` | Free text. |
| `status` | `open` / `closed`. The account's `has_many` orders `status: desc, name: asc` (open first). Closed = retired envelope. Default `open`. |
| `household_id` | Tenant scope. |
| `created_at` / `updated_at` | Timestamps. |

## The balance is transaction-derived, not `amount`

This is the trap to avoid: **an envelope's actual balance is
`current_balance = Σ(deposit − withdrawal)` over its transactions** — *not* the
`amount` column.

- `amount` (and its alias `target` — `target`/`target=` are **methods aliasing
  `amount`, not a separate column**) is a leftover from an abandoned target-driven
  design. It is displayed but **not operative**.
- To answer "how much is in the car fund?", **compute from transactions**
  (`current_balance`). Never read `amount`.
- Dead/abandoned methods on the model: `target`, `target=`, `difference`
  (target − current_balance, the UI shortfall readout, to be removed), and `spent`
  / `remaining` (explicitly marked "part of the old user interface"). See
  [refactor candidates](/tracking/refactor-candidates.md) (R4).

`current_balance` / `spent` sum **in Ruby**, sharing the same N+1-in-SQL
workaround as `Allocation#spent` — one shared root cause. See
[bugs](/tracking/bugs.md) (B4).

## Membership

A transaction funded from an envelope carries `sink_fund_allocation_id` and **no
`allocation_id`** — outside the monthly budget. See
[budget membership](/concepts/budget-membership.md). Inter-envelope reassignment
(clothing → car) lives on the account's `SinkFund` concern and is still to be
confirmed — see [open questions](/tracking/open-questions.md) (Q7).
