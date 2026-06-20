---
type: concept
title: Turn
term: turn
definition: "One exchange within a conversation: a user message plus its eventual user-facing answer. One-to-many with steps; identified by conversation_turn_id."
lexicon: true
lexicon_group: chat
tags: [domain, nlq-chat]
timestamp: 2026-06-20T00:00:00Z
---

# Turn

One exchange within an NLQ chat [conversation](/concepts/conversation.md) — a single
user message plus the assistant's eventual user-facing answer. Identified by
`conversation_turn_id` (generated once per `sendMessage` in the frontend).

## Contract

- A conversation contains many turns. Mnemonic: **"taking turns"** — your turn,
  then the assistant's turn. One user message + its answer = one turn.
- A turn is one-to-many with [steps](/concepts/chat-step.md): handling one turn may
  take one or more LLM calls. No-tool turn → 1 step; tool-calling turn → multiple
  steps.
- `conversation_turn_id` already exists on `llm_usage_records` (shipped to prod) at
  exactly this grain — one row group per user prompt.

## Gotcha

The word "turn" is overloaded in the industry. At the human-conversation altitude
(ours), a turn is one exchange — the conventional, intuitive meaning. But some agent
frameworks (notably **OpenAI's Agents SDK**, `max_turns`) use "turn" for each inner
LLM call — i.e. what we call a [step](/concepts/chat-step.md). If you've read those
docs you may instinctively invert turn/step. We reserve **turn = user exchange**,
**step = inner LLM call**, matching the conventional meaning of "turn" and our
existing schema.
