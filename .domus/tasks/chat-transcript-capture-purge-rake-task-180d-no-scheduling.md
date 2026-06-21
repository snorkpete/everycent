# Task: Chat-transcript capture — purge rake task (180d, no scheduling)

**ID:** chat-transcript-capture-purge-rake-task-180d-no-scheduling
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-19
**Parent:** none
**Depends on:** chat-transcript-capture-backend-table-recorder-controller
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Rake task plus supporting code (purge query/service) that deletes chat_transcript_steps older than 180 days (DELETE WHERE created_at < 180.days.ago). 180 hardcoded for now. Runnable by hand — NO scheduling/cron wiring (deferred to a separate task). Depends on the transcript table existing.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
