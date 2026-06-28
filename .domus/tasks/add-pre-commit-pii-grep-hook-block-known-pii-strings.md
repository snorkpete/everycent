# Task: Add pre-commit PII grep hook (block known-PII strings)

**ID:** add-pre-commit-pii-grep-hook-block-known-pii-strings
**Status:** deferred
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-21
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Structural backstop from the 2026-06 PII remediation. Add a pre-commit hook that greps staged changes against a known-PII string list and blocks the commit on a match. Catches the developer-brain leak class (real data pasted into fixtures/seeds) that the behavioural CLAUDE.md rule alone failed to prevent. The PII string list must live OUTSIDE the repo (gitignored/external file the hook reads), never committed.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
