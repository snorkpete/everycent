# ADR-002: Haiku Rejected for Review Agents

**Date:** 2026-04-08
**Status:** Accepted
**Context:** Health Check Module — choosing the model tier for review agents

## Decision

Review agents use Sonnet. Haiku was tested and rejected.

## Evidence

On 2026-04-06, all 4 initial lenses (duplication, consistency, API surface, dependency health) were run with both Sonnet and Haiku using identical prompts against the full Vue codebase.

**Sonnet results:** 15, 16, 18, and 13 findings respectively. Specific line ranges, precise descriptions, found actual bugs (e.g., settings store assigning wrong response shape). Findings were immediately actionable.

**Haiku results:** 13, 10, 12, and 12 findings. Fewer findings with less precision — vaguer descriptions, fewer line numbers. Some findings were observations rather than actionable issues (e.g., noting that all API methods use `.then(r => r.data)` consistently — which is correct behavior, not a problem). Dependency health took a different but not wrong approach (focused on transitive CVEs rather than structural issues).

## Rationale

The quality gap is significant enough that Haiku reports would require more human interpretation to be useful, negating the cost savings. Sonnet's output can flow into the doctor skill with minimal friction. Haiku's output would need a human pre-pass before the doctor could work with it.

## Consequences

- Higher per-run cost than Haiku (but review runs are infrequent — cost is negligible)
- Revisit if Haiku's quality improves in future model releases
