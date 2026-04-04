# Close (Budget)

## Definition

End-of-period process. Snapshots bank account balances, brings forward unpaid credit card transactions, sets budget status to closed. Reversible by reopening the most recently closed budget.

## Context

**Started as optimization.** Originally a purely technical optimization — snapshot the bank balance at close so that calculating current balance doesn't require summing all transactions from the beginning of time. Just sum from the last close.

**Grew into a functional step.** Later became user-relevant because it triggers the credit card brought-forward process.

**Side effect on historical views.** Because balance is snapshotted at close, the transaction screen shows incorrect balances for any budget period except the current one. Known for 12+ years, never painful enough to fix.

## Contract

- Closing updates all bank account balances (closing_balance, closing_date) for the period.
- Triggers brought-forward for unpaid credit card transactions.
- Sets status to `closed`.
- Closed budgets should not accept allocation changes (enforcement uncertain). Transaction edits may still be allowed.
- Only the most recently closed budget can be reopened (`reopen_last_budget`).
