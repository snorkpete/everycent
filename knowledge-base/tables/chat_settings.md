---
type: table
title: chat_settings
term: chat-setting
definition: "Per-household singleton config for the NLQ chat: the enable flag, the selected LLM model, and the tool-iteration cap. Singleton by convention, not by DB constraint."
lexicon: true
description: >-
  One config row per household for the NLQ chat feature — chat_enabled, the
  selected llm_model_id, max_tool_iterations, and an extras jsonb. Read at the
  start of every chat turn.
resource: everycent:table:chat_settings
tags: [table, ai, chat]
timestamp: 2026-06-21T00:00:00Z
---

# chat_settings

Per-household configuration for the [NLQ chat](/concepts/nlq-chat.md).
`acts_as_tenant :household`; `belongs_to :llm_model, optional`.

**Singleton by convention, not by DB.** `ChatSetting.get_setting_record` returns the
first row or creates one; nothing enforces one row per household, so a second row
would simply be ignored. `update_settings` is the only write path.

## Schema

| Column | Meaning |
|---|---|
| `id` | Primary key. |
| `household_id` | Tenant scope. |
| `chat_enabled` | Master feature toggle. Default false. |
| `llm_model_id` | → the selected [llm_model](/tables/llm_models.md). **Optional in the DB**, but the chat refuses to run if it's null ("select a model in Chat Settings"). |
| `max_tool_iterations` | Caps the frontend agent's tool-call loop per turn. Default 5. |
| `extras` | `jsonb`, default `{}`. Forward extension hook. |
| `created_at` / `updated_at` | Timestamps. |

## History

Originally carried `ollama_url` and `ollama_model` directly. Migration
`20260524134615` **moved the endpoint URL into [llm_models](/tables/llm_models.md)**
and dropped both columns — the model registry now owns provider/url/name, and
chat_settings just points at a chosen model.
