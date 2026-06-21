# Task: Chat-transcript capture — frontend capture, assemble, flush

**ID:** chat-transcript-capture-frontend-capture-assemble-flush
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

Frontend half of NLQ conversation-transcript capture. Today the agent loop **discards** the data we want: tool-call params (`event.args`) are dropped, intermediate `thinking` is overwritten each generation, and tool results aren't retained for capture. This slice captures all of it per step, assembles the turn-DTO, and POSTs it to the new backend endpoint from slice 1 — replacing the current `/mcp/llm_usage` usage-only POST.

**⚠ Coupling — read before dispatch:** Slice 1 deletes `/mcp/llm_usage`; this slice removes its last caller and repoints to `/mcp/conversation_turns`. **Branch this from slice 1's branch (stacked)** and merge the pair to master as a unit (merge the tip) so master never carries a dead route. The two ship in one atomic FE+BE release.

**Vocabulary:** see `knowledge-base/concepts/{conversation,chat-turn,chat-step}.md`. A **turn** = one user message + its answer; a **step** = one inner LLM call. Verified: the loop already emits one usage event per step and flushes once per turn in `chatStore.ts`'s `finally` — so "one turn per request" matches existing behavior.

**Payload to produce** (the slice-1 contract): `{ llm_model_id, conversation_id, conversation_turn_id, user_prompt, final_output, steps: [{ thinking, tool_calls: [{name, params, result}], usage: {…} }] }`. Each `steps[]` element pairs the step's transcript content with its usage; the backend keys both tables by array position, so the array MUST be in step order. `incomplete` is derived backend-side — don't send it.

---

## Acceptance Criteria

- [ ] `chatStore.ts` no longer discards tool-call `event.args` — `params` are captured per step.
- [ ] Tool-call **results** are captured per step (available client-side after the tool runs in `chatAgent.ts`).
- [ ] Intermediate `thinking` is **accumulated per step**, not overwritten — every step's reasoning is retained, not just the last generation's.
- [ ] `user_prompt` and `final_output` are captured at the turn level.
- [ ] A turn flush assembles the full turn-DTO (above) and POSTs it to `POST /mcp/conversation_turns`, in step order, once per turn.
- [ ] The old `/mcp/llm_usage` caller (`llmUsageApi` / `submitUsageBatch` path) is removed/repointed — nothing calls the deleted endpoint.
- [ ] Unit tests cover: params captured, results captured, per-step thinking accumulation, turn-DTO assembly + ordering, single POST per turn. (TDD, 100% coverage on new code per webclientv4 rules.)
- [ ] `npm run type-check` and `npm run test` pass; `senior-code-reviewer` run on the Vue changes.

---

## Implementation Notes

- Touch points: `webclientv4/src/app/chat/chatAgent.ts` (surface `args` + tool `result` on the emitted events; today the tool-call event drops args and results aren't retained for capture), `chatStore.ts` (accumulate per-step content + turn-level prompt/output, assemble DTO, flush), and the API module currently calling `/mcp/llm_usage` (repoint to `/mcp/conversation_turns` with the new shape).
- Reference implementations (per CLAUDE.md): store → `transactionStore.ts`, API → `bankAccountApi.ts`.
- The new endpoint writes usage **and** transcript in one call, so this replaces — not supplements — the existing usage POST. There should be exactly one POST per turn.
- Edge: an interrupted turn may have no `final_output` and a trailing incomplete step — send what exists; the backend derives `incomplete`.
