---
type: table
title: incomes
term: income
definition: "Money coming into a budget — a named source with an amount, optionally linked to a bank account. A planning declaration only."
lexicon: true
description: >-
  Plan-only inflow lines, one set per budget. Declares expected income that
  allocations budget against. Not linked to actual deposit transactions.
resource: everycent:table:incomes
tags: [table, core, zero-based, plan]
timestamp: 2026-06-17T00:00:00Z
---

# incomes

The **money-in side** of a budget period. Each row is one expected income line
for one [budget](/tables/budgets.md). Where [allocations](/tables/allocations.md)
assign money *out*, incomes declare the money *coming in* that those allocations
budget against. Total income is the pool allocations draw from — but allocations
do **not** fully consume it. The remainder is discretionary money; see
[discretionary money & the budget gap](/concepts/discretionary-money.md).

## Schema

| Column | Meaning |
|---|---|
| `id` | Primary key. |
| `name` | Free-form, **user-controlled** label (contrast with the system-controlled budget name). |
| `amount` | Planned/expected income, integer [minor units](/concepts/money-units.md). |
| `budget_id` | The period this income belongs to. Makes income per-budget, not a standing fact. |
| `comment` | Free text. |
| `household_id` | Tenant scope. |
| `bank_account_id` | **DEAD.** Trinidad-era vestige, unused in the current household. See [dead schema](/tracking/dead-schema.md) (D1) and [Trinidad banking model](/legacy/trinidad-banking-model.md). |
| `created_at` / `updated_at` | Timestamps. |

## Plan-only: no linkage to actuals

**Income is a planning declaration only.** `incomes.amount` is the *planned*
figure. Actual income arrives as a [transaction](/tables/transactions.md) with a
`deposit_amount`. **There is no row-to-row matching** between an income line and
the deposit(s) that fulfill it — there is no `income_id` on transactions. Any
plan-vs-actual comparison is done at the **aggregate** level.

The features that help check actual income against the plan are **UI-only** and
carry only UI-level risks; they are not part of the data model. (To be covered
when the frontend layer is documented.)
