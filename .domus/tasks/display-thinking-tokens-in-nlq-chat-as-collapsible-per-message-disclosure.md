# Task: Display thinking tokens in NLQ chat as collapsible per-message disclosure

**ID:** display-thinking-tokens-in-nlq-chat-as-collapsible-per-message-disclosure
**Status:** done
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-05-25
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The NLQ chat currently shows a generic "thinking" spinner while waiting for the model to respond. For reasoning models (deepseek-r1, qwq, gpt-oss, etc.) Ollama can emit a separate `thinking` field on each streamed chunk when the request includes `think: true`. This task wires that up end to end: request the thinking, stream it, accumulate it onto the message, and render it as a collapsible disclosure.

The infrastructure is partially ready — `chatAgent.ts` already has a `'thinking'` event type, but it's just a no-content marker for the spinner. The DB usage table has a `thinking_tokens` column that's currently hard-coded to 0. Messages are in-memory only (no server-side persistence), so no migration is needed.

### Files to change
- `webclientv4/src/app/chat/chatAgent.ts` — add `think: true` to request, parse `thinking` field from streamed chunks, change `'thinking'` event to carry accumulating content (`{ type: 'thinking', content: string }`), populate `usage.thinking_tokens` from Ollama response
- `webclientv4/src/app/chat/chat.types.ts` — add `thinking?: string` to `ChatMessage`
- `webclientv4/src/app/chat/chatStore.ts` — on `'thinking'` event, write to `target.thinking` (parallel to how `'token'` writes `target.content`); keep boolean `thinking.value` flag for the initial waiting state
- `webclientv4/src/app/chat/NlqChatWindow.vue` (or wherever messages are rendered) — render thinking block when present

### Explicitly out of scope
- Per-user setting / preference persistence (per-message stateless toggle only)
- Model capability detection (always send `think: true`; non-reasoning models return empty thinking, render nothing)
- Interleaving thinking with tool calls (one accumulated thinking blob per message — can revisit if useful)
- Opt-out for trivial questions (will add later if always-thinking proves slow)

---

## Acceptance Criteria

- [x] Ollama request body includes `think: true`
- [x] `chatAgent.ts` parses the `thinking` field from streamed chunks and yields `'thinking'` events with accumulating content
- [x] `ChatMessage` has an optional `thinking?: string` field
- [x] `chatStore.ts` accumulates thinking content onto the active assistant message
- [x] `usage.thinking_tokens` is populated from the Ollama response (no longer hardcoded to 0)
- [x] Message renderer shows a muted/italic collapsible block above the message content when `thinking` is present
- [x] Block is auto-expanded while thinking is streaming
- [x] Block auto-collapses when main `content` begins streaming
- [x] User can re-expand the block after the message completes
- [x] Non-reasoning models (which return no thinking) show no thinking block — graceful empty state
- [x] Pre-commit checks pass: `npm run type-check`, `npm run test` in webclientv4/, `bundle exec rspec` in repo root
- [x] Vue changes reviewed via `senior-code-reviewer` agent before commit (per project CLAUDE.md)

---

## Implementation Notes

_Remove if empty._
