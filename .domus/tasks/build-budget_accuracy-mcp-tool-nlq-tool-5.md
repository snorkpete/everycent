# Task: Build budget_accuracy MCP tool (NLQ tool 5)

**ID:** build-budget_accuracy-mcp-tool-nlq-tool-5
**Status:** done
**Branch:** task/build-budget_accuracy-mcp-tool-nlq-tool-5
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-06-07
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

NLQ currently exposes 4 MCP tools (`analyze_overspending`, `analyze_overspending_by_allocation`, `list_categories`, `ping`). This task adds **tool 5 — `budget_accuracy`**, answering *"What are we bad at predicting?"* by measuring how far actual spend diverges from the budgeted amount across a **range of months** (the existing overspending tools operate on a single month).

The work lands in **two commits**:

1. **Refactor** — extract a shared `Mcp::SpendingScope` filter module from the two existing overspending query objects (this is the 3rd consumer of the same filter fragments, so extract now). The existing tools switch to it with **no behavioural change**.
2. **Feature** — add `Mcp::BudgetAccuracy` + its full vertical slice (controller, route, frontend tool definition + executor wiring) + model-first specs.

### Core metric

For each (group, month) pair, **%-off** = `(actual − budgeted) / budgeted × 100`. Across the month range, each group yields a distribution of monthly %-off values. The tool reports **magnitude** (how far off, either direction) and **direction** (over/under) *separately*, because both are actionable ("allocate more here, less there"):

- **median absolute %-off** — typical miss size, robust to a single freak month (e.g. an annual premium landing in one month). **This is the primary sort key.**
- **avg absolute %-off** — mean miss size.
- **% of months within 10%** — a hit-rate.
- **direction** (over/under) — derived from the **signed** net deviation across the range.

Magnitude metrics use **absolute** %-off so that +30% and −30% months don't cancel to a misleading "0% = perfectly predicted".

---

## Acceptance Criteria

### Commit 1 — extract `Mcp::SpendingScope` (refactor, no behaviour change)

- [ ] New module `app/models/mcp/spending_scope.rb` exposing two SQL-fragment helpers:
  - `budgeted_conditions` — allocations side: `ac.budget_role = 'spending'` + `Allocation.non_placeholder_amount_sql('a.amount')`.
  - `actual_conditions` — transactions side: `t.is_manual_adjustment = false`, `t.withdrawal_amount > 0`, brought-forward exclusion (`t.brought_forward_status IS NULL OR t.brought_forward_status NOT IN ('added','adjustment')`), + the joined allocation's spending/non-placeholder filters.
- [ ] `Mcp::OverspendingAnalysis` and `Mcp::OverspendingAnalysisByAllocation` both refactored to consume `SpendingScope` instead of inlining these fragments.
- [ ] **Their existing specs pass unchanged** (`spec/models/mcp/overspending_analysis_spec.rb`, `overspending_analysis_by_allocation_spec.rb`, and the controller/request specs) — this is the proof of behavioural equivalence. Do **not** edit those specs.
- [ ] The €10 noise floor is **NOT** in `SpendingScope` — it is accuracy-tool-specific (see Commit 2).
- [ ] `canonical_name_sql` / `non_placeholder_amount_sql` stay on `Allocation` (genuine allocation-level concerns); only the *reporting* filter composition moves into `SpendingScope`.

### Commit 2 — `Mcp::BudgetAccuracy` + vertical slice + specs

**Query object** — `app/models/mcp/budget_accuracy.rb`:

- [ ] Params: `start_month`, `end_month` (both `YYYY-MM`), `group_by` (`allocation`|`category`, default `allocation`), `sort_by` (`pct_off`|`overspend_amount`|`underspend_amount`, default `pct_off`), `variable_only` (boolean, default `false`).
- [ ] `ActiveModel::Validations` with **helpful, model-recoverable error messages** (the LLM reads these to fix a bad call):
  - `start_month` / `end_month` each match `\A\d{4}-\d{2}\z`, message e.g. `"start_month must be in YYYY-MM format, e.g. 2024-03"`.
  - `end_month` must be `>=` `start_month`, message e.g. `"end_month (2024-01) must not be before start_month (2024-06)"`.
  - `group_by` / `sort_by` constrained to their allowed values (`inclusion`), message lists the valid values.
- [ ] Uses `Mcp::SpendingScope` for the budgeted/actual filters.
- [ ] `variable_only: true` restricts to allocations where `is_fixed_amount = false`.
- [ ] **€10 noise floor**: groups whose budgeted amount is `<= 1000` cents are excluded (accuracy on a €3 line item is meaningless).
- [ ] `group_by allocation` merges month-suffix variants via `Allocation.canonical_name_sql`; `group_by category` groups on `ac.name`.
- [ ] **Stats computed in SQL**: a CTE produces per-(group, month) signed and absolute %-off; the outer query aggregates per group — `percentile_cont(0.5)` over absolute %-off for median, `avg(...)` for mean, `count(*) filter (where abs_pct_off <= 10)` over `count(*)` for % within 10%, and a signed-net comparison for `direction`. Return finished numbers (no Ruby-side stats).
- [ ] Sort: `pct_off` → median absolute %-off DESC (worst-predicted first); `overspend_amount` / `underspend_amount` → by net signed deviation in the respective direction.
- [ ] Output per group includes: group label, `group_by` kind, months counted, median/avg abs %-off, % within 10%, direction, and the underlying budgeted/actual totals over the range (cents).

**Vertical-slice wiring** (follow `overspending_analysis_by_allocation` as the reference for every layer):

- [ ] Controller `app/controllers/mcp/budget_accuracy_controller.rb` — thin: build query, `valid?` guard rendering `query.errors.full_messages.to_sentence` at `:bad_request`, else render results with an `amount_unit: "cents (divide by 100 for currency display)"` note.
- [ ] Route in `config/routes.rb` under `namespace :mcp` — `get 'budget_accuracy', to: 'budget_accuracy#show'`.
- [ ] Tool definition in `webclientv4/src/app/chat/toolDefinitions.ts` — name `budget_accuracy`, description documents the response shape, the primary sort (worst-predicted first), the absolute-vs-signed split, and the exclusions (spending-role only, brought-forward + placeholders excluded, €10 floor).
- [ ] Executor mapping in `webclientv4/src/app/chat/toolExecutor.ts` — maps `budget_accuracy` → `GET /mcp/budget_accuracy` with all params as encoded query string; throws on missing required params and on non-2xx.

**Specs (model-first):**

- [ ] `spec/models/mcp/budget_accuracy_spec.rb` — unit-tests SQL behaviour: %-off computation, median vs avg, % within 10%, direction sign, €10 floor exclusion, `variable_only`, canonical-name merge, each `group_by` and `sort_by`, and validation failures (bad format, reversed range, bad enum).
- [ ] Controller/request spec characterizing the JSON envelope (success + `:bad_request` on invalid params).
- [ ] `webclientv4/src/app/chat/toolExecutor.spec.ts` — covers the new mapping (URL built correctly, params encoded, error paths). Mirror the existing `analyze_overspending_by_allocation` block.
- [ ] `toolDefinitions.spec.ts` updated if it asserts on the tool list/count.

### Whole-task gates

- [ ] `bundle exec rspec` green.
- [ ] `npm run type-check` and `npm run test` green (in `webclientv4/`).
- [ ] No error suppression (`@ts-ignore`, `eslint-disable`, `!`, `--no-verify`) — see project CLAUDE.md.

### Out of scope

- The remaining 7 structured tools and the `run_sql` free-form tool.
- Anything payee-dependent (the backfill workstream).
- Any change to overspending tool *behaviour* (Commit 1 is pure extraction).

---

## Implementation Notes

**Reference implementation:** `app/models/mcp/overspending_analysis_by_allocation.rb` + its controller (`app/controllers/mcp/overspending_analysis_by_allocation_controller.rb`) + spec (`spec/models/mcp/overspending_analysis_by_allocation_spec.rb`). The by-allocation tool already does the budgeted-vs-actual CTE join, `canonical_name_sql` merge, and the exact filter fragments being extracted — match its structure.

**Established conventions (from the existing query objects):**
- Household scoping via `ActsAsTenant.current_tenant.id` bound into the SQL (set by `Mcp::AppController`); never trust a param for it.
- Build SQL with heredoc + named bindings via `ActiveRecord::Base.sanitize_sql([sql, bindings])` then `exec_query`; map rows to symbol-keyed hashes, coercing cents with `.to_i`.
- All monetary values are **cents** — the controller envelope states the unit; do not divide in the query.
- Month filtering: `to_char(b.start_date, 'YYYY-MM')` for budgets, `to_char(t.transaction_date, 'YYYY-MM')` for transactions. For the range, use `BETWEEN :start_month AND :end_month` on these `to_char` expressions (lexicographic compare is correct for `YYYY-MM`).

**SpendingScope extraction shape (suggested):** plain module with class methods returning SQL-fragment strings, e.g. `Mcp::SpendingScope.budgeted_conditions(allocation_alias: 'a', category_alias: 'ac')` and `Mcp::SpendingScope.actual_conditions(txn_alias: 't', allocation_alias: 'a', category_alias: 'ac')`, so each query object interpolates them into its own CTE. Confirm the alias-passing approach reads cleanly against the two existing call sites before committing — if it gets awkward, a simpler fixed-alias contract is acceptable as long as both existing tools and the new one share it. Worker may use judgement on the exact signature; the **non-negotiable** is that all three query objects consume one shared definition and the existing specs stay green.

**%-off / stats CTE (sketch, worker to finalise):**
- Inner CTE: per (group, month), `budgeted_cents`, `actual_cents`, `signed_pct = (actual - budgeted)::numeric / budgeted * 100`, `abs_pct = abs(signed_pct)`. Apply the €10 floor here (`budgeted_cents > 1000`) and skip months with zero budget for a group (no division by zero).
- Outer: `GROUP BY group`, `percentile_cont(0.5) WITHIN GROUP (ORDER BY abs_pct)` = median, `avg(abs_pct)`, `count(*) FILTER (WHERE abs_pct <= 10)::numeric / count(*) * 100` = pct within 10, `sum(actual_cents - budgeted_cents)` → sign gives `direction`.
- Round %-off outputs to a sensible precision (e.g. 1 dp) in SQL.

**Full design rationale** lives in project memory `project_next-up.md` (the "build budget_accuracy" section) and the second-brain note `everycent-nlq-tool-inventory.md` — but everything needed to execute is in this file; the worker should not need them.

**Sequencing for the worker:** fresh worktree off **master** (do NOT touch the user's main worktree). Commit 1 = refactor (specs prove equivalence). Commit 2 = feature. Stop at a reviewable diff per commit per the worker-dispatch protocol — do not land or push.
