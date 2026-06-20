---
type: concept
title: Allocation naming conventions
description: >-
  Allocation names look free-form but carry structured meaning: trailing
  month-code suffixes group annual-billing variants, and (SF) markers denote
  sink-fund relationships.
tags: [domain, allocations, naming, grouping]
timestamp: 2026-06-17T00:00:00Z
---

# Allocation naming conventions

[Allocation](/tables/allocations.md) `name` values are user-entered and look
free-form, but they **encode structured meaning**. An agent must not treat them
as opaque text.

## Month-code suffixes (annual billing)

A trailing parenthetical month code marks variants of the same logical
allocation that are billed in specific months, so they can be **grouped
together**. Recognized forms include:

- `(Feb)` — single month
- `(Oct+Mar)`, `(Feb & Mar)` — multiple months with `+` or `&`
- `(Jan, Apr, Jul)` — comma-separated list
- `(Feb 2024)` — month with an optional year

Month codes are the three-letter set: `Jan Feb Mar Apr May Jun Jul Aug Sep Oct
Nov Dec`.

The model strips these to a **canonical name** via `canonical_name_sql(column)`,
which applies a `REGEXP_REPLACE` removing the trailing month suffix
(case-insensitive). This lets annual-billing variants of one allocation collapse
to a single logical line for reporting. The caller passes a qualified column
name; **it must not be user input** (raw SQL interpolation).

## Other markers

- `(SF)` and other non-month parenthetical markers are **left untouched** by the
  canonical-name logic. `(SF)` denotes a sink-fund relationship — see
  [placeholder allocations](/concepts/placeholder-allocations.md). (The exact
  rules around `(SF)` are not yet fully documented.)

## Implication for agents

- To group/aggregate allocations that represent the same recurring expense, use
  the **canonical** (suffix-stripped) name, not the raw name.
- Do not invent or reformat these suffixes; they are a real, parsed convention.
