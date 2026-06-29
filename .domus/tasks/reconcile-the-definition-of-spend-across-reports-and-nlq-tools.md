# Task: Reconcile the definition of 'spend' across reports and NLQ tools

**ID:** reconcile-the-definition-of-spend-across-reports-and-nlq-tools
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-28
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The word "spend" is overloaded across the codebase and the two definitions disagree — which can deceive when comparing report numbers against NLQ answers.

**Two taxonomies, two answers:**
- **NLQ tools** — `Mcp::SpendingScope` (`app/models/mcp/spending_scope.rb`) defines countable spend as `budget_role = 'spending'` (**savings excluded**) + hygiene exclusions: non-placeholder allocations, `is_manual_adjustment = false`, `withdrawal_amount > 0`, and brought-forward `added`/`adjustment` excluded. Used by `budget_accuracy`, `out_of_budget_analysis`, `overspending_analysis`, etc.
- **Reports** (`app/models/report.rb`):
  - `needs_vs_wants` — built on **`allocation_class`** (`'need'`/`'savings'`, **savings included**), with **no** hygiene exclusions.
  - `category_spending` — **no scope filter at all** (raw `withdrawal − deposit` per allocation; predates SpendingScope).
  - `net_worth` — intentionally sums *all* transactions both directions (balance/cash-flow, not spend).

**Consequence:** for spend-only surfaces, reports and NLQ tools return **different numbers for the same data** because the reports skip the countable-spend hygiene filters. `budget_role` (category-level) vs `allocation_class` (allocation-level) are different columns that also **disagree on savings**.

**Key nuance (do not "fix" the netting reports):** when a report sums across **all** transactions in both directions (`withdrawal − deposit`), deposits/refunds/reversals net out — so the hygiene filters only matter for **spend-only** views, not net-summing reports. Brought-forward (`added`/`adjustment`) and manual-adjustment entries are **designed to net off** in a both-directions sum, so summing reports (`needs_vs_wants`, `net_worth`) are correct **by design** and must be left as-is. The divergence specifically affects `category_spending` (spend-only, currently unfiltered), where there is no netting to cancel the bookkeeping entries.

**Reuse angle:** `Mcp::SpendingScope` exposes `budgeted_conditions` / `actual_conditions` SQL-fragment helpers, but they **weld** the `budget_role='spending'` gate and the txn-hygiene exclusions into one string. Consider **decomposing** into (a) reusable transaction-hygiene exclusions and (b) the budget_role gate, so report SQL can reuse the hygiene part independently of the role filter.

> Absorbs the former `decide-whether-category_spending-report-should-filter-by-allocation_class` task (cancelled, superseded) — the real question wasn't "filter by allocation_class" but "which canonical spend definition, and reuse it."

The KB already has a `countable-spend` concept — this task should make code match (or correct) that documented definition. **Capture-only; no work scheduled. Health-check category.**

---

## Acceptance Criteria

- [ ] One canonical "countable spend" definition documented (which columns/filters; reconcile `budget_role` vs `allocation_class`; settle the savings question) — aligned with the KB `countable-spend` concept.
- [ ] `category_spending` report aligned to that definition (reusing `Mcp::SpendingScope`, decomposed if needed).
- [ ] `needs_vs_wants` and `net_worth` left as-is (correct by design — both-directions sums net off BF/manual-adjustment entries).
- [ ] Reports and NLQ tools return consistent spend numbers for spend-only views.
- [ ] If KB `countable-spend` diverges from final code behaviour, KB updated to match.

---

## Implementation Notes

Health-check (internal consistency). Net-summing reports' behaviour is preserved; only spend-only surfaces change. The `Mcp::SpendingScope` decomposition is the likely first step if reports are to share the hygiene filters.
