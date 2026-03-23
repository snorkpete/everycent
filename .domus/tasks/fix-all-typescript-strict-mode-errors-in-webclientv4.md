# Task: Fix all TypeScript strict mode errors in webclientv4

**ID:** fix-all-typescript-strict-mode-errors-in-webclientv4
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-03-23
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

vue-tsc -b fails with ~100+ strict mode errors across source and spec files. Mostly 'possibly undefined' type narrowing issues. Fix all errors so build:check (vue-tsc -b && vite build) passes clean. This blocks using type-checked builds.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
