# Idea: Natural Language Querying (NLQ) for Everycent

**Captured:** 2026-03-26
**Last refined:** 2026-04-05
**Status:** raw

---

## Next Ideation

**Nail down the very first analyze-tool.** What single tool, answering which test-set question end-to-end, kicks off phase 1? This is the next oracle session on this idea.

---

## The Idea

A natural-language analysis layer over 12 years of everycent budgeting data (two countries, two life stages). User types a question in a Vue chat interface → LLM receives it via MCP → LLM calls analyze-shaped tools → LLM returns the answer.

This is the umbrella project. It subsumes the earlier `everycent-mcp-server` idea, which turned out to be an architectural component rather than a separate initiative.

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

---

## Phased Plan

### Phase 1: Foundations + MCP server (dogfooded via Claude Code)
- Google auth in place (parallel to existing devise; chat access gated behind Google-only). See `google-auth-migration`.
- Rails `/api/mcp/` endpoints — start with one analyze-tool end-to-end
- TypeScript MCP server wrapping those endpoints
- Tested via Claude Code as the MCP client — no UI yet
- Success criterion: answer a real question from the test set that I hadn't pre-built a report for

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

## Test Set (drives first tool design)

Real questions from my own budgeting life. The system works when it can answer ones I didn't pre-build:

1. What do we overspend on most? Where are our biggest budgeting failures?
2. Where is our budget lying to us consistently (budgeted vs actual patterns)?
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
- What is the very first analyze-tool? Probably something that answers one of the test-set questions end-to-end.
- TypeScript confirmed as MCP server language?
- How to structure the `/api/mcp/` Rails namespace — controllers, serializers, tool contracts.

**Phase 2:**
- Which agent SDK — Anthropic's directly, or something higher-level?
- Cost budgeting / usage caps — how to prevent runaway spend.

**Phase 3:**
- Which embedding model — OpenAI (simple, cheap at personal scale) vs self-hosted (privacy)?
- Acceptable to send transaction descriptions to OpenAI?
- Confidence threshold for vector search results — how to handle low-confidence matches?
- Could SQL + analyze-tools alone (no embeddings) already answer the full test set? If so, phase 3 is pure learning investment.

**Cross-cutting:**
- When does the MCP server get exposed to external MCP clients (Claude Code / Claude Desktop) as a product feature vs kept internal?
