# Idea: Filter/exclude certain allocation categories from NLQ tools

**Captured:** 2026-06-06
**Status:** raw

---

## The Idea

User foresees wanting to hide or filter out certain allocation categories in the NLQ layer (e.g. from list_categories and downstream tools) — likely the bookkeeping/structural categories that aren't meaningful spending. CategoryList query object (app/models/mcp/category_list.rb) was deliberately given a home now so this filter has somewhere to land. Decide: filter by budget_role, an explicit exclude-list, or a per-category flag; and whether it's a tool param or a fixed default.

---

## Why This Is Worth Doing

_To be filled in._

---

## Open Questions / Things to Explore

- _Add open questions here_
