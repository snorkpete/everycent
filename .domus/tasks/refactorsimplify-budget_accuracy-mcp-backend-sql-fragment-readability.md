# Task: Refactor/simplify budget_accuracy MCP backend (SQL-fragment readability)

**ID:** refactorsimplify-budget_accuracy-mcp-backend-sql-fragment-readability
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-07
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The budget_accuracy MCP implementation is hard to follow — heavy SQL-fragment string manipulation, and Mcp::SpendingScope's alias-passing fragment helpers are difficult to understand. Refactor for readability/maintainability while preserving behaviour exactly (existing specs must stay green). Behaviour-preserving internal improvement → belongs on the healthcheck branch/worktree.

---

## Acceptance Criteria

- [ ] `Mcp::BudgetAccuracy` SQL is easier to follow — reduce the raw string-fragment manipulation; consider clearer composition (well-named CTEs, fewer interpolated condition strings, or a different structuring) without changing the query's results.
- [ ] `Mcp::SpendingScope` is easier to understand — the alias-passing fragment-helper approach was flagged as confusing; evaluate a clearer contract (fixed aliases, scopes, or another abstraction).
- [ ] **Behaviour preserved exactly** — all existing MCP specs (`overspending_analysis`, `overspending_analysis_by_allocation`, `budget_accuracy`, controllers) pass unchanged. This is a pure readability/maintainability refactor, no output changes.
- [ ] Gates green: `bundle exec rspec`; in `webclientv4/` `npm run type-check`, `npm run test`.

---

## Implementation Notes

**Provenance:** raised by Kion at review time of the original `budget_accuracy` build (2026-06-07). The implementation was merged as-is (deliberately not gated on this) to see how the tool functions in practice — so do this refactor with real usage feedback in hand, and don't pre-optimise for cases that don't come up.

**Home:** behaviour-preserving internal improvement → the `healthcheck` branch/worktree (`/Users/kion/code/everycent-healthcheck`), per project CLAUDE.md, not a fresh feature worktree.

**Scope discipline:** readability only. Do not change which figures the tools return, the filter semantics, or the response shape. If a behavioural change seems warranted, split it into a separate task.
