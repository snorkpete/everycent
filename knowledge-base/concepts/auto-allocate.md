---
type: concept
title: Auto-Allocate
term: auto-allocate
definition: "Suggests which allocation a transaction belongs to by matching its description against the previous budget's transactions. Match types: exact or contains."
lexicon: true
doc_status: stub
tags: [domain, stub]
timestamp: 2026-06-20T00:00:00Z
---

# Auto-Allocate

> **Stub — restored from prior vocabulary notes; pending review against current code.**

## Context

Relies on [allocation](/tables/allocations.md) name-based identity — the previous budget's transactions are linked to allocations by name, and those names are assumed stable across budgets (enforced by the [future budgets](/concepts/future-budgets.md) workflow).

Only looks at the previous budget's transactions — not further back. This keeps matching simple and relevant (last month's patterns are the best predictor).

## Contract

- Input: transaction descriptions.
- Output: suggestions with `allocation_name` and `match_type` (exact/contains).
- Scope: previous budget only.
- Depends on allocation name consistency across budgets.
