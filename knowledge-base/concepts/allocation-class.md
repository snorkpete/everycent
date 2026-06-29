---
type: concept
title: Allocation Class
term: allocation-class
definition: "Higher classification of an allocation: need, want, or savings. A mechanism for evaluating spending alignment; underdeveloped. Stored in allocation_class (a refactor candidate, R1)."
lexicon: true
description: >-
  Why allocation_class (need/want/savings) is a purely informational reporting
  classification with no enforcement — the underdeveloped basis of the
  needs-vs-wants report, defaulting to want, and an R1 refactor candidate.
doc_status: stub
tags: [domain, stub]
timestamp: 2026-06-20T00:00:00Z
---

# Allocation Class

> **Stub — restored from prior vocabulary notes; pending review against current code.**

## Context

The foundational concept behind the needs-vs-wants report. A common alignment target is roughly 50% needs / 30% wants / 20% savings, but the real point is having the data to evaluate alignment at all.

**Underdeveloped.** This area hasn't been fleshed out enough in the system. There's an intention to put more emphasis on alignment tracking, but currently it's primarily a reporting classification with no enforcement or guidance features. Stored in `allocation_class`, it is a [refactor candidate](/tracking/refactor-candidates.md) (R1).

## Contract

- Values: `need`, `want`, `savings`.
- Set on [allocations](/tables/allocations.md) (via `allocation_class` field, defaults to `want`).
- Used by the needs-vs-wants report to calculate budgeted and actual percentages per class.
- No enforcement — purely informational/analytical.
