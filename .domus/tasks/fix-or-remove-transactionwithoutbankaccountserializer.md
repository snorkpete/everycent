# Task: Fix or remove TransactionWithoutBankAccountSerializer

**ID:** fix-or-remove-transactionwithoutbankaccountserializer
**Status:** done
**Autonomous:** true
**Priority:** low
**Captured:** 2026-04-10
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

`TransactionWithoutBankAccountSerializer` is dead code since March 2018 (commit `09b19e0`). It also has a copy-paste `type 'bank_account'` bug from a 2021 Rails 6 upgrade. Thoroughly investigated — zero references anywhere (direct, convention-based, string-based, or via AMS association resolution). Safe to delete.

---

## Acceptance Criteria

- [x] `app/serializers/transaction_without_bank_account_serializer.rb` deleted
- [x] No remaining references to `TransactionWithoutBankAccountSerializer` in the codebase
- [x] `bundle exec rspec` passes
- [x] Pre-commit checks pass

---

## Implementation Notes

### Files to change
- `app/serializers/transaction_without_bank_account_serializer.rb` — delete

### Investigation summary (already completed)
- Zero direct references (grep across all Ruby, specs, config)
- No model/scope/decorator for convention-based AMS resolution
- No string-based or dynamic constantize references
- No `has_many`/`has_one` in other serializers referencing it
- Controller always uses `TransactionSerializer` — the `no_bank_account` param only controls eager loading, not serializer selection
- Dead since March 2018, created Dec 2017

### Risks
- None. 8+ years of dead code.

### Commit scope
- Single commit
