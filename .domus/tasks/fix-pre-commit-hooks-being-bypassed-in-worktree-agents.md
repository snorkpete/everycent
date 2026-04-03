# Task: Fix pre-commit hooks being bypassed in worktree agents

**ID:** fix-pre-commit-hooks-being-bypassed-in-worktree-agents
**Status:** done
**Autonomous:** false
**Priority:** high
**Captured:** 2026-04-02
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Pre-commit hooks (husky + lint-staged) were set up 2026-03-29 but worktree agent commits made after that date bypassed formatting. 12 files on master are currently unformatted despite hooks being active.

**Root cause candidates:**
1. Worktree agents committing with `--no-verify`
2. Husky hooks not firing in git worktree contexts (worktrees may not inherit `.husky/` hooks)
3. Hook failures being silently ignored

---

## Acceptance Criteria

- [ ] Root cause identified — determine exactly how hooks are bypassed in worktrees
- [ ] Fix applied so all commit paths enforce formatting (including agent worktrees)
- [ ] All 12 currently unformatted files reformatted and committed
- [ ] Verified: a test commit in a worktree triggers pre-commit hooks
