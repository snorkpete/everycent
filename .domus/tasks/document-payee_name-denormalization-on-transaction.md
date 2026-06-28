# Task: Document payee_name denormalization on Transaction

**ID:** document-payee_name-denormalization-on-transaction
**Status:** done
**Autonomous:** false
**Priority:** high
**Captured:** 2026-06-06
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Transaction has payee_id/payee_code/payee_name columns and a payees table exists, but there's no Payee Rails model and no payee_name write-path in current app code (only 2015/2018 migrations). Investigate how payee_name is actually populated (importer? legacy/Angular? DB-level?), then document why it exists, what it's for, and why it drifts from payees.name (likely a name snapshot at write time). Confirm the mechanism before writing — do not infer.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
