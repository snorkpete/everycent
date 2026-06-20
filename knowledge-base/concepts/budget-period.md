---
type: concept
title: Budget Period
term: budget-period
definition: "The month-long window a budget covers. Most time-scoped logic is relative to this."
lexicon: true
doc_status: stub
tags: [domain, stub]
timestamp: 2026-06-20T00:00:00Z
---

# Budget Period

> **Stub — restored from prior vocabulary notes; pending review against current code.**

## Context

Budget periods are always calendar months. The [budget](/tables/budgets.md) auto-names itself from the date range. Nearly all system operations are bounded by the current budget period — viewing transactions, calculating balances, determining what gets brought forward. See [budget membership](/concepts/budget-membership.md).

## Contract

- Always one calendar month.
- Defined by budget's start_date and end_date.
- Transactions, balance calculations, and close operations are all scoped to a budget period.
