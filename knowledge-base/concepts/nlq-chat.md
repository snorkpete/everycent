---
type: concept
title: NLQ chat (frontend-driven, with backend support tables)
term: nlq-chat
definition: "A natural-language-query chat over the household's finances. The model and agent loop run in the browser; Rails only exposes stateless /mcp/* tool endpoints plus three support tables (config, model registry, usage log). Shipped but not yet in active use."
lexicon: true
description: >-
  The defining architecture of the NLQ chat — frontend-driven, with the LLM and
  agent loop running in the browser (chatAgent.ts) and Rails only exposing
  stateless /mcp/* tools plus three support tables; there is no backend agent.
  Also why it ships logging-only with simulated cost, embeddings unbuilt, and an
  open production-architecture question.
tags: [domain, ai, chat, nlq]
timestamp: 2026-06-21T00:00:00Z
---

# NLQ chat

A natural-language-query chat for asking questions about the household's finances.
The defining architectural fact: **it is frontend-driven.**

## Architecture — there is no backend agent

- The **LLM runs in the browser** (a free **local Ollama** model today).
- The **agent loop** — tool-calling and the multi-round tool iteration — lives in the
  **frontend** (`webclientv4/src/app/chat/chatAgent.ts`), capped by
  `chat_settings.max_tool_iterations`.
- **Rails is stateless**: it exposes `/mcp/*` tool endpoints (query objects returning
  finance data) and the usage-logging endpoint. There is **no `ChatController`,
  orchestrator, or backend agent** — don't go looking for one.

The three backend tables are the **support layer** around that frontend loop:

- [chat_settings](/tables/chat_settings.md) — per-household config (enable flag,
  selected model, tool-iteration cap).
- [llm_models](/tables/llm_models.md) — the selectable-model registry (endpoint URL +
  cost rates).
- [llm_usage_records](/tables/llm_usage_records.md) — the append-only per-turn usage
  log.

## Status — shipped, logging, not yet used

The feature is **shipped but not in active use.** Its current point is **logging**:
capturing what the chat does (tokens, tool calls, timing, simulated cost) so the
configuration can be experimented with and tuned. The hope is that adding a
**bug-reporting** flow on top of the chat starts driving real usage — and reporting
use alongside it.

## Two forward-looking aspects to read correctly

- **Cost is simulated.** The local model is free, but the configured model carries
  **dummy Opus-like pricing** so the usage log shows what a paid/hosted provider
  *would* cost. `total_cost` is not real spend. See
  [llm_models](/tables/llm_models.md).
- **Embeddings aren't built yet.** `usage_category` allows `query_embedding` and
  `background_embedding`, but only `chat` is implemented. Those two are placeholders
  for the coming NLQ embedding phase — the same phase the cleaned
  [payee name](/concepts/payee-name.md) feeds.

## Open question

The production architecture (a dedicated TS service vs. moving the loop into Rails)
is still **open**, and is coupled to the free-local-model decision. The current
in-browser design follows from running a free local model.
