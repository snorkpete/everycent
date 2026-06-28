# Task: Fix order-dependent + load-induced spec flakiness (transcripts_rake, router)

**ID:** fix-order-dependent-load-induced-spec-flakiness-transcripts_rake-router
**Status:** raw
**Autonomous:** false
**Priority:** high
**Captured:** 2026-06-26
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

A pre-existing flaky spec, surfaced (not caused) while landing bug-reporting Slice 1. It intermittently blocks clean commits.

> **Scope narrowed 2026-06-28.** The original backend half (`transcripts_rake_spec.rb`) was root-caused to a leaked `ActsAsTenant.current_tenant` and moved to **`centralize-household-tenant-scoping-controller-side-spec-tenant-reset`** (global spec tenant reset). This task is now the frontend router half only.

### Frontend — `webclientv4 src/router/index.spec.ts` (load-induced timeout)
The `/setup/bank-accounts` and `/setup/allocation-categories` authenticated-navigation tests **pass 32/32 in isolation** but **intermittently time out (~25s)** under full-suite **concurrent load** in the pre-commit hook.

Repro / investigation leads:
- Run the router spec alone → passes consistently.
- Run the full webclientv4 suite under the pre-commit hook (concurrent workers) → these two navigation tests intermittently hit the ~25s timeout.
- Smells like resource contention / an unmocked async wait under load rather than a logic bug — check the auth-guard navigation await and any real timers.

---

## Acceptance Criteria

- [ ] The two router navigation tests pass reliably under full-suite concurrent load in the pre-commit hook (no ~25s timeouts).
- [ ] Fix addresses the root cause (async handling / contention), not just retries or increased timeouts.

(Backend `transcripts_rake` criterion moved to `centralize-household-tenant-scoping-controller-side-spec-tenant-reset`.)

---

## Implementation Notes

_Remove if empty._
