# Task: Rework usage-log UI to reflect per-step llm_usage_records (step_index)

**ID:** rework-usage-log-ui-to-reflect-per-step-llm_usage_records-step_index
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-20
**Parent:** none
**Depends on:** chat-transcript-capture-backend-table-recorder-controller
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The LLM usage-log UI shows llm_usage_records rows. Once step_index is added (one row per step within a turn), the log should reflect the turn/step grouping rather than a flat list. Enhancement, not a blocker — backfill keeps the existing flat view working.

### Added scope (2026-06-22)

Two further refinements to the same viewer, captured during a session reviewing the chat-log UI:

1. **Make the cost-record granularity explicit + switchable.** Right now it's ambiguous whether a displayed cost record is turn-based (aggregated across the whole turn) or step-based (one row per step within a turn). The UI should clearly label which it's showing, and let the user toggle between the two views (turn-based ↔ step-based). This is the natural extension of the turn/step grouping work above.

2. **Short identifying column from chat content.** Add a column showing a truncated slice (~30-60 chars) of the actual chat content for each record, purely to orient the viewer about which record corresponds to which conversation. Enough to recognise a record, not enough to be meaningful PII exposure.
   - **Constraint:** this column is DB-derived, client-side display ONLY. The chat snippet must never be logged, committed, or used in fixtures/specs with real content (public repo + financial-conversation text). Spec data uses invented placeholder content.

---

## Acceptance Criteria

- [ ] Usage-log viewer reflects turn/step grouping once `step_index` is available (flat view still works via backfill)
- [ ] UI clearly labels whether displayed cost records are turn-based or step-based
- [ ] User can toggle between turn-based and step-based views
- [ ] An identifying column shows a ~30-60 char truncated snippet of chat content per record
- [ ] Snippet column is DB-derived display only — never logged/committed; specs use invented placeholder content

---

## Implementation Notes

_Remove if empty._
