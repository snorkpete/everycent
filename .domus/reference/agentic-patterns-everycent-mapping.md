# Agentic Patterns — Everycent Feature Mapping

How the three-category framework from the agentic architecture reference maps to planned Everycent LLM features.

See `.domus/reference/agentic-architecture-patterns.md` for the full framework.

---

## Hunter (Bug Reporting & Autonomous Fix Pipeline)

The hunter pipeline spans all three categories:

**Intake conversation (Category 3 — Hybrid):**
The chat interface is a workflow shell (greet -> extract steps -> check logs -> check DB -> form diagnosis -> create issue) with agent intelligence at each step (the LLM decides what questions to ask, what to look up, how to interpret answers). Bounded by: read-only DB access, household-scoped queries, no mutations, source code read-only.

**Taskmaster preparation (Category 1 — Deterministic Workflow):**
Taskmaster follows a defined process: read diagnosis -> identify gaps -> ask questions -> prepare task -> request approval. LLM adds intelligence within each step but the flow is fixed. This is prompt chaining with gates.

**Worker implementation (Category 2 — Autonomous Agent, wrapped in Category 3):**
Code changes are genuinely Category 2 (path unknown until runtime). But wrapping in a durable workflow shell with checkpoints (human approves plan, human reviews MR) makes it a bounded Category 2 inside a Category 3 shell. Matches the article's observation that "pure Category 2 in production is rare."

**Key design decisions from the framework:**
- Least agency principle: hunter gets read-only access, not write access
- Human-in-the-loop at every checkpoint, bypassable as trust increases
- Durable execution matters for the worker phase (don't re-run everything if a step fails)
- Token budgets and time limits on the intake conversation to prevent runaway costs

---

## Transaction Import (LLM-Assisted Upload)

**Category 1 — Deterministic Workflow.**

User provides raw data (copy-paste, file upload). The pipeline:
1. Parse input (LLM helps with format detection and field extraction)
2. Validate transactions (deterministic — dates, amounts, required fields)
3. Match to bank accounts (deterministic — IBAN matching)
4. Classify/categorize (LLM helps with fuzzy matching to allocation categories)
5. Preview for user confirmation (deterministic gate)
6. Save (deterministic)

LLM involvement is bounded to steps 1 and 4. Everything else is deterministic. This is **prompt chaining with gates** — the simplest workflow pattern.

**Key design decisions:**
- Never let LLM directly create transactions without user confirmation
- Format detection (step 1) should fall back gracefully if LLM can't parse
- Category matching (step 4) should present suggestions, not auto-assign
- Cost-predictable: fixed number of LLM calls per import (one for parsing, one for categorization)

---

## Natural Language Querying (NLQ)

**Category 3 — Hybrid.**

User asks a question in natural language. The pipeline:
1. Interpret intent (LLM — agent layer)
2. Generate structured query (LLM, bounded by known schema)
3. Execute query (deterministic — SQL against Postgres)
4. Format response (LLM for natural language, deterministic for charts/tables)
5. Present to user

The workflow shell is fixed (interpret -> query -> execute -> format -> present). The agent intelligence lives in steps 1-2 (understanding what the user wants) and step 4 (presenting it clearly).

**Key design decisions:**
- Generated SQL must be read-only (SELECT only, no mutations)
- Household-scoped automatically (acts_as_tenant)
- Schema provided to LLM as context, not discovered at runtime
- Validation gate between step 2 and 3: generated query must pass a SQL safety check
- Consider the **routing pattern**: classify query type (simple lookup vs. aggregation vs. comparison vs. trend analysis) and route to specialized handlers

---

## LLM Chat Interface (General)

**Category 3 — Hybrid.**

The chat interface is the shared surface for hunter, NLQ, and potentially transaction upload. It's a workflow shell that routes to specialized handlers.

**Architecture:**
- **Routing** at the top level: classify user intent (bug report, data query, transaction upload, general question)
- Each handler is its own workflow (Category 1 or 3 depending on the task)
- Chat maintains conversation state (memory) within a session
- All actions the LLM can take are defined and auditable — no open-ended tool access

**Key design decisions from the framework:**
- OWASP considerations: household-scoped data only, no cross-tenant access, validate all LLM-generated queries
- Agent Goal Hijack risk: user input could contain prompt injection. Validate outputs, don't trust LLM-generated SQL without safety checks.
- Tool access restrictions per handler: hunter gets source+DB read access, NLQ gets DB read access, upload gets transaction write access (with confirmation gate)

---

## General Principles for All Everycent LLM Features

1. **Start with Category 1.** Default to deterministic workflows. Add agent flexibility only where the task genuinely requires it.
2. **Least agency.** Every LLM feature gets the minimum access it needs. Read-only where possible. Human confirmation before any mutation.
3. **Household scoping is non-negotiable.** Every query, every tool call, every data access is scoped to the current household. No exceptions.
4. **Confirmation gates before side effects.** The LLM can suggest, classify, interpret, and format. It cannot create, update, or delete without explicit user confirmation.
5. **Cost predictability matters.** For a personal finance app, LLM costs must be bounded. Token budgets per interaction. Prefer Category 1 patterns (fixed number of LLM calls) over open-ended loops.
6. **Build the architecture first, add the LLM later.** The value is in the workflow design, validation gates, error handling, and security boundaries. The LLM integration is the easy part.
