# Task: Fix order-dependent + load-induced spec flakiness (transcripts_rake, router)

**ID:** fix-order-dependent-load-induced-spec-flakiness-transcripts_rake-router
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-26
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Two pre-existing flaky specs surfaced while landing bug-reporting Slice 1. They are **unrelated to that work** — pre-existing flakiness, just exposed by running the full suite during the landing. Both intermittently block clean commits.

### (1) Backend — `spec/tasks/transcripts_rake_spec.rb` (order-dependent)
The 4 `transcripts:purge` examples **pass 7/7 in isolation** but **fail under the full suite in defined order**. Classic test pollution — a sibling spec is leaving DB/tenant state behind that the purge examples then trip over.

Repro / investigation leads:
- Run the file alone → passes (isolation is clean).
- Run the full suite **in defined order** (not random) → the purge examples fail.
- Look for a sibling spec that mutates DB or `acts_as_tenant` tenant state without cleaning up; the purge examples likely assume a clean slate.

### (2) Frontend — `webclientv4 src/router/index.spec.ts` (load-induced timeout)
The `/setup/bank-accounts` and `/setup/allocation-categories` authenticated-navigation tests **pass 32/32 in isolation** but **intermittently time out (~25s)** under full-suite **concurrent load** in the pre-commit hook.

Repro / investigation leads:
- Run the router spec alone → passes consistently.
- Run the full webclientv4 suite under the pre-commit hook (concurrent workers) → these two navigation tests intermittently hit the ~25s timeout.
- Smells like resource contention / an unmocked async wait under load rather than a logic bug — check the auth-guard navigation await and any real timers.

---

## Acceptance Criteria

- [ ] `transcripts_rake_spec.rb` passes under the full suite in defined order (root-cause the polluting sibling spec; fix the leak rather than reordering around it).
- [ ] The two router navigation tests pass reliably under full-suite concurrent load in the pre-commit hook (no ~25s timeouts).
- [ ] Fixes address the root cause (state isolation / async handling), not just retries or increased timeouts.

---

## Implementation Notes

_Remove if empty._
