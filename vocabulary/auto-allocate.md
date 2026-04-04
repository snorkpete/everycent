# Auto-Allocate

## Definition

Given transaction descriptions, suggests which allocation they belong to by matching against the previous budget's transactions. Returns suggestions with match type (exact or contains).

## Context

Relies on allocation name-based identity — the previous budget's transactions are linked to allocations by name, and those names are assumed stable across budgets (enforced by the future budgets workflow).

Only looks at the previous budget's transactions — not further back. This keeps matching simple and relevant (last month's patterns are the best predictor).

## Contract

- Input: transaction descriptions.
- Output: suggestions with `allocation_name` and `match_type` (exact/contains).
- Scope: previous budget only.
- Depends on allocation name consistency across budgets.
