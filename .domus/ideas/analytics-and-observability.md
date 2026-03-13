# Idea: Analytics, Logging, and Observability

**Date:** 2026-03-11
**Project:** Everycent Migration

---

## The Idea

Add per-user interaction logging and analytics infrastructure. This includes:

- Logging all user interactions (keyed by username) for product analytics
- Google Analytics (GA) tracking on the frontend
- OpenTelemetry instrumentation for distributed tracing and observability

Analytics/logging data should live in a **separate database** from the main app DB to avoid coupling operational data with analytical data and to allow independent scaling.

---

## Why This Is Worth Doing

- Understand how users actually use the product (which features, how often, drop-off points)
- Foundation for data-driven product decisions
- OpenTelemetry gives visibility into backend performance without vendor lock-in
- Prerequisite for Everycent becoming a real product with real usage insights

---

## Open Questions / Things to Explore

- **Storage choice for analytics DB** — candidates to evaluate:
  - ClickHouse (columnar, fast aggregations, self-hostable)
  - TimescaleDB (Postgres extension, familiar tooling)
  - A managed service (e.g. Posthog, Mixpanel) vs. self-hosted
  - BigQuery or similar cloud data warehouse if scale warrants it
- What exactly to log — page views, feature interactions, API calls, or all of the above
- Privacy implications — user-keyed logs need a data retention and deletion policy
- Whether GA and OpenTelemetry cover different enough concerns to warrant both, or if one covers the need
- How to pipe Rails + Vue telemetry into the same observability backend
- Whether this runs as a sidecar/separate service or is instrumented inline
