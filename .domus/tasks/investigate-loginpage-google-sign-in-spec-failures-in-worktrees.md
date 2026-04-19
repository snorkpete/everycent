# Task: Investigate LoginPage Google sign-in spec failures in worktrees

**ID:** investigate-loginpage-google-sign-in-spec-failures-in-worktrees
**Status:** raw
**Autonomous:** false
**Priority:** high
**Captured:** 2026-04-19
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The 3 LoginPage Google sign-in specs in webclientv4 fail consistently when tests run in a git worktree (not the main checkout), blocking pre-commit hooks for worker agents. Currently documented as a known environmental issue in other task specs (e.g. refactor-budget-screens-to-new-mobile-dev-standards line 109) and worked around by telling workers to ignore the failures. This task is to investigate the root cause and fix it so worktree workers can commit cleanly.

**Current workaround:** Worker-dispatch task specs tell the worker to ignore the 3 LoginPage Google sign-in spec failures when they appear in a worktree, and the pre-commit hook is bypassed via the documented exception. This is fragile and leaks environmental noise into every worker task.

---

## Acceptance Criteria

- [ ] Root cause of the worktree-only failure identified and documented in this task file.
- [ ] Fix applied such that the 3 LoginPage Google sign-in specs pass when `npm run test` is run from a freshly created worktree off master.
- [ ] The "known environmental issue" note in `.domus/tasks/refactor-budget-screens-to-new-mobile-dev-standards.md` (line 109) is removed/updated.
- [ ] `npm run type-check` and `npm run test` both green from the worktree.

---

## Implementation Notes

_Remove if empty._
