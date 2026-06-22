# Idea: Capture NLQ chat transcripts for later analysis/debugging

**Status:** implemented
**Captured:** 2026-06-07
**Status:** implemented

---

## The Idea

The EveryCent NLQ chat currently persists NOTHING about the conversation itself — turns render live in the session and are lost. This idea is to persist a record of how the model *reasoned*, so its behaviour can be reviewed retrospectively and used to tune the system prompt and/or tool definitions.

The origin: Kion noticed, while actively chatting, that the model took wrong turns that would make sense to correct — but that kind of analysis only works in the moment. There's no way to go back and inspect a past conversation's reasoning, because nothing is saved. Capturing it makes the analysis retrospective instead of opportunistic.

**This is purely a model-tuning concern — it is NOT bug-reporting evidence.** (An earlier draft framed an "auto-attach transcript to a bug report" seam; that conflated two separate things and has been removed. See `add-bug-reporting-to-the-nlq-chat` — related only in that both touch the chat, not in purpose.)

### What to capture (Kion's spec)

Keyed by the existing `conversation_id` (already generated when a new chat starts):

- **User prompts** — the raw input.
- **Thinking output** — *the most valuable signal.* This is where wrong turns show up.
- **Tool calls** — name + **params especially** (NOT results — see below).
- **Final output** — less important than thinking, but still valuable.

**Deliberately NOT captured: tool results.** For tuning *how the model decides*, what matters is the reasoning and the call it chose with what params; the result is a deterministic backend echo and isn't what you tune. (Narrow caveat: results would only help in the cents-as-dollars class of bug — the model misreading a *correct* result. Could be added later if that shows up; storage is trivial.)

**Distinct from existing tool-call logging.** There's already some tool-call logging for expense/cost tracking. This is a different purpose (reasoning analysis for prompt/tool tuning) and likely a different store.

---

## Why This Is Worth Doing

When the model picks the wrong tool or misreads a query, the thinking + the tool call it chose are what reveal *why*. Today that's thrown away, so prompt/tool-definition tuning relies on catching mistakes live. Persisting the record turns tuning into something you can do deliberately against real history — find the recurring wrong turns, fix the prompt or the tool definition, verify against past cases.

---

## Open Questions / Things to Explore

- **Always-on by definition.** For retrospective tuning to work it has to capture every conversation — on-demand defeats the purpose. So the real questions are retention and PII, not whether to always capture.
- **Retention & PII:** prompts and thinking will contain financial data. How long to keep, and what the purge policy is. (Unlike bug attachments, there's no natural "fixed" terminal state to hang a purge on — likely time-based.)
- **Data model:** one row per turn vs one row per conversation with serialized turns; how thinking and tool-call params are structured for later querying.
- **Relationship to existing tool-call/cost logging:** extend that store or stand up a separate one? Confirm what it already captures before duplicating.
- **How to actually review it:** raw DB rows, an export, or a small viewer. Lowest priority — don't design until there's data to look at.

---

Related: task `add-bug-reporting-to-the-nlq-chat`.

**Strong-benefit precursor to bug reporting (not a hard dependency).** Tuning the bug-report intake prompt needs a corpus of real bug-intake conversations to review retrospectively — the same retrospective-tuning argument this idea makes for NLQ, applied to bug-report mode. So prefer building chat persistence *first*. It remains tuning-only: the captured transcript is NOT bug-reporting evidence and is not auto-attached to bug reports (confirmed 2026-06-14 — debugging-evidence framing was considered and rejected; capture stays purely for prompt/tool tuning). The bug-reporting design as written does not depend on this.
