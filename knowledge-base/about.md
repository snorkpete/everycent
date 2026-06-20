---
type: Reference
title: About this bundle
description: Scope, reading guide, and conventions for the EveryCent knowledge bundle.
tags: [everycent, meta, guide]
timestamp: 2026-06-17T00:00:00Z
---

# About this bundle

EveryCent is a personal **zero-based budgeting** application (Rails + Postgres,
Vue 3 frontend, an NLQ/MCP reporting layer over the Rails API). It is zero-based
in *concept*; see
[discretionary money & the budget gap](/concepts/discretionary-money.md) for how
the implementation deliberately leaves a discretionary remainder. One household,
two users in practice. This bundle is the durable, agent-facing knowledge base
that explains how the system actually works, beyond what the raw schema reveals.

## Scope of this version

Database layer only, and within that the **budget core** cluster (households →
budgets → incomes → allocations) plus the cross-cutting concepts those tables
depend on. Banking/actuals, recurring templates, auth, and the AI/chat tables
are **not yet documented** — see the pending list in [the index](/index.md).
Their absence means "not yet written," not "doesn't exist."

## How to read this bundle

- Each file is one **concept**; its identity is its path (e.g. `tables/allocations`).
- **Table concepts** (`tables/`) describe a table as it behaves *today*, not as
  the schema annotation claims. The schema is ground truth for structure; these
  concepts are ground truth for meaning.
- **Domain concepts** (`concepts/`) describe behavior spanning multiple tables
  that is invisible in the schema (e.g. balance checkpointing, placeholder
  allocations).
- **Tracking registers** (`tracking/`) hold known defects (B), dead schema (D),
  incomplete features (I), refactor candidates (R), and open questions (Q).
  These are maintenance state, not the live model — consult them before trusting
  a field or writing a migration.
- **Legacy concepts** (`legacy/`) explain deprecated schema that predates the
  current household setup, so empty/unused fields are explained in one place.

## Bundle conventions

- **Money** is integer minor units everywhere — see [money units](/concepts/money-units.md).
- **Links** are bundle-relative (`/tables/allocations.md`) and keep the `.md` suffix.
- **Subdirectory index files** are added once a directory holds **3 or more**
  files (progressive disclosure). Smaller directories are left without one.
- **`type` values** are lowercase-hyphenated by local convention
  (`table`, `concept`, `tracking-register`); OKF tolerates any type string.
- **Tracking IDs** (B/D/I/R/Q + number) are stable references used across concepts.

### Knowledge tiers

Facts in this bundle live in one of two tiers, and an agent should know which —
system facts generalize, household facts do not.

- **EveryCent-system knowledge** — true for any instance of the app. E.g. the
  `> 10` placeholder filter, `budget_role` semantics, and
  `allocation_id` = budget membership.
- **Household-specific knowledge** — data conventions of this particular
  household that shape behavior but are not part of the product. E.g. the two
  `transfer` categories (sink-fund injection and overspend top-up), the permanent
  miscellaneous allocation, and the ~200 discretionary gap.
