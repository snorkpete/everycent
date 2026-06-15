# Task: Remove payee-backfill rake task and PayeeBackfill service after successful run

**ID:** remove-payee-backfill-rake-task-and-payeebackfill-service-after-successful-run
**Status:** raw
**Autonomous:** false
**Priority:** low
**Captured:** 2026-06-15
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

This is a **contingent cleanup task**. The payee backfill (the rake task plus the `PayeeBackfill` service) is a one-time historical operation to populate `transactions.payee_name` for NL household 96. It has no long-term purpose once run.

The reusable parts are **NOT** removed: `PayeeNameExtractor` and its per-format extractor classes, plus the going-forward transfer detection that runs at import time, all stay in place.

> ⚠️ **Contingency:** Do NOT execute this task until the user confirms the backfilled data is good. This is cleanup that only makes sense after the one-shot backfill has run and been accepted on production.

---

## Acceptance Criteria

- [ ] Backfill rake has been run against production hh96
- [ ] Resulting `payee_name` data reviewed and accepted by the user
- [ ] `lib/tasks/payee_backfill.rake` deleted
- [ ] `app/services/payee_backfill.rb` deleted
- [ ] Any backfill-only specs removed
- [ ] `PayeeNameExtractor` and forward-looking import-time payee/transfer logic retained (NOT removed)

---

## Implementation Notes

_Remove if empty._
