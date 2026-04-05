# Idea: Everycent MCP Server

**Captured:** 2026-03-10
**Status:** abandoned

---

## The Idea

Build an MCP (Model Context Protocol) server for Everycent instead of a traditional reporting layer.

Users would interact with the Everycent system through any MCP-compatible client and ask any reporting-style question in natural language, getting answers without a fixed query UI. The MCP server could also serve as an alternative path for formatting and ingesting transactions correctly.

---

## Why This Is Worth Doing

**Product value**
- Natural language reporting with no fixed query limitations
- Secondary path for transaction formatting/ingestion
- Realistic path toward Everycent becoming a real product

**Personal/dev value**
- First real MCP server build
- Greenfield project — no legacy code, so the AI-throughout-dev workflow can be honestly evaluated from the start
- Opportunity to build in Go and learn that backend area

---

## Open Questions / Things to Explore

- MCP server language support — MCP is transport-based (stdio or HTTP/SSE), so language choice is largely open; Go should be viable
- What tools/resources the MCP server should expose (transaction queries, summaries, formatting endpoints, etc.)
- How the MCP server connects to the Everycent data layer
