# Task: Centralize auth token management

**ID:** centralize-auth-token-management
**Status:** raw
**Autonomous:** false
**Priority:** high
**Captured:** 2026-03-28
**Parent:** none
**Depends on:** extract-modular-api-gateway-interceptors
**Idea:** none
**Spec refs:** none

---

## What This Task Is

GATE-02/03: localStorage accessed directly in 3 files (api-gateway, authStore, handle401). Dual logout paths can diverge. Create single AuthTokenManager that owns token read/write/clear. handle401 delegates to authStore for logout.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
