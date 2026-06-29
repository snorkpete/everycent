---
type: concept
title: Countable spend (the MCP spending filter)
term: countable-spend
definition: "The canonical filter the MCP analysis tools apply to decide which allocations and transactions count as real discretionary spend — spending-role only, non-placeholder, and (on the actuals side) excluding deposits, manual adjustments, and brought-forward rows."
lexicon: true
description: >-
  The exact Mcp::SpendingScope filters that decide what counts as real
  discretionary spend on both the budgeted side (spending-role, non-placeholder)
  and the actuals side (also excluding manual adjustments, deposits, and
  brought-forward rows), the tools that deliberately invert/extend them, and the
  wart that legacy Reports don't apply them — so figures can diverge.
tags: [domain, nlq, analysis]
timestamp: 2026-06-21T00:00:00Z
---

# Countable spend

The shared definition of "what counts as spend" used by the
[MCP analysis tools](/concepts/nlq-chat.md). It lives in code as
`Mcp::SpendingScope` (two SQL-fragment helpers) and answers a question the raw
schema can't: most rows in `transactions`/`allocations` are **not** real
discretionary spending, and every analysis tool must filter them out the same way.

## The two filters

**Budgeted side** (`budgeted_conditions`) — which allocations count:
- `allocation_categories.budget_role = 'spending'` — only spending-role categories
  (excludes transfer/savings/event/annual — see [budget-role analysis
  sections](/concepts/budget-role-analysis-sections.md)).
- **non-placeholder**: `amount > 10` cents — excludes [placeholder
  allocations](/concepts/placeholder-allocations.md) (sink-fund-funded lines budgeted
  at ~0).

**Actuals side** (`actual_conditions`) — which transactions count:
- `budget_role = 'spending'` and non-placeholder (as above).
- `is_manual_adjustment = false` — excludes the [balance-reconciliation
  row](/concepts/manual-balance-adjustment.md).
- `withdrawal_amount > 0` — **deposits/refunds don't count as spend**.
- `brought_forward_status IS NULL OR NOT IN ('added','adjustment')` — excludes the
  synthetic [brought-forward](/concepts/brought-forward.md) carry rows (would
  double-count).

## Inversions and add-ons

Some tools deliberately invert or extend this:
- **Out-of-budget analysis** targets `budget_role = 'transfer'` (the escape-valve
  spend) instead of `'spending'`.
- **Placeholder analysis** targets `amount <= 10` (placeholders are its subject).
- **Budget accuracy** adds a **€10 (1000-cent) noise floor** on top — that threshold
  is accuracy-tool-specific and lives in that query object, **not** in `SpendingScope`.

## Wart — the old Reports don't use this

The legacy [Reports](/concepts/reports.md) (`report.rb`: net worth, category
spending, needs-vs-wants) **sum raw transactions** and do **not** apply these
filters — no placeholder, brought-forward, manual-adjustment, or deposit exclusion.
So a number from a Report and the "same" number from an MCP tool can legitimately
**disagree**. When reconciling figures, check which layer produced them.

This filter is the in-code realization of the household's
[discretionary-money](/concepts/discretionary-money.md) bookkeeping conventions.
