# Task: Prevent transactions with blank transaction_date

**ID:** prevent-transactions-with-blank-transaction_date
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-04-22
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The `transactions.transaction_date` column allows NULL at both the database and model level. Three null-date records were found and deleted (IDs 30880, 44937, 233503 — all zero-amount placeholders). The column needs a presence validation and a NOT NULL DB constraint to prevent recurrence.

---

## Acceptance Criteria

- [ ] Add `validates :transaction_date, presence: true` to Transaction model
- [ ] Add migration: `change_column_null :transactions, :transaction_date, false`
- [ ] Ensure `update_with_params` handles validation failures safely — currently it `delete_all`s existing transactions then re-creates with `Transaction.create` (no bang, no DB transaction wrapping), so a validation failure would silently lose a record

---

## Implementation Notes

**Creation paths that can produce null dates:**
1. `Transaction.update_with_params` (`transaction.rb:~89`) — the bulk save endpoint used by the Vue frontend. No date validation.
2. `ImportSaveService#create_transaction!` (`import_save_service.rb:~63`) — CAMT import. The classifier flags null dates as `"invalid_date"` so they shouldn't normally persist, but no hard constraint backs this up.

**Safe paths** (always set a date): transfers (`transfers.rb`), sink fund transfers (`sink_fund.rb`), credit card brought-forward (`credit_card.rb`).

**Key risk with `update_with_params`:** It deletes all transactions for the budget/bank_account on line 82, then re-creates them one-by-one with `Transaction.create` (soft fail). If a validation rejects one, that transaction is silently lost. This needs to be wrapped in a DB transaction with `create!`, or the batch needs to be validated before the delete.
