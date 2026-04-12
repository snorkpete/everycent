# Task: Remove password-based auth after Google OAuth migration

**ID:** remove-password-based-auth-after-google-oauth-migration
**Status:** deferred
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-04-09
**Parent:** none
**Depends on:** implement-google-oauth-sign-in-for-everycent
**Idea:** google-auth-migration
**Spec refs:** none

---

## What This Task Is

After Google auth is confirmed working in production, the password auth code is only used by dev/test users. This task removes password auth from the production code path while preserving dev/test sign-in capability via rake-seeded users. Deferred — only execute after the implementation task is deployed and verified in production.

---

## Acceptance Criteria

- [ ] Password reset flow removed (endpoints, mailer, frontend)
- [ ] Password sign-up endpoint removed (no self-registration)
- [ ] Frontend password-related components removed from production build (login form stays in dev only if needed, or removed entirely if dev users are seeded with tokens directly)
- [ ] devise configuration cleaned up — remove modules that are no longer needed while keeping `token_authenticatable` working
- [ ] Password sign-in endpoint: evaluate whether to remove entirely or leave inert. If dev/test still needs it, leave it. If rake-seeded tokens are sufficient, remove it.
- [ ] App still functions correctly with Google auth in production — no regressions
- [ ] Dev/test auth flow still works (Cypress, Claude agents)
- [ ] No orphaned routes, controllers, or views left behind

## Scope

**Not in scope:** Removing devise entirely — it still manages token auth.

---

## Implementation Notes

**Investigate at execution time** — exact scope depends on what exists after the implementation task.

**Key areas to audit:**
- User model: devise modules list (`:database_authenticatable`, `:registerable`, `:recoverable`, etc.)
- `config/initializers/devise.rb`: settings tied to password auth
- Routes: `/auth/sign_in`, `/auth/sign_up`, `/auth/password` — which are devise_token_auth defaults vs custom
- Vue frontend: login component, any password reset pages
- Angular frontend (webclientv3): has its own password auth — decide whether to clean up or leave (it's frozen)

**Critical verification:**
- Removing `database_authenticatable` from devise may affect other modules. Test that `token_authenticatable` still works independently.
- Check if `auth:seed_dev_users` rake task (from implementation task) still works without `database_authenticatable` — seeding passwords requires it.

**Commit scope:** Single branch, single commit. Straightforward removal once the investigation is done.

**Risks:**
- Devise module interdependencies — removing one could break another. Run full test suite after each removal.
