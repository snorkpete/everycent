# Task: Chat-transcript capture — backend table, recorder, controller

**ID:** chat-transcript-capture-backend-table-recorder-controller
**Status:** proposed
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-19
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Backend foundation for NLQ conversation-transcript capture. Persist conversation transcripts (user prompts, per-step thinking, tool calls + params + **results**, final output) for retrospective model tuning. Tuning-only — explicitly NOT bug-report evidence.

The chat is frontend-driven (Ollama in the browser, agent loop in `chatAgent.ts`, Rails = stateless `/mcp/*` tools), so capture must originate frontend. This slice builds only the backend: the tables, a model-layer recorder, and the controller wiring to *receive and persist*. It does NOT change `chatStore.ts` or start sending real data (that is slice 2, `chat-transcript-capture-frontend-capture-assemble-flush`).

**Vocabulary** (see `vocabulary/conversation`, `turn`, `step`): a **conversation** is the full back-and-forth until wiped (`conversation_id`). A **turn** is one user message + its eventual answer (`conversation_turn_id`). A **step** is one inner LLM call within a turn (`step_index`, 0-based). One turn = one or more steps.

**Data model** — header/detail split so reconstruction is a single-table scan and each fact lives at its own grain (no positional-nullable columns):

- **`conversation_turns`** — `acts_as_tenant :household`, 1 row/turn
  - `conversation_turn_id` (uuid, unique) · `conversation_id` (uuid, indexed) · `user_prompt` (text) · `final_output` (text) · `incomplete` (boolean, NOT NULL default false, **recorder-derived**) · timestamps
- **`conversation_turn_steps`** — `acts_as_tenant :household`, 1 row/step
  - `conversation_turn_id` (uuid, FK/indexed) · `step_index` (int, 0-based) · `thinking` (text, nullable) · `tool_calls` (jsonb default `[]`, element shape `{name, params, result}`) · unique `(conversation_turn_id, step_index)` · timestamps
- **`llm_usage_records`** (existing, shipped) — add `step_index` (int, **NOT NULL default 0**); **backfill** existing rows via `row_number() - 1` partitioned by `conversation_turn_id` ordered by `id`; add unique index `(conversation_turn_id, step_index)`. This puts cost rows and step rows at the same grain with the same keys.

Design rationale and decision history: second-brain `inbox/everycent-chat-capture-investigation-and-design.md` + `inbox/everycent-chat-capture-grain-decision.md`. Note: original design said "tool calls + params, NOT results" — that was reversed; results ARE captured (step-level, to reconcile model decisions against what it saw).

---

## Acceptance Criteria

- [ ] `conversation_turns` table created as specified: `acts_as_tenant :household`, unique `conversation_turn_id`, indexed `conversation_id`, `incomplete` NOT NULL default false.
- [ ] `conversation_turn_steps` table created as specified: `acts_as_tenant :household`, `tool_calls` jsonb default `[]`, unique `(conversation_turn_id, step_index)`.
- [ ] `llm_usage_records` gains `step_index` (NOT NULL default 0); existing rows backfilled with correct per-turn ordering; unique `(conversation_turn_id, step_index)` index added. Existing usage-log UI still renders (read ignores the new column).
- [ ] `ConversationTurn` and `ConversationTurnStep` models exist with `acts_as_tenant :household`, following `LlmUsageRecord` conventions.
- [ ] `ChatTurnRecorder.record(...)` (model layer, NOT controller) writes `conversation_turns` (1) + `conversation_turn_steps` (N) + `llm_usage_records` (N) in a **single transaction** — all commit or all roll back. It **derives** `conversation_turns.incomplete = usage_records.any?(&:incomplete)`.
- [ ] `/mcp/llm_usage` controller accepts the transcript payload alongside the existing usage `records`, delegates to the recorder, returns a success count. Usage-only payloads (no transcript) still work — backward compatible.
- [ ] All writes household-scoped; tenant isolation holds (a foreign household's data is never written or read).
- [ ] Request spec covers: all tables written on success; transaction rollback on invalid data (nothing written); tenant scoping; backward-compat usage-only payload; the backfill produces unique, correctly-ordered `step_index` values.

---

## Implementation Notes

_Phase 2 (how) — to be filled. Open item: exact HTTP payload shape (nested turn-DTO `{conversation_id, turn_id, steps[], usage_records[]}` vs additive `transcript` block alongside existing `records`). The recorder's input DTO is the stable contract regardless._
