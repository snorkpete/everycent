# Task: Completely remove Spring from the test path

**ID:** completely-remove-spring-from-the-test-path
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-29
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Finish ripping out Spring (spring + spring-commands-rspec), which is still active despite a prior partial removal and causes nondeterministic rspec example counts. Behaviour-preserving test-infra cleanup; bootsnap already covers boot caching so there's no speed cost.

**WHY:** Spring (`spring` + `spring-commands-rspec`) is still active despite a prior partial removal (commit 760e39e8f "chore(gems): remove stray bundler dep + rip out inert spring"). It causes NONDETERMINISTIC test selection: the full rspec suite loads a wildly varying example count across runs (observed 256 / 511 / 775 / 990 / 1077) with zero failures and zero load errors — Spring serving stale/partial preloaded app state. This makes "full suite green" untrustworthy and masks real failures/order-dependencies (e.g. spec/tasks/transcripts_rake_spec.rb showed spurious failures under Spring but passes 7/7 in isolation). With `DISABLE_SPRING=1` the suite is deterministic: 1077 examples, 0 failures, 11 pending.

Spring is REDUNDANT here: bootsnap is already installed (config/boot.rb `require "bootsnap/setup"`) and caches boot. Measured single-file rspec: ~1.38s WITH Spring (warm) vs ~1.41s WITHOUT — ~30ms, within noise. Removal does NOT slow the suite (full-suite boot is amortized anyway). Do NOT add any replacement.

**CURRENT FOOTPRINT (as of master b443b3350):**
- Gemfile (~lines 56-58): `gem 'spring'`, `gem 'spring-commands-rspec'`, commented `#gem 'spring-watcher-listen'`.
- bin/rspec — the ONLY binstub still carrying a Spring shim (`load File.expand_path('../spring', __FILE__)`). bin/rails and bin/rake are already plain.
- config/spring.rb — present.
- Gemfile.lock — `spring (2.1.1)`, `spring-commands-rspec (1.0.4)`.

**STEPS:**
1. Remove the 3 Gemfile lines (spring, spring-commands-rspec, the commented spring-watcher-listen).
2. Regenerate bin/rspec as a plain binstub so it no longer loads the spring shim (e.g. `bundle binstubs rspec-core --force`); verify bin/rspec no longer references spring.
3. Delete config/spring.rb.
4. `bundle install` to drop spring + spring-commands-rspec from Gemfile.lock.

---

## Acceptance Criteria

- [ ] `grep -rIi spring bin/ config/ Gemfile Gemfile.lock` returns nothing.
- [ ] bin/rspec runs the suite directly with no Spring involvement.
- [ ] Full suite DETERMINISTIC: run `bundle exec rspec --format progress | tail -1` twice consecutively; identical example count both times (baseline 1077 examples, 0 failures, 11 pending).
- [ ] No test regressions vs that baseline.

---

## Implementation Notes

- Behaviour-preserving; test infra only; no production code changes. Belongs on the healthcheck branch/worktree.
- Prior incomplete attempt: commit 760e39e8f.
