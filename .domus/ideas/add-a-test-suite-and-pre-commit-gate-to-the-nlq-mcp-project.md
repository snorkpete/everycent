# Idea: Add a test suite (and pre-commit gate) to the nlq MCP project

**Captured:** 2026-06-22
**Status:** raw

---

## The Idea

The nlq/ MCP server has zero tests and no test runner (devDeps are only tsx/typescript; only a type-check script exists), so the pre-commit hook can't gate it. Surfaced 2026-06-22 while making pre-commit test-running path-conditional: decided 'no nlq gate yet' precisely because there's nothing to run. When nlq grows a suite (pick a runner — node:test or vitest), add an nlq block to webclientv4/.husky/pre-commit mirroring the Vue gate (symlink nlq/node_modules in worktrees like the Vue block does). Low priority — nlq is dev-only tooling, not deployed (Procfile is puma-only; excluded from the Heroku slug via .slugignore).

---

## Why This Is Worth Doing

_To be filled in._

---

## Open Questions / Things to Explore

- _Add open questions here_
