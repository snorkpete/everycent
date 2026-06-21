# Idea: Automate the healthcheck loop into a self-cleaning system

**Captured:** 2026-06-19
**Status:** raw

---

## The Idea

Today healthcheck is a me-in-the-loop process (audits + fixes, dependency updates, behaviour-preserving refactors). Explore automating the whole loop so the system self-cleans and surfaces only problems/decisions to Kion. This is background orchestration operating ON the repo — closer to a Claude Code / domus-harness / scheduled-agent shape than to the in-app NLQ chat agent. Distinct from chat-agent work and does not bear on the NLQ agent hosting decision. Direction unknown — exploratory.

**Includes the periodic-refactoring angle** (folded in from the now-abandoned `periodic-refactoring-process-and-refactor-skill` idea, 2026-06-21): one concrete recurring pass the loop should run is a **structured refactoring pass** — inventory shared patterns → identify extraction candidates → propose changes → apply + test. Per the "do it manually first, then extract" rule, run that pass by hand a few times before crystallizing it into a reusable `/refactor` skill that the automated loop can invoke.

---

## Why This Is Worth Doing

- Keeps internal quality (audits, dependency freshness, behaviour-preserving refactors) from depending on Kion remembering to do it — the loop runs itself and only escalates problems/decisions.
- The healthcheck worktree already operationalized *where* this work lives; this idea is about automating the *cadence and execution*.
- A repeatable structured-refactoring pass (and eventually a `/refactor` skill) makes the refactoring half of the loop consistent rather than ad-hoc.

---

## Open Questions / Things to Explore

- **Orchestration shape** — scheduled cloud agent / cron routine vs domus-harness workflow vs a local loop. What triggers a run (time-based? on dependency-update availability? before each feature migration?).
- **What the loop does autonomously vs surfaces for decision** — fixes it can land behind behaviour-preservation guarantees vs changes that need Kion's sign-off.
- **The structured refactoring pass** — run it manually 2–3 times first; capture what works/doesn't before extracting a `/refactor` skill (don't design the skill upfront).
- **Behaviour-preservation guardrails** — how does the loop prove a change is behaviour-preserving (full test suite, type-check, coverage gates) before self-merging?
- **Reporting** — how does it surface "here's what I cleaned / here's what needs you" without becoming noise.
- **Relationship to existing pieces** — healthcheck worktree as the workspace, deploy skill, senior-code-reviewer, domus task lifecycle.

---

*Merge note: absorbed `periodic-refactoring-process-and-refactor-skill` (the structured-refactoring-pass recipe + `/refactor` skill extraction) on 2026-06-21; that idea abandoned as superseded.*
