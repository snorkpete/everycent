# Task: Update deploy skill to run tests and abort on failure

**ID:** update-deploy-skill-to-run-tests-and-abort-on-failure
**Status:** done
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-04-11
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The deploy skill currently doesn't run the test suite as part of its protocol. A failing test reached master via WhatsNew content/spec drift because deploy doesn't gate on test failures. Add npm run test (and bundle exec rspec) as a pre-deploy step that aborts the deploy if anything fails.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
