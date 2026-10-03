# Task: Clear Heroku build warnings: remove bin/bundle binstub and move to latest Ruby 3.4.x

**ID:** clear-heroku-build-warnings-remove-binbundle-binstub-and-move-to-latest-ruby-34x
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-10-03
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The v91 deploy build warned that the bin/bundle binstub should be removed (heroku-buildpack-ruby issue 1690: rm bin/bundle) and that a newer Ruby 3.4 patch (3.4.11) is available than the one in use. Neither blocked the release. Behaviour-preserving internal work for the healthcheck worktree; follow the rbenv/ruby-build note in memory when bumping Ruby.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
