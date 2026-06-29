---
type: concept
title: Copy Budget
term: copy-budget
definition: "Duplicate incomes and allocations into a new budget one month ahead. The primary mechanism for creating budgets — it replaced the never-built recurring allocations."
lexicon: true
description: >-
  Why copying a budget's incomes and allocations one month ahead became the
  standard budget-creation workflow — it emerged from months being nearly
  identical, replacing the never-built recurring allocations, and is the reason
  the 0.01 keep-alive hack exists.
doc_status: stub
tags: [domain, stub]
timestamp: 2026-06-20T00:00:00Z
---

# Copy Budget

> **Stub — restored from prior vocabulary notes; pending review against current code.**

## Context

**Replaced recurring allocations.** The original design intended [recurring allocations](/concepts/recurring-allocation.md)/incomes as templates for new budgets. But every month was nearly identical to the last, so copy budget emerged from practical need and became the standard workflow. The recurring allocations feature was never truly implemented — it's dead code.

Copy is the reason the 0.01 keep-alive hack exists — seasonal allocations need to survive in the copied budget even when they're not active that month.

## Contract

- Creates a new budget with start_date one month ahead of the source.
- Copies all incomes and allocations from the source budget.
- The new budget is created in `open` status.
