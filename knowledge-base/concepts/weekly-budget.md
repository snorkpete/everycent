---
type: concept
title: Weekly Budget
term: weekly-budget
definition: "Alternative view splitting a monthly budget into weeks with proportional allocation distribution. Partially implemented; stalled."
lexicon: true
status: partial
doc_status: stub
tags: [domain, stub]
timestamp: 2026-06-20T00:00:00Z
---

# Weekly Budget

> **Stub — restored from prior vocabulary notes; pending review against current code.**

## Context

**Intent.** Mid-month course correction — "I've spent 60% of my grocery budget but I'm only 2 weeks in, slow down." A reporting/self-correction tool for rationing spending across the month.

**Not fully implemented.** Development has been paused for months if not years. The concept and some backend logic exist but it's not a complete feature. See [incomplete features](/tracking/incomplete-features.md).

Related: cumulative allocations (allocations that distribute across weeks).

## Contract

- Splits month into 5 weeks.
- Weighting per week = days in that week / days in month.
- Cumulative allocations use this weighting to calculate amount_for_week and spent_for_week.
