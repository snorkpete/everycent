# Task: Investigate LoginPage Google sign-in spec failures in worktrees

**ID:** investigate-loginpage-google-sign-in-spec-failures-in-worktrees
**Status:** done
**Autonomous:** false
**Priority:** high
**Captured:** 2026-04-14
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The 3 LoginPage Google sign-in specs in webclientv4 fail consistently when tests run in a git worktree (not the main checkout), blocking pre-commit hooks for worker agents. Currently documented as a known environmental issue in other task specs (e.g. refactor-budget-screens-to-new-mobile-dev-standards line 109) and worked around by telling workers to ignore the failures. This task is to investigate the root cause and fix it so worktree workers can commit cleanly.

---

## Acceptance Criteria

- [ ] Root cause identified and documented.
- [ ] Fix applied so all three specs pass inside `.claude/worktrees/*` as well as on master.
- [ ] Pre-commit hooks in dispatched workers no longer require `--no-verify` for this reason.
- [ ] If the root cause turns out to be a legitimate worktree-specific environment difference, the mitigation (env var, setup tweak, mock hoist, etc.) is documented in a project location (`vue-coding-rules.md` or a CLAUDE.md) so future workers aren't surprised.

---

## Implementation Notes

### Hypotheses to check

1. **Mock hoisting / module resolution** — `vi.mock()` hoisting can behave differently when the test runner resolves modules through a worktree path versus a main checkout path. Compare `vi.mock` calls in `LoginPage.spec.ts` against the full import graph.
2. **`window.google` stub injection timing** — the test asserts that when `window.google` is present at mount, `initialize` is called. If `window.google` is not set before `LoginPage` mounts in the worktree context, the spy never fires. Check for any `beforeEach` ordering difference.
3. **Vitest cache / `node_modules` sharing** — worktrees share `node_modules` with the main worktree by default (depending on how the worktree was created). Stale cache or resolved module paths could differ.
4. **Absolute vs relative path imports** — the worktree path is `.claude/worktrees/agent-<hash>`, which is much longer than the main path. If any import uses absolute paths or resolves via `__dirname`, this could change behaviour.
5. **Environment variables** — check if `LoginPage.spec.ts` reads `VITE_GOOGLE_CLIENT_ID` or similar. Worker worktrees may not inherit the full main env.

### Reproduction

From a fresh worktree created via `git worktree add`, run `npm run test src/auth/LoginPage.spec.ts` in `webclientv4/` and compare against the same command on the main worktree on the same SHA. Use `-- --reporter=verbose` to see exactly which expectations fire.

### Out of scope

- Fixing the Google auth code itself (only the spec failures are in scope).
- General spec flakiness unrelated to LoginPage.
