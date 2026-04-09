# Idea: Auto-generate TypeScript types from Rails API

**Captured:** 2026-04-06
**Status:** raw

---

## The Idea

Derive frontend TypeScript type definitions from the Rails API's actual serializer output, eliminating hand-maintained parallel type definitions and guaranteeing FE/BE type alignment.

---

## Why This Is Worth Doing

The current codebase maintains TypeScript interfaces by hand in parallel with Rails serializers. The architect review process surfaced multiple shape mismatches (backend sends fields the frontend types don't declare, frontend types promise fields the backend doesn't send). These aren't runtime bugs per se — TypeScript types are erased at runtime — but they create dev-experience bugs (can't use data you can't see) and latent bugs (code that reads a field the backend doesn't actually send).

The contract mismatch review lens (from the architect review process) becomes nearly unnecessary if types are generated from the source of truth rather than hand-maintained in parallel.

---

## Possible Approaches

- **OpenAPI spec route:** Rails generates an OpenAPI spec (via rswag or similar) then openapi-typescript generates TS interfaces, CI type-check catches mismatches.
- **Custom serializer introspection:** A script or rake task that introspects ActiveModel::Serializer attribute declarations and emits .d.ts files directly.
- **Snapshot comparison:** A test that snapshots actual response shapes and compares them to the TS type definitions, failing on drift.

Any mechanism that derives TS types from the actual serializer output would work. The core concept is simpler than full OpenAPI compliance.

---

## Open Questions / Things to Explore

- How much effort is OpenAPI compliance vs a lighter custom approach?
- Can we introspect ActiveModel::Serializer attribute declarations programmatically?
- What's the regeneration trigger — CI, pre-commit hook, manual?
- How to handle serializer variants (e.g., BankAccountSerializer vs BankAccountWithBalanceSerializer returning different shapes for the same model)?
- Does this play well with the existing type structure (feature-scoped .types.ts files)?
