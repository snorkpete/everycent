# Sink Fund Allocation

## Definition

One obligation or goal within a sink fund. Has a target amount, tracks current balance, spent, and remaining. Persistent across budget periods — unlike regular allocations which are ephemeral per budget.

## Context

Sink fund allocations are the long-lived savings goals. Where a regular allocation asks "how much should I spend on groceries this month?", a sink fund allocation asks "how much have I saved toward my car repair fund overall?"

Transfers between sink fund allocations use a singleton transaction pattern — at most one transfer transaction per allocation, replaced entirely when recalculated.

## Contract

- Belongs to a sink fund (bank account).
- Has a target (goal amount) and tracks `current_balance` (sum of deposits - withdrawals).
- `spent` = sum of (withdrawal - deposit) across linked transactions.
- `remaining` = amount - spent.
- `difference` = target - current_balance.
- Status: `open` or `closed`.
- Transactions can link to a sink fund allocation instead of a regular allocation (mutually exclusive).
