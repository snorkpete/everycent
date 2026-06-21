---
type: concept
title: Recurring Allocation
term: recurring-allocation
definition: "Templates for auto-populating new budgets. Never truly implemented — copy budget replaced the need. Dead code / DB artifacts."
lexicon: true
status: dead
doc_status: stub
tags: [domain, stub]
timestamp: 2026-06-20T00:00:00Z
---

# Recurring Allocation

> **Stub — restored from prior vocabulary notes; pending review against current code.**

## Context

**Never truly implemented.** The data model exists (tables, fields) but the feature was never built out in any version of the system. It was the v1 answer to *"how do we create a new budget easily?"* — auto-populate a new budget from templates. [Copy budget](/concepts/copy-budget.md) emerged as the practical replacement — every month is similar enough that copying and tweaking is simpler than maintaining templates.

This covers both halves of the idea: [recurring_allocations](/tables/recurring_allocations.md) and its income counterpart [recurring_incomes](/tables/recurring_incomes.md). Both are dead. (Distinct from the v1 *tagging* idea — see [auto-allocation](/concepts/auto-allocation.md) and [payees](/tables/payees.md).)

The database artifacts should be cleaned up — see [dead schema](/tracking/dead-schema.md).

## Contract

- Not functional. Dead code / database artifacts.
- Copy budget serves the same purpose in practice.
