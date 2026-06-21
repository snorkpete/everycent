# Idea: First-class conversations table (parent of conversation_turns)

**Captured:** 2026-06-21
**Status:** raw

---

## The Idea

Add a `conversations` model/table as the parent of `conversation_turns`, completing the hierarchy `conversation → turns → steps`. Today `conversation_id` is just a browser-generated uuid grouping key with no home table; this would give it a first-class entity and a place for conversation-level metadata.

Surfaced during the chat-history-capture design (slices: chat-transcript-capture-*). **Decision this session: DEFER — do not build now.** Filed so it's not lost. User framing: "we'll see if it comes up as a thing."

---

## Why This Is Worth Doing (eventually)

- Completes the header/detail hierarchy already established (turn header + step detail) one level up.
- Gives `conversation_turns.conversation_id` a real FK target and a home for conversation-level metadata (title, summary, status).
- Natural home for a future "browse past conversations" feature.

## Why It Was Deferred (the case against building now)

- No conversation-level FACT exists today beyond `conversation_id` itself — a `conversations` table now would be a hollow grouping row: `(conversation_id, household_id, timestamps)` and nothing else, costing a JOIN + a find-or-create write per turn for zero payload. That's the same header-without-payload creep deliberately avoided on the turn table.
- Reconstruction/listing already works without it: `SELECT conversation_id, MIN(created_at), COUNT(*) FROM conversation_turns GROUP BY conversation_id` is fine at two-user volume.
- No integrity gap: `acts_as_tenant` already scopes household per turn.
- Deferral is cheap: adding it later is an `INSERT ... SELECT DISTINCT conversation_id FROM conversation_turns` backfill + FK — the same low-cost move as the `step_index` backfill.

---

## Revisit Triggers (build it when one appears)

- **Conversation title/summary** — e.g. a "name this chat" feature or auto-generated summaries.
- **Conversation status** — archived / pinned / cleared-vs-active state to model.
- **A "browse past conversations" list view** that outgrows the `GROUP BY` query (more data, richer per-conversation columns).

---
