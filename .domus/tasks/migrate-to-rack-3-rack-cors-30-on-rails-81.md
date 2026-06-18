# Task: Migrate to Rack 3 (rack-cors 3.0) on Rails 8.1

**ID:** migrate-to-rack-3-rack-cors-30-on-rails-81
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-18
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Move the app off the pinned `rack ~> 2.2` to **Rack 3**, including `rack-cors 2.0.2 → 3.0`.
Behaviour-preserving; **healthcheck worktree**.

### Why this is a standalone task (not blocked on Rails 8.2)
- **No hard technical blocker on Rails 8.1.** Rails has supported Rack 3 since 7.0, and the
  old blocker (puma 5.6 rejecting Rack 3) is gone — we're on **puma 8.0.2**, which is Rack-3-ready.
- It was deferred from the 7.1→8.1 upgrade purely for **scope isolation** — Rack 3 is its own
  breaking-change surface and would have muddied an otherwise mechanical version bump.
- **Rails 8.2 is the deadline, not the prerequisite:** 8.2 is expected to require Rack 3 / drop
  Rack 2. Do this **before** tackling 8.2 so that upgrade stays clean.

### The pin to undo
`Gemfile`: `gem 'rack', '~> 2.2'` (added in the 7.2 step — Rails 7.2 pulled Rack 3 transitively
and puma 5.6 rejected it). Remove/loosen the pin and let `rack` + `rack-cors` resolve to 3.x.

### Surface in this app (small)
- **One custom middleware:** `Rack::Cors` in `config/application.rb` (`insert_before 0`,
  `allow { origins '*'; resource '*', … }`). This is the main thing to re-verify under rack-cors 3.0.
- **No other custom Rack middleware**, and **no direct Rack response/header manipulation** in
  controllers (grep-verified at filing time). So the blast radius is essentially rack-cors.

### Watch-outs for Rack 3
- rack-cors 3.0 requires Rack 3 and has its own changes — re-check the CORS DSL/behaviour.
- Rack 3 spec changes: response **header keys are now lowercase**, header values, and the
  response-body interface. Rails shields most of this internally, but verify nothing in the
  stack (or any gem) trips on it.
- Re-confirm `rack-session` / `rackup` resolve cleanly to their Rack-3 lines.

---

## Acceptance Criteria

- [ ] `gem 'rack', '~> 2.2'` pin removed; `rack` 3.x + `rack-cors` 3.0 resolved
- [ ] CORS behaviour verified unchanged (preflight + actual cross-origin request from the Vue app)
- [ ] `bundle exec rspec` + webclientv4 suites green; app boots on puma 8 under Rack 3
- [ ] Auth (bearer-token) + a normal API round-trip smoke-tested
- [ ] Landed before any Rails 8.2 work begins
