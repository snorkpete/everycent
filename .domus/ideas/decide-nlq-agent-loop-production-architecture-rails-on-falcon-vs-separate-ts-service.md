# Idea: Decide NLQ agent-loop production architecture: Rails-on-Falcon vs separate TS service

**Captured:** 2026-06-22
**Status:** raw

---

## The Idea

The NLQ chat is frontend-driven today (agent loop in chatAgent.ts, Ollama in-browser) purely as a local-dev convenience. For a real hosted-model deployment the loop must move server-side. Open question explored 2026-06-22 (no decision): (a) keep it in Rails on a fiber server (Falcon + isolation_level=:fiber) — ops-simple, one runtime, atomic deploy, fibers hold many concurrent streams cheaply and serve web+mobile from one loop; vs (b) a separate TS/Node service — engineer's preference (right runtime for evented streaming, shared types with the Vue FE) but on Heroku forces either a same-dyno supervisor (worst-of-both: two runtimes, coupled scaling) or a separate Heroku app (two deploys, cross-service auth, extra app-to-app hop per tool call). Leaning (a)-on-Falcon for single-household scale; reach for (b) only if a second client or multi-tenant scale justifies the operational surface. Hard precondition for ANY hosted-API path: rate limiting + per-user cost caps (see SB everycent-nlq-hosted-api-rate-limit-gate). Full exploration in SB inbox everycent-nlq-agent-loop-production-architecture-exploration.

---

## Why This Is Worth Doing

_To be filled in._

---

## Open Questions / Things to Explore

- _Add open questions here_
