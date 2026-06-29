---
type: concept
title: Reports (net worth, category spending, needs-vs-wants)
term: reports
definition: "The three retrospective reports on the Reports screen, computed as raw SQL in report.rb. The older reporting layer — it does NOT apply the countable-spend filters the MCP tools do, so figures can diverge."
lexicon: true
description: >-
  How the three retrospective Reports-screen reports compute in raw SQL
  (report.rb) — net_worth as cumulative flow, category_spending per category,
  needs-vs-wants as the 50/30/20 split with wants-as-residual — and the warts a
  senior must know: they bypass countable-spend filters and the needs/wants
  split chronically drifts.
tags: [domain, reporting]
timestamp: 2026-06-21T00:00:00Z
---

# Reports

The three reports on the Reports screen, computed as raw SQL in `app/models/report.rb`
(`ReportsController` just routes to them). All are **retrospective** — they analyze what
happened. This is the **older reporting layer**.

> **Wart — these do NOT apply [countable-spend](/concepts/countable-spend.md)
> filters.** Each report sums **raw transactions** with no placeholder,
> brought-forward, manual-adjustment, or deposit exclusion. So a figure here can
> legitimately disagree with the "same" figure from an MCP analysis tool. Always note
> which layer produced a number before reconciling.

## net_worth

A **flow-based** view of how net worth changes over time — *not* a balance sheet (no
account balances involved). For each budget period (`to_char(end_date,'yyyy-mm')`) it
sums transaction net flow `deposit − withdrawal`, then takes a **cumulative running
sum** across periods. Output: `period`, `net_change`, `net_worth` (running total).

## category_spending

Per category per period: `budgeted = Σ allocation.amount`, `spent = Σ(withdrawal −
deposit)` over the allocation's transactions, `diff = budgeted − spent` (positive =
under budget). Deposits offset withdrawals (a refund reduces spend).

**Includes all `allocation_class` values** (need/want/savings/bookkeeping) — no class
filter, so savings/bookkeeping lines appear as "spending." Whether to filter is an open
product decision (domus task
`decide-whether-category_spending-report-should-filter-by-allocation_class`).

## needs-vs-wants

A visualization of the **50/30/20** split (needs / wants / savings) per period,
budgeted vs actual, as amounts and as percentages of income. See the unmodeled 50/30/20
target noted in [allocations](/tables/allocations.md) and
[allocation class](/concepts/allocation-class.md).

- **needs** and **savings** are summed from allocations by `allocation_class`
  (`'need'`, `'savings'`).
- **wants is a residual**: `income − needs − savings`. The report **ignores**
  `allocation_class = 'want'` entirely. Conceptually wants is spending, so it bottoms
  out at 0.

Two warts a senior should know:

1. **Wants-as-residual is a legacy artifact.** It predates `allocation_class` having
   defaults/backfill — when a missing class effectively meant "assume want." The field
   is now backfilled, so summing `'want'` directly is probably equivalent and simpler.
   Under investigation (domus task
   `simplify-needs_vs_wants-wants-computation-now-that-allocation_class-is-backfilled`).
2. **The report drifts and is chronically unreliable.** [Copy budget](/concepts/copy-budget.md)
   preserves an existing allocation's class, but **new** allocations default to
   `'want'`, and classes aren't consistently kept current. So the needs/wants/savings
   split drifts unless allocations are actively reclassified — a household-discipline
   dependency, not a system guarantee.
