# Task: Add bug reporting to the NLQ chat

**ID:** add-bug-reporting-to-the-nlq-chat
**Status:** done
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-06-06
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Add bug-reporting capability to the already-live EveryCent NLQ chat by registering new tool(s) on the existing agent (no router, no second prompt), plus Rails backend (bug_reports + bug_report_attachments) and a small CRUD UI for status changes.

### Why (product intent — drives the design)

The reporter is a **non-technical user** (Kion's wife). Bug reporting isn't natural to her, and a plain form fails her because a form assumes the reporter already knows what's relevant. The chat is chosen precisely so it can act as a **conversational intake interviewer**: it actively pulls the relevant details out of her *while the bug is fresh*.

Today the process is a two-step back-and-forth: "hey, I found a bug" → Kion either makes time to come look at what she's doing, or interrogates her over WhatsApp to reconstruct it. The chat replaces that: even if Kion still needs to ask a few follow-ups when he later picks up the bug, the core (possibly-relevant) info is already captured in the report, giving him a troubleshooting foundation to start from.

This is the whole point of the feature — the intake quality matters more than the CRUD mechanics. The bug tool's prompting must behave like an interviewer (what screen, what did you expect vs. what happened, when, reproducible?), not a dumb form-filler.

### Context

The EveryCent NLQ chat is already implemented and live: a single chat agent with ~12 MCP tools under `/api/mcp/`, thinking-token display, Ollama dev server. This task ADDS bug-reporting capability to that existing chat — it is not a greenfield agent.

### Approach

- The chat gets TWO modes — `nlq` (existing financial Q&A) and `bug-report` — selected by an explicit **UI button**, not an LLM router/classifier. The user declares intent by clicking; there is no message-classification step and therefore no misroute failure mode. Type: `type ChatMode = 'nlq' | 'bug-report'` (a union type, not necessarily an enum; extends cleanly to a 3rd mode later).
- Each mode swaps exactly two things: the **system prompt** and the **available tool set**. Toolsets are disjoint — bug mode does NOT load the NLQ tools, and vice versa (a real context-budget win on the local model; it grows as the NLQ toolset builds out toward its ~12-tool target — only 4 are wired today).
- Add corresponding Rails backend support for the bug-report tools.

### Chat Mode Architecture (confirmed 2026-06-08, after codebase investigation)

**Key fact — prompt + tools are FRONTEND-owned and sent straight to Ollama; they never touch Rails.** So mode-switching is a pure frontend concern. The Rails MCP layer is a stateless query executor with no prompt/tool registry.

Current wiring (anchors for the implementer):
- `webclientv4/src/app/chat/systemPrompt.ts` — system prompt, currently a hardcoded module const. → refactor to `getSystemPrompt(mode)`.
- `webclientv4/src/app/chat/toolDefinitions.ts` — tool array, currently hardcoded (4 tools: `analyze_overspending`, `analyze_overspending_by_allocation`, `list_categories`, `budget_accuracy`). → refactor to `getToolsForMode(mode)`.
- `webclientv4/src/app/chat/chatAgent.ts:265` injects the system prompt; `:74` injects the tools into the Ollama payload. Thread `mode` through `ChatConfig`.
- `webclientv4/src/app/chat/toolExecutor.ts:5` — hardcoded switch (one branch per tool name → Rails MCP endpoint). Bug tools add new branches here.
- `webclientv4/src/app/chat/chatStore.ts:12` — `defineStore('chat', ...)`; `:18` generates `conversationId` via `crypto.randomUUID()`; `:147` `clearMessages()` resets it.
- `webclientv4/src/app/chat/NlqChatWindow.vue` (reusable PrimeVue Dialog) + `NlqChatApp.vue` (wrapper), mounted globally at `App.vue:18`.

**Store decision — Option B: key the store by mode.** Make the store a factory: `defineStore(\`chat-${mode}\`, setupFn)`. `chat-nlq` and `chat-bug-report` are then independent stores (separate `messages`, `conversationId`, `loading`). Render ONE at a time. Rationale:
- Pinia stores are singletons *by ID*, not one-per-page — parameterizing the ID gives genuine independent instances. This is cheap and localized (thread `mode` through `useChatStore()` callsites), NOT a big refactor.
- Non-destructive: switching modes does not nuke the other mode's in-progress conversation (Option A — a single store with a `mode` ref + `clearMessages` on switch — would have).
- Keeps visual stacking (two windows at once) nearly free LATER without retrofit — but we are NOT building stacking now (YAGNI; not needed for two users).

**Banned (over-engineering guardrails):**
- No LLM router/classifier — the button is the disambiguation.
- No mid-conversation mode coexistence / visual stacking built now (the store-keyed-by-mode design just doesn't *prevent* it later).
- No mode registry / plugin framework / `ChatModeStrategy` abstraction. Two modes, hardcoded. Refactor to a registry only if/when a 3rd mode actually lands.
- No sharing tools across modes "just in case." Disjoint. (Possible exception: a shared *prompt fragment* describing EveryCent to the model, if one exists — copy-paste it for now, extract later only if it proves duplicated.)

### Effort

- Mode parameterization (prompt fn + tools fn + `mode` on `ChatConfig` + store-keyed-by-mode): ~0.5 day, frontend only.
- The bug feature itself (backend tables/endpoints/tools + intake prompt + CRUD UI) is the real work — see Slices below.

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

- Backend: Rails 8.1 API (master is on Rails 8.1 / Ruby 3.4 since 2026-06-18), acts_as_tenant by Household, devise_token_auth. JSON keys snake_case. Server-side validation authoritative.
- Frontend: Vue 3 in webclientv4/. Follow reference implementations: store → transactionStore.ts, API → bankAccountApi.ts, component → TransactionsPage.vue. TDD, 100% coverage on new code.

---

## Acceptance Criteria

### Slice 1 — text-only, end-to-end usable

- [ ] `bug_reports` model: status enum (open / in_progress / fixed), `reporter_id` captured from the devise_token_auth identity at create time, description/text fields, scoped by Household via `acts_as_tenant`.
- [ ] Bug reports are NOT filtered by reporter — both household members see all bugs.
- [ ] Chat supports a `bug-report` mode alongside `nlq`, selected by an explicit UI button (no LLM router/classifier). `getSystemPrompt(mode)` and `getToolsForMode(mode)` select the prompt + disjoint toolset; `mode` threaded through `ChatConfig`.
- [ ] Store keyed by mode (Option B): `defineStore(\`chat-${mode}\`, ...)` so `nlq` and `bug-report` have independent state; one rendered at a time. No multi-instance stacking built.
- [ ] Bug-mode tools (create bug report, read/search bug reports) registered for that mode only, wired through `toolExecutor` to new Rails MCP endpoints.
- [ ] Agent does read-before-create to dedupe against existing open bugs (prompts the user to add detail to an existing report instead of duplicating).
- [ ] System prompt / tool prompting makes the agent conduct an interview-style intake for a non-technical reporter — actively eliciting what screen, expected vs. actual, when it happened, and whether it reproduces — rather than passively recording whatever the user volunteers. (This is the core value of the feature.)
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

- **Slice 1 is `ready` for dispatch** (re-implementation onto current master — see Landing Strategy below). Slice 2 (attachments) still carries one open design question (attachment capture mechanism) and is explicitly out of this dispatch's scope.
- Slice 1 must be fully usable end-to-end before Slice 2 begins.
- **Recommended precursor (not a hard dependency): chat persistence** — see idea `capture-nlq-chat-transcripts-for-later-analysis/debugging`. Tuning the intake prompt (the core value of this feature) needs a corpus of real bug-intake conversations to review retrospectively, which requires persistence in place first. The design here does not depend on it, but building persistence before this task is the preferred sequencing. Persistence is tuning-only — transcripts are NOT bug-report evidence.

## 🛠️ Landing strategy — RE-IMPLEMENT Slice 1 onto refactored master (decided 2026-06-25)

**This task's dispatch scope is Slice 1 ONLY.** Slice 1 was fully implemented and tested
on branch `add-bug-reporting-to-the-nlq-chat`, but it is NOT being git-merged. Master moved
~461 files since the branch base (merge-base `c2ce53ee5f4c12ac9cbcda7be0837a0e90d5f755`),
including the **apiGateway / mcpToolApi refactor** that restructured the very chat files
Slice 1 modified. A rebase/merge would force reconciling two independent ~half-file rewrites
of `chatStore.ts` et al → **frankenmerge risk** (old mode-switching patterns stitched beside
new apiGateway patterns; compiles but not native to the new architecture). Decision:
**re-implement the integration layer fresh on current master, using the original branch as
the reference spec.**

### Operation

- **Branch from LOCAL master** (not origin — local master runs ahead), in an isolated worktree.
- **Reference artifact = the original implementation.** Generate it with:
  `git diff c2ce53ee5f4c12ac9cbcda7be0837a0e90d5f755..add-bug-reporting-to-the-nlq-chat`
  Use that diff + the Slice 1 acceptance criteria above as the spec. The branch's file
  anchors/line-numbers are **pre-refactor** — refresh them against current master before relying on them.

### Bucket A — clean-apply (28 files; master never touched them → take the branch's version verbatim)

Backend: `app/models/bug_report.rb`, `app/controllers/bug_reports_controller.rb`,
`app/controllers/mcp/bug_reports_controller.rb`, `db/migrate/20260615203415_create_bug_reports.rb`,
`spec/models/bug_report_spec.rb`, `spec/controllers/bug_reports_controller_spec.rb`,
`spec/controllers/mcp/bug_reports_controller_spec.rb`, `spec/factories/bug_reports.rb`.
Frontend bug-reports module: `webclientv4/src/app/bug-reports/*` (bugReport.types.ts,
bugReportApi.ts+spec, BugReportsPage.vue+spec, bugReportStore.ts+spec).
Chat files master did NOT touch: `chat/chatAgent.ts+spec`, `chat/systemPrompt.ts+spec`,
`chat/NlqChatApp.vue+spec`, `chat/NlqChatWindow.vue+spec`. Plus `menu/menuIcons.ts`,
`menu/menuItems.ts`, `router/index.ts`, `test/factories/bugReportFactory.ts`, `test/factories/index.ts`.

⚠️ "Clean-apply" ≠ "no thought": several of these import symbols from Bucket B files
(e.g. `chatAgent.ts`/`systemPrompt.ts` call `getToolsForMode(mode)` / `getSystemPrompt(mode)`).
Validate the integration via type-check + tests — don't assume the file applies in isolation.

### Bucket B — re-implement on the current apiGateway/mcpToolApi architecture (the collision zone)

`config/routes.rb` (small: re-add `bug_reports` routes), `chat/chat.types.ts` (add bug-mode types),
`chat/chatStore.ts`+spec (**KEY**: the mode-keyed store `defineStore(\`chat-${mode}\`)` design
reconciled with master's apiGateway refactor), `chat/mcpToolApi.ts`+spec,
`chat/toolDefinitions.ts`+spec (bug tools via `getToolsForMode(mode)` — master also added tools here),
`chat/toolExecutor.ts`+spec (add bug-tool branches). **Re-write these so the result is NATIVE to
the new architecture — not a textual 3-way merge.**

### schema.rb — regenerate, never hand-edit

After applying Bucket A's migration: `bundle install`, `rails db:migrate`, `rails db:schema:dump`.
**Verify the `schema.rb` diff vs master is EXACTLY the `bug_reports` table + version bump — nothing else.**
If stray tables/columns appear, the local DB is contaminated (known: `bug_reports` already leaked into
shared `everycent_dev*`/`everycent_test`) → round-trip through a throwaway DB. Never resolve schema.rb by hand.

### Verification & commit

- All green: `npm run type-check`, `npm run test` (webclientv4/), `bundle exec rspec`. TDD / 100%
  coverage on new code per CLAUDE.md. The branch's comprehensive specs come along and re-validate the re-implementation.
- **Single squashed feature commit** for Slice 1 (the original branch's two same-message commits collapse into one).
- Worker commits to its task branch; does **NOT** push or merge. Senior review + human close-out, then deploy.
- **Worktree env:** copy the gitignored env files from `/Users/kion/code/everycent` (Rails root `.env`,
  `webclientv4/.env.local`) into the worktree before `rails db:migrate` / running the app (per CLAUDE.md Worktrees).

### Out of scope

Slice 2 (attachments) — still carries the open attachment-capture design question; remains future work in this file.
