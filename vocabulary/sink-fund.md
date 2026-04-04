# Sink Fund

## Definition

A bank account (type `sink_fund`) subdivided into named obligations or goals. Not a separate model — it's a bank account with the sink fund concern mixed in.

## Context

Sink funds represent money set aside for specific future expenses or goals (e.g., car maintenance, vacation, emergency fund). The key difference from regular accounts is the subdivision — the total balance is split across named sink fund allocations, each tracking progress toward its own target.

## Contract

- Is a bank account with `account_type = 'sink_fund'`.
- Contains sink fund allocations (one-to-many).
- `total_assigned_balance` = sum of current_balance across all sink fund allocations.
- `unassigned_balance` = sink fund's current_balance minus total_assigned_balance.
- Supports transfers between its allocations (moving money from one obligation to another).
