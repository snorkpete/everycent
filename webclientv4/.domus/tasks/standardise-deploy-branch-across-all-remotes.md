# Task: Standardise deploy branch across all remotes

**ID:** standardise-deploy-branch-across-all-remotes
**Status:** raw
**Autonomous:** false
**Priority:** low
**Captured:** 2026-03-24
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Production Heroku deploys from master, staging Heroku deploys from main. Align staging to also deploy from master so all three remotes (GitHub, production, staging) use the same branch name. Current workaround: git push staging master:main.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
