# Task: Build budget_vs_actual NLQ tool (#1) — or generalize the overspending tools to cover it

**ID:** build-budget_vs_actual-nlq-tool-1-or-generalize-the-overspending-tools-to-cover-it
**Status:** raw
**Autonomous:** false
**Priority:** high
**Captured:** 2026-06-15
**Parent:** none
**Depends on:** build-nlq-analysis-tools-out_of_budget_analysis-placeholder_allocation_analysis-sink_fund_status
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Next NLQ analysis tool after the #8/#9/#10 batch. Tool #1 `budget_vs_actual` from the inventory
(`notes/projects/everycent-nlq/everycent-nlq-tool-inventory.md` in the second brain).

**This task is NOT ready to build — it carries an unresolved design fork that must be decided first.**

### The design fork (resolve before building)

`budget_vs_actual` answers "How are we doing this month / quarter / year?" — budgeted vs actual + variance,
grouped at `total` | `category` | `allocation`. The question is whether it warrants a **dedicated tool** or
whether existing tools should be **generalized** to cover it:

- **`budget_accuracy` (#5, already built) is NOT a substitute.** It reports *prediction-quality* statistics
  (avg/median % off, % within 10%, over/under direction) — a meta-view of forecasting consistency. It does
  NOT return the raw budgeted/actual/variance numbers for "where do we stand right now."
- **The real overlap is with the overspending tools.** `analyze_overspending` already returns
  budgeted-vs-actual *filtered to the negative (over) side*. So a dedicated `budget_vs_actual`'s unique
  contribution over what exists is narrow: the **under** side, the symmetric both-directions view, and the
  `total` roll-up.

**Option A — dedicated `Mcp::BudgetVsActual` query object.** Clean separation, matches the inventory's
one-tool-per-question shape. Cost: a 3rd query object computing budgeted-vs-actual, overlapping SQL with the
overspending tools.

**Option B — generalize the overspending tools** to expose both over AND under sides + a total roll-up, so
`budget_vs_actual` falls out as a parameterization rather than a new tool. Cost: changes a live, tested tool's
contract (the LLM tool surface + `toolDefinitions.ts`); must not regress the existing overspending behaviour.

Decide via the Taskmaster/Oracle pass before this is dispatch-ready. Lean signal: if Option B keeps the
overspending tools coherent and avoids a near-duplicate query object, prefer it; if it bloats the overspending
tool contract or muddies its description, prefer A.

### Why it depends on the #8/#9/#10 batch

Soft coupling, not a hard code dependency: Option B would touch `app/models/mcp/overspending_analysis*.rb` and
the shared `Mcp::SpendingScope` concern — the exact files the #8/#9/#10 worker is modifying. Build this only
after that batch merges to avoid conflicts and to build on the (possibly evolved) SpendingScope surface.

### #1 spec (from the inventory note, for whichever option is chosen)

- **Params:** `start_month` (req), `end_month` (req), `group_by` = `total` | `category` | `allocation`
  (default `total`).
- **Output:** budgeted, actual, variance per group.
- **Bookkeeping gates** (encode in SQL, per the build-approach lessons): exclude Savings & Investments from
  "spending" totals (now `budget_role`, not category name — see the schema-reference sweep in
  `inbox/everycent-nlq-tool-inventory-build-approach-update.md`); flag 0.01-placeholder allocations (they show
  huge % overspend by design); exclude brought-forward transactions.
- Follow the established pattern: query object under `app/models/mcp/` + thin controller + route + model-first
  spec + frontend `toolDefinitions.ts`/`toolExecutor.ts`/`mcpToolApi.ts`, with `*_cents` + `*_display` on
  every money column.

---

## Acceptance Criteria

- [ ] Design fork resolved (Option A dedicated tool vs Option B generalize overspending) and the choice
      recorded in this task before any code is written.
- [ ] Implementation matches the chosen option; if Option B, the existing overspending tools' behaviour is
      preserved (no regression to their current outputs/descriptions).
- [ ] Bookkeeping gates encoded in the query layer (verified by specs): Savings & Investments excluded from
      spending totals via `budget_role`, placeholders flagged, brought-forward excluded.
- [ ] `*_cents` + `*_display` on every money column; invalid params → 400 `{ error }` body.
- [ ] Frontend tool def with response-shape-documenting description, wired through executor + api, with unit
      tests (100% coverage on new code).
- [ ] Pre-commit gates pass: `bundle exec rspec`, `npm run type-check`, `npm run test` (webclientv4/).

---

## Implementation Notes

- Sequenced to run after `build-nlq-analysis-tools-out_of_budget_analysis-placeholder_allocation_analysis-sink_fund_status` (depends-on).
- Needs a Taskmaster/Oracle refinement pass to resolve the fork before it can go ready+autonomous.
