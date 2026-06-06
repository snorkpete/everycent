# Task: Add bug reporting to the NLQ chat

**ID:** add-bug-reporting-to-the-nlq-chat
**Status:** proposed
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-06
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Add bug-reporting capability to the already-live EveryCent NLQ chat by registering new tool(s) on the existing agent (no router, no second prompt), plus Rails backend (bug_reports + bug_report_attachments) and a small CRUD UI for status changes.

### Context

The EveryCent NLQ chat is already implemented and live: a single chat agent with ~12 MCP tools under `/api/mcp/`, thinking-token display, Ollama dev server. This task ADDS bug-reporting capability to that existing chat — it is not a greenfield agent.

### Approach

- Add a new bug-reporting tool (or small tool set) to the existing single chat agent. No router, no second system prompt — the LLM decides via tool selection whether a message is a financial query or a bug action.
- The system prompt may need updating to cover bug-reporting behaviour.
- Add corresponding Rails backend support.

### Data Model

- `bug_reports`: status enum (open / in_progress / fixed), reporter_id (captured from the devise_token_auth identity at create time; NOT filtered — both household members see all bugs), description/text fields. Scoped by Household via acts_as_tenant like all models.
- `bug_report_attachments`: one-to-many off bug_reports, stored as `bytea`. Columns: `content_type` (MIME type, e.g. image/png, text/csv — for download headers), a separate `kind`/category enum (e.g. screenshot, transaction_file — what the user reasons about; deliberately distinct from content_type), and `filename`. Generalized from "screenshots" to "attachments" so uploaded transaction files with bad data can be attached for later debugging. Attachments must be downloadable.
- Purge rule: attachments are deleted when the parent bug_report flips to `fixed` (model callback). Motivated by PII hygiene (financial data in images/files) and it naturally keeps debugging test data only as long as the bug is active. UI must handle the "fixed, attachments purged" state gracefully.

### Responsibility Split

- Agent handles: create + conversational intake + read/search. Read-before-create to dedupe against existing open bugs ("looks like you already reported this — add detail?").
- Small CRUD UI handles: status changes (deterministic and auditable — avoids the agent closing the wrong ticket).

### Storage Decision

Raw `bytea`, deliberately NOT Active Storage/S3 — avoiding an external blob store for confidentiality (financial PII). Storage is a non-issue: 12 years of data is only ~19MB; Heroku Essential-1 gives 10GB with no row limits.

### Sequencing (thinnest slice)

- Slice 1: create/read/status tools + CRUD UI, TEXT ONLY — fully usable end-to-end.
- Slice 2: attachment upload, attached to an existing bug via the CRUD UI (NOT the chat) to keep binary bytes out of the agent loop.

### Open Questions

- Attachment capture mechanism: frontend DOM-capture button (html2canvas-style) vs paste/manual file upload. Deferred to Slice 2. Kion leans toward adding upload separately.

### Conventions

- Backend: Rails 7.1 API, acts_as_tenant by Household, devise_token_auth. JSON keys snake_case. Server-side validation authoritative.
- Frontend: Vue 3 in webclientv4/. Follow reference implementations: store → transactionStore.ts, API → bankAccountApi.ts, component → TransactionsPage.vue. TDD, 100% coverage on new code.

---

## Acceptance Criteria

### Slice 1 — text-only, end-to-end usable

- [ ] `bug_reports` model: status enum (open / in_progress / fixed), `reporter_id` captured from the devise_token_auth identity at create time, description/text fields, scoped by Household via `acts_as_tenant`.
- [ ] Bug reports are NOT filtered by reporter — both household members see all bugs.
- [ ] New MCP tool(s) registered on the existing single chat agent (no router, no second prompt) for: create bug report, read/search bug reports.
- [ ] Agent does read-before-create to dedupe against existing open bugs (prompts the user to add detail to an existing report instead of duplicating).
- [ ] System prompt updated as needed to cover bug-reporting behaviour.
- [ ] Small CRUD UI in webclientv4/ for changing bug-report status (status changes are UI-only, not agent-driven).
- [ ] Server-side validation is authoritative; JSON keys snake_case.
- [ ] TDD with 100% coverage on new code (backend rspec + Vue tests).

### Slice 2 — attachments

- [ ] `bug_report_attachments` model: one-to-many off `bug_reports`, stored as `bytea`, with `content_type` (MIME), `kind`/category enum (e.g. screenshot, transaction_file), and `filename`.
- [ ] Attachment upload via the CRUD UI (NOT the chat), attached to an existing bug report.
- [ ] Attachments are downloadable (correct download headers from `content_type`).
- [ ] Model callback purges attachments when the parent bug report flips to `fixed`.
- [ ] UI handles the "fixed, attachments purged" state gracefully.
- [ ] Storage stays as raw `bytea` — no Active Storage / S3.

---

## Implementation Notes

- One open design question remains (attachment capture mechanism), deferred to Slice 2 — this is why the task sits at `proposed` rather than fully `ready`.
- Slice 1 must be fully usable end-to-end before Slice 2 begins.
