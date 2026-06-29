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
the implementation deliberately leaves a discretionary remainder. It is
multi-tenant, scoped by household. This bundle is the durable, agent-facing knowledge base
that explains how the system actually works, beyond what the raw schema reveals.

## Scope of this version

The **database layer** is now fully covered — every table (as it behaves today),
including the auth and AI/chat tables, plus the cross-cutting concepts they depend
on. Still pending: the non-database layers (controllers, routes, UI) this bundle
will grow into (see [the index](/index.md)).
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

  *Why the bundle tracks its own defects:* EveryCent was built as a functional
  tool for a two-person household, not a production product. With limited
  development time, the guiding stance was to enforce each rule at the *cheapest
  sufficient place* for that context — sometimes in the UI (e.g. a transaction
  can't link both an allocation and a sink-fund allocation, enforced only in the
  form), sometimes by convention between two users who both know the rules (e.g.
  don't edit a closed budget's amounts), sometimes not at all where it doesn't
  bite at this scale (e.g. an N+1 that's invisible for two users). That's a
  deliberate trade, not an oversight. These registers catalog those rough edges
  honestly, and they're being closed deliberately now that the app doubles as a
  production-practices learning ground and AI-assisted development makes the
  fixes cheap.
- **Legacy concepts** (`legacy/`) explain deprecated schema that predates the
  current household setup, so empty/unused fields are explained in one place.
- **Lexicon** (`vocabulary.md`) is an always-loaded, generated index of the
  domain's words — read it first for the shared language, then follow a link for
  depth. It is a view over the files below, not a separate source.

## Bundle conventions

- **Money** is integer minor units everywhere — see [money units](/concepts/money-units.md).
- **Links** are bundle-relative (`/tables/allocations.md`) and keep the `.md` suffix.
- **Subdirectory index files** are added once a directory holds **3 or more**
  files (progressive disclosure); smaller directories are left without one. They
  are **generated** — a frontmatter-less OKF listing built from each file's
  `description` by `rake kb:index` (`rake kb:index:check` verifies currency).
  Never hand-edit them; change the source `description` and regenerate. The root
  `index.md` lists only the *areas*, not individual files — it is hand-maintained.
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
  household that shape behavior but are not part of the product. E.g.
  household-specific `transfer` categories (such as sink-fund injection and
  overspend top-up), a permanent miscellaneous allocation, and a deliberate
  discretionary gap.

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
