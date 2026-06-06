# Task: Remove dead/redundant gems from Gemfile

**ID:** remove-deadredundant-gems-from-gemfile
**Status:** raw
**Autonomous:** false
**Priority:** low
**Captured:** 2026-06-05
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

A Gemfile usage audit (2026-06) found direct gem declarations that are unused or redundant. None are blockers; this is a standalone cleanup, mostly independent of the Rails 8 upgrade (`upgrade-to-rails-81-ruby-34`), though two of them also naturally fold into that work.

### Clear removals (verified unused/redundant in the codebase)
- **launchy** (test group) — zero references anywhere; Capybara/Selenium are commented out, nothing opens a browser in tests. Remove.
- **mimemagic** (github fork pin) — no direct `MimeMagic` usage in app code; Rails uses `marcel` for MIME detection now; the pin is a 2021-licensing-fiasco relic. Remove the line. (Also a Rails 8 cleanup.)
- **rails_12factor** (production group) — archived 2022, redundant since Rails 5; `production.rb` already logs to STDOUT manually (line ~49). Remove. (Also a Rails 8 cleanup.)
- **omniauth** (direct line) — only referenced transitively via devise_token_auth (provider config is commented out); the Gemfile comment itself says it's "a dependency of devise_token_auth". Drop the direct declaration (it resolves transitively). NOTE: revisit alongside the auth migration — if devise_token_auth is removed, re-check what still needs omniauth.
- **nio4r** (`~> 2.7.0` direct pin) — no direct app usage; transitive dep of puma/websocket-driver; the explicit version pin looks like an old workaround. Drop the direct declaration and let it resolve transitively.

### Judgment calls (used, but worth questioning — confirm with the user before removing)
- **spring** + **spring-commands-rspec** — currently used (`bin/rspec` is a spring binstub), but Rails de-emphasized Spring (gone from the default Gemfile in Rails 7) and `spring-commands-rspec` is unmaintained since 2014. Candidate to drop both for a simpler, less stale-reload-prone setup. User decision.
- **lol_dba** (dev) — a manual CLI tool (finds missing FK indexes), no code wiring. Keep only if actually used; otherwise drop.

---

## Acceptance Criteria

- [ ] launchy, mimemagic, rails_12factor removed from the Gemfile
- [ ] omniauth + nio4r direct declarations dropped (still resolve transitively; bundle still installs)
- [ ] spring / spring-commands-rspec and lol_dba: decision made with the user (keep or drop)
- [ ] `bundle install` succeeds; `bundle exec rspec` green; app boots
- [ ] If omniauth removal is deferred, note the dependency on the auth-migration decision

---

## Implementation Notes

Independent of the Rails upgrade and doable now. mimemagic + rails_12factor removals also fold into `upgrade-to-rails-81-ruby-34` if done together. omniauth's final disposition is coupled to the auth-migration idea (`decide-auth-migration-direction-off-devise_token_auth`).
