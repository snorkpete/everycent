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

The `transactions.transaction_date` column allows NULL at both the database and model level. Three null-date records exist (IDs 30880, 44937, 233503 — all zero-amount placeholders), **not yet deleted** (deletion approved, on hold as of 2026-06-29 — see Verified findings). The column needs a presence validation and a NOT NULL DB constraint to prevent recurrence — but the NOT NULL migration can only run **after** those 3 rows are removed, or it will fail.

---

## Acceptance Criteria

- [ ] Add `validates :transaction_date, presence: true` to Transaction model
- [ ] Add migration: `change_column_null :transactions, :transaction_date, false`
- [ ] Ensure `update_with_params` handles validation failures safely — it `delete_all`s existing transactions then re-creates with `Transaction.create` (no bang). It **is** already wrapped in `ActiveRecord::Base.transaction` (line 76), but the wrapper is inert: `create` (no bang) never raises, so the block commits and the deleted-but-not-recreated row is lost with no rollback and no surfaced error. Fix = switch to `create!` (the existing wrapper then rolls back the whole batch on failure) **or** validate the batch before the `delete_all`

---

## Implementation Notes

**Creation paths that can produce null dates:**
1. `Transaction.update_with_params` (`transaction.rb:~89`) — the bulk save endpoint used by the Vue frontend. No date validation.
2. `ImportSaveService#create_transaction!` (`import_save_service.rb:~63`) — CAMT import. The classifier flags null dates as `"invalid_date"` so they shouldn't normally persist, but no hard constraint backs this up.

**Safe paths** (always set a date): transfers (`transfers.rb`), sink fund transfers (`sink_fund.rb`), credit card brought-forward (`credit_card.rb`).

**Key risk with `update_with_params`:** It `delete_all`s all transactions for the budget/bank_account (line 79), then re-creates them one-by-one with `Transaction.create` (soft fail, return value ignored). If a validation rejects one, that transaction is silently lost — deleted and never recreated, with no error surfaced to the client (the method returns the requeried set, which simply omits the dropped row). The block is **already** inside `ActiveRecord::Base.transaction` (line 76), so the fix is *not* "add a transaction wrapper" — it's to make the failure actually raise (`create!`, which the existing wrapper will then roll back) or to validate the whole batch before the `delete_all`.

---

## Verified findings (2026-06-29)

Confirmed against the dev DB (`everycent_dev_8`) while scoping the NLQ `transactions.budget_id` work:

- **Exactly 3 null-`transaction_date` rows exist globally** (no others): `30880` (hh 2, `"dummy"`), `44937` (hh 1, `"Blank"`), `233503` (hh 96, `""` — empty manual entry, `MAN-` bank_ref, status `unpaid`). All zero-amount. Only `233503` is in the real/active household (96); the other two are in throwaway test households.
- **No guard exists at any layer:** schema is `t.date "transaction_date"` (no `null: false`); `Transaction` has no presence validation. Confirmed nothing prevents a dateless save through any write path.
- **`update_with_params` silent-loss mechanism verified** (see Key risk above) — the DB-transaction wrapper is present but inert because `create` (no bang) never raises.
- **Coupling note:** the in-flight NLQ `transactions.budget_id` foundation adds a `before_save :assign_budget_id` callback. That callback is written to **never raise / never invalidate** the record precisely because of this silent-loss path. If this task later adds a `transaction_date` presence validation, re-check that the two don't interact badly on the `update_with_params` path (a blank-date row would then be silently dropped rather than saved-as-junk — arguably better, but still silent; surfacing the error is the real fix).
