# Task: Upgrade to Rails 8.1 + Ruby 3.4

**ID:** upgrade-to-rails-81-ruby-34
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-05
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Upgrade the Rails backend from **Rails 7.1.6 / Ruby 3.2.3** to **Rails 8.1.x (latest 8.1.3) / Ruby 3.4.9**. Researched 2026-06.

### Headline / urgency
- **Ruby 3.2.3 is already EOL** — the entire 3.2 line went EOL Mar 31 2026; Heroku no longer ships patched 3.2 builds. The app runs an unsupported runtime today. This is the urgent driver, independent of Rails.
- Current baseline is clean: `config.load_defaults 7.1`, framework-defaults files only go to 7_1.

### Why Ruby 3.4.9 (not 3.3 / not 4.0)
- Rails 8.0/8.1 require Ruby >= 3.2.0. 3.4 is supported to Mar 2028 (~2yr runway); 3.3 is already security-only (EOL Mar 2027); Ruby 4.0 (Dec 2025) is too fresh for a migration. 3.4 is fully supported on Heroku, has mature gem support, and an improved YJIT (set `RUBY_YJIT_ENABLE=1` for a free throughput win).

### Recommended sequence
1. **Ruby 3.2.3 → 3.4.9 FIRST**, on Rails 7.1 — isolated, gets off the EOL runtime, removes "is it Ruby or Rails?" ambiguity. Green the suite here.
2. **Resolve the devise_token_auth blocker** (see related idea — git-ref bridge or auth migration).
3. **Rails one minor at a time:** 7.1 → 7.2 → 8.0 → 8.1. Flip `load_defaults` + run `bin/rails app:update` each step; suite green between each.
4. **Stay on Rack 2** — Rails 8.1 still allows it (`rack >= 2.2.4`). Forced Rack 3 lands in Rails 8.2; defer it (forces rack-cors 3.0 + middleware breaking changes).

### THE blocker
`devise_token_auth` (1.2.6) pins `devise < 5`, but Rails 8 needs devise 5.0+. The fix is merged to master (PR #1675, Feb 15 2026) but UNRELEASED and the gem is dormant. See related idea **"Decide auth migration direction off devise_token_auth"**. Bridge option: point the Gemfile at the git ref to unblock immediately, migrate auth as a post-upgrade task.

### Gem audit (researched 2026-06)

**Hard install blockers (gemspec caps — Bundler refuses Rails 8.1):**
- `bootsnap` 1.17.0 (pins rails < 8.1) → 1.24.5
- `annotate` 3.2.0 (pins activerecord < 8.0; abandoned) → migrate to **annotaterb** 4.22.0

**Required bumps for Rails 8:**
- `puma` 5.6.9 → 8.0.2 (5.x EOL; add `enable_keep_alives false` for Heroku Router 2.0; puma-heroku plugin no longer needed)
- `rspec-rails` 7.1.1 → 8.0.4
- `web-console` 4.1.0 → 4.3.0

**Routine bumps:** pg 1.5.9→1.6.3; newrelic_rpm 10.4.0→10.5.0 (smoke-test — official support listed only to Rails 8.0.x); tzinfo-data 1.2021.1→1.2026.2 (stale 2021 tz data); omniauth→2.1.4; responders→3.2.0; factory_bot_rails→6.5.1; faker→3.8.0; database_cleaner-active_record→2.2.2; lol_dba→3.0.0; active_record_query_trace→1.9; launchy→3.1.1. Already current: googleauth, nio4r, dotenv-rails, rails-controller-testing.

**Watch / strategic:**
- `active_model_serializers` 0.10.15 — works on 8.1 but effectively SUNSET (0.10.x is end of line). Ship with it; flag eventual migration (Blueprinter / oj_serializers) on its own track.
- `acts_as_tenant` 1.0.1 — no release since Dec 2023, no declared Rails 8 support, wraps every model. Almost certainly fine; smoke-test tenant scoping explicitly post-upgrade.

### Effort
Medium-to-large, gated on the auth decision. Everything except devise/devise_token_auth is well-trodden. Git-ref bridge or devise-jwt path → solidly medium. Full auth rework → large.

---

## Acceptance Criteria

- [ ] Ruby on 3.4.9, app + full suites green on Rails 7.1 first
- [ ] devise_token_auth blocker resolved (bridge or migration)
- [ ] Rails stepped 7.1 → 7.2 → 8.0 → 8.1, `load_defaults` flipped each step, suites green between each
- [ ] All hard-blocker gems resolved (bootsnap, annotate→annotaterb), required bumps done (puma, rspec-rails, web-console)
- [ ] Routine gem bumps applied
- [ ] Still on Rack 2 (Rack 3 / Rails 8.2 explicitly deferred)
- [ ] Heroku: puma `enable_keep_alives false` set; Ruby pinned in Gemfile/Gemfile.lock; deploy green
- [ ] Tenant scoping (acts_as_tenant) smoke-tested on Rails 8.1
- [ ] webclientv4 (2452 tests) + `bundle exec rspec` green at the end

---

## Implementation Notes

- Dead-gem Gemfile cleanup (launchy, mimemagic, rails_12factor, omniauth direct line, nio4r direct pin) is a SEPARATE task; mimemagic + rails_12factor removals also naturally fold into this Rails 8 work.
