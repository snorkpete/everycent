---
type: tracking-register
title: Refactor candidates
description: >-
  Naming/structure improvements worth considering. Not defects — the system works
  as-is — but changes that would improve clarity, especially for agents.
tags: [tracking, refactor, naming]
timestamp: 2026-06-17T00:00:00Z
---

# Refactor candidates (R)

Improvements to consider. Not bugs — the system is correct as-is. These mostly
improve clarity for both humans and agents.

| ID | Item | Issue | Direction |
|---|---|---|---|
| R1 | `allocations.allocation_class` | The name is vague and `class` collides with a loaded programming term; the same "internal money movement, not spending" idea is also named inconsistently across axes (`transfer` as a `budget_role` vs. `bookkeeping` as an `allocation_class`). | The field is a four-way role classification (`need`/`want`/`savings`/`bookkeeping`), so a need-vs-want name like `necessity` does **not** fit. Candidates that house all four: `purpose`, `classification`, `role`. Separately, consider unifying `transfer`/`bookkeeping` on one term across both axes. Decide later. See [allocations](/tables/allocations.md). |
| R2 | Mass-edit "amount 0 = delete" | Mass-edit treats amount 0 as "remove this allocation from this budget," forcing the 0.01 escape hatch to keep near-zero allocations alive. Working but clunky. | Replace with an explicit per-budget delete; this would also retire the 0.01 placeholder workaround. See [placeholder allocations](/concepts/placeholder-allocations.md). |
| R3 | Dead transfer deadwood | `transfer_to_old` and `transaction_for_transfer_2` are dead. | Remove them. Note `Transfers` vs. sink-fund-internal reassignment are **different scopes**, not duplication — only the `_old`/`_2` methods are dead. |
| R4 | Dead sink-fund target-design code | `SinkFundAllocation` carries target-design methods (`target`, `target=`, `difference`, `spent`, `remaining`) and a disabled `check_sink_fund_allocation_balance_against_current_balance` validation, but there is **no `target` column** and envelopes are not goals. `amount` is near-vestigial (display-only, plus a UI "shortfall from target" readout). | Remove the dead methods and the disabled validation, and rip out the UI shortfall readout. See [sink fund accounts](/concepts/sink-fund.md). |
| R6 | Per-budget totals table | The budget-close checkpoint is a single rolling per-account balance (latest closed budget only), so UI totals for *past* budgets that rely on closing balance can be wrong — there is no per-budget stored total to restore them from. | A long-standing design idea is a per-budget totals table for retrospective balance/total correctness. No real-world trigger yet. See [budget close & balance checkpointing](/concepts/budget-close-checkpointing.md). |
