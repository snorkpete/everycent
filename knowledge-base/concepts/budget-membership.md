---
type: concept
title: Budget membership & the allocation_id invariant
description: >-
  A transaction's allocation_id presence is the system-wide marker of budget
  membership. A transaction carries allocation_id XOR sink_fund_allocation_id XOR
  neither — never both.
tags: [domain, invariant, transactions, reporting, nlq]
timestamp: 2026-06-17T00:00:00Z
---

# Budget membership & the allocation_id invariant

A **system-wide invariant**, reused across reporting, discretionary money, and
analysis sectioning. Promoted to its own concept because it underpins all of them.

## allocation_id = budget membership

For a [transaction](/tables/transactions.md):

- `allocation_id` **present** ⇒ the transaction is **part of the budget** and
  counts in allocation/spend reporting.
- `allocation_id` **absent** ⇒ the transaction is **not budget-related** and must
  **not** appear in allocation-based reporting.

This is how discretionary/personal money and pure account movements stay out of
spend analysis automatically — they simply never carry an `allocation_id`. See
[discretionary money & the budget gap](/concepts/discretionary-money.md).

## The three-way exclusivity rule

A transaction references **at most one** of two allocation axes:

```
allocation_id  XOR  sink_fund_allocation_id  XOR  neither
```

- `allocation_id` only → budgeted spend (in the monthly budget).
- `sink_fund_allocation_id` only → sink-fund-funded spend (outside the monthly
  budget; tracked against the sink fund). See [sink fund accounts](/concepts/sink-fund.md).
- neither → not budget-related (transfers out to personal accounts, discretionary
  spending, internal movements).

**Never both.** This is **not enforced at the data-model layer.** It is enforced:

- in the **transactions UI**, which shows either the allocation selector or the
  sink-fund selector based on the account — never both; and
- in the **transfer code path**, which explicitly rejects a leg carrying both.

So "both" is structurally possible in the schema but unreachable through normal
use. An agent should treat the XOR rule as a true invariant while knowing no DB
constraint guarantees it.

## Two complementary filters for the NLQ layer

- **`allocation_id` presence** — is this in the budget at all? (this concept)
- **`budget_role`** — for in-budget spend, which analysis section? See
  [budget-role analysis sections](/concepts/budget-role-analysis-sections.md).
