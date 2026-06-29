# Task: Prevent transactions with blank transaction_date

**ID:** prevent-transactions-with-blank-transaction_date
**Status:** ready
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-04-22
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The `transactions.transaction_date` column allows NULL at both the database and model level. The 3 pre-existing null-date records (IDs 30880, 44937, 233503 — all zero-amount, unlinked placeholders) were **deleted from prod 2026-06-29** (see Verified findings), so the data pre-req for the NOT NULL migration is now CLEAR. The column still needs a presence validation and a NOT NULL DB constraint to prevent recurrence.

**Ready, human-in-loop (not autonomous).** The fix is fully specced below (Design
decision, locked). It's coupled to the in-flight NLQ `transactions.budget_id` work via
the `update_with_params` path, but that's resolved-by-ordering, not blocking — see the
Coupling note. If dispatched before the budget_id branch merges, re-confirm `create!`
doesn't trip the `assign_budget_id` callback.

---

## Acceptance Criteria

- [ ] Add `validates :transaction_date, presence: true` to `Transaction`
- [ ] Add migration `change_column_null :transactions, :transaction_date, false`
      (prod data already cleaned 2026-06-29 — see Prod verification; no backfill needed)
- [ ] `transaction.rb:85`: `Transaction.create(...)` → `Transaction.create!(...)` so the
      EXISTING `ActiveRecord::Base.transaction` wrapper (line 76) rolls back the whole
      batch on failure instead of silently dropping the row
- [ ] `transactions_controller.rb`: add `rescue ActiveRecord::RecordInvalid => e` →
      render 422 to BOTH actions that call it (`create` line 75, `update_all` line 80) —
      mirror the existing `import_save`/`import_preview` rescue pattern (lines 54–55)
- [ ] rspec: model presence spec; `update_with_params` spec proving an invalid row rolls
      back the entire batch (nothing deleted-and-lost); controller spec for the 422 path
- [ ] `bundle exec rspec` green; no `package-lock.json` / unrelated churn

---

## Implementation Notes

**Creation paths that can produce null dates:**
1. `Transaction.update_with_params` (`transaction.rb:~89`) — the bulk save endpoint used by the Vue frontend. No date validation.
2. `ImportSaveService#create_transaction!` (`import_save_service.rb:~63`) — CAMT import. The classifier flags null dates as `"invalid_date"` so they shouldn't normally persist, but no hard constraint backs this up.

**Safe paths** (always set a date): transfers (`transfers.rb`), sink fund transfers (`sink_fund.rb`), credit card brought-forward (`credit_card.rb`).

**Key risk with `update_with_params`:** It `delete_all`s all transactions for the budget/bank_account (line 79), then re-creates them one-by-one with `Transaction.create` (soft fail, return value ignored). If a validation rejects one, that transaction is silently lost — deleted and never recreated, with no error surfaced to the client (the method returns the requeried set, which simply omits the dropped row). The block is **already** inside `ActiveRecord::Base.transaction` (line 76), so the fix is *not* "add a transaction wrapper" — it's to make the failure actually raise (`create!`, which the existing wrapper will then roll back) or to validate the whole batch before the `delete_all`.

## Design decision (locked 2026-06-29) — `create!` + controller rescue

Chose **`create!` + controller rescue** over validate-batch-before-delete because it (a)
reuses the already-present-but-inert `transaction` wrapper (minimal change), and (b)
matches the existing error pattern in the SAME controller (`import_*` rescue → 422).

**Resulting behaviour change (intended):** previously a bad row was silently dropped and
the rest saved; now an invalid row rolls back the WHOLE bulk save and returns **422**.
That's correct (no silent data loss) and atomic-by-design for a delete-all+recreate
replace. Edge-case only — blank date is now also blocked at the source by the presence
validation, so this path should rarely fire.
- **Vue follow-up (out of scope, note it):** the create/update_all callers on the Vue
  side should surface the new 422 gracefully. Low risk (blank-date is the only new
  rejection and it's prevented upstream), but flag it so it isn't a silent failure on
  the client.

**NLQ `budget_id` coupling — resolved, not a blocker.** The in-flight `before_save
:assign_budget_id` runs AFTER validations, so a blank-date row now fails validation and
raises before that callback runs — no bad interaction. Once budget_id lands, the callback
derives the budget from `transaction_date`, which this task guarantees is present, so the
two are complementary. No hard `depends-on` set (per Kion 2026-06-29: budget_id work is
about to merge); if dispatched before it merges, just re-confirm `create!` doesn't trip
the callback.

---

## Verified findings (2026-06-29)

Confirmed against the dev DB (`everycent_dev_8`) while scoping the NLQ `transactions.budget_id` work:

- **Exactly 3 null-`transaction_date` rows exist globally** (no others): `30880` (hh 2, `"dummy"`), `44937` (hh 1, `"Blank"`), `233503` (hh 96, `""` — empty manual entry, `MAN-` bank_ref, status `unpaid`). All zero-amount. Only `233503` is in the real/active household (96); the other two are in throwaway test households.
- **No guard exists at any layer:** schema is `t.date "transaction_date"` (no `null: false`); `Transaction` has no presence validation. Confirmed nothing prevents a dateless save through any write path.
- **`update_with_params` silent-loss mechanism verified** (see Key risk above) — the DB-transaction wrapper is present but inert because `create` (no bang) never raises.
- **Coupling note:** the in-flight NLQ `transactions.budget_id` foundation adds a `before_save :assign_budget_id` callback. That callback is written to **never raise / never invalidate** the record precisely because of this silent-loss path. If this task later adds a `transaction_date` presence validation, re-check that the two don't interact badly on the `update_with_params` path (a blank-date row would then be silently dropped rather than saved-as-junk — arguably better, but still silent; surfacing the error is the real fix).

## Prod verification + cleanup (2026-06-29)

Re-verified directly against **prod** (not just dev) this session:
- Exactly **3** null-`transaction_date` rows, matching the dev findings: `44937` (hh 1, test, paid, 2019), `30880` (hh 2, test, paid, 2019), `233503` (hh 96 live, unpaid, blank desc, `MAN-` ref, 2026-04-14). All `withdrawal_amount = 0`, `deposit_amount = 0`, `allocation_id` NULL — genuinely empty, unlinked.
- Confirmed `transactions.budget_id` does NOT exist in prod yet → the NLQ `budget_id` foundation hasn't landed (coupling handled by ordering — see Design decision, not a blocker).
- **Deleted all 3 from prod** (guarded `DELETE`: id-match + still-null-date + zero-amount + null allocation). 0 null-date rows remain. The NOT NULL migration's data blocker is now clear.

**Remaining work (now spec'd, task is READY):** add the presence validation, the
`change_column_null` migration, and the `create!` + controller-rescue error-surfacing
fix — all detailed in Acceptance Criteria + Design decision above.
