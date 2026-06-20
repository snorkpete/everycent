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
| Q2 | Where are budget-close **balance checkpoints physically stored**? `bank_accounts` has singular `opening_balance`/`closing_balance`/`closing_date` that may be rewritten on close, or storage may live in an unexamined table. | Resolve when documenting `bank_accounts` and `transactions`. See [budget close](/concepts/budget-close-checkpointing.md). |
| Q3 | What was the problem the abandoned tables (`payees`, `recurring_*`) were meant to solve, and where was it solved instead? | Backfill when the table that actually solved it is documented. See [dead schema](/tracking/dead-schema.md). |
| Q4 | Do `(SF)` name markers and the ≤10-cent placeholder threshold always coincide, or are they independent signals of sink-fund funding? | Resolve when documenting `sink_fund_allocations`. See [placeholder allocations](/concepts/placeholder-allocations.md). |
