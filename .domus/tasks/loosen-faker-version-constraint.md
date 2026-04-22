# Task: Loosen faker version constraint

**ID:** loosen-faker-version-constraint
**Status:** done
**Autonomous:** true
**Priority:** low
**Captured:** 2026-04-10
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

`faker` is pinned to `~> 3.2.0` (patch-only). It's a test-only gem — loosen to `~> 3.2` to allow minor version upgrades.

---

## Acceptance Criteria

- [x] `faker` constraint changed from `~> 3.2.0` to `~> 3.2` in Gemfile
- [x] `Gemfile.lock` updated via `bundle install`
- [x] `bundle exec rspec` passes
- [x] Pre-commit checks pass

---

## Implementation Notes

### Files to change
- `Gemfile` line 78 — change `'~> 3.2.0'` to `'~> 3.2'`

### Approach
- One-line change + `bundle install` + rspec

### Risks
- None. Test-only gem.

### Commit scope
- Single commit
