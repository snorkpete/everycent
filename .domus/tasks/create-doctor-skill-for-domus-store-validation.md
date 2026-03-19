# Task: Create doctor skill for domus store validation

**ID:** create-doctor-skill-for-domus-store-validation
**Status:** deferred
**Refinement:** raw
**Priority:** normal
**Captured:** 2026-03-14
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Skill that validates a single project's domus store: JSONL/MD frontmatter sync, open task status accuracy vs git log, schema integrity (field names, required fields present). Returns a concise report. Process: list tasks/ideas via --json, spot-read MD headers, cross-ref open tasks against git log, flag any drift. Runs as background subagent since it mostly returns all-ok. Skill lives in .claude/skills/doctor/SKILL.md.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
