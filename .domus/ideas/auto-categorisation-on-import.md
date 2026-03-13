# Idea: Auto-Categorisation on Import

**Date:** unknown
**Project:** Everycent Migration

---

## The Idea

When transactions are imported, automatically assign a category based on the transaction description. The core idea is straightforward; what needs figuring out is the matching strategy and the UX.

---

## Why This Is Worth Doing

- Reduces manual categorisation work after every import
- Improves the import workflow significantly for repeat merchants
- Foundation for smarter transaction handling over time

---

## Open Questions / Things to Explore

- Matching strategy — candidates: exact string match, fuzzy match, learned rules from past categorisations, or a combination
- UX decision: auto-apply silently, or suggest and let the user confirm?
- Are categories currently assigned manually after import, or is there already some logic in the Angular app?
- Is the matching expected to be per-household (learned from your own history) or could it be a shared/global ruleset?
