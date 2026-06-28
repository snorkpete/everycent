# Task: Align NLQ MCP server and chat app tool contracts

**ID:** align-nlq-mcp-server-and-chat-app-tool-contracts
**Status:** deferred
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-28
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The everycent NLQ MCP server and the in-app web chat both proxy the same Rails `/mcp/*` endpoints but hand-maintain their tool schemas separately (zod/MCP vs OpenAI-function format), and the NLQ side has no domain system prompt. Decide how to tie the two together so the tool contract and domain framing stop being duplicated, then implement.

**This task has a DECISION component that must be resolved before/within implementation** — see "Design discussion (to resolve)" below. Do not jump straight to coding; the contract-binding approach (Option A vs B vs hybrid) must be settled and recorded first.

### Background — current architecture (verified by reading the code)

Both LLM features are thin clients over the SAME Rails backend logic. Budget/overspend math is a single source of truth in Rails — NOT duplicated:
- Overspending calc: `app/models/mcp/overspending_analysis.rb:17-75`
- Scope rules (spending role, placeholder/brought-forward exclusions): `app/models/mcp/spending_scope.rb:19-36`
- Placeholder threshold `PLACEHOLDER_MAX_CENTS = 10`: `app/models/allocation.rb:24`
- Money formatting: `app/models/mcp/money.rb:11-17`

**NLQ MCP server** (`nlq/`):
- Entry `src/stdio.ts`; server `src/server.ts` (McpServer "everycent-nlq"); tool reg `src/tools/analyzeOverspending.ts:27-59` calls `rails.get("/mcp/overspending_analysis")`.
- Exposes only 1 tool: `analyze_overspending`. Uses `@modelcontextprotocol/sdk` + zod. Schema hand-written at `src/tools/analyzeOverspending.ts:5-18`.
- Has NO system prompt / domain framing.
- Registered in Claude Code at user scope, stdio transport, env `RAILS_API_URL=http://localhost:3000`.

**Chat app** (`webclientv4/src/app/chat/`):
- LLM via Ollama/OpenAI-compatible API (NOT Anthropic); model configured per-household via `LlmModel` record (`app/models/chat_setting.rb`).
- Exposes 4 tools in `toolDefinitions.ts:1-92`: analyze_overspending, analyze_overspending_by_allocation, list_categories, budget_accuracy.
- Tool execution `toolExecutor.ts` fetches the same Rails `/mcp/*` endpoints.
- Has a rich `systemPrompt.ts:1-45` with domain rules (budget_role exclusions, placeholder semantics, brought-forward CC rules).

### The duplication (three distinct things)
1. **Tool set divergence** — NLQ exposes 1 of 4 tools (just incomplete, not true dup).
2. **Tool schemas** — name+description+params hand-written twice in two formats (zod/MCP vs OpenAI-function).
3. **Domain framing** — chat has `systemPrompt.ts`; NLQ has nothing.

Insight: a tool contract is just `name + description + params(JSON Schema)`. MCP registration and OpenAI function-calling are two wrappers around the same three fields, so one declaration can drive both via thin adapters.

---

## Design discussion (to resolve)

This is the decision part of the task — settle and record before implementing.

- **Option A — shared TS module:** both clients are TS; extract the 4 tool contracts + domain-guidance text into one TS module both `nlq/` and `webclientv4/` import and render to native format. Lowest friction, no new endpoint. Cost: contract lives in TS while logic lives in Ruby (co-declared, not co-located); only works because both clients are TS.
- **Option B — Rails-served manifest:** add `GET /mcp/manifest` returning `[{name, description, params, guidance}]`; both clients fetch + render. Contract sits next to the logic, language-neutral, drift structurally impossible. Cost: more infra. Note: adds NO new coupling since NLQ already needs Rails at runtime and chat already fetches settings from Rails. Deeper variant: generate schemas from Rails routes+strong-params (max dedup, max coupling — probably too far).
- **System-prompt asymmetry (can't fully dedup):** chat owns its system prompt; MCP host (Claude Code) owns its own — a server can only offer the `instructions` field on initialize, MCP prompt primitives, or fold rules into tool descriptions. So you can centralize the *source text* of domain guidance but not the injection mechanism. Design the contract so guidance is one blob: chat uses it as system prompt, NLQ as `instructions` + description seeding.

### Recommended sequencing (current lean, not final)
1. Close divergence first: bring NLQ up to all 4 tools + copy domain text into MCP `instructions`. Removes the "different capabilities" risk — the main concern.
2. Then extract a shared contract — start with Option A (shared TS module) since both clients are TS.
3. Promote to Option B (Rails manifest) only if a third/non-TS client appears or tool count grows enough that regenerate-on-change stops being trivial.

Caveat to weigh: only 4 tools today — a manifest is real machinery for a one-screen contract; watch for over-engineering.

---

## Acceptance Criteria

- [ ] A decision is recorded on how the contract is tied together (Option A vs B vs hybrid/sequenced), with rationale.
- [ ] NLQ and chat expose the same tool set (NLQ brought up to parity, or an explicit reason it shouldn't be).
- [ ] Tool schemas have a single authoritative source; neither client hand-maintains a divergent copy.
- [ ] Domain/system-prompt guidance has a single source text, rendered appropriately on both sides (chat system prompt; MCP instructions + tool descriptions).
- [ ] Decision + rationale captured in the second brain (everycent project notes) once resolved.

---

## Implementation Notes

_Remove if empty._
