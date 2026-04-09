# ADR-001: No Static Tooling for BE Dead Code Detection

**Date:** 2026-04-08
**Status:** Accepted
**Context:** Health Check Module — choosing tool vs LLM approach for each lens

## Decision

Backend dead code detection relies on LLM review only. No static analysis tools.

## Rationale

The available Ruby/Rails static analysis tools for dead code (`debride`, `traceroute`) produce high false positive rates due to Rails' heavy use of metaprogramming, dynamic dispatch, and convention-over-configuration (e.g., controller actions discovered by routing, callbacks registered by name, concerns included dynamically).

Runtime coverage tools (`coverband`) are more reliable but require production instrumentation — disproportionate setup cost for a personal app.

The LLM can reason about Rails conventions in ways static tools cannot (e.g., understanding that a method named `before_save` is a callback, not dead code).

## Consequences

- BE dead code lens is pure LLM — no hybrid tool+LLM approach like the FE side
- Higher risk of false positives than tool-backed lenses, but lower than the static tools themselves would produce
- Revisit if a reliable, low-false-positive static tool emerges for Rails
