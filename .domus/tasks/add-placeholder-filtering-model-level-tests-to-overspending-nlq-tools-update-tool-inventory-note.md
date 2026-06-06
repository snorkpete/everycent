# Task: Add placeholder filtering + model-level tests to overspending NLQ tools, update tool-inventory note

**ID:** add-placeholder-filtering-model-level-tests-to-overspending-nlq-tools-update-tool-inventory-note
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-06
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

This task holds the in-progress work and pending notes so second-brain is NOT edited mid-session (session-recap will push to second-brain later).

### Code work
- Add `Allocation::PLACEHOLDER_MAX_CENTS = 10` and a SQL-fragment class method (mirror of the existing `Allocation.canonical_name_sql`) yielding the non-placeholder condition (`amount > 10`). Single-source the threshold so the model spec and controller SQL cannot drift. Placeholders = budgeted amount <= 10 cents inclusive (0.01-0.10 EUR), including 0; spending against them is sink-fund-funded by design — nothing to overspend.
- Apply the non-placeholder filter to both CTEs in both overspending controllers: `app/controllers/mcp/overspending_analysis_controller.rb` and `app/controllers/mcp/overspending_analysis_by_allocation_controller.rb`.
- Rewrite the two overspending tool descriptions in `webclientv4/src/app/chat/toolDefinitions.ts`: state rows are pre-sorted most-overspent-first, the natural filter is `amount_remaining_cents < 0`, and that placeholder + brought-forward + non-`spending` budget_role rows are excluded.
- Tests: MODEL-level specs first (placeholder threshold run through Postgres; boundaries 10 excluded / 11 kept / 0 excluded / NULL excluded), THEN controller request specs as glue (budget_role scoping, brought-forward exclusion, placeholder exclusion, canonical-name collapse). The MCP overspending controllers currently have ZERO spec coverage.

### Pending second-brain note update (for session-recap; do NOT edit the vault mid-session)
Target note: `second-brain/notes/projects/everycent-nlq/everycent-nlq-tool-inventory.md`
- Add a "Build Approach" section capturing: (1) encode bookkeeping filters in SQL, not the prompt — models are unreliable rule-followers; (2) placeholder filtering is context-specific — exclude for overspend/accuracy tools, KEEP for spending-total tools (excluding undercounts real sink-fund-funded spend), the placeholder-analysis tool is its own subject; (3) tool descriptions must document response shape (sort order, natural filter field, exclusions); (4) shared filter extraction deferred to the 3rd tool instance (budget_role, brought-forward, placeholder, manual-adjustment fragments currently duplicated across 2 controllers).
- Mechanical schema-reference sweep: replace stale `exclude_from_overspend_tracking` and "Savings & Investments" category-name matching with `budget_role` throughout the 12 per-tool caveats. Defer deeper per-tool rethink until each tool is actually built.

### Context
Depends on last session's `chat-prompt-and-overspend-filters` work (budget_role='spending' filter, brought-forward exclusion, `canonical_name_sql`) which was LOST when ready-for-master was reset, and is being recovered to master first.

---

## Acceptance Criteria

- [ ] `Allocation::PLACEHOLDER_MAX_CENTS` constant + non-placeholder SQL-fragment method added, threshold single-sourced
- [ ] Non-placeholder filter applied to both CTEs in both overspending controllers
- [ ] Both overspending tool descriptions rewritten to document sort order, `amount_remaining_cents < 0` filter, and exclusions
- [ ] Model-level specs for the placeholder threshold (PG boundaries: 10 excluded, 11 kept, 0 excluded, NULL excluded)
- [ ] Controller request specs covering budget_role scope, brought-forward exclusion, placeholder exclusion, canonical-name collapse
- [ ] second-brain NLQ tool-inventory note updated (Build Approach section + schema-reference sweep) — done at session-recap, tracked here

---

## Implementation Notes

_Remove if empty._
