---
okf_version: "0.1"
---

# EveryCent Knowledge Bundle

The agent-facing record of how EveryCent actually works, beyond what the schema
reveals. Start with [about.md](about.md) for the reading guide and conventions,
and [vocabulary.md](vocabulary.md) for the always-loaded domain lexicon.

## Areas

* [tables/](tables/index.md) - every database table as it behaves today (budget core, auth, AI/chat), plus dead v1 tables
* [concepts/](concepts/index.md) - cross-table behavior invisible in the schema (close/checkpointing, placeholders, brought-forward, import, NLQ chat)
* [tracking/](tracking/index.md) - maintenance state: bugs (B), dead schema (D), incomplete features (I), refactor candidates (R), open questions (Q)
* [legacy/trinidad-banking-model.md](legacy/trinidad-banking-model.md) - deprecated pre-current-household schema, explained once

Each area's `index.md` is its on-demand listing — generated from the files'
`description` frontmatter by `rake kb:index`. Load the relevant area's index
before reasoning about, explaining, or modifying anything in it.

## Scope

The database layer is fully covered — every table as it behaves today, plus the
cross-cutting concepts they depend on. The non-database layers (controllers,
routes, UI) are not yet documented; absence means "not yet written," not
"doesn't exist."
