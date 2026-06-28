# Task: Rails 8.1 post-upgrade gem cleanup

**ID:** rails-81-post-upgrade-gem-cleanup
**Status:** done
**Autonomous:** false
**Priority:** low
**Captured:** 2026-06-18
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Loose-ends gem hygiene after the Rails 7.1→8.1 / Ruby 3.4 upgrade (which merged to
master 2026-06-18). Behaviour-preserving; **healthcheck worktree**.

### 1. Remove `gem 'bundler'` from the Gemfile (the real item)
Line ~4 still declares `gem 'bundler'`. The upgrade task explicitly listed removing it
as a fold-in and it was missed. Bundler is the build tool, not an app runtime dependency —
declaring it in the Gemfile is a long-standing anti-pattern (and Bundler itself has warned
against it). Remove the line, `bundle install`, confirm the suite is green. No app code
requires `bundler` as a library (`Bundler.require` in application.rb is the bundler API,
always available regardless).

### 2. (Optional) low-risk bumps surfaced by `bundle outdated`
Not required by the upgrade — routine maintenance, include only if doing a refresh pass:
- `googleauth` 1.16.2 → 1.17.1 (minor; **auth-sensitive** — bump deliberately and smoke-test
  Google sign-in + ID-token verification, don't bump casually).
- `spring` 2.1.1 → 4.6.0 (dev-only tool; major bump — verify `bin/spring` / preloading still work).

### Explicitly OUT of scope (tracked elsewhere)
- `active_model_serializers` migration → its own task `migrate-off-active_model_serializers-to-a-maintained-serializer`.
- **Rack 3 / rack-cors 3.0** → see separate Rack 3 task. (Note: there is NO hard blocker on
  Rails 8.1 — Rails supports Rack 3, puma 8 is Rack-3-ready, and our surface is just one
  `Rack::Cors` middleware + no direct Rack usage. It was deferred for scope isolation, with
  Rails 8.2 as the forcing deadline — not a prerequisite.)

---

## Acceptance Criteria

- [ ] `gem 'bundler'` removed from the Gemfile; `bundle install` clean; `bundle exec rspec` green
- [ ] (If included) googleauth bumped + Google sign-in smoke-tested; spring bumped + preloading verified
- [ ] No `package-lock.json` / unrelated lockfile churn
