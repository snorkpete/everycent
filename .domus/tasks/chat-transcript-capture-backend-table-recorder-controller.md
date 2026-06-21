# Task: Chat-transcript capture — backend table, recorder, controller

**ID:** chat-transcript-capture-backend-table-recorder-controller
**Status:** done
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

The chat is frontend-driven (Ollama in the browser, agent loop in `chatAgent.ts`, Rails = stateless `/mcp/*` tools), so capture must originate frontend. This slice builds only the backend: the tables, a model-layer recorder, and a new controller endpoint to *receive and persist*. It does NOT change `chatStore.ts` or send real data — that is slice 2 (`chat-transcript-capture-frontend-capture-assemble-flush`).

**⚠ Coupling — read before dispatch:** This slice **deletes** the old `/mcp/llm_usage` endpoint that the *current* frontend still calls, so it is **not independently deployable**. It must reach prod together with slice 2 in one atomic FE+BE Heroku release. Slice 2 should branch from this slice's branch (stacked) and the pair merge to master as a unit (merge the tip), so master never carries a dead route. Do not deploy this slice alone.

**Vocabulary** (`knowledge-base/concepts/conversation.md`, `chat-turn.md`, `chat-step.md`): a **conversation** is the full back-and-forth until wiped (`conversation_id`). A **turn** is one user message + its eventual answer (`conversation_turn_id`). A **step** is one inner LLM call within a turn (`step_index`, 0-based). One turn = one or more steps. Verified from code: `llm_usage_records` is **already step-grain** — a tool-call turn writes multiple rows sharing one `conversation_turn_id` today (`chatAgent.ts` yields a usage event per LLM generation), which is why the backfill below is non-trivial.

**Data model** — header/detail split so reconstruction is a single-table scan and each fact lives at its own grain (no positional-nullable columns):

- **`conversation_turns`** — `acts_as_tenant :household`, 1 row/turn
  - `conversation_turn_id` (uuid, unique) · `conversation_id` (uuid, indexed) · `user_prompt` (text, NOT NULL) · `final_output` (text, **nullable** — absent on interrupted turns) · `incomplete` (boolean, NOT NULL default false, **recorder-derived**) · timestamps
- **`conversation_turn_steps`** — `acts_as_tenant :household`, 1 row/step
  - `conversation_turn_id` (uuid, FK/indexed) · `step_index` (int, 0-based) · `thinking` (text, nullable) · `tool_calls` (jsonb default `[]`, element shape `{name, params, result}`) · unique `(conversation_turn_id, step_index)` · timestamps
- **`llm_usage_records`** (existing, shipped) — add `step_index` (int, **NOT NULL default 0**); **backfill** existing rows via `row_number() - 1` partitioned by `conversation_turn_id` ordered by `id`; add unique index `(conversation_turn_id, step_index)`. Puts cost rows and step rows at the same grain with the same keys.

**Endpoint — one new endpoint, retire the old (no backward-compat shim):**
- **New** `POST /mcp/conversation_turns` → `ConversationTurnRecorder.record(turn_dto)`. One turn per request.
- **Delete** `POST /mcp/llm_usage`, `Mcp::LlmUsageController`, and its spec. `ConversationTurnRecorder` becomes the **sole writer** of `llm_usage_records` (calls `LlmUsageRecord.create_batch!` internally for the usage rows).

**Payload (turn-DTO, one turn per request):**
```json
{
  "llm_model_id": 7,
  "conversation_id": "<uuid>",
  "conversation_turn_id": "<uuid>",
  "user_prompt": "...",
  "final_output": "..."         // nullable
  "steps": [
    { "thinking": "...",        // nullable
      "tool_calls": [{ "name": "...", "params": {}, "result": {} }],
      "usage": { "usage_category": "chat", "input_tokens": 0, "...": "..." } }
  ]
}
```
Each `steps[]` element carries **both** its transcript content and its usage, so `step_index` = array position keys `conversation_turn_steps` and `llm_usage_records` identically. `incomplete` is **not** in the payload — the recorder derives it from `steps[].usage.incomplete`.

Design rationale and decision history: second-brain `inbox/everycent-chat-capture-investigation-and-design.md` + `inbox/everycent-chat-capture-grain-decision.md`. Note: original design said "tool calls + params, NOT results" — reversed; results ARE captured (step-level) to reconcile model decisions against what it saw.

---

## Acceptance Criteria

- [ ] `conversation_turns` table: `acts_as_tenant :household`, unique `conversation_turn_id`, indexed `conversation_id`, `user_prompt` NOT NULL, `final_output` nullable, `incomplete` NOT NULL default false.
- [ ] `conversation_turn_steps` table: `acts_as_tenant :household`, `tool_calls` jsonb default `[]`, unique `(conversation_turn_id, step_index)`.
- [ ] `llm_usage_records` gains `step_index` (NOT NULL default 0); existing rows backfilled with correct per-turn ordering (`row_number()-1` partitioned by `conversation_turn_id` ordered by `id`); unique `(conversation_turn_id, step_index)` index added. (Existing usage-log UI still renders — read ignores the new column.)
- [ ] `ConversationTurn` and `ConversationTurnStep` models exist with `acts_as_tenant :household`, following `LlmUsageRecord` conventions.
- [ ] `ConversationTurnRecorder.record(...)` (model layer, NOT controller) writes `conversation_turns` (1) + `conversation_turn_steps` (N) + `llm_usage_records` (N) in a **single transaction** — all commit or all roll back. Derives `conversation_turns.incomplete` from the steps' usage `incomplete` flags. Assigns `step_index` from the `steps[]` array position, applied to both the step row and its usage row.
- [ ] **New** `POST /mcp/conversation_turns` (`Mcp::ConversationTurnsController`, mirroring the prior `Mcp::LlmUsageController` for auth/tenant setup) accepts the turn-DTO, delegates to the recorder, returns a success count. 404 if `llm_model_id` not found.
- [ ] **Old** `POST /mcp/llm_usage` route, `Mcp::LlmUsageController`, and its spec are **removed**.
- [ ] All writes household-scoped; tenant isolation holds (a foreign household's data is never written or read).
- [ ] Request/recorder specs cover: all three tables written on success; transaction rollback on invalid data (nothing written); tenant scoping; `step_index` alignment between step rows and usage rows; the existing-row backfill produces unique, correctly-ordered `step_index`.

---

## Implementation Notes

- **Migrations (3):** `create_conversation_turns`; `create_conversation_turn_steps`; `add_step_index_to_llm_usage_records`. The third in **strict order**: add column nullable → backfill `row_number()-1` → set NOT NULL + default 0 → add unique index. Never add the unique index before the backfill.
- **Files:** 3 migrations; `app/models/conversation_turn.rb`; `app/models/conversation_turn_step.rb`; `app/models/conversation_turn_recorder.rb`; `app/controllers/mcp/conversation_turns_controller.rb`; `config/routes.rb` (add new route, remove old); request + recorder + model specs; **edit** `app/models/llm_usage_record.rb` (`create_batch!` accepts an explicit `step_index`); **delete** `app/controllers/mcp/llm_usage_controller.rb` + its spec.
- `ConversationTurnRecorder.record` opens the transaction; `create_batch!` joins it (Rails nested transaction = same savepoint) so all-or-nothing holds across all three tables.
- The transcript purge (slice 3) targets `conversation_turns`/`conversation_turn_steps` only — `llm_usage_records` (cost) is kept. So **no FK** from `llm_usage_records` to `conversation_turns`; the `conversation_turn_steps → conversation_turns` FK (with cascade) is fine.
- **Commit scope:** one cohesive commit (migrations + models + recorder + controller + routes + specs + old-endpoint removal). Indivisible — nothing half-works without the rest.
- **Risk:** the unique index would break the live frontend's multi-row-per-turn POST if the old endpoint stayed — which is why the old endpoint is removed and slices 1+2 ship together (see Coupling).
