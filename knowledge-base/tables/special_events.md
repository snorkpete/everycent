---
type: table
title: special_events
term: special-event
definition: "Named event with budgeted and actual amounts; primarily a retrospective cost-analysis tool. (The amounts are a frontend-maintained cache — see bugs B8.)"
lexicon: true
description: >-
  A discrete non-recurring spending occasion (vacation, birthday, Christmas) that
  groups allocations across multiple budgets. Stored budget_amount/actual_amount
  are a frontend-maintained cache; the truth is the allocation rollup.
resource: everycent:table:special_events
tags: [table, events, cross-budget]
timestamp: 2026-06-17T00:00:00Z
---

# special_events

A discrete, non-recurring spending occasion — a vacation, birthday, Christmas —
that groups the [allocations](/tables/allocations.md) belonging to it so it can be
analyzed as a unit. This is the home of the `event`
[budget_role](/concepts/budget-role-analysis-sections.md).

`acts_as_tenant :household`; `has_many :allocations`; `name` required.

## Why it's a table, not just a category

An event `has_many :allocations`, and each allocation belongs to a *budget* (a
month). So a special event **stitches allocations across multiple monthly budgets
into one logical occasion** (a vacation spanning a month boundary; Christmas spend
starting in November). Categories are per-allocation tags; an event is a
cross-budget grouping — hence a separate table.

## Schema

| Column | Meaning |
|---|---|
| `id` | Primary key. |
| `name` | Event label ("Summer Trip 2025"). Required. |
| `budget_amount` | Planned total. **Frontend-maintained cache — see below.** Default 0, ≥ 0. |
| `actual_amount` | Actual total. **Frontend-maintained cache — see below.** Default 0, ≥ 0. |
| `start_date` | **Ordering only** — events are listed by occurrence (descending), typically the first day of the vacation. No timespan semantics; nothing keys off it. (Omitted from the model's stale annotation but present in the schema.) |
| `household_id` | Tenant scope. |
| `created_at` / `updated_at` | Timestamps. |

## budget_amount / actual_amount are a cache, not ground truth

These two columns were meant as a **performance optimization** to avoid
recomputing event totals. But they are **computed on the frontend and stored
verbatim** by the backend, which has **no logic to compute or validate them** (the
model is logic-free).

Flow: in the special-events UI you pick allocations across budgets; the frontend
already computes allocated + spent totals for display, then ships those totals in
the POST/PUT; the backend stores them; they are overwritten wholesale on each
event re-save.

**Authoritative source of truth is the derived rollup**, not these columns:
`Σ allocation.amount` (plan) and `Σ allocation.spent` (actual). The stored pair
**can drift** — it only refreshes when the *event* is re-saved, so if an
allocation's amount or transactions change without re-saving the event, the cache
goes stale. **To answer "what did this event cost," derive from the
allocations; treat the stored totals as a possibly-stale display cache.** See
[bugs](/tracking/bugs.md) (B8).

> Provenance: the special-events implementation came entirely out of an early
> AI-assisted experiment (Cursor, Nov 2025) — a first run at AI-first "vibe coding"
> that optimized for speed of exploration over review rigor, with limited tool
> access at the time. A hand-built version would have been designed differently;
> the frontend-trusting, server-light pattern here is an artifact of that
> experiment. Useful archaeology when reasoning about this code.

## Consumption & settings

`SpecialEvent.preloaded` eager-loads `allocations: [:budget, :allocation_category,
:transactions]` — the natural access is "the event with all allocations, each with
its budget, category, and actual transactions."

The special-events UI filters allocations by budget + category (nothing shows
until a budget is picked). `settings.default_allocation_category_id_for_special_events`
sets which category is **pre-selected** in that filter — a UI convenience (a
household can keep a dedicated `event`-role category). See [settings](/tables/settings.md).
