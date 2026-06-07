# Task: Investigate origin of TT household payee_code data

**ID:** investigate-origin-of-tt-household-payee_code-data
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

transactions.payee_code is populated on 1,297 rows, ALL in the TT household (879), and nowhere else. It is NOT a payee identifier — the same merchant carries many different codes, so it behaves like a per-transaction bank reference number. TT is **deprioritized, not dead**: not relevant to current NL-focused work, but Kion may revisit TT data later with fresh eyes — so preserving meaningful data matters.

Before the cleanup task drops this column, understand what populated it. This likely means going back in git history to find the old TT import code path (search for payee_code assignments in importers, services, controllers, and historical migrations/commits) and understanding what the value represented in the source TT bank export.

Also treat this as a **stress-test of our historical-record archaeology** — a trial run of reconstructing original intent from git history for a case where the stakes are low, so we trust the method when stakes are high.

Hypothesis (Claude's): it is the TT bank's per-transaction reference — a TT analog of `bank_ref` — that was written into the wrong column. If so, the data has latent value and the right move is to MIGRATE it to `bank_ref`, then drop `payee_code`. If it is genuine junk, drop outright. Decision lens: because TT isn't dead, **preserve-then-drop wins if the value is a real reference**; drop outright only if it's confirmed junk.

---

## Acceptance Criteria

- [ ] Identify the code path / commit that populated transactions.payee_code for TT (git archaeology)
- [ ] Determine what the value represented in the source TT bank data
- [ ] Confirm it is per-transaction (not a stable payee identifier) and TT-only
- [ ] Recommend: drop outright vs migrate to bank_ref (or another field) then drop
- [ ] Decision recorded so drop-unused-payee-table-and-columns can proceed on payee_code

---

## Implementation Notes

_Remove if empty._
