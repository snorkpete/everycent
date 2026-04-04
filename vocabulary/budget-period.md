# Budget Period

## Definition

The month-long window a budget covers (start_date to end_date). Most time-scoped logic — transactions, balances, closing — is relative to a budget period.

## Context

Budget periods are always calendar months. The budget auto-names itself from the date range. Nearly all system operations are bounded by the current budget period — viewing transactions, calculating balances, determining what gets brought forward.

## Contract

- Always one calendar month.
- Defined by budget's start_date and end_date.
- Transactions, balance calculations, and close operations are all scoped to a budget period.
