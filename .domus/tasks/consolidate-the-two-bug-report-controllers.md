# Task: Consolidate the two bug-report controllers

**ID:** consolidate-the-two-bug-report-controllers
**Status:** raw
**Autonomous:** false
**Priority:** low
**Captured:** 2026-06-26
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

BugReport CRUD is split across two controllers:

- `app/controllers/bug_reports_controller.rb` (admin) — `index` (all reports) + `update`, rendered via `respond_with`. Base class: `ApplicationController`.
- `app/controllers/mcp/bug_reports_controller.rb` (mcp) — `index` (open reports only) + `create`, rendered via manual `render`. Base class: `AppController`.

They now share `BugReportSerializer`, but the split is a smell Kion flagged during the bug-reporting Slice 1 landing. Investigate whether the CRUD should consolidate and whether the MCP-vs-admin boundary is drawn in the right place.

**Important context — the controllers are NOT literally identical:**
- Different actions (admin: `index` all + `update`; mcp: `index` open + `create`).
- Different base class (`ApplicationController` for admin vs `AppController` for mcp).
- Different render conventions (`respond_with` vs manual `render`).
- They DO share `BugReportSerializer`.

This is **behaviour-preserving cleanup** (a health-check-category change) that builds on the `bug-reporting-nlq-reimpl` branch — pick it up once that branch has landed.

---

## Acceptance Criteria

- [ ] Determine whether the two controllers should consolidate or whether the MCP-vs-admin boundary is the correct separation, and document the decision.
- [ ] If consolidating, the resulting controller(s) preserve existing behaviour exactly (same actions, same response shapes via `BugReportSerializer`, same access boundaries).
- [ ] No change to the admin-vs-MCP access semantics unless explicitly decided otherwise.
- [ ] Existing bug-report specs pass; add coverage for any newly merged paths.

---

## Implementation Notes

_Remove if empty._
