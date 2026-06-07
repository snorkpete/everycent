# Idea: Capture NLQ chat transcripts for later analysis/debugging

**Captured:** 2026-06-07
**Status:** raw

---

## The Idea

The EveryCent NLQ chat currently persists NOTHING — conversations render live in the session and are lost. This idea explores persisting chat transcripts so the agent's behaviour can be debugged after the fact, the way Kion manually copy-pasted his claude.ai history to see where the model drifted on a query.

Three separable pieces (nothing decided — still spitballing):

1. **Transcript persistence** — store NLQ conversations (turns, tool calls, tool results, token counts, thinking tokens) in the DB. Foundational; built from scratch since nothing is saved today.
2. **Auto-attach transcript to a chat-originated bug report** — when the bug-reporting tool fires mid-conversation, snapshot the current thread onto the bug report. Clean integration seam with the bug-reporting task (`add-bug-reporting-to-the-nlq-chat`). The transcript is the agent-debugging analog of attaching a bad transaction file.
3. **Analysis tooling over transcripts** — querying/reviewing past conversations to find drift/failure patterns. Fuzziest and least urgent; do not design yet.

---

## Why This Is Worth Doing

When the LLM picks the wrong tool, hallucinates a number, or misreads a query, the full turn record (user message -> tool calls -> tool results -> model output, with thinking tokens) is what lets you diagnose it. Today that record is thrown away, so debugging the agent means reproducing from memory. For a bug filed about a chat answer ("this spending total is wrong"), the exact transcript is the single most useful artifact — and capturing it automatically beats asking the user to reconstruct it.

---

## Open Questions / Things to Explore

- **What to capture:** just visible user/assistant messages, or full tool I/O (tool calls + results)? For agent-debugging the tool I/O is the part that actually matters — and the part most likely missing if we only log visible messages.
- **Data model:** one row per turn vs one row per conversation with serialized turns; how tool calls/results are structured.
- **Retention & PII:** transcripts contain financial data. How long to keep them, purge policy, whether retention mirrors the bug-attachment purge-on-fix rule.
- **Relationship to bug reporting:** shared infrastructure vs independent feature. Does transcript persistence ship as a prerequisite of bug reporting, or stand alone?
- **Scope of always-on vs on-demand:** persist every conversation, or only when a bug is filed / explicitly flagged? Always-on enables analysis (#3) but costs storage and widens PII surface.

---

Related: task `add-bug-reporting-to-the-nlq-chat` (auto-attach seam, piece #2).
