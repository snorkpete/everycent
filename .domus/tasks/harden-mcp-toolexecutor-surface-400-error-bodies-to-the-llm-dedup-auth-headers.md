# Task: Harden MCP toolExecutor: surface 400 error bodies to the LLM + dedup auth headers

**ID:** harden-mcp-toolexecutor-surface-400-error-bodies-to-the-llm-dedup-auth-headers
**Status:** ready
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-06-07
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

toolExecutor.ts throws a generic 'failed: 400 Bad Request' on validation errors, swallowing the server's {error: ...} body so the LLM never sees the recoverable message — defeating the LLM-recoverable validation messages the MCP query objects deliberately return. Fix suite-wide: on non-ok responses, parse the JSON body and include error in the thrown message. Also extract a buildAuthHeaders() helper — the auth-header build block is now copy-pasted across all 4 tool branches.

---

## Acceptance Criteria

- [ ] On a non-ok response, `toolExecutor.ts` attempts to parse the JSON body and includes its `error` field in the thrown `Error` message (falling back to `status statusText` when the body is absent/unparseable). Applied to **all** tool branches, not just one.
- [ ] A reusable `buildAuthHeaders()` helper replaces the auth-header build block currently copy-pasted across all 4 tool branches (`analyze_overspending`, `analyze_overspending_by_allocation`, `list_categories`, `budget_accuracy`).
- [ ] `toolExecutor.spec.ts` updated: assert that a 400 with `{error: "<message>"}` surfaces `<message>` in the thrown error; assert `buildAuthHeaders()` behaviour (null/undefined token values skipped).
- [ ] Gates green: in `webclientv4/` — `npm run type-check`, `npm run test`. No error suppression.

### Out of scope

- Backend changes — the query objects already return helpful `{error: ...}` bodies; this is purely the frontend executor swallowing them.

---

## Implementation Notes

**Provenance:** surfaced by the senior-code-review of the `budget_accuracy` tool (NLQ tool 5), 2026-06-07. Both issues are **pre-existing across all four tools** — the new tool only made the duplication worse (a 4th copy) and made the swallowed-error problem more visible (budget_accuracy deliberately returns LLM-recoverable validation messages for reversed month ranges / bad enums, which the executor currently discards).

**Why it matters:** the MCP query objects validate params and return messages written so the model can self-correct (e.g. `"end_month (2024-01) must not be before start_month (2024-06)"`). If the executor throws `"failed: 400 Bad Request"` the model gets no signal to fix its call. Thematically pairs with the money-display work — both are about making the tool contract serve the model.

**Reference:** `webclientv4/src/app/chat/toolExecutor.ts` + `toolExecutor.spec.ts`. Independent of the budget_accuracy and money-formatting tasks; dispatch any time.
