# Task: Correct misdated transactions found in the Sep 2026 reconciliation

**ID:** correct-misdated-transactions-found-in-the-sep-2026-reconciliation
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-10-03
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

A CAMT-vs-Everycent reconciliation of the current period (2026-09-12) found three real data errors on the primary budget account. The corrective SQL was offered but NOT approved — the approach needs a decision before anything is applied, because it writes to a closed budget.

Errors found (details, including the specific rows and amounts, are in private session memory — project_next-up.md in the Claude project memory dir; keep them out of this tracked file):

1. Five hand-entered rows carry a transaction_date one day later than the bank's booking date, which puts them on the wrong side of the 25th period boundary — they sit in the current budget but belong to the prior (closed) one. Two of them are recurring monthly bills, so those allocations will be charged twice in the current period while the prior period shows them unspent.
2. One sink-fund transfer has the mirror problem: dated into the prior closed budget, but the bank booked it inside the current period.
3. The prior budget's closing_balance checkpoint on that account is wrong as a direct consequence of 1 and 2 — and because the two errors are near-equal and opposite, the account's displayed current_balance still matches the bank exactly. The balance is right for the wrong reasons.

Proposed fix (needs sign-off): re-date the misdated rows to their bank booking dates and reassign budget_id accordingly, correct a one-cent amount discrepancy, and recompute the prior budget's closing checkpoint.

IMPORTANT sequencing constraint: do not CAMT-import the affected prior-period day before fixing this. The misdated rows have MAN- refs, so the (bank_account_id, bank_ref) unique index will not dedup them and the import will create genuine duplicates.

Separately and unrelated to the fix: three recent days had simply not been imported yet, which accounted for the entire headline balance gap the investigation started from.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
