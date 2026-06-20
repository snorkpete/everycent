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

The **database layer** is now broadly covered — most tables (as they behave
today) plus the cross-cutting concepts they depend on. Still pending: the
**auth** and **AI/chat** tables (see the pending list in [the index](/index.md)),
and the non-database layers (controllers, routes, UI) this bundle will grow into.
Absence means "not yet written," not "doesn't exist." Some files are **stubs**
(frontmatter `doc_status: stub`) — they carry a definition but await full
treatment.

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
- **Lexicon** (`vocabulary.md`) is an always-loaded, generated index of the
  domain's words — read it first for the shared language, then follow a link for
  depth. It is a view over the files below, not a separate source.

## Bundle conventions

- **Money** is integer minor units everywhere — see [money units](/concepts/money-units.md).
- **Links** are bundle-relative (`/tables/allocations.md`) and keep the `.md` suffix.
- **Subdirectory index files** are added once a directory holds **3 or more**
  files (progressive disclosure). Smaller directories are left without one.
- **`type` values** are lowercase-hyphenated by local convention
  (`table`, `concept`, `tracking-register`); OKF tolerates any type string.
- **Tracking IDs** (B/D/I/R/Q + number) are stable references used across concepts.
- **Lexicon** — a file with `lexicon: true` contributes its `term` + `definition`
  to the generated [vocabulary.md](/vocabulary.md). That file is a pure view —
  never hand-edit it; change the source `definition` and run `rake kb:vocabulary`.

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

## Design philosophy

Features come from observing real usage, not theoretical design. The system
evolved empirically — most original intuitions about how budgeting "should" work
turned out wrong, and nearly every feature that stuck came from watching how the
system was actually used. Copy budget replaced theoretically-designed recurring
allocations (months were too similar to need templates); future budgets came from
observed spreadsheet usage; the 0.01 keep-alive and month-suffix names were
user-invented hacks that stuck because they worked; special events exist to answer
"how much did that vacation actually cost?"

The working rules an agent should carry:

- Prefer observation over speculation when weighing a new feature.
- **User workarounds that stick are signals of missing features** — and if a
  workaround already works well enough, improving it shouldn't degrade the
  experience.
