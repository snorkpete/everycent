# Task: Upgrade Heroku stack Heroku-24 to Heroku-26

**ID:** upgrade-heroku-stack-heroku-24-to-heroku-26
**Status:** ready
**Autonomous:** false
**Priority:** low
**Captured:** 2026-06-19
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The 2026-06-19 prod deploy noted Heroku-24 is in use and Heroku-26 is available
(confirmed 2026-06-25: `heroku stack --app everycent` shows `* heroku-24` with
`heroku-26` available). Upgrade the `everycent` prod app's stack to heroku-26 to
stay on a current, supported base image (Ubuntu 24.04 → 26.04).

**Behaviour-preserving, base-image-only.** No Ruby/Rails/gem changes — those stay
at the Ruby 3.4.9 / Rails 8.1 baseline already on prod. This is an **ops task with
no repo change** (no `app.json`/`heroku.yml` in the repo — the stack is set via the
Heroku CLI, and the next deploy rebuilds the slug on the new image).

**Not autonomous-worker material:** touches prod infra, must run human-in-loop, and
the prod deploy goes through the **deploy skill** (per CLAUDE.md — don't push to
heroku manually).

---

## Acceptance Criteria

- [ ] `everycent` prod rebuilt and running on `heroku-26` (slug build succeeds — the
      real test is native extensions like `pg`/`nokogiri`/`bcrypt` recompiling clean
      against the 26.04 image)
- [ ] Prod smoke passes post-upgrade: app boots, Google sign-in works, a core page
      (transactions/budget) loads
- [ ] No behaviour change — Ruby 3.4.9 / Rails 8.1 baseline unchanged
- [ ] Rollback path confirmed available: `heroku stack:set heroku-24 --app everycent`
      + redeploy
- [ ] (Pre-flight, recommended) build validated on a throwaway heroku-26 app before
      flipping prod

**Out of scope:** no Ruby/Rails/gem bumps; no switch to `container`/`cnb` stacks; no
`app.json` stack-pinning (possible follow-up, not this task).

---

## Implementation Notes

No standing staging app — de-risk with a throwaway app instead of a staging gate.

**1. Pre-flight build validation (recommended, throwaway app):**
- `heroku create everycent-h26-preflight --stack heroku-26` (Ruby buildpack)
- Push current `master`; watch the **build log** — slug compile is the signal that
  native extensions recompile cleanly on 26.04. (Without prod config vars the app
  won't fully boot — build success is the value here, not a request smoke.)
- `heroku apps:destroy everycent-h26-preflight` when done.
- Confirms the Ruby buildpack ships a 3.4.9 binary for heroku-26 before touching prod.

**2. Prod upgrade (via deploy skill):**
- `heroku stack:set heroku-26 --app everycent` — note this only takes effect on the
  *next* release; it does NOT rebuild on its own.
- Trigger a rebuild through the **deploy skill** (an empty commit / re-push forces the
  slug to rebuild on heroku-26 if master is already deployed).

**3. Smoke prod:** sign-in + a core page load + app boots clean (check `heroku logs`).

**4. Rollback if the build or smoke fails:** `heroku stack:set heroku-24 --app everycent`,
then redeploy. Stack changes don't touch add-ons/config vars, so rollback is clean.

**Primary risk:** native-extension recompilation against Ubuntu 26.04 system libs
(pg, nokogiri, bcrypt, ffi). The build log is the tell — surfaces in pre-flight before
prod. Secondary: confirm the Ruby buildpack has a 3.4.9 binary for heroku-26.
