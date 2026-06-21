# Task: Chat-transcript capture — purge rake task (180d, no scheduling)

**ID:** chat-transcript-capture-purge-rake-task-180d-no-scheduling
**Status:** done
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-19
**Parent:** none
**Depends on:** chat-transcript-capture-backend-table-recorder-controller
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Rake task plus supporting code (a purge query/service object) that deletes **transcript** data older than 180 days. Runnable by hand — **NO scheduling/cron wiring** (deferred to `schedule-the-chat-transcript-purge-job`). Depends on slice 1 (the tables must exist).

**What gets purged vs kept:**
- **Purge:** `conversation_turns` and `conversation_turn_steps` older than the cutoff. Deleting a `conversation_turns` row cascades to its `conversation_turn_steps` (FK). These hold prompts/thinking/tool-results — financial PII under a retention policy.
- **Keep:** `llm_usage_records` (cost accounting) is **never** purged here — it has its own indefinite retention. After a purge, cost rows whose transcript has been deleted simply have no transcript counterpart; that's expected.

180 days is **hardcoded** for now (`180.days.ago`); making it household-configurable from settings is the separate deferred task `make-chat-transcript-retention-window-configurable-from-settings-ui`.

---

## Acceptance Criteria

- [ ] A rake task (e.g. `transcripts:purge`) deletes `conversation_turns` with `created_at < 180.days.ago`, cascading to their `conversation_turn_steps`.
- [ ] `llm_usage_records` is untouched by the purge.
- [ ] The deletion logic lives in a **supporting service/query object**, not inline in the rake task (rake task is a thin caller — keeps it testable and reusable by the future scheduler task).
- [ ] Cutoff is computed at run time (`180.days.ago`), 180 hardcoded in one named place.
- [ ] No scheduling/cron/Heroku Scheduler wiring is added.
- [ ] Specs cover: rows older than cutoff deleted (with cascade), rows at/after cutoff retained, `llm_usage_records` untouched, household scoping respected.
- [ ] `bundle exec rspec` passes.

---

## Implementation Notes

- Tenant scoping: the purge runs across households (it's a maintenance job), so it must operate outside or across `acts_as_tenant` scope — confirm the deletion isn't silently limited to a current tenant. Verify against how other cross-tenant maintenance code (if any) handles this.
- Prefer a set-based `DELETE` over instantiating ActiveRecord objects, but ensure the `conversation_turn_steps` cascade actually fires (DB-level `ON DELETE CASCADE` from the slice-1 FK, or delete children explicitly).
- Keep the service signature cutoff-injectable (e.g. `older_than:`) even though the rake task hardcodes 180 — the scheduler/config tasks will reuse it.
