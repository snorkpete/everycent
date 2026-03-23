# Task: DB migration: bank_ref index and camt_imported flag

**ID:** db-migration-external_transaction_id-and-is_manual
**Status:** done
**Branch:** task/db-migration-external_transaction_id-and-is_manual
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-22
**Parent:** camt053-bank-statement-import
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Prepare the transactions table for CAMT.053 imports. Reuse the existing `bank_ref` column (string, already plumbed through model/serializer/controller/types — currently unpopulated) as the external transaction ID. Add a unique composite index for dedup lookups. Add `camt_imported` boolean to distinguish CAMT-imported transactions from manual/copy-paste ones. Add a `before_create` callback to auto-populate `bank_ref` with a generated ID for non-CAMT transactions.

### Key discovery during refinement

- `bank_ref` already exists on transactions (since 2015), is in the serializer, permitted params, and TypeScript types. Zero rows have it populated. No code reads/writes it meaningfully. Perfect fit for the external transaction ID — no new column needed.
- `is_manual_adjustment` already exists but is a different concept (auto-generated balance reconciliation entries). The new flag is `camt_imported` to avoid confusion with both `is_manual_adjustment` and the existing "imported" terminology (which historically means copy-paste from the bank UI).

---

## Acceptance Criteria

- [ ] Migration adds unique composite index on `[bank_account_id, bank_ref]`
- [ ] Migration adds `camt_imported` boolean column, default `false`
- [ ] `before_create` callback on Transaction model assigns `MAN-{SecureRandom.hex(8)}` to `bank_ref` when blank (same guard pattern as `check_status`)
- [ ] Existing transactions are unaffected (NULL `bank_ref` stays NULL, `camt_imported` defaults to `false`)
- [ ] Factory updated — `bank_ref` must generate unique values per instance (e.g. `bank_ref { "TEST-#{SecureRandom.hex(8)}" }`) to avoid unique index violations in tests
- [ ] Specs cover the `before_create` callback: blank → gets `MAN-` prefix; pre-set value → left alone

## Scope Boundaries

- Does NOT backfill `bank_ref` on existing transactions (NULLs are harmless — Postgres unique indexes allow multiple NULLs)
- Does NOT populate `account_no` (IBAN) on bank accounts — that's a manual/separate step before first CAMT import
- Does NOT add any CAMT parsing or import logic — just prepares the schema

---

## Implementation Notes

- **`before_create` is correct here, not `before_save`.** `Transaction.update_with_params` (line 73-100 in `transaction.rb`) does `delete_all` + `create` on every save. So every transaction goes through `create` on every save cycle. The `bank_ref` round-trips: server → serializer → frontend → permitted params → create. Same pattern as `check_status`.
- `bank_ref` is already in: model schema comment, serializer (`transaction_serializer.rb`, `transaction_without_bank_account_serializer.rb`), permitted params (`transactions_controller.rb`), TypeScript types (`transaction.types.ts`), factory (`transactions.rb`). No new plumbing needed.
- The unique index on `[bank_account_id, bank_ref]` can be relaxed to non-unique later if needed (drop + re-add, no table rebuild). Table is ~29K rows — standard migration, no need for concurrent index creation.
- CAMT imports will set `bank_ref` to `AcctSvcrRef` and `camt_imported` to `true`
- Copy-paste imports and manual transactions get `MAN-{hex}` via callback and `camt_imported` stays `false`
- Single commit: migration + model callback + factory fix + specs
