# Transaction

## Definition

An individual money movement. Has a withdrawal or deposit amount (never both meaningfully), a date, and belongs to a bank account. Optionally links to an allocation OR a sink fund allocation (mutually exclusive, never both).

## Context

Transactions are the raw financial data — every cent that moves is a transaction. They can enter the system three ways:

1. **File import (CAMT)** — upload a bank statement file. Idempotent via transaction IDs from the bank file. Limitation: ABN AMRO doesn't make the file available until end of day, so there's a lag.
2. **Manual entry** — add rows directly in the transaction screen UI. Gets a randomly generated ID.
3. **Manual upload (copy-paste)** — copy transactions from the bank's customer portal, paste into a parser field that extracts the data. Also gets random IDs. This was the primary entry method for a long time.

The random IDs on methods 2 and 3 are critical because the transaction save process is destructive — wipe and replace for a bank account in a budget period. The IDs tell the system which transactions were manually added so they survive the wipe.

**Paid/unpaid** is specifically credit card machinery. It tracks whether a credit card purchase has been paid off. Unpaid transactions at budget close get "brought forward" to the next period. This is useful fiction for personal tracking — the credit card company doesn't actually track payments against specific charges.

## Contract

- Belongs to exactly one bank account.
- Links to either an allocation OR a sink fund allocation, or neither. Never both.
- `net_amount` = deposit_amount - withdrawal_amount.
- Status: `paid` or `unpaid`. Unpaid is primarily a credit card concept.
- `is_manual_adjustment` flag marks singleton corrective transactions for balance reconciliation.
- Transactions have a `bank_ref` (auto-generated or from import).
- `camt_imported` flag tracks file-imported transactions.
