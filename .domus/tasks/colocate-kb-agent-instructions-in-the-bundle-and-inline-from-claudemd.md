# Task: Colocate KB agent-instructions in the bundle and inline from CLAUDE.md

**ID:** colocate-kb-agent-instructions-in-the-bundle-and-inline-from-claudemd
**Status:** proposed
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-29
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

**Goal:** Establish a consistent OKF-bundle config pattern across all of Kion's OKF bundles, using the second-brain vault as the reference template. The agent instructions for working with a KB should live colocated with the KB (in a top-level bundle folder OUTSIDE the knowledge store itself), and the project CLAUDE.md should just INLINE them rather than holding them inline.

Specifically: extract the everycent CLAUDE.md "Knowledge Base" section into a colocated `knowledge-base/docs/agent-instructions.md` and have CLAUDE.md inline it, mirroring how the second-brain vault colocates its KB instructions. This is behavior-preserving config cleanup — work belongs on the healthcheck branch.

**Reference precedent (the template to mirror):** Second-brain at `/Users/kion/code/second-brain/` — `docs/agent-instructions.md` holds the vault's working instructions; `docs/okf-structure.md` is the OKF format spec; `notes/` is the knowledge store; the personal `~/.claude/CLAUDE.md` inlines `docs/agent-instructions.md` via an `@import`. Everycent's KB should adopt the same shape.

**Concrete steps:**
1. Create a meta/config folder colocated with the everycent KB — likely `knowledge-base/docs/` (a top-level bundle folder sibling to the knowledge-store dirs `tables/`, `concepts/`, `tracking/`, `legacy/`). Confirm exact placement against the SB precedent (in SB, `docs/` sits at the bundle root next to `notes/`).
2. Move the "Knowledge Base" section of the everycent project CLAUDE.md into `knowledge-base/docs/agent-instructions.md`. That section currently holds: always-loaded tier-1 wiring (`vocabulary.md` + root `index.md`), tier-2 per-area `index.md` loading, the forced-lookup rule for absence/derivation claims, the generated-never-hand-edited rules (`rake kb:vocabulary` / `rake kb:index` + their `:check` pre-commit gates), and the frontmatter-contract pointer to `about.md`.
3. Replace that section in CLAUDE.md with a single inline reference (`@knowledge-base/docs/agent-instructions.md`) so CLAUDE.md just pulls it in — keeps CLAUDE.md lean/organized and makes it obvious that KB working-rules change in the KB's own docs.
4. Establish + document the convention: a bundle has top-level folders OUTSIDE the knowledge store (e.g. `docs/` for agent-instructions + format spec; the generated `vocabulary.md` / `index.md`; `about.md`) vs the knowledge store itself (concept files in `tables/`/`concepts/`/etc.). Document this in `about.md`, and propose folding the "bundle top-level folders" convention into the vault's `docs/okf-structure.md` so it becomes canonical OKF across all bundles.
5. Verify the inlined instructions still load at session start and the always-loaded tier-1 (vocab + root index) survives the move.

**Rationale:** Colocating KB instructions with the KB clarifies what changes when (KB working-rules evolve alongside the KB, not buried in a general CLAUDE.md); keeps CLAUDE.md organized and lean; consistent with how the personal CLAUDE.md already inlines the second-brain agent-instructions.

**Context / follows from:** Builds on the KB index-generation work just completed (root `index.md` thinned to areas; generated per-area `index.md` from `description`; forced-lookup rules + tier-1/tier-2 wiring added to CLAUDE.md; `kb:index` + `:check` rake tasks; pre-commit gate wired). This task extracts those CLAUDE.md rules into the colocated agent-instructions file. That index-generation work may still be uncommitted/in-flight when this task is picked up — sequence accordingly.

---

## Acceptance Criteria

- [ ] A colocated meta/config folder exists at the everycent KB bundle root (likely `knowledge-base/docs/`), sibling to the knowledge-store dirs (`tables/`, `concepts/`, `tracking/`, `legacy/`), placement confirmed against the SB precedent.
- [ ] `knowledge-base/docs/agent-instructions.md` exists and holds the full content moved from the CLAUDE.md "Knowledge Base" section: tier-1 always-loaded wiring (`vocabulary.md` + root `index.md`), tier-2 per-area `index.md` loading, the forced-lookup rule for absence/derivation claims, the generated-never-hand-edited rules (`rake kb:vocabulary` / `rake kb:index` + `:check` pre-commit gates), and the frontmatter-contract pointer to `about.md`.
- [ ] The CLAUDE.md "Knowledge Base" section is replaced by a single inline reference (`@knowledge-base/docs/agent-instructions.md`) — no KB working-rules left inline in CLAUDE.md.
- [ ] The "bundle top-level folders OUTSIDE the knowledge store vs the knowledge store itself" convention is documented in `about.md`; a proposal to fold it into the vault's `docs/okf-structure.md` is captured (so it becomes canonical OKF across all bundles).
- [ ] Verified behavior-preserving: the inlined instructions still load at session start, and the always-loaded tier-1 (vocab + root index) survives the move.

---

## Implementation Notes

- Healthcheck/behavior-preserving — do this work on the `healthcheck` branch/worktree (`/Users/kion/code/everycent-healthcheck`), not a fresh feature worktree.
- Tags `health-check, devex` chosen from the controlled vocab (`.domus/tags/shared.md`); the conceptually-desired `knowledge-base`/`docs`/`config`/`tech-debt` tags do not exist in the vocab.
