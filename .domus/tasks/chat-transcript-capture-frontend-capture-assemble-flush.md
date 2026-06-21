# Task: Chat-transcript capture — frontend capture, assemble, flush

**ID:** chat-transcript-capture-frontend-capture-assemble-flush
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

Stop discarding tool-call params (event.args) and stop overwriting intermediate thinking per generation in chatStore.ts; accumulate per step. Assemble the transcript-step DTO alongside pendingUsageRecords and flush it in the same finally POST to /mcp/llm_usage. Depends on the backend DTO contract.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
