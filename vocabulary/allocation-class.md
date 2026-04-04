# Allocation Class

## Definition

Higher-level classification of an allocation: `need`, `want`, or `savings`. The mechanism for evaluating whether spending is "in alignment" with financial goals.

## Context

The foundational concept behind the needs-vs-wants report. A common alignment target is roughly 50% needs / 30% wants / 20% savings, but the real point is having the data to evaluate alignment at all.

**Underdeveloped.** This area hasn't been fleshed out enough in the system. There's an intention to put more emphasis on alignment tracking, but currently it's primarily a reporting classification with no enforcement or guidance features.

## Contract

- Values: `need`, `want`, `savings`.
- Set on allocations (via `allocation_class` field, defaults to `want`).
- Used by the needs-vs-wants report to calculate budgeted and actual percentages per class.
- No enforcement — purely informational/analytical.
