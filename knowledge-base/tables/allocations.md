---
type: table
title: allocations
description: >-
  The core money-out unit of EveryCent. One budgeted outflow line per budget;
  where plan meets actual via transactions.allocation_id. Carries a four-way
  class, a category, and behavior flags (several dead/incomplete).
resource: everycent:table:allocations
tags: [table, core, zero-based, spending]
timestamp: 2026-06-17T00:00:00Z
---

# allocations

The **core money-out unit**. One row is one budgeted outflow line in a
[budget](/tables/budgets.md) — the zero-based unit of "this much money is
assigned to this purpose." Counterpart to [incomes](/tables/incomes.md), but
richer: it carries classification, behavior flags, and the link to actuals.

This is where **plan meets actual**: [transactions](/tables/budgets.md) point at
an allocation via `transactions.allocation_id`. The budgeted `amount` is compared
against the sum of categorized transactions.

The model declares `acts_as_tenant :household`.

> **Note:** the schema annotation comment on this model is **stale** — it omits
> `allocation_class`, `is_fixed_amount`, `is_cumulative`, and `special_event_id`.
> Trust the live database / this concept, not the annotation header.

## Schema

| Column | Meaning |
|---|---|
| `id` | Primary key. |
| `name` | Label. Free-form, but **carries structured meaning** — see [allocation naming conventions](/concepts/allocation-naming-conventions.md). |
| `amount` | Budgeted figure, integer [minor units](/concepts/money-units.md). |
| `budget_id` | The period this allocation belongs to. |
| `allocation_category_id` | Grouping bucket (food, household, transportation, …). Also seeds `allocation_class` — see below. → `allocation_categories` (not yet documented). |
| `allocation_class` | Four-way role classification. See below. |
| `is_fixed_amount` | **Live.** Marks allocations whose amount is externally fixed and cannot be tweaked (e.g. health insurance at 300) vs. variable ones (e.g. groceries). Powers a UI feature: filter to variable allocations and collapse/sum the fixed ones during budget setup. Default `false`. |
| `is_cumulative` | **Incomplete feature** — see [incomplete features](/tracking/incomplete-features.md) (I1). Exists but drives no behavior. Default `false`. |
| `special_event_id` | Optional link to a special event (FK present). To be documented at the `special_events` table. |
| `comment` | Free text. |
| `household_id` | Tenant scope. |
| `allocation_type` | **DEAD** — see [dead schema](/tracking/dead-schema.md) (D4). Referenced nowhere in the model. |
| `is_standing_order` | **DEAD** — Trinidad vestige (D2). |
| `bank_account_id` | **DEAD** — Trinidad vestige (D3). A `before_save` callback nulls it unless `is_standing_order?`, which (since standing orders are dead) now always nulls it. |
| `created_at` / `updated_at` | Timestamps. |

`name` is indexed — allocations are looked up by name (the canonical-name SQL
used for grouping annual-billing variants relies on it; see naming conventions).

## allocation_class (the role classification)

`ALLOCATION_CLASSES = [need, want, savings, bookkeeping]`. This is **not** a
simple need-vs-want axis — it is a four-way classification of **what role the
money assignment plays**:

- `need` / `want` — discretionary essentialness (need = essential, want =
  discretionary).
- `savings` — money assigned to saving.
- `bookkeeping` — **money movements that are not real spending** (e.g. transfers
  between accounts). This class exists primarily so the **NLQ / reporting layer
  can exclude internal money movement from genuine-expense analysis.**

**Derivation:** `allocation_class` is seeded from the category when left blank.
A `before_validation` hook maps `allocation_category.budget_role`:
`savings → savings`, `transfer → bookkeeping`, otherwise `want`. So **category
and class are coupled** — `allocation_categories.budget_role` has real budgeting
semantics, it is not just UI grouping. (Full treatment when
`allocation_categories` is documented.)

The name `allocation_class` is a [refactor candidate](/tracking/refactor-candidates.md) (R1).

### The 30-50-20 target is not modeled

There is an aspirational want/need/savings split target (roughly 50/30/20). **It
is not stored or enforced anywhere in data.** The one field that once attempted
percentage tracking — `allocation_categories.percentage` — is **dead** (see
[dead schema](/tracking/dead-schema.md), D5). An agent should treat the split as
a mental target, not something computable against a stored field.

## Spending semantics

Defined on the model:

- `spent = Σ(withdrawal_amount − deposit_amount)` over the allocation's
  transactions. **Net** — a deposit/refund reduces spend.
- `remaining = amount − spent`.

These are foundational for any "how am I tracking against this line" question.

> **Performance note:** `spent` sums in Ruby, not SQL, because summing in the DB
> triggers an N+1 (and `includes` does not resolve it). Flagged with a TODO in
> the model. See [bugs](/tracking/bugs.md) (B4).

### Placeholder allocations

Allocations budgeted at **≤ 10 cents** (`PLACEHOLDER_MAX_CENTS`) are
**placeholders**: the expense exists but is funded from sink funds, not this
month's income. Spending against them is **by design, not overspend**. Any
overspend calculation must exclude them (the model exposes
`non_placeholder_amount_sql`). Full detail:
[placeholder allocations](/concepts/placeholder-allocations.md).

## Bulk operations

The model supports batch upsert/delete via `update_from_params`,
`update_one_from_params`, and `mass_update` (used to set the same name + category
across many budgets at once, creating/updating/deleting allocations by amount).
Worth knowing when reasoning about how allocations get written.
