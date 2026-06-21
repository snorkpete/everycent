# Idea: Backend observability (OpenTelemetry)

**Captured:** 2026-03-11
**Status:** raw

---

## The Idea

Instrument Rails (and optionally Vue) with **OpenTelemetry** for distributed tracing and performance visibility, with no vendor lock-in.

Scoped down from the original "analytics, logging & observability" idea. **The product-analytics half (Google Analytics + per-user/username-keyed interaction logging) has been retired** — Everycent is a two-user household app, so behavioural analytics has nothing meaningful to measure and never pays off. Observability (debugging, performance, error visibility) is the part that's genuinely useful today.

---

## Why This Is Worth Doing

- See backend performance and request flow when something is slow or breaks — real debugging value now, not someday.
- OpenTelemetry is vendor-neutral: instrument once, point at whatever backend (self-hosted or managed) without rewiring.
- Complements the narrow telemetry that already exists (LLM usage records, chat-transcript capture) with general request/trace visibility.

---

## Open Questions / Things to Explore

- **Backend to send traces to** — self-hosted (e.g. Jaeger / Grafana Tempo / SigNoz) vs a managed OTLP endpoint (Honeycomb, Grafana Cloud, etc.). Cost vs effort for a personal app.
- **Scope of instrumentation** — Rails-only first (controllers, DB queries, the `/mcp/*` tool endpoints, import pipeline)? Add Vue/browser tracing later, or skip it?
- **Sidecar vs inline** — run a collector as a separate process/service, or export directly from the app.
- **Sampling & retention** — low-traffic app, so probably trace everything; still decide retention to avoid unbounded storage.
- **Heroku fit** — does the chosen collector/exporter run cleanly on the Heroku deploy model, or does it need an add-on?
- **Privacy** — traces can capture request params/SQL; ensure no PII (amounts, descriptions, household identifiers) leaks into span attributes, given the public-repo / PII sensitivity.

---

*Split note: the retired GA / product-analytics half was dropped 2026-06-21 during idea review — two-user app, no analytics value.*
