# Task: Health check module: won't-fix support in domus (dependency)

**ID:** health-check-module-wont-fix-support-in-domus-dependency
**Status:** cancelled
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-04-09
**Parent:** none
**Depends on:** add-wont-fix-terminal-status-to-domus
**Idea:** none
**Spec refs:** .domus/docs/specs/health-check-module-spec.md

---

## What This Task Is

Dependency tracker for the health check module's doctor skill. The doctor needs to check existing won't-fix tasks to suppress known, accepted findings from re-surfacing in future review runs. This is blocked until domus itself supports the won't-fix terminal status.

Without won't-fix support, the doctor skill cannot implement its suppression mechanism — findings that were deliberately not acted on would resurface every run, creating noise that undermines trust in the system.

See `.domus/docs/specs/health-check-module-spec.md` open question 1 for the full context.

---

## Acceptance Criteria

- [ ] Domus supports won't-fix terminal status (upstream dependency resolved)
- [ ] Doctor skill can query domus for won't-fix tasks programmatically
- [ ] Doctor skill suppresses findings that match existing won't-fix tasks
- [ ] Open question 1 in health-check-module-spec.md can be marked resolved

---

## Implementation Notes

This task is a placeholder — no everycent code changes are needed. It unblocks when the upstream domus task (`add-wont-fix-terminal-status-to-domus`) is complete. At that point, the doctor skill implementation can proceed with won't-fix suppression as part of its dedup-against-existing-work flow.
