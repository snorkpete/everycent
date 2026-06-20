---
type: tracking-register
title: Open questions
description: >-
  Pending decisions and unresolved threads an agent should not silently resolve.
  Each names what's unknown and where it will be settled.
tags: [tracking, open-questions, pending]
timestamp: 2026-06-17T00:00:00Z
---

# Open questions (Q)

Unresolved threads. An agent should **not** assume a resolution; treat these as
explicitly undecided.

| ID | Question | Status / where it resolves |
|---|---|---|
| Q1 | Should `sessions` be household-scoped directly? It currently scopes transitively via `user_id` → `users.household_id`. Likely a gap, but an implementation reason might justify keeping it transitive. | Pending the in-progress **auth migration** (Google OAuth + session-based auth). Revisit when new auth lands. See [households](/tables/households.md). |
| Q2 | Where are budget-close **balance checkpoints physically stored**? `bank_accounts` has singular `opening_balance`/`closing_balance`/`closing_date` that may be rewritten on close, or storage may live in an unexamined table. | **Resolved.** It is the single rolling `bank_accounts.closing_balance`/`closing_date` — not per-budget history. See [budget close & balance checkpointing](/concepts/budget-close-checkpointing.md). Removable. |
| Q3 | What was the problem the abandoned tables (`payees`, `recurring_*`) were meant to solve, and where was it solved instead? | Backfill when the table that actually solved it is documented. See [dead schema](/tracking/dead-schema.md). |
| Q4 | Do `(SF)` name markers and the ≤10-cent placeholder threshold always coincide, or are they independent signals of sink-fund funding? | Resolve when documenting `sink_fund_allocations`. See [placeholder allocations](/concepts/placeholder-allocations.md). |
| Q5 | Why is `allocation_categories.name` unique per household (case-insensitive)? Possibly a UI concern or another technical reason; not remembered. | Pending. See [allocation_categories](/tables/allocation_categories.md). |
| Q6 | Should transactions tie to a budget via an explicit `budget_id` instead of the current date-range membership? Border-date transactions sometimes need date nudging; an explicit FK could simplify. The most consequential structural question so far. | Pending. See [transactions](/tables/transactions.md), [budget membership](/concepts/budget-membership.md). |
| Q7 | Confirm the sink-fund-internal reassignment mechanism (`apply/reverse_transactions_to_sink_fund_allocations` / `transfer_allocation`, the "single movement transaction" trick). | Resolve when documenting `sink_fund_allocations`. See [sink fund accounts](/concepts/sink-fund.md). |

**Resolved (removable):** Q2 (checkpoint storage — answered, see
[budget close & balance checkpointing](/concepts/budget-close-checkpointing.md)).
The earlier `allocation_id` = budget-membership promotion is **done** — now its
own concept, [budget membership](/concepts/budget-membership.md).
