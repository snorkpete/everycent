# Task: Route MCP toolExecutor through apiGateway via mcpToolApi module

**ID:** route-mcp-toolexecutor-through-apigateway-via-mcptoolapi-module
**Status:** done
**Branch:** route-mcp-toolexecutor-through-apigateway
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-08
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

`webclientv4/src/app/chat/toolExecutor.ts` makes raw `fetch()` calls and hand-rolls auth-header building (`buildAuthHeaders`) and error-body parsing (`extractErrorMessage`) — duplicating what `src/api/api-gateway.ts` already provides for free via interceptors (`attachAuthHeaders`, baseURL, Content-Type, `saveAuthHeaders` token-refresh, `handle401` redirect) and what axios gives for free (auto-parsed error response body on `error.response.data`).

Create `src/app/chat/mcpToolApi.ts` — an `*Api.ts` module (required by the `no-api-gateway-outside-api-modules` eslint rule) with one typed method per MCP endpoint, each `apiGateway.get<T>(...).then(r => r.data)`, mirroring `src/app/bank-accounts/bankAccountApi.ts`. Rewrite `toolExecutor.ts` as a thin dispatcher: validate args, call the api method, `JSON.stringify` the result; surface LLM-recoverable validation messages by catching the axios error and reading `error.response?.data?.error` (fall back to status/statusText). Delete `buildAuthHeaders`; collapse `extractErrorMessage`.

This subsumes the two goals of the cancelled task `harden-mcp-toolexecutor-surface-400-error-bodies-to-the-llm-dedup-auth-headers` (surface error bodies + dedup auth headers) via the correct architecture, and gains token-refresh + 401 handling for free.

Endpoints to cover: `/mcp/overspending_analysis` (analyze_overspending), `/mcp/overspending_analysis_by_allocation` (analyze_overspending_by_allocation), `/mcp/categories` (list_categories), `/mcp/budget_accuracy` (budget_accuracy).

DECISION (settled): accept that MCP tool calls will now trigger the global loading indicator (`loadingInterceptor`); revisit only if noisy in practice.

Provenance: surfaced during senior review of the budget_accuracy tool + the cancelled harden-mcp attempt, 2026-06-08.

---

## Acceptance Criteria

- [x] New `src/app/chat/mcpToolApi.ts` with a typed method per endpoint, routed through `apiGateway` (mirrors `bankAccountApi.ts`). Param-typed args; returns parsed `.data`.
- [x] `toolExecutor.ts` rewritten as a thin dispatcher calling `mcpToolApi`; `buildAuthHeaders` deleted; raw `fetch()` and manual header construction gone.
- [x] Validation error bodies surfaced to the LLM: a 4xx with `{error: "<msg>"}` results in a thrown error containing `<msg>`; falls back to status/statusText when the body has no string `error`.
- [x] Existing arg-validation behaviour preserved (missing required params throw the same "missing required parameter" errors before any request).
- [x] Tests: `mcpToolApi.spec.ts` covers each method against a mocked `apiGateway`; `toolExecutor.spec.ts` covers dispatch, validation, and error-body surfacing end-to-end by mocking `apiGateway` and running the real `mcpToolApi` (the boundary-correct pattern per `vue-coding-rules.md` — error-surfacing logic lives in `toolExecutor.toolError`, not the passthrough api module). 100% coverage on both new files.
- [x] Gates green in `webclientv4/`: `npm run type-check`, `npm run test`. No error suppression.

### Out of scope
- Backend changes (query objects already return helpful `{error}` bodies).
- Suppressing the global loading indicator for MCP calls (deferred by decision above).

---

## Implementation Notes

_Remove if empty._
