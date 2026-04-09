# Task: Add won't-fix terminal status to domus

**ID:** add-wont-fix-terminal-status-to-domus
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-04-09
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Add a `won't-fix` terminal task status to domus. This is a domus tool change (not an everycent change). The won't-fix status represents a deliberate decision not to act on something — distinct from cancelled (which implies the task became irrelevant or was a mistake).

Scope includes:
- New CLI command to create tasks directly in won't-fix state
- Workflow engine recognizing won't-fix as a terminal status (no further transitions except reopen)
- Reopen transition: won't-fix → open (for when circumstances change)
- Documentation updates

**Boundary:** The capture-task skill (not the CLI) is responsible for knowing what detail to include in won't-fix task descriptions — the CLI is plumbing. The CLI just needs to support the status; the skill layer decides how to use it.

---

## Acceptance Criteria

- [ ] `won't-fix` is a valid terminal status in the domus workflow engine
- [ ] CLI supports creating a task directly in won't-fix state
- [ ] CLI supports transitioning an existing task to won't-fix (from any active state)
- [ ] Reopen from won't-fix works (won't-fix → open)
- [ ] `domus task list` shows won't-fix tasks (with distinct indicator)
- [ ] Won't-fix tasks do not appear in `domus task ready` output
- [ ] Documentation reflects the new status and its transitions

---

## Implementation Notes

This is a prerequisite for the health check module's doctor skill. The doctor needs to check existing won't-fix tasks to suppress known, accepted findings from re-surfacing in future review runs. See `.domus/docs/specs/health-check-module-spec.md` open question 1.
