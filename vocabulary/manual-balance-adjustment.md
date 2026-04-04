# Manual Balance Adjustment

## Definition

A corrective singleton transaction to reconcile the system's calculated balance with reality. At most one per bank account, replaced entirely when recalculated.

## Context

When the system's balance doesn't match the real-world balance (due to missed transactions, rounding, etc.), a manual adjustment creates a single transaction to correct the difference. The system clears any existing adjustment first, then calculates what the new adjustment transaction should look like to make recorded balance match user input.

## Contract

- Flagged with `is_manual_adjustment = true`.
- At most one per bank account at any time.
- System auto-calculates the adjustment amount (withdrawal or deposit) based on the difference between calculated and entered balance.
- `current_balance_without_manual_adjustment` is available to see the "natural" balance.
