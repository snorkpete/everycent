---
type: concept
title: Budget Period
term: budget-period
definition: "The month-long window a budget covers, bounded by its start_date/end_date — one month in length but not necessarily a calendar month. Most time-scoped logic is relative to this."
lexicon: true
description: >-
  Why nearly all time-scoped logic — viewing transactions, calculating
  balances, brought-forward, close operations — is bounded by the budget's
  one-month-long start_date/end_date window (not necessarily aligned to a
  calendar month), which also auto-names the budget.
doc_status: stub
tags: [domain, stub]
timestamp: 2026-06-20T00:00:00Z
---

# Budget Period

> **Stub — restored from prior vocabulary notes; pending review against current code.**

## Context

A budget period is one month in length, bounded by the budget's start_date and end_date — but **not necessarily a calendar month** (1st–end). The boundaries are whatever the budget specifies; in practice a household runs a consistent offset window (e.g. the 25th of one month to the 24th of the next). The [budget](/tables/budgets.md) auto-names itself from the date range. Nearly all system operations are bounded by the current budget period — viewing transactions, calculating balances, determining what gets brought forward. See [budget membership](/concepts/budget-membership.md).

## Contract

- One month in length, but not necessarily a calendar month — boundaries are the budget's start_date and end_date (e.g. the 25th to the 24th).
- Defined by budget's start_date and end_date.
- Transactions, balance calculations, and close operations are all scoped to a budget period.
