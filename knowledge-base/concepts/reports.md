---
type: concept
title: Reports
term: reports
definition: "Backward-looking analysis: net worth over time, category spending (budget vs actual), needs vs wants. All retrospective."
lexicon: true
doc_status: stub
tags: [domain, stub]
timestamp: 2026-06-20T00:00:00Z
---

# Reports

> **Stub — restored from prior vocabulary notes; pending review against current code.**

## Context

All reports are retrospective — they analyze what happened to inform future decisions. Key reports:

- **Net worth** — cumulative money gained/lost over time. Shows the trend.
- **Category spending** — budget vs actual by [allocation category](/tables/allocation_categories.md) and period. Answers "am I spending what I planned?"
- **Needs vs wants** — income allocation breakdown by [allocation class](/concepts/allocation-class.md). Answers "is my spending in alignment?"

See also [budget-role analysis sections](/concepts/budget-role-analysis-sections.md).

## Contract

- Net worth: period, net_change, cumulative net_worth.
- Category spending: period, category_name, budgeted, spent, difference.
- Needs vs wants: budgeted and actual for each class (need/want/savings), with percentages.
