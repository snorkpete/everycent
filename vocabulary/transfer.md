# Transfer

## Definition

Paired transactions moving money between accounts or between allocations and sink fund allocations. Creates one withdrawal (from source) and one deposit (to destination).

## Context

Transfers are the mechanism for any money movement that isn't external income or spending — moving money between accounts, funding sink fund allocations, rebalancing between sink fund obligations.

Sink fund allocation transfers follow a singleton pattern — at most one transfer transaction per sink fund allocation, replaced entirely when recalculated rather than appended.

## Contract

- Creates exactly two transactions: one withdrawal, one deposit.
- Amount must be > 0, description required, transaction date within budget period.
- Supports: account-to-account, allocation-to-sink-fund-allocation, sink-fund-allocation-to-allocation.
