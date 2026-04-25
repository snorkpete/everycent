# Task: Add budget_role enum to allocation_categories

**ID:** add-budget_role-enum-to-allocation_categories
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-04-25
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Replace exclude_from_overspend_tracking boolean with budget_role enum (spending, annual_spending, transfer, savings, event). Single migration: add column, backfill from current data, drop boolean. Update all touchpoints: serializer, controller params, 3 MCP controllers, Vue edit dialog, list page badge, specs, test factory. See second-brain inbox/everycent-model-changes-from-nlq-exploration.md for full spec.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
