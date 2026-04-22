# Task: Loosen devise_token_auth version constraint

**ID:** loosen-devise_token_auth-version-constraint
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

`devise_token_auth` is pinned to `~> 1.2.2` which locks out 1.3.x releases containing Ruby 3.2 and Rails 7.1 compatibility fixes. Loosen the constraint to allow minor version upgrades.

---

## Acceptance Criteria

- [ ] `devise_token_auth` constraint changed from `~> 1.2.2` to `~> 1.2` in Gemfile
- [ ] `Gemfile.lock` updated via `bundle install`
- [ ] `bundle exec rspec` passes (all auth specs green)
- [ ] Pre-commit checks pass

---

## Implementation Notes

### Files to change
- `Gemfile` line 40 — change `'~> 1.2.2'` to `'~> 1.2'`

### Approach
- One-line change + `bundle install` + full rspec run
- Auth is critical — if any auth specs fail after the version bump, the constraint should stay as-is and the task should be reported as blocked

### Risks
- Low. `~> 1.2` still pins to 1.x (won't jump to 2.0). But auth is load-bearing — rspec is the safety net.

### Commit scope
- Single commit
