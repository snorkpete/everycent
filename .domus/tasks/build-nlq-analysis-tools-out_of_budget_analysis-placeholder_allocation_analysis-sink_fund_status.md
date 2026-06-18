# Task: Build NLQ analysis tools: out_of_budget_analysis, placeholder_allocation_analysis, sink_fund_status

**ID:** build-nlq-analysis-tools-out_of_budget_analysis-placeholder_allocation_analysis-sink_fund_status
**Status:** done
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-06-15
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Build three NLQ analysis tools from the 12-tool inventory as **one combined effort**, following the
established `Mcp::` query-object pattern:

- **#8 `out_of_budget_analysis`** — how much are we leaning on the escape valve (OOB category)?
- **#9 `placeholder_allocation_analysis`** — how much spending rides on saved money via 0.01 placeholders?
- **#10 `sink_fund_status`** — how healthy are reserves across the three sink-fund tiers?

These three are a thematic cluster (reliance on saved money + reserve health). #8 is the *category* view
and #9 is the *allocation-level* view of the **same mechanism** — build them together so the shared SQL is
coherent. This is also the 3rd/4th/5th consumer of the extracted `Mcp::SpendingScope` concern — if a fragment
needs to change to serve these, extract/adjust deliberately (note it in the PR), don't copy-paste a 6th time.

### MANDATORY reference reads before writing any code

1. `notes/projects/everycent-nlq/everycent-nlq-tool-inventory.md` in the second brain
   (`/Users/kion/code/second-brain/`) — the authoritative per-tool spec. Read entries **8, 9, 10** in full,
   plus the "Common Filters" and "Build Approach" sections.
2. `inbox/everycent-nlq-tool-inventory-build-approach-update.md` (same vault) — the build-approach lessons +
   the schema-reference sweep. **Critical:** the inventory note predates the `budget_role` migration, so its
   per-tool caveats still reference the **removed** `exclude_from_overspend_tracking` column and
   category-name matching. Translate per the sweep: `budget_role` semantics, not category names.
3. `project_bookkeeping-effects.md` (Claude project memory) — the bookkeeping-effects checklist. Treat it as
   a **build-time correctness gate per tool**: 0.01 placeholders, brought-forward transactions, excluded
   categories, sink-fund tiers, future-budget unreliability.

**Core lesson (do not skip):** encode all bookkeeping filters in the **SQL / query layer**, never in the
system prompt. The model is an unreliable rule-follower — it once ranked a 1¢-budgeted placeholder as the top
overspend despite the prompt saying not to. The tool must enforce correctness; the prompt only teaches concepts.

---

## Reference implementation (match these exactly)

The overspending + budget_accuracy tools are the canonical pattern. Read before building:

- Query object: `app/models/mcp/budget_accuracy.rb`, `app/models/mcp/overspending_analysis.rb`,
  `app/models/mcp/overspending_analysis_by_allocation.rb`
- Shared filters: `app/models/mcp/spending_scope.rb` (the `SpendingScope` concern — SQL-fragment helpers),
  `app/models/mcp/money.rb` (`Mcp::Money.display(cents)` for `*_display` strings)
- Controller: `app/controllers/mcp/budget_accuracy_controller.rb` (thin params→validate→render shell;
  household comes from `ActsAsTenant.current_tenant` via `Mcp::AppController`)
- Routes: `config/routes.rb` `namespace :mcp do … end` block
- Specs: `spec/models/mcp/budget_accuracy_spec.rb`, `spec/models/mcp/overspending_analysis_spec.rb`
  (model-first: unit-test the SQL behaviour, no HTTP)
- Frontend tool defs: `webclientv4/src/app/chat/toolDefinitions.ts`
- Frontend executor: `webclientv4/src/app/chat/toolExecutor.ts`
- Frontend API: `webclientv4/src/app/chat/mcpToolApi.ts` (routes through `apiGateway`)

### The file chain to touch PER TOOL

Backend:
1. `app/models/mcp/<tool>.rb` — query object: `ActiveModel::Validations`, param validation, SQL CTEs reusing
   `Mcp::SpendingScope` fragments, `.results` row mapping, `*_cents` (exact integer) **and** `*_display`
   (via `Mcp::Money.display`) on every money column.
2. `app/controllers/mcp/<tool>_controller.rb` — thin shell mirroring `BudgetAccuracyController`: build query
   from params, `render 400 { error: … }` when invalid (so the LLM can self-correct), else render results.
3. `config/routes.rb` — add the route inside `namespace :mcp`.
4. `spec/models/mcp/<tool>_spec.rb` — model-first spec covering the bookkeeping gates (placeholder handling,
   brought-forward exclusion, budget_role scoping, tenant scoping, param validation, reversed-range error).

Frontend:
5. `toolDefinitions.ts` — tool def. The **description must document response shape**: sort order, the natural
   filter field, what's excluded, and that `*_display` strings are pre-formatted (don't do math). This stopped
   the model reverse-engineering arithmetic on prior tools.
6. `toolExecutor.ts` — add a branch wiring tool name → `mcpToolApi` call.
7. `mcpToolApi.ts` — add the typed API method + params type.
8. Frontend unit tests for the new tool def / executor branch / api method (100% coverage on new code per
   `webclientv4/CLAUDE.md`).

---

## Per-tool spec + bookkeeping gates

> Confirm the exact `budget_role` enum values and sink-fund account/tier identifiers against the schema and
> seed/prod data before writing SQL — do not guess the string literals. The mappings below are the intent;
> verify the actual column values.

### #8 `out_of_budget_analysis` — the escape-valve / shock-absorber view
- **Subject:** the Out-of-Budget / Sink Fund Transfers category **and** the Over Budget Supplement category
  (same mechanism, different label). Per the schema sweep these are now non-`spending` budget_roles
  (likely `transfer` — **verify**), NOT matched by category name.
- **Params:** `start_month` (req), `end_month` (req), `group_by` = `month` | `allocation_name` |
  `calendar_month` (default `month`).
- **Output:** `month` → chronological OOB spend per budget period; `allocation_name` → recurring OOB items
  ranked by total; `calendar_month` → seasonality (which calendar months are worst on average).
- **Gates:** exclude brought-forward (`brought_forward_status IN ('added','adjustment')`). Scope to the OOB
  budget_role(s) — this is NOT a placeholder-exclusion tool; placeholders are irrelevant here because the
  subject is the OOB category itself. Feb is consistently worst (bonus → big LTSF transfers) — fine, just don't
  special-case it.

### #9 `placeholder_allocation_analysis` — the allocation-level mechanism view
- **Subject:** the 0.01 placeholder pattern itself. **This tool INVERTS the usual filter** — placeholders are
  the subject, so SELECT them rather than excluding them. A placeholder = allocation budgeted
  `BETWEEN 1 AND 10` cents. Use the single-sourced threshold `Allocation::PLACEHOLDER_MAX_CENTS = 10`
  (there is `Allocation.non_placeholder_amount_sql` — you want the **complement** of that condition; add a
  sibling helper if it reads cleaner, but keep the threshold single-sourced).
- **Params:** `start_month` (req), `end_month` (req).
- **Output:** count and % of allocations that are placeholders per month; total spending flowing through
  placeholders; top placeholder allocations ranked by spend.
- **Gates:** exclude brought-forward. Complements #8 (category view) — keep the two coherent.

### #10 `sink_fund_status` — reserve health (different shape from #8/#9)
- **Subject:** current state of **open** sink-fund allocations across the three tiers — Sink Fund Account
  (near-term), Long Term Sink Fund (months out), Emergency Fund (break-glass). This is a balances/reserve
  query, NOT a period-spending-filter query, so it shares less with `SpendingScope`.
- **Params:** `account` (optional — filter to one sink-fund account), `include_closed` (boolean, default `false`).
- **Output:** name, account (tier), target, funded, spent, remaining (all with `*_cents` + `*_display`).
- **Gates:** **flag negative `remaining` as overdrawn** (don't hide it). Default to open allocations only.

---

## Acceptance Criteria

- [ ] All three reference reads above completed; SQL filters encoded in the query layer (verified by specs),
      not deferred to the system prompt.
- [ ] `Mcp::OutOfBudgetAnalysis` query object + `Mcp::OutOfBudgetAnalysisController` + route + model-first spec.
- [ ] `Mcp::PlaceholderAllocationAnalysis` query object + controller + route + model-first spec — placeholders
      correctly treated as the **subject** (not excluded), threshold via `Allocation::PLACEHOLDER_MAX_CENTS`.
- [ ] `Mcp::SinkFundStatus` query object + controller + route + model-first spec — three tiers, negative
      `remaining` flagged.
- [ ] Every money column exposes both `*_cents` (integer) and `*_display` (via `Mcp::Money.display`).
- [ ] Invalid params (e.g. reversed month range, missing required) return a 400 `{ error: "<msg>" }` body so
      the LLM can self-correct — covered by specs.
- [ ] All three registered in `toolDefinitions.ts` with response-shape-documenting descriptions, wired through
      `toolExecutor.ts` and `mcpToolApi.ts`, with frontend unit tests (100% coverage on new code).
- [ ] `budget_role` / sink-fund-tier string literals verified against actual schema + data, not guessed.
- [ ] If a `SpendingScope` fragment needed changing for a new consumer, the change is deliberate and noted.
- [ ] Pre-commit gates pass: `bundle exec rspec`; `npm run type-check` + `npm run test` in `webclientv4/`.
      No suppression (`--no-verify`, `@ts-ignore`, `eslint-disable`, `!`) without explicit permission.

---

## Implementation Notes

- Build order: #8 then #9 (complementary, share the most SQL), then #10 (different shape). Stage for review
  between tools if dispatched interactively.
- Special-event backfill is **done** (the inventory note's "blocked" tag on tool #11 is stale) — not relevant
  to these three, just noting it so the worker doesn't trust the note's blocked tags.
- Run `senior-code-reviewer` on the Vue changes before commit (per project convention; dispatched workers
  often skip this — the human will run it post-dispatch if needed).
