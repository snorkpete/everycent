---
type: table
title: allocation_categories
term: allocation-category
definition: "Label that groups allocations. Unique per household, shared across all budgets."
lexicon: true
description: >-
  Household-scoped grouping buckets for allocations (food, household, transport,
  …). Carries two orthogonal axes: budget_role (newer, drives NLQ analysis
  sectioning and seeds class) and the seeded allocation_class default.
resource: everycent:table:allocation_categories
tags: [table, core, categorization, nlq]
timestamp: 2026-06-17T00:00:00Z
---

# allocation_categories

The grouping buckets that [allocations](/tables/allocations.md) are filed under —
household-defined labels like food, household, transportation. A dimension/lookup
table, but one field (`budget_role`) carries real analysis semantics.

Each [allocation](/tables/allocations.md) belongs to exactly one category
(`Allocation belongs_to :allocation_category`, required). The model declares
`acts_as_tenant :household`.

> The model's schema-annotation comment is **stale** — it omits `budget_role`
> (present in `schema.rb` as `default: "spending", null: false`). Trust the live
> DB / this concept.

## Schema

| Column | Meaning |
|---|---|
| `id` | Primary key. |
| `name` | Bucket label. **Required**, and **unique per household** (case-insensitive). Why unique is an [open question](/tracking/open-questions.md) (Q5). |
| `budget_role` | Analysis/role tag. `default: "spending"`, not null. Five values — see below. Drives NLQ analysis sectioning and seeds `allocation_class`. |
| `household_id` | Tenant scope. Categories are per-household. |
| `percentage` | **DEAD (D5)** — abandoned percentage-tracking attempt. Model never reads it. |
| `created_at` / `updated_at` | Timestamps. |

## The two axes (don't confuse them)

A category influences allocations along **two orthogonal axes** that exist for
**different reasons**:

### 1. `allocation_class` (older, human/discretionary)

`need` / `want` / `savings` / `bookkeeping`, defined on
[allocations](/tables/allocations.md). User-owned and **editable in the UI**. The
category's `budget_role` only **seeds a default** when class is blank; the user is
expected to set the right value. `need` is never produced by seeding — it only
arrives by manual choice. Some minor reporting predates the NLQ layer.

### 2. `budget_role` (newer, for the NLQ layer)

`BUDGET_ROLES = [spending, annual_spending, transfer, savings, event]`.

Added specifically to build the NLQ data-extraction tools: it **partitions
transactions into analysis sections** so the reporting layer can include/exclude
the right slices per question. Full treatment:
[budget-role analysis sections](/concepts/budget-role-analysis-sections.md).

| Role | Analysis meaning |
|---|---|
| `spending` | Ordinary in-budget monthly spend. The baseline. |
| `annual_spending` | Real spending, but lumpy/periodic — **excluded from *monthly* analysis**, included in annual/total. |
| `transfer` | **Money movement, not spending** — excluded from spending analysis entirely. (Maps to class `bookkeeping`.) |
| `savings` | Money assigned to saving. (Maps to class `savings`.) |
| `event` | Special-event spend (vacations, birthdays); sectioned for event analysis. Connects to `special_events` (not yet documented). |

**Role → class seeding** (from the `Allocation` model):
`transfer → bookkeeping`, `savings → savings`, everything else
(`spending`, `annual_spending`, `event`) → `want`. The savings inference is an
explicit **convenience bonus**, not the purpose of `budget_role`.

## Relationships

- `has_many :allocations` is **not** declared on the model — and arguably
  shouldn't be without a budget scope: across budgets the association has no
  useful meaning (an allocation of the same name recurs per budget).
- `has_many :recurring_allocations` **is** declared — but `recurring_allocations`
  is a [dead table](/tracking/dead-schema.md). A live association to dead schema;
  harmless, cleanup-worthy.

## Household-specific categories

Beyond the system mechanics above, a household typically maintains specific
categories that shape analysis. These are **household data conventions, not part of
EveryCent itself** — see the knowledge-tiers note in [about](/about.md).

- **Sink-fund injection** (`transfer` role) — funds spending that was pre-saved
  in a sink fund (a saved-for vacation; a car repair paid from car-repair
  savings). The *spend* still happens through normal allocations; this category
  only carries the **inflow** that funds it, kept out of spending analysis. Its
  allocations typically ride the 0.01 workaround — see
  [placeholder allocations](/concepts/placeholder-allocations.md).
- **Overspend top-up** (`transfer` role) — when monthly spending exceeds budget,
  the money transferred **into** the joint account to cover it flows through
  here. Lets analysis separate "we overspent on ordinary monthly things" from
  "a non-monthly-but-normal event happened" (car repair, winter-clothes trip).
  Again: only the funding inflow — the spend itself is in normal allocations.

Both are `transfer`-role **inflow/movement** buckets; neither holds spend.
