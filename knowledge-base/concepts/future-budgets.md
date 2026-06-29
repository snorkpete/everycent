---
type: concept
title: Future Budgets
term: future-budgets
definition: "Spreadsheet-like screen for editing allocations across all open budgets by name; where ~95% of budget editing happens. Enforces name consistency; home of the 0 = delete / 0.01 = keep-alive behavior."
lexicon: true
description: >-
  Why this spreadsheet-style screen (allocations as rows, budgets as columns) is
  where most budget editing happens, how editing by allocation name across all
  open budgets is what makes name-based allocation identity hold, and where the
  0 = delete / 0.01 = keep-alive workaround lives.
doc_status: stub
tags: [domain, stub]
timestamp: 2026-06-20T00:00:00Z
---

# Future Budgets

> **Stub — restored from prior vocabulary notes; pending review against current code.**

## Context

**Origin.** Built after observing spreadsheet-based planning of [allocations](/tables/allocations.md) across multiple months. The spreadsheet layout (allocations as rows, budgets as columns) turned out to be the natural way to think about budgets over time.

**Enforces allocation name consistency.** Because you edit by allocation name across budgets (not budget by budget), names naturally stay consistent. This is what makes name-based allocation identity work in practice.

**The 0 / 0.01 problem lives here.** Setting an allocation to 0 signals deletion. 0.01 is the keep-alive hack for seasonal allocations that need to survive across months ([placeholder allocations](/concepts/placeholder-allocations.md)). This is a UX workaround masking a missing "inactive but present" state.

## Contract

- Operates on all open budgets.
- Edits allocations by name across budgets.
- 0 = delete the allocation from that budget.
- 0.01 = keep the allocation alive without meaningful budget impact.
- Changes propagate through the copy chain (since [copy budget](/concepts/copy-budget.md) duplicates allocations by name).
