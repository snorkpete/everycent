---
type: tracking-register
title: Incomplete features
description: >-
  Schema for features that were started but never finished. The columns exist but
  drive no behavior. Not safe to drop (may be completed), not safe to rely on.
tags: [tracking, incomplete, aspirational]
timestamp: 2026-06-17T00:00:00Z
---

# Incomplete features (I)

Features that are **partially implemented**: the schema exists but **no behavior
relies on it**. Distinct from [dead schema](/tracking/dead-schema.md) — these are
**not** safe to drop, because they may yet be finished. An agent must know the
column exists but **must not assume it does anything**.

| ID | Item | Intended behavior | Status |
|---|---|---|---|
| I1 | `allocations.is_cumulative` | Marks an allocation consumed by **many** transactions over the month (e.g. groceries), with a planned feature to split the budgeted amount **by week** to track pacing within the month. | Never finished. Column exists; drives nothing. |

See [allocations](/tables/allocations.md).
