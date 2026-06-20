---
type: concept
title: Manual balance adjustment
term: manual-balance-adjustment
definition: "Singleton corrective transaction reconciling the calculated balance with reality; at most one per bank account, replaced entirely when recalculated."
lexicon: true
description: >-
  A reconciliation trick: a single self-updating, self-deleting transaction per
  account that forces EveryCent's balance to match the real bank balance. Current
  period / last budget only.
tags: [domain, banking, reconciliation, transactions]
timestamp: 2026-06-17T00:00:00Z
---

# Manual balance adjustment

A reconciliation mechanism (the `ManualBalanceAdjustments` concern on
[bank accounts](/tables/bank_accounts.md)) for when EveryCent's computed balance
can't be made to match the real bank balance.

## How it works

`manually_adjust_balance(new_balance)`:

1. Compute `diff = new_balance − current_balance_without_manual_adjustment`
   (the balance excluding any existing adjustment row).
2. Find the **single** existing `is_manual_adjustment: true` transaction, or build
   one dated `closing_date + 1`.
3. Set its withdrawal (if `diff < 0`) or deposit (if `diff > 0`) to force the
   balance to `new_balance`.
4. If the resulting net is **zero, destroy the row**; otherwise save.

## Invariants

- **At most one** manual-adjustment transaction per account — re-adjusting
  updates that same row rather than adding more.
- It is self-deleting: when no adjustment is needed (net 0), the row is removed.
- Scoped to the **current period only** (`transaction_date > closing_date`),
  i.e. the last/open budget — consistent with not editing closed periods.
- Marked by [`transactions.is_manual_adjustment`](/tables/transactions.md); the
  balance helper `current_balance_without_manual_adjustment` deliberately excludes
  it to avoid feedback when recomputing the diff.
