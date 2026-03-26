# Idea: Natural Language Querying (NLQ) for Everycent

**Captured:** 2026-03-26
**Status:** raw

---

## The Idea

Enable users to query their personal finance data in plain English — e.g. "how many times have we gone over budget on food?" — without needing to know SQL, category names, or how the data is structured.

Three technologies, each doing what it does best:
- **LLM (via MCP)** — understands user intent and translates it into a query plan
- **pgvector** — resolves fuzzy natural language entity references ("food" → allocation IDs for "Groceries", "Supermarket", "Eating out")
- **SQL** — performs the actual aggregation, comparison, and arithmetic

Architecture: user types query → LLM receives via MCP → LLM generates query plan → pgvector resolves entities → SQL executes → answer returned.

The MCP server exposes Everycent's database as a set of tools the LLM can call. The LLM decides which tools to use and in what order based on the user's question.

**Key insight:** pgvector alone cannot answer natural language questions. It is a fuzzy entity resolver — it maps natural language terms to database rows. The LLM handles intent, SQL handles math. All three layers are required.

---

## Vector Field Design

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

---

## Embedding Strategy

- **At write time:** embed and store immediately for new records
- **Batch (historical):** embed in bulk off-peak. Rows without embeddings don't appear in semantic search until processed.
- **At query time:** always real-time — user's search string must be embedded on the fly

### Model options
| Option | Cost | Quality | Infra |
|---|---|---|---|
| OpenAI API | ~$0.02/million tokens | High | None |
| Self-hosted (Ollama + nomic-embed-text) | Electricity only | Good enough | Small VPS or local machine |

At personal-use scale, OpenAI API is pragmatic. Self-hosted if privacy becomes a concern.

---

## Example Query Walkthrough

**User asks:** "How many times have we gone over budget on food purchases?"

1. LLM receives the question via MCP
2. LLM identifies it needs to: (a) find food-related allocations, (b) compare actual spend vs budgeted amount, (c) count occurrences
3. **pgvector query** on `allocations.embedding` for "food purchases" → returns allocation IDs for "Groceries", "Supermarket", "Eating out"
4. **SQL query** sums `transactions.withdrawal_amount` grouped by budget period for those allocation IDs, compares to `allocations.amount`, counts periods where actual > budgeted
5. Answer: "You've gone over your food budget 4 times in the last 6 months."

**Key:** numbers in queries (e.g. "over food by 100 euro") are handled entirely by SQL (`WHERE actual - budgeted > 10000`). Never embedded.

---

## Implementation Steps

1. Enable `pgvector` extension in Postgres (`CREATE EXTENSION vector`)
2. Add `embedding vector(1536)` column to `transactions` and `allocations`
3. Add an embedding service (API wrapper around OpenAI or Ollama) callable from Rails
4. Add callbacks/jobs to generate embeddings on insert/update
5. Run batch job to embed existing records
6. Add vector search as a tool in the MCP server
7. Wire up LLM to use vector search + SQL tools to answer natural language queries

---

## Why This Is Worth Doing

Turns the budget data from a static record into something you can interrogate conversationally. The spending-analysis skill already does ad-hoc queries, but requires someone who understands the schema. NLQ removes that barrier entirely.

---

## Open Questions / Things to Explore

- Which embedding model to use — OpenAI (simple, cheap at personal scale) vs self-hosted (privacy)?
- Privacy posture: acceptable to send transaction descriptions to OpenAI?
- Which MCP-compatible client will be the primary interface?
- Confidence threshold for vector search results — how to handle low-confidence matches?
- How many distinct allocations/categories exist? Small set may not need vector search at all.
- Could this be prototyped with just the spending-analysis skill + smarter prompting before building full infrastructure?
