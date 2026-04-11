# Task: Unwrap authApi responses and align authStore

**ID:** unwrap-authapi-responses-and-align-authstore
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-04-10
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

[HC §5.3] authApi is the only API module not doing .then(r => r.data). Clean up so authStore matches other stores (no .data navigation, no axios.isAxiosError). Drive-by.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
