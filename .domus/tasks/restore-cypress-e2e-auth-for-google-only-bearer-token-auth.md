# Task: Restore Cypress E2E auth for Google-only bearer-token auth

**ID:** restore-cypress-e2e-auth-for-google-only-bearer-token-auth
**Status:** ready
**Autonomous:** false
**Priority:** low
**Captured:** 2026-06-15
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The auth migration to Google-only opaque bearer tokens left the Cypress auth wiring
(loginAsTestUser, visitAuthenticated, auth.cy.ts) targeting the removed devise password
endpoints and 5-header tokens. Rewrite it for programmatic dev_login + single-key bearer
token, and verify with a live run.

### Context

Auth migrated from devise_token_auth (5-header tokens, password `POST /auth/sign_in`) to
Google-only owned opaque bearer tokens (single `localStorage['auth-token']`,
`POST /auth/google` + non-prod `POST /auth/dev_login`). Landed on the healthcheck branch,
commits `e7b09d8d1..b1b994dec`. The Cypress auth wiring was deliberately left
untouched/unverified because the E2E suite has been unmaintained — this task brings it back.

### Why Cypress auth is currently broken

- `cypress/support/commands.ts`: `cy.loginAsTestUser` POSTs `/auth/sign_in` with
  email+password (endpoint removed) and reads the 5 devise headers
  `access-token`/`client`/`uid`/`expiry`/`token-type` (gone); `visitAuthenticated` writes
  those 5 localStorage keys.
- `cypress/e2e/auth.cy.ts`: tests the password login form + invalid-credentials, asserts on
  `[data-testid="login-form"]` and `password-input` — all removed from `LoginPage.vue`
  (now Google-only).
- `cypress.config.cjs`: `testUser` still carries a dead password.

A working, type-checked draft exists in reverted commit `2e1512f01` on the healthcheck
branch — recover via `git show 2e1512f01`.

---

## Acceptance Criteria

- [ ] `cy.loginAsTestUser` rewritten to log in programmatically: `POST /auth/dev_login`
      `{email: testUser.email}`, read `body.data.token`, stash via
      `Cypress.expose('authToken', token)`.
- [ ] `visitAuthenticated` sets `localStorage['auth-token'] = token` (single key).
- [ ] `auth.cy.ts` rewritten: drop password-login + invalid-credentials specs; assert on
      `[data-testid="google-button-container"]`; add a positive programmatic-auth path
      (loginAsTestUser + visitAuthenticated reaches a protected route); keep logout +
      unauthenticated-redirect, retargeting `login-form` -> `google-button-container`.
- [ ] `cypress.config.cjs`: drop `password` from `testUser`.
- [ ] Add a `cypress/CLAUDE.md` note: the Rails server under test must run with
      `EVERYCENT_DEV_LOGIN=true` (already added to the dev `.env` files in both worktrees),
      else `/auth/dev_login` 404s.
- [ ] Verified with a live run: `npm run cypress:run:dev` (needs dev DB seeded with the
      cypress household via `npm run cypress:seed-dev-db`; Rails on `:3000` with
      `EVERYCENT_DEV_LOGIN=true`; Vite on `:4200`).

---

## Implementation Notes

**Caveat:** the broader Cypress E2E suite has been unmaintained and its overall health is
unverified — confirm it runs at all before investing, or scope this strictly to the auth
specs.
