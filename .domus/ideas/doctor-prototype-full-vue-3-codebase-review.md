# Idea: Doctor Prototype: Full Vue 3 Codebase Review

**Captured:** 2026-03-24
**Status:** raw

---

## The Idea

Use a comprehensive review of the webclientv4 codebase as the first real test case for the Domus Doctor role. The Vue 3 migration is nearing completion, and the user has stepped back from reviewing individual changes — making this a natural moment for a full audit.

Two review modes to prototype:
- **Localized reviews** — single file or component, focused on quality/correctness
- **System-wide reviews** — architecture, patterns, consistency across the codebase

The expectation is that findings will be mostly detail-level (duplicated helpers, shared components to extract, inconsistent patterns) rather than architectural, since the Vue app was modeled after the existing Angular structure.

The key goal is **capturing the process itself** — not just the findings. This is as much about figuring out how the Doctor works as it is about the review.

---

## Why This Is Worth Doing

- The Vue codebase has grown through migration with decreasing review attention — a full audit is overdue on its own merits
- Prototyping Doctor on a real codebase review gives concrete workflow feedback (what works, what's noisy, what's useful)
- Easy wins (deduplication, shared utilities) improve the codebase while also generating the kind of findings that test whether Doctor's output format is actionable
- Establishes the pattern for future periodic reviews

---

## Status / Progress (2026-06-21)

**KEEP — started but automation didn't get far enough.** The manual review process was run once and produced artifacts, but the goal of automating the Doctor role/workflow is unfinished. More to figure out and do here.

**Artifacts from the manual run live in `.reviews/2025-04-08/`** (git-tracked):
- Multi-model, multi-dimension review outputs: `haiku-*` and `sonnet-*` across `api-surface`, `consistency`, `dependency-health`, `duplication` dimensions, plus `sonnet-deduped.md` (the merged/deduped findings).
- This was effectively a model-comparison (haiku vs sonnet) and dimension-decomposition prototype. ADR `.domus/docs/adrs/002-haiku-rejected-for-review-agents.md` captured one outcome (haiku rejected for review agents).

**Still open:** turning this one-off manual run into a repeatable, automated Doctor process — triggers, output format, task-filing, scope-per-run, and how it plugs into the healthcheck loop (see `automate-the-healthcheck-loop-into-a-self-cleaning-system`). The review *capability* now also exists via the `senior-code-reviewer` agent + `/code-review` skill; the gap is the automated, periodic, role-driven orchestration.

---

## Open Questions / Things to Explore

- What triggers a Doctor review? Scheduled (e.g. weekly), on-demand, or both?
- What output format works best — tasks filed directly? A report to review? Inline annotations?
- How does Doctor connect to the refactoring pipeline — does it create tasks, or just surface findings for the user to triage?
- What's the right scope for a single Doctor run — whole codebase, or one feature area at a time?
- How does Doctor distinguish "this is a real issue" from "this is a style preference" — what's the threshold for filing something?
- Should Doctor have access to the project's coding rules (vue-coding-rules.md) as its quality bar, or develop its own heuristics?
- How does this relate to the existing `periodic-refactoring-process-and-refactor-skill` idea and the `create-doctor-skill-for-domus-store-validation` task?
