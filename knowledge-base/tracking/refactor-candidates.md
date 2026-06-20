---
type: tracking-register
title: Refactor candidates
description: >-
  Naming/structure improvements worth considering. Not defects — the system works
  as-is — but changes that would improve clarity, especially for agents.
tags: [tracking, refactor, naming]
timestamp: 2026-06-17T00:00:00Z
---

# Refactor candidates (R)

Improvements to consider. Not bugs — the system is correct as-is. These mostly
improve clarity for both humans and agents.

| ID | Item | Issue | Direction |
|---|---|---|---|
| R1 | `allocations.allocation_class` | The name is vague and `class` collides with a loaded programming term. | The field is a four-way role classification (`need`/`want`/`savings`/`bookkeeping`), so a need-vs-want name like `necessity` does **not** fit. Candidates that house all four: `purpose`, `classification`, `role`. Decide later. See [allocations](/tables/allocations.md). |
