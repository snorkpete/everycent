# Task: Drop unused payee table and columns

**ID:** drop-unused-payee-table-and-columns
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-07
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The payees table and payee_id/payee_code columns are leftover from an abandoned classification design and confuse the data model. Remove the unused parts in a dedicated, destructive schema migration (its own commit). Keep transactions.payee_name — it is the target of task extract-payee-info-from-imports-and-backfill-historical-transactions.

DB analysis (2026-06-07, local db everycent_dev_8) confirmed safe to remove:
- payees table: 0 rows, no FK constraints reference it, no Payee model file exists (app/models/payee.rb absent), zero webclientv4 frontend references. Only code refs: dead `has_many :payees` in app/models/household.rb (model doesn't exist) and schema-annotation comments in transaction.rb / transaction_serializer.rb.
- transactions.payee_id: 0 populated across all households, no FK.
- transactions.payee_code: 1,297 rows ALL in TT household (879). These are per-transaction bank reference numbers, NOT payee identifiers (same merchant carries many different codes). TT is permanently out of scope.

OPEN DECISION (must resolve before implementing): whether to drop transactions.payee_code. Dropping is destructive (loses the 1,297 TT rows) but they are meaningless junk and out of scope. Kion to decide drop vs keep.

---

## Acceptance Criteria

- [ ] Migration drops the `payees` table (and its index)
- [ ] Migration drops `transactions.payee_id`
- [ ] Remove dead `has_many :payees` from app/models/household.rb
- [ ] Decision recorded on `transactions.payee_code` (drop vs keep); if drop, included in the migration
- [ ] `transactions.payee_name` retained untouched
- [ ] Schema annotations / comments referencing removed columns cleaned up
- [ ] Its own commit, separate from the payee-name backfill work

---

## Implementation Notes

_Remove if empty._
