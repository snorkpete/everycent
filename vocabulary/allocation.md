# Allocation

## Definition

A budget line item — the core unit of zero-based budgeting. Has an amount, belongs to an allocation category, and optionally links to a bank account and special event. Tracks spent (sum of linked transactions) and remaining (amount minus spent).

## Context

Allocations are where the budgeting actually happens. Each allocation represents a planned expense or income category for a specific budget period. The zero-based philosophy is that every cent gets allocated somewhere.

**Identity is name-based, not relational.** Two allocations with the same name in different budgets are considered the "same" allocation logically, but there's no foreign key linking them. The future budgets screen enforces name consistency by design — since most editing happens there, names stay stable across budgets. But rename an allocation and the chain breaks silently. Whether this implicit identity needs to become explicit in the data model is an open question.

**Allocation lifecycle.** Allocations are ephemeral per budget period — they don't technically persist across budgets. New ones are created via copy budget or through the future budgets screen. The 0 = delete / 0.01 = keep-alive behavior on future budgets is how seasonal allocations survive across months.

**Flags.** `is_standing_order` (dead feature), `is_fixed_amount` (don't vary during mass-update), `is_cumulative` (weekly budget feature, partially implemented).

## Contract

- Belongs to exactly one budget and one allocation category.
- Optionally links to a bank account and/or a special event (but not a sink fund allocation — that's a separate link on the transaction).
- `spent` = sum of (withdrawal_amount - deposit_amount) across linked transactions. Always a positive number for actual spending.
- `remaining` = amount - spent.
- Setting amount to 0 on the future budgets screen signals deletion.
- Closed budgets should not accept allocation changes (enforcement uncertain).
