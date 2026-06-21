# Idea: Natural Language Querying (NLQ) for Everycent

**Captured:** 2026-03-26
**Last refined:** 2026-04-06
**Status:** scoped

---

## Next Ideation

~~**Nail down the very first analyze-tool.** — resolved 2026-04-06, see First Tool below.~~

**Next:** Refine into buildable tasks (taskmaster). Phase 1 scope is clear enough to start scoping work.

---

## The Idea

A natural-language analysis layer over 12 years of everycent budgeting data (two countries, two life stages). User types a question in a Vue chat interface → LLM receives it via MCP → LLM calls analyze-shaped tools → LLM returns the answer.

This is the umbrella project. It subsumes the earlier `everycent-mcp-server` idea, which turned out to be an architectural component rather than a separate initiative.

---

## ⚠️ Status / As-Built (2026-06-21) — read before trusting the Architecture section below

**SCOPED. Phases 1 & 2 are SHIPPED; the as-built architecture DIVERGED from the original plan; phase 3 and the production-hosting direction remain open.**

- **What's built:** ~12 MCP analysis tools (incl. the first tool, `analyze_overspending`); the Vue chat UI; the agent/tool-calling loop. Dogfooding via Claude Code (phase 1) and the in-app chat (phase 2) both work.
- **⚠️ Architecture pivoted — the "Architecture" and "Phased Plan" sections below are now STALE.** They describe a *TypeScript MCP server as a thin translation layer* + an *agent SDK* driving the loop. **Reality: NLQ is FRONTEND-DRIVEN. Ollama runs in the browser; the agent loop (tool-calling, multi-round iteration) lives in `webclientv4/src/app/chat/chatAgent.ts`; Rails is only stateless `/mcp/*` tool endpoints (query objects). There is NO backend MCP server / orchestrator / ChatController.** This pivot is coupled to the free-local-model decision (run a local Ollama model for free instead of pay-per-use API). Full as-built breakdown: second-brain `inbox/everycent-nlq-chat-architecture-as-built.md`.
- **Open threads:**
  - **Phase 3 (pgvector embeddings):** not built. Open question still stands — could SQL + analyze-tools alone answer the full test set, making phase 3 pure learning investment?
  - **Production architecture direction (reopened):** the in-browser-Ollama design is coupled to the free-local-model choice; whether production should be a TS service vs in-Rails (vs something else) is an explicitly reopened open question.
- **Live tasks spawned from this umbrella:** `build-budget_vs_actual-nlq-tool-1-or-generalize-the-overspending-tools-to-cover-it`, the `chat-transcript-capture-*` cluster, `add-cancelinterrupt-for-long-running-nlq-chat-requests`, `add-bug-reporting-to-the-nlq-chat`, `filterexclude-certain-allocation-categories-from-nlq-tools`, `harden-mcp-toolexecutor-*`.

---

## Why This Is Worth Doing

**Product value**
- 12 years of data is an LLM-shaped dataset: hard to extract value via pre-built reports, natural fit for reasoning
- Enables "where is everycent failing us?" analysis — surfaces product gaps that dashboards can't (budget structures that lie, missing annual support, under-used special events)
- Cross-context comparison (Trinidad vs Netherlands) is the kind of qualitative question SQL alone can't easily answer
- Non-technical user (wife) may actually use the power of the data via chat in a way the current UI doesn't unlock

**Personal/dev value — the primary driver**
- Develop product intuition for AI the way I have it for web. Open the black box.
- Concrete dogfooding of "how do you build AI into a product usefully" — not a toy project
- Learn what makes a good MCP tool (analysis-shaped, domain-aware) vs a bad one (CRUD wrapper that may as well be direct table access)

---

## Architecture

**Responsibility split:**
- **Rails `/api/mcp/` endpoints** — where the query logic lives. Analysis-shaped, not CRUD. Reuses Rails models, auth, testability. Separate namespace from UI-oriented endpoints.
- **MCP server** — thin translation layer. No business logic. No direct SQL. Likely TypeScript (Go ruled out once Go-specific learning was deprioritized).
- **MCP transport** — HTTP/SSE (required for Vue app embedding in phase 2).
- **Vue chat UI** — phase 2. Calls an agent SDK which in turn calls the MCP server.

**Anti-pattern explicitly ruled out:**
CRUD tools like `get_transactions(filters)`. If tools just expose tables in a fancier wrapper, they add no value beyond direct DB access. Tools must encode domain knowledge — e.g. `analyze_budget_variance(category, period)`, `find_structural_budget_gaps()`.

**Build principle:** thinnest end-to-end slice first — one tool, one endpoint, one working query — then expand based on actual usage.

### MCP Tools vs Resources

Mental model established during ideation (2026-04-06):

**Resources = the nouns.** Things that exist in the domain. The LLM reads them for context before making tool calls. Predictable shape, identified by URI. For everycent: allocation categories, budgets, bank accounts. A resource *can* be computed (e.g. `everycent://budgets/2025-03/summary`) — the test isn't "stored vs computed" but "is this a known thing with a predictable shape?"

**Tools = the verbs.** Analysis operations the LLM invokes with parameters. The consumer drives what gets computed. For everycent: overspending analysis, pattern detection, comparisons.

**The key distinction:** a resource answers "show me this thing." A tool answers "find me something interesting." Resources are lookups, tools are discovery. Discovery is the whole point of NLQ.

**Example:** `everycent://budgets/2025-03/overspend` is a valid resource (overspend for a known budget). But `analyze_overspending(period, threshold, group_by)` as a tool lets the LLM figure out *which* budgets are interesting as part of answering the question. The tool unlocks far more flexibility.

---

## Phased Plan

### Phase 1: Foundations + MCP server (dogfooded via Claude Code)
- Google auth in place (parallel to existing devise; chat access gated behind Google-only). See `google-auth-migration`.
- Rails `/api/mcp/` endpoints — start with one analyze-tool end-to-end
- TypeScript MCP server wrapping those endpoints
- MCP server configurable to target production, staging, or local DB
- Tested via Claude Code (or Codex) as the MCP client — no UI yet
- Success criterion: ask "what do we overspend on?" via Claude Code and get a useful, accurate answer from the MCP server

### Phase 2: Chat UI inside everycent
- Vue chat component, agent SDK integration (calls LLM, handles tool-calling loop)
- Gated behind Google auth (cost control — pay-per-use LLM)
- Exposes the same MCP server built in phase 1

### Phase 3: Embeddings layer (learning-driven, possibly overkill)
- pgvector column on transactions + allocations for semantic entity resolution
- Batch embed historical data, real-time embed new records + query strings
- Add vector search as an MCP tool
- Justified by learning even if SQL + LLM reasoning could handle most queries without it

---

## First Tool: Overspending Analysis

**Decided 2026-04-06.** This is the first tool to build end-to-end in phase 1.

### What it does
Compares budgeted vs actual spending per category, across time, with flexible parameters. One tool that answers multiple questions depending on how the LLM calls it:

- "What do we overspend on most?" → all categories, all time, no threshold
- "What did we overspend on in 2024?" → all categories, 2024, no threshold
- "Which months do we overspend on groceries?" → one category, all time, group by month
- "Where do we overspend by more than €50?" → all categories, all time, threshold 50

### Parameters (indicative, not final)
- `period` — date range or year (optional, defaults to all time)
- `category` — filter to specific category (optional, defaults to all)
- `threshold` — minimum overspend amount to include (optional)
- `group_by` — how to aggregate: by category, by month, by year (optional)

### Resources it needs
The LLM needs domain context to call this tool intelligently:
- **Allocation categories** — what categories exist, so the LLM can map user language to category names
- **Budgets** — what budget periods exist, date ranges, so the LLM can resolve "last year" or "since we moved to NL"

### Domain logic encoded (not just SQL)
- "Overspending" = actual transaction total > budgeted allocation amount
- Excludes manual adjustments
- Aggregates across multiple allocations within a category
- Structural categories (Over Budget Supplement, Sink Fund Transfers) excluded — they're mechanisms, not spending

### Validated against real data
Ran the overspending analysis ad-hoc (2026-04-06) using the spending-analysis skill. Key findings that confirm the tool is useful:
- **Household Purchases**: over budget by €50-68/mo for 6+ years — budget has never been realistic
- **Food - Groceries**: variance growing (€24/mo in 2018 → €138/mo in 2025)
- **Recreation**: most volatile, sometimes 2-3x budget — possibly better served by sink funds
- **Visitors**: actual is consistently 2-3x budgeted when active

These are exactly the kind of insights NLQ should surface.

---

## Test Set (drives tool design beyond the first)

Real questions from my own budgeting life. The system works when it can answer ones I didn't pre-build:

1. ~~What do we overspend on most? Where are our biggest budgeting failures?~~ → **first tool**
2. Where is our budget lying to us consistently (budgeted vs actual patterns)? → **first tool covers this**
3. Any annual patterns we aren't properly catering for? (monthly model has gaps)
4. Which months do we regularly go over?
5. How much do vacations typically cost us? Are we missing special events we should have logged?
6. What have we learnt comparing Trinidad (previous household) vs Netherlands (current)?

Several of these aren't "reports" — they're product critique. The chat doubles as a tool for surfacing gaps in everycent itself.

---

## Vector Field Design (phase 3)

### `transactions.embedding` (vector)
Built from concatenated string at insert/update time:
```
"[description] | [payee_name] | [allocation_name] | [allocation_category]"
```
- `payee_name` included when present, omitted when null
- `allocation_name` and `allocation_category` require a join at embed time but carry the richest signal
- Amounts, dates, status fields are NOT included — handled by SQL, not semantic search

### `allocations.embedding` (vector)
Built from:
```
"[name] | [allocation_type] | [allocation_class] | [allocation_category]"
```
Purpose: find budget line items by meaning — e.g. "food budget", "entertainment", "fixed costs"

## Embedding Strategy (phase 3)

- **At write time:** embed and store immediately for new records
- **Batch (historical):** embed in bulk off-peak. Rows without embeddings don't appear in semantic search until processed.
- **At query time:** always real-time — user's search string must be embedded on the fly

### Model options
| Option | Cost | Quality | Infra |
|---|---|---|---|
| OpenAI API | ~$0.02/million tokens | High | None |
| Self-hosted (Ollama + nomic-embed-text) | Electricity only | Good enough | Small VPS or local machine |

At personal-use scale, OpenAI API is pragmatic. Self-hosted if privacy becomes a concern.

## Example Query Walkthrough (phase 3)

**User asks:** "How many times have we gone over budget on food purchases?"

1. LLM receives the question via MCP
2. LLM identifies it needs to: (a) find food-related allocations, (b) compare actual spend vs budgeted amount, (c) count occurrences
3. **pgvector query** on `allocations.embedding` for "food purchases" → returns allocation IDs for "Groceries", "Supermarket", "Eating out"
4. **SQL query** sums `transactions.withdrawal_amount` grouped by budget period for those allocation IDs, compares to `allocations.amount`, counts periods where actual > budgeted
5. Answer: "You've gone over your food budget 4 times in the last 6 months."

**Key:** numbers in queries (e.g. "over food by 100 euro") are handled entirely by SQL (`WHERE actual - budgeted > 10000`). Never embedded.

---

## Open Questions / Things to Explore

**Phase 1 (first up):**
- ~~What is the very first analyze-tool?~~ → resolved: overspending analysis
- TypeScript confirmed as MCP server language?
- How to structure the `/api/mcp/` Rails namespace — controllers, serializers, tool contracts.
- How does the MCP server config for prod/staging/local work? Does it point at different Rails instances, or does the Rails app itself switch DBs?

**Phase 2:**
- Which agent SDK — Anthropic's directly, or something higher-level?
- Cost budgeting / usage caps — how to prevent runaway spend.

**Phase 3:**
- Which embedding model — OpenAI (simple, cheap at personal scale) vs self-hosted (privacy)?
- Acceptable to send transaction descriptions to OpenAI?
- Confidence threshold for vector search results — how to handle low-confidence matches?
- Could SQL + analyze-tools alone (no embeddings) already answer the full test set? If so, phase 3 is pure learning investment.

**Design artifacts:**
- MCP server API needs a **spec** — tool signatures, resource URIs, parameter contracts, response shapes. First time in the project needing a spec (migration work didn't need one because the system was already understood). Use the overspend tool as the trial spec before formalising a format.
- Tool responses should return raw numbers (budgeted, actual, variance) — the LLM interprets meaning from field names. Tool description must explain domain terms (budgeted = allocation amount, actual = sum of withdrawals excluding manual adjustments).
- Underspend / overbudgeting is the same tool — negative variance. LLM figures this out without a separate definition.

**Cost optimisation (phase 2+):**
Three levers that interact: (1) model quality — cheaper models need more hand-holding, (2) context volume — more context costs more per call but reduces errors, (3) reliability tolerance — 95% correct is dramatically cheaper than 99.9%. A cheaper model with tight, well-designed context can outperform an expensive model with sloppy context. The spec work pays off here — it's the foundation for cost optimisation. Start with the best model, get it working, then tune.

**Cross-cutting:**
- When does the MCP server get exposed to external MCP clients (Claude Code / Claude Desktop) as a product feature vs kept internal?
