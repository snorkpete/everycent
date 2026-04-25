# Task: add-chat-config-to-household

**ID:** add-chat-config-to-household
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-04-25
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Store Ollama URL, model name, and LLM settings per-household in the database instead of hardcoded constants in chatAgent.ts. Specific columns for known fields (ollama_url, ollama_model), jsonb for experimental extras. Needs: migration on households table, setup UI screen, Rails endpoint to serve config, frontend to read it on chat init.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
