---
type: concept
title: Step
term: step
definition: "One inner LLM call within a turn. A no-tool turn is one step; a tool-calling turn is several. Ordered by step_index. (Some frameworks call this a 'turn'.)"
lexicon: true
lexicon_group: chat
description: >-
  Why a step is the inner-LLM-call grain within a turn (no-tool turn = 1 step,
  tool-calling turn = several), how it maps 1:1 to an LlmUsageRecord cost row
  and to chat_transcript_steps capture, and the deliberate step-vs-turn naming
  choice against frameworks that call this a "turn".
tags: [domain, nlq-chat]
timestamp: 2026-06-20T00:00:00Z
---

# Step

One inner LLM call (a single generation) within a chat [turn](/concepts/chat-turn.md).
Ordered within the turn by `step_index`.

## Contract

- A turn is composed of one or more steps. A no-tool turn is a single step. A
  tool-calling turn is multiple steps: the LLM is called, emits a tool-call
  (intercepted by `chatAgent.ts`, not shown to the user as an answer), the code runs
  the tool against Rails, then the LLM is called again with the tool-call +
  tool-result, producing the user-facing answer.
- Each step is one LLM generation, so each step maps 1:1 to one `LlmUsageRecord` cost
  row (same `conversation_id` + `conversation_turn_id`, ordered by `step_index`).
- Step-grain is the chosen grain for transcript capture (`chat_transcript_steps`):
  one row per step, with `thinking` and `tool_calls` per step, `user_prompt` on
  step 0, `final_output` on the last step.

## Gotcha

"Step" for the inner agent-loop iteration is *a* convention (ReAct/LangChain-style
"intermediate steps"), not *the* universal one — others say "iteration," "round," or
"hop," and OpenAI's Agents SDK calls it a "turn." We deliberately use **step** here
and reserve **turn** for the user exchange. See [turn](/concepts/chat-turn.md).
