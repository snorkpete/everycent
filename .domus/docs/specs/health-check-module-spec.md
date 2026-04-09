# Codebase Health Check Module — Design Spec

**Status:** Draft
**Date:** 2026-04-06
**Context:** Emerged from manual experiment running review agents across the Everycent codebase. This spec captures the design for an automated, multi-lens codebase health check system.

---

## Problem

Codebase health degrades silently. Dependencies go stale. Patterns that started consistent diverge as new features get built one at a time. The frontend and backend develop contract mismatches — TypeScript types promise fields the API doesn't send, or the API sends data the types don't expose. Code gets duplicated across modules because nobody remembers the same logic already exists elsewhere.

None of this breaks anything today. It accumulates until a periodic refactoring pass discovers the full extent of the drift — by which point the cleanup is expensive and the scope is surprising.

The health check module automates detection. Rather than discovering drift during refactoring, the system runs periodic diagnostic scans across multiple dimensions (duplication, consistency, dependency health, FE/BE contract alignment, dead code) and surfaces findings as actionable tasks. The goal: targeted fixes at the point of drift, not archaeological excavation months later.

## Design Principles

1. **Separate lenses, not one mega-review.** Each review agent has a single focus. Broad "review everything" agents produce unfocused noise.
2. **Agents don't know about each other.** Cross-lens deduplication and prioritization happen downstream in the doctor skill, not in the review agents themselves.
3. **Tool + LLM hybrid where appropriate.** Deterministic tools produce facts; LLMs produce judgment and insight. Use each where it's strongest.
4. **Finding nothing is a valid result.** A clean report from a lens that previously found issues is a signal that fixes worked. During the tuning phase, agents should err toward over-reporting — it's easier to ignore noise than to miss signal. Over time, as we calibrate what's actionable, prompts tighten to filter out low-value findings.
5. **Human in the loop, decreasing over time.** The doctor skill starts interactive (draft task list for human review). Common patterns get automated as confidence grows. The loop gets faster, not removed.

---

## Architecture

```
Health Check Skill (coordinator)
        |
        |  dispatches lenses, enforces concurrency, waits for all to complete
        v
   Review Agents (parallel, per-lens, max 4 concurrent)
        |
        v
   Raw Reports (structured findings, written to disk)
        |
        |  all reports complete — snapshot handed off
        v
   Doctor Skill (interactive, human-in-the-loop)
        |
        v
   Domus Tasks (actionable, deduplicated, prioritized)
```

### Health Check Skill

The coordinator. Dispatches review agents across selected lenses, respects the concurrency limit (max 4 simultaneous), and waits for all agents to complete before handing off to the doctor. This is the entry point — invoked manually when the user judges enough has changed to warrant a check.

### Review Agents

Each agent is a focused sub-agent (sonnet model) that scans a defined scope and produces a structured report. Agents run in parallel within the concurrency limit the coordinator enforces.

### Doctor Skill

Runs after all review agents complete. Responsibilities:
- **Dedup across lenses** — the same issue surfaced by multiple lenses becomes one task
- **Check existing work** — skip findings that match open domus tasks or won't-fix tasks
- **Weigh importance** — use agent-provided severity as input, apply its own judgment
- **Draft task list** — present to user for review/approval before creating tasks

The doctor does NOT run until all review reports are written. It works from a snapshot.

### Won't-Fix Suppression

When a finding is reviewed and deliberately not acted on, the corresponding domus task is marked with a terminal `won't-fix` status. Future doctor runs check existing tasks (including won't-fix) and skip matches. This prevents re-nagging on known, accepted issues.

### Future Vision: Auto-Fix Patterns

As the system matures, recurring finding types that always result in the same fix action can be identified and promoted to auto-fix rules. The doctor learns which findings the user consistently approves without modification and begins applying those automatically — surfacing only novel or ambiguous findings for human review. The system gets smarter over time, not just faster. The human loop narrows to where judgment is genuinely needed.

---

## Lens Taxonomy

### Judgment Lenses (LLM-primary)

These require reasoning about similarity, intent, and design quality. LLMs are the right tool.

| Lens | Scope | What it finds |
|---|---|---|
| Duplication | FE or BE (separate) | Copy-paste code, extractable patterns, repeated logic |
| Consistency | FE or BE (separate) | Same concept implemented differently, naming divergence, style drift |

### Cross-Cutting Lenses (must see both layers)

| Lens | Scope | What it finds |
|---|---|---|
| Contract mismatch | FE API modules + BE serializers/controllers | Type declarations vs actual API response shapes |
| Dead code (cross-layer) | FE API modules + BE controllers/serializers | See dead code matrix below |

**Dead code matrix.** The cross-layer check is the prerequisite that makes single-layer dead code tools trustworthy. Only F→B calls are valid (frontend calls backend), giving three connection states. Combined with field-level alignment, this produces 9 cells:

| # | Connection | Field | What it means | Category |
|---|---|---|---|---|
| 1 | FN BP | Both | Dead BE endpoint; orphaned FE types linger. Cleanup both. | Dead code |
| 2 | FN BP | FE only | Dead BE endpoint; FE types declare fields BE doesn't even send. Double orphan. | Dead code |
| 3 | FN BP | BE only | Dead BE endpoint, no FE trace at all. Pure dead backend. | Dead code |
| 4 | FP BN | Both | FE calls non-existent endpoint. 404 at runtime. | System error |
| 5 | FP BN | FE only | FE calls non-existent endpoint with phantom fields. | System error |
| 6 | FP BN | BE only | Degenerate — if endpoint doesn't exist, it can't have fields. Edge case: serializer/model exists but no route. | System error |
| 7 | FP BP | Both | Connected and aligned. | Healthy |
| 8 | FP BP | FE only | FE declares field BE doesn't send. Latent bug if read. | Contract mismatch |
| 9 | FP BP | BE only | BE sends field FE doesn't type. Wasted work, invisible to devs. | Contract mismatch |

Key — first letter is the layer: **F** = frontend, **B** = backend. Second letter is presence: **P** = API endpoint/function present, **N** = not present. So **FP BN** = frontend API function exists, backend endpoint does not. "Both/FE only/BE only" in the field column refers to which side declares a given field — in the FE type definition or the BE serializer output.

Cells 8 and 9 overlap with contract mismatch — the dead code lens sees them from a different angle. The doctor must dedup these across lenses.

Cells 4-6 (FP BN) are particularly likely during migration: an API function was written speculatively or copy-pasted from Angular, but the endpoint was never wired up or got removed. TypeScript compiles fine — the failure is only at runtime.

Once cells 1-6 are resolved and dead cross-layer code is removed, standard single-layer static analysis tools can reliably detect dead code within each layer independently.

**Note on contract mismatch:** Each FE client (web, future mobile) pairs independently with the BE. Adding a client adds a pairing, not combinatorial complexity. The lens is: "for each FE API function, find the corresponding BE controller action, compare shapes."

### Hybrid Lenses (tool produces data, LLM produces insight)

| Lens | Tool layer | LLM layer |
|---|---|---|
| Dependency health (FE) | `npm audit` (security), `knip` (unused deps) | Consequence assessment, migration recommendations |
| Dependency health (BE) | `bundler-audit` (security), gem version checks | Consequence assessment, upgrade risk |
| Dead code (single-layer, FE) | `knip` (unused exports/files), `eslint-plugin-vue` (unused components) | Interpret results, flag false positives, suggest cleanup scope |
| Dead code (single-layer, BE) | None — LLM only | See ADR below |
| Test coverage gaps | `vitest --coverage` (FE), `rspec` coverage (BE) | "Are the right things tested?" vs just coverage % |

**Note on tooling:** `knip` is the current community default for TypeScript/Vue unused code detection (replaced `ts-prune`). `bundler-audit` is the unambiguous default for Ruby gem security. Tool choices should be validated when implementation begins; this table reflects consensus as of early 2026.

**BE dead code — no static tooling.** Rails metaprogramming causes unacceptable false positive rates in available static tools. This lens is LLM-only. See [ADR-001](../adrs/001-no-static-tooling-be-dead-code.md) for full rationale.

### Lower-Frequency Lenses

| Lens | Scope | What it finds |
|---|---|---|
| Performance / bundle | FE | Large components needing lazy-load, unnecessary re-renders, heavy imports |
| Security | FE or BE (separate) | Future lens — not yet scoped. Likely includes: OWASP-style review, auth/authorization gaps, data exposure, secrets in code. Needs an experiment run (like the initial 4-lens experiment) to determine what's actionable vs noise before formalizing. |

---

## Report Format

Each finding in a report follows this structure:

```markdown
## Finding [N]
- **Files**: file1.ts:L10-25, file2.ts:L30-45
- **Type**: [lens-specific type taxonomy]
- **Impact**: [critical | high | medium | low]
- **Effort**: [small | medium | large]
- **Description**: What the issue is and why it matters. Enough detail
  that another agent could act on this to fix it.
```

### Impact Scale
- **Critical** — runtime bug (code reads wrong shape, logic error)
- **High** — architectural issue (pattern divergence that causes maintenance burden across many files)
- **Medium** — maintenance burden (localized, but accumulates)
- **Low** — cosmetic (naming, style, minor inconsistency)

### Effort Scale
- **Small** — single file, < 1 hour, mechanical change
- **Medium** — few files, needs tests updated, some judgment required
- **Large** — cross-cutting, many files, potential for breakage

**Note on impact/effort calibration.** These scales were not part of the initial experiment — the first reports only had files, type, and description. Agent classifications will need calibration against human judgment. During the tuning phase, treat agent-assigned impact/effort as a starting suggestion, not a reliable sort key. The doctor + human loop catches misclassification; over time, prompt refinement narrows the gap.

### Contract Mismatch Classification

The contract mismatch lens must distinguish between:
- **Runtime-breaking** — code reads the wrong shape (e.g., store assigns `{ success: true }` to a typed state variable and downstream code reads properties that don't exist)
- **Type-gap** — data exists at runtime but TypeScript types don't expose it (e.g., backend sends `paid`, frontend type doesn't declare it — works in JS, invisible in TS)
- **Latent** — types promise something the backend doesn't deliver, but nothing reads the missing field yet

This distinction matters because TypeScript is a type checker, not a runtime system. Shape mismatches are only runtime bugs when code actually depends on the incorrect shape.

### Zero-Finding Reports

A report with 0 findings and a note "No significant [duplication|inconsistency|etc.] detected" is valid output — a healthy codebase for that dimension, not a failed review.

**Tension with tuning phase:** During early runs, agents should err toward over-reporting (per Design Principle 4) — it's easier to filter noise than miss signal. This means the threshold for "worth reporting" starts low and tightens as we calibrate what's actionable. Once calibrated, agents should not inflate reports with trivial findings to avoid empty output. The transition is gradual: early runs will have more low-impact findings; mature prompts will filter those out.

### Dedup and Traceability

Every finding must contain enough identifying detail — specific file paths, line numbers, and a description of the issue — that future doctor runs can match it against existing domus tasks (including won't-fix tasks). A finding without file-level specificity cannot be deduplicated or suppressed, which means it will resurface every run. This is a hard requirement on report quality, not a nice-to-have.

---

## Execution Model

### Concurrency
- Maximum 4 agents running simultaneously (hardware constraint)
- A full run across all lenses is ~15 agent dispatches: duplication (2), consistency (2), contract mismatch (1), dead code cross-layer (1), dep health (2), dead code single-layer (2), test coverage (2), performance (1), security (2). At 4 concurrent, that's 4 sequential batches.
- Wall time for a full run: ~20-30 minutes
- Typical runs will be a subset — lower-frequency lenses (performance, security) don't run every time. A focused run (e.g., just duplication + consistency + contract mismatch) is 5 dispatches, one batch, ~5-10 minutes.

### Model Choice
- **Review agents:** Sonnet (validated — sufficient quality, cost-effective)
- **Doctor skill:** Interactive, runs in main session (Opus or Sonnet depending on context)
- **Haiku:** Tested and rejected. See [ADR-002](../adrs/002-haiku-rejected-for-review-agents.md).

### Cadence
- **Trigger:** Manual, based on human judgment ("enough has changed")
- **Signal for running:** After completing a major feature, migration milestone, or refactoring pass
- **Signal for NOT running:** No meaningful code changes since last review
- **Evolution:** Monitor when reviews are triggered and what they find. Patterns may emerge that suggest encoding a trigger (e.g., "after every N tasks completed" or "after touching > X files")

### Scope
- Full codebase for now (codebase is small enough)
- Future isolated modules (NLQ layer, mobile app APIs) can be reviewed independently once they exist as distinct subsystems
- The lens constraint keeps output manageable at current scale; revisit if finding counts consistently exceed ~25 per lens

---

## Output Location

Reports are written to `.domus/reviews/` (gitignored). Naming convention:

```
<lens-name>-<date>.md    — each run is dated and kept
```

Every run is archived. The durable output is the domus tasks the doctor creates, but report history serves as a meta-signal: comparing finding counts across runs reveals whether fixes are landing and whether lenses are drifting. Disk is cheap; lost history isn't recoverable.

---

## Open Questions

1. **Won't-fix in domus:** The suppression mechanism depends on domus supporting a `won't-fix` terminal status. Domus doesn't have this yet. Needs to be specified and built — prerequisite for the doctor skill's dedup-against-existing-work flow.
2. **Security lens scope:** What does this look like concretely? OWASP top 10 scan, auth/authorization review, data exposure audit? Needs an experiment like we did with the other lenses.
3. **Doctor skill design:** Interactive triage flow TBD. Likely: present findings grouped by theme, user approves/rejects/marks-won't-fix, approved findings become domus tasks.
4. **Prompt templates:** Each lens needs a carefully tuned prompt. The contract mismatch lens in particular needs explicit guidance on runtime vs type-system impact (learned from experiment).

## Resolved

- **Static tool choices:** Knip (FE), bundler-audit (BE), no BE dead code tooling (ADR-001). Remaining work is installation and wiring — tracked as a task, not an open question.
- **Cross-run tracking:** Doctor checks domus task state (including won't-fix). Report history exists at `.domus/reviews/` for meta-signals (finding count trends) but the doctor does not diff reports directly.
- **Model choice:** Sonnet for review agents. Haiku rejected (ADR-002).

## Remaining Experiment Work

The initial experiment (2026-04-06) validated the review agent phase only. The full workflow has not been tested end-to-end:
- **Dedup across lenses** — pure functionality, can be built and tested against the existing 8 reports
- **Doctor triage** — human-in-the-loop workflow that needs to be experienced interactively to understand the pattern before formalizing as a skill
- **Won't-fix lifecycle** — depends on domus support (open question 1)
- **Existing experiment reports** live at `webclientv4/.reviews/` — these are the input for the next phase of experimentation
