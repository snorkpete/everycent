---
type: concept
title: Budget-role analysis sections
description: >-
  budget_role partitions transactions into analysis sections so the NLQ/reporting
  layer can include or exclude the right slices depending on the question.
  transfer = money movement, never spending; actual spend always lives in real
  allocations.
tags: [domain, nlq, reporting, analysis, categorization]
timestamp: 2026-06-17T00:00:00Z
---

# Budget-role analysis sections

`allocation_categories.budget_role` exists for one purpose: to **partition
transactions into analysis sections** so the NLQ / reporting layer can
include or exclude the right slices depending on the question being asked. It was
added specifically while building the data-extraction tools the model reads from.

This is the backbone of spending analysis. An agent doing reporting must respect
these sections or it will answer the wrong question.

## The sections

| Role | Include in… | Exclude from… |
|---|---|---|
| `spending` | everything (the baseline) | — |
| `annual_spending` | annual / total spend | **monthly** spend analysis (lumpy/periodic would distort a month) |
| `transfer` | nothing (it is **not spending**) | **all** spending analysis |
| `savings` | savings analysis | spend analysis (it's saving, not spending) |
| `event` | event analysis (per special event) | regular monthly spend |

The questions these enable, e.g.: "did we overspend on ordinary monthly things?"
(exclude `annual_spending`, `event`, `transfer`) vs. "what did this vacation
cost?" (the `event` section) vs. "total real spend this year" (include
`annual_spending`, still exclude `transfer`).

## Core invariant: transfer ≠ spending, and spend always lives in allocations

`transfer`-role categories carry **money movement only** — inflows and internal
transfers that *fund* things, never the spending itself. The actual spend always
flows through **normal allocations** in the monthly budget.

Worked example (this household): when the month runs over, the money moved **into**
the joint account to cover it goes through an overspend-top-up `transfer`
category; the things actually bought are still ordinary allocations (there's even
a permanent **miscellaneous** allocation for the random monthly stuff). So
"funding" and "spending" never mix in the data. See
[allocation_categories](/tables/allocation_categories.md) for the household-specific
`transfer` categories.

## Relationship to other filters

`budget_role` is one of **two complementary filters** the NLQ layer needs:

- **`allocation_id` presence** = is this transaction in the budget *at all*?
  (absent ⇒ not budget-related; excluded outright). See
  [discretionary money & the budget gap](/concepts/discretionary-money.md).
- **`budget_role`** = for in-budget spend, *which analysis section* does it
  belong to / get excluded from?

Both are needed: the first gates membership, the second sections what's left.

## Note: role vs. class

`budget_role` (analysis sectioning) is distinct from `allocation_class`
(need/want/savings, the older human axis). Role *seeds* a class default as a
convenience, but they serve different consumers. The `transfer`/`bookkeeping`
naming split for the same "internal movement" idea is a
[refactor candidate](/tracking/refactor-candidates.md) (R1).
