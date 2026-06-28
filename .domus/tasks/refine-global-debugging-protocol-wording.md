# Task: Refine global debugging protocol wording

**ID:** refine-global-debugging-protocol-wording
**Status:** raw
**Autonomous:** false
**Priority:** high
**Captured:** 2026-04-11
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The protocol lives at `~/.claude/docs/debugging-protocol.md` (NOT in this project repo — it's in the user's global `~/.claude/` directory). It's 9 rules across 4 phases (Before / During / Across / After) plus a "Why this protocol exists" history section at the bottom. Substance is right but wording is long and could be tightened. Not urgent — the rough version is usable as-is, this is polish.

Open questions for this refinement pass:

1. **Consolidation with project CLAUDE.md.** The Everycent project CLAUDE.md has an existing "Debugging: Pre-Fix Validation Sequence" section with 3 bullets that overlap with the global protocol (reproduce before fixing, visual confirmation before fixing tests, server-running check). Decide whether to:
   - Remove the overlapping bullets from project CLAUDE.md (keep the global as single source of truth) and keep only the Everycent-specific bits (Rails 3000 / Vite 4200 port numbers and commands) as a project override.
   - OR keep both and treat the project section as a supplementary project-specific layer.

   Recommendation to evaluate: consolidate — single source of truth is easier to maintain.

2. **History section placement.** The bottom of the protocol has a "Why this protocol exists" section explaining the 2026-04-11 google-auth session failures that produced each rule. This may or may not belong inline with the protocol — consider moving to a separate `~/.claude/docs/debugging-protocol-history.md` so the protocol itself is leaner. Tradeoff: the "why" is part of what makes the rules feel load-bearing to future sessions, so splitting may weaken that. Leave inline unless the protocol gets too long.

3. **Rule wording tightness.** Several rules are 2-3 sentences where 1 might suffice, but compressing risks losing nuance about hypothesis framing, trust cost, and why mechanical self-service matters. Suggested approach: try a compressed version, diff against the current version, keep whichever feels stronger. Don't compress at the cost of intent clarity.

---

## Acceptance Criteria

- [ ] Protocol wording tightened (fewer sentences per rule where possible without losing nuance)
- [ ] Decision made and documented about project CLAUDE.md consolidation (either done or explicitly deferred with reasoning)
- [ ] History section placement decided (keep inline or split out)
- [ ] Global CLAUDE.md pointer at `~/.claude/CLAUDE.md` still points at the correct path after any file moves

---

## Implementation Notes

_Remove if empty._
