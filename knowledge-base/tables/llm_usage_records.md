---
type: table
title: llm_usage_records
term: llm-usage-record
definition: "Append-only log of LLM calls from the NLQ chat — token counts, point-in-time cost-rate snapshots, computed (simulated) cost, and per-turn telemetry. Written by the frontend via POST /mcp/llm_usage."
lexicon: true
description: >-
  One row per LLM call in a chat turn. Captures tokens, a snapshot of the model's
  cost rates, computed total_cost, conversation/turn UUIDs, and tool telemetry. The
  current point of the feature: logging to tune chat configuration.
resource: everycent:table:llm_usage_records
tags: [table, ai, chat, observability]
timestamp: 2026-06-21T00:00:00Z
---

# llm_usage_records

An **append-only** log of LLM calls made by the [NLQ chat](/concepts/nlq-chat.md).
One row per model call (a tool loop emits several per turn). `acts_as_tenant
:household`; `belongs_to :llm_model`. **Capturing this log is the feature's current
purpose** — the chat is shipped but not in active use, and the records exist to study
what the chat does so its configuration can be tuned.

## Write path

The browser agent accumulates usage per turn and **batch-posts fire-and-forget** to
`POST /mcp/llm_usage` (`{ llm_model_id, records: [...] }`) at turn end.
`LlmUsageRecord.create_batch!` builds each row via `build_from_model`, which
**snapshots the model's cost rates**, computes `total_cost`, and denormalizes
`provider`/`llm_model_name`. The batch is **all-or-nothing**. There is no
create/update/destroy API beyond this; reads are paginated with date filters, plus a
`/summary` aggregate.

## Schema

| Column | Meaning |
|---|---|
| `id`, `household_id`, `llm_model_id` | PK, tenant scope, model FK (required). |
| `usage_category` | `chat` \| `query_embedding` \| `background_embedding`. **Only `chat` is implemented**; the two embedding categories are placeholders for the coming NLQ embedding phase (see [payee name](/concepts/payee-name.md)). |
| `conversation_id` / `conversation_turn_id` | UUIDs (frontend-generated) linking rows to a conversation and a single turn. |
| `input_tokens`, `output_tokens`, `cache_read_tokens`, `cache_write_tokens`, `thinking_tokens`, `total_tokens` | Token counts. `total_tokens` computed server-side. |
| `*_token_cost_rate` (five) | **Snapshot** of the model's rates at write time, so historical cost stays correct if rates later change. |
| `total_cost` | Computed `(tokens × rates) / 1e6`, cents. **Simulated** — see the dummy-pricing note in [llm_models](/tables/llm_models.md). |
| `provider`, `llm_model_name` | Denormalized from the model for fast querying (frozen copies). |
| `request_duration_ms`, `tool_call_count`, `tool_calls_detail` (jsonb) | Per-call telemetry. |
| `incomplete` | True if the stream was interrupted before the usage chunk arrived. |
| `extras` | `jsonb`, default `{}`. |
| `created_at` / `updated_at` | Timestamps. |

## Gotcha — thinking tokens are effectively always 0

Ollama's OpenAI-compat endpoint streams reasoning under `delta.reasoning` (not
`delta.thinking`) and lumps reasoning into `completion_tokens`, so there is no separate
thinking-token count — `thinking_tokens` lands at 0 in practice.
