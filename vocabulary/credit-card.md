# Credit Card

## Definition

A bank account subclass (account_type `credit_card`) with statement cycle tracking and paid/unpaid transaction management. Transactions default to unpaid. Unpaid transactions at budget close are brought forward to the next period.

## Context

Credit cards have their own billing cycle logic — statement day, payment due day — which is independent of the budget period. The system calculates statement period start/end and payment due dates from these fields.

The paid/unpaid mechanism is a personal planning tool, not a mirror of how the credit card company works. It helps answer "which charges do I intend to clear this month?" See also: brought forward.

## Contract

- Account type: `credit_card`. Category: `liability`. `is_cash`: true.
- Extra fields: `statement_day`, `payment_due_day`.
- Transactions default to `unpaid` status.
- Budget close triggers brought-forward for unpaid transactions.
- Statement period is calculated from statement_day.
