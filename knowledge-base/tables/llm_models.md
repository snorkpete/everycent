---
type: table
title: llm_models
term: llm-model
definition: "Per-household registry of selectable LLM models — provider, name, endpoint URL, and five per-million-token cost rates. The cost rates are forward-looking (currently dummy pricing over a free local model)."
lexicon: true
description: >-
  Registry of LLM models a household can pick for the NLQ chat. Holds the endpoint
  URL and five cost-rate columns (cents per million tokens). CRUD-managed; one row
  per [household, provider, name].
resource: everycent:table:llm_models
tags: [table, ai, chat]
timestamp: 2026-06-21T00:00:00Z
---

# llm_models

The registry of LLM models selectable for the [NLQ chat](/concepts/nlq-chat.md).
`acts_as_tenant :household`; full CRUD via `LlmModelsController`. Unique per
`[household_id, provider, name]`. [chat_settings](/tables/chat_settings.md) points at
one of these rows.

## Schema

| Column | Meaning |
|---|---|
| `id` | Primary key. |
| `household_id` | Tenant scope. |
| `provider` | e.g. `ollama`, `anthropic`. Required. |
| `name` | Model identifier, e.g. `qwen3:14b`. Required. Unique with provider per household. |
| `display_name` | Optional UI label. |
| `url` | Endpoint the browser calls (e.g. the local Ollama server). Required; whitespace-stripped on save. |
| `input_token_cost`, `output_token_cost`, `cache_read_token_cost`, `cache_write_token_cost`, `thinking_token_cost` | **Cost rates in cents per *million* tokens** (`decimal(10,4)`). Snapshotted onto each [llm_usage_record](/tables/llm_usage_records.md) at write time. |
| `active` | Soft enable/disable. Default true. |
| `created_at` / `updated_at` | Timestamps. |

## The cost rates are forward-looking

The chat currently runs a **free local** model (Ollama), so there is no real spend.
The cost-rate columns exist for a **future hosted/paid provider**. In prod today the
configured model carries **dummy pricing that mimics Opus** — deliberately, so the
[usage records](/tables/llm_usage_records.md) show what costs *would* accrue if the
chat ran on a paid model. Treat any `total_cost` figure as **simulated**, not money
actually spent. See [NLQ chat](/concepts/nlq-chat.md).
