# Bank Account

## Definition

The universal value-tracking primitive. Any container that holds or represents monetary value — bank accounts, investment accounts, physical assets (houses, cars), credit cards, loans. Has an account type, category (asset/liability), and tracks opening/closing/current balances.

## Context

**Overloaded term.** The name "bank account" comes from the most common case, but it's actually much broader. In everycent, a house is a bank account whose current balance is the estimated sell value (intentionally undervalued). A car is a bank account where transactions represent depreciation. An investment portfolio is a bank account. The unifying concept is "something with a monetary value that changes over time."

**Single-table subclasses.** Technically modeled as one table with an `account_type` discriminator (`normal`, `credit_card`, `sink_fund`). Each "subclass" has columns that only apply to it — credit cards get `statement_day`, `payment_due_day`; sink funds get the sink fund allocation relationship. Non-applicable columns are null/ignored. Not Rails STI — just extra columns on the same table.

**Account category** (`asset`/`liability`) and **is_cash** (boolean) together determine how the account appears on the account balances dashboard: cash assets, non-cash assets, credit cards (cash liabilities), loans (non-cash liabilities).

## Contract

- Account types: `normal`, `credit_card`, `sink_fund`.
- Account categories: `asset`, `liability`.
- Status: `open` or `closed` (default open).
- `current_balance` = closing_balance + net transactions since closing date.
- `expected_closing_balance` = same but bounded by next closing date.
- Belongs to an institution.
- Contains transactions.
- Balance is snapshotted (closing_balance updated) when a budget is closed.

## Gotchas

- Because close snapshots the balance, historical budget views show incorrect balances for any period except the current one. Known limitation, never fixed.
