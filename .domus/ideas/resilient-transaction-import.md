# Idea: Resilient / Format-Agnostic Transaction Import

**Captured:** unknown
**Status:** raw

---

## The Idea

Make the import pipeline durable against changes in bank export formats and ideally able to handle new formats without code changes.

The minimum bar is graceful handling of small format variations in existing sources (column renames, date format drift, extra columns) without needing a code fix. The ambitious version is a fully format-agnostic importer that can ingest any CSV/export and map fields intelligently.

---

## Why This Is Worth Doing

- Bank export formats change without warning and currently that breaks the import
- Reduces maintenance burden when adding support for new banks
- A format-agnostic importer is a strong foundation for the MCP transaction ingestion path

---

## Open Questions / Things to Explore

- Implementation approach — candidates: config-driven column-mapping layer, heuristic auto-detection, LLM-assisted parsing
- How many bank formats are currently supported, and how do they come in — CSV, OFX, something else?
- Has the import broken before due to format changes, or is this proactive hardening?
