---
type: concept
title: Auto-allocation (suggestion from the previous budget)
term: auto-allocation
definition: "Suggests an allocation for each imported transaction by matching its description against the previous budget's already-allocated transactions, then mapping to the same-named allocation in the current budget. The live answer to 'how do we tag transactions easily?'"
lexicon: true
tags: [domain, import, allocation]
timestamp: 2026-06-21T00:00:00Z
---

# Auto-allocation

The live mechanism for the recurring question **"how do we allocate (tag)
transactions to the right allocation with the least effort?"** When transactions
are imported (CAMT or manual copy-paste) into a budget, EveryCent suggests an
allocation for each one by looking at **how the same description was allocated in
the previous budget**.

This is description-based and **name-keyed** — it carries no payee entity. It is
the sibling of [copy budget](/concepts/copy-budget.md): both derive the current
budget from the previous one because months are nearly identical.

## Mechanism

`AutoAllocationSuggester` (`app/services/auto_allocation_suggester.rb`), exposed via
the `BudgetsController#auto_allocate` endpoint. The frontend posts the descriptions
being imported and gets back a parallel array of suggestions; it is a **suggestion
service, not an auto-writer** — nothing is persisted server-side, the UI applies
(or ignores) each suggestion. Triggered on import and via a manual "find matching
allocations from the previous budget" button.

Algorithm:

1. **Find the previous budget** — the latest budget with `start_date` before this
   one's.
2. **Load its allocated transactions** — within that budget's date range,
   `allocation_id` present, **excluding sink-fund accounts**.
3. **Two match passes** over each incoming description:
   - Pass 1 — **exact**, case-insensitive.
   - Pass 2 — **contains**, case-insensitive (previous description ≥ 3 chars and
     contained in the incoming one).
4. **Resolve** — collect the distinct allocation **names** of the matched prior
   transactions. If exactly **one** name, map it to the same-named allocation in the
   current budget and suggest that. **Ambiguous** (more than one allocation matched)
   or no match → no suggestion for that row.

## Why it depends on allocation-name consistency

Matching maps prior → current by **allocation name**, so it only works because names
stay stable across budgets. That stability is what [future
budgets](/concepts/future-budgets.md) (editing allocations by name across months)
and [copy budget](/concepts/copy-budget.md) (duplicating by name) produce. Name as
identity is load-bearing here — see [allocation naming
conventions](/concepts/allocation-naming-conventions.md).

## History — the abandoned v1 idea

The original (Trinidad-era) idea for easy tagging was the
[payees](/tables/payees.md) table: each payee carried a `default_allocation_name`,
so a transaction's description would resolve to a **payee entity**, which pointed at
a default allocation. It was never built out and didn't stick. The replacement
dropped the entity layer entirely — match the **description** against the previous
budget directly. (The same entity-free move was later repeated for
[payee-name](/concepts/payee-name.md), which cleans the description for NLQ rather
than for tagging.) The dead `payees` schema is registered in [dead
schema](/tracking/dead-schema.md).
