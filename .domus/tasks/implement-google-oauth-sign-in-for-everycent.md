# Task: Implement Google OAuth sign-in for Everycent

**ID:** implement-google-oauth-sign-in-for-everycent
**Status:** done
**Autonomous:** false
**Priority:** high
**Captured:** 2026-04-09
**Parent:** none
**Depends on:** set-up-google-cloud-oauth-credentials-for-everycent
**Idea:** google-auth-migration
**Spec refs:** none

---

## What This Task Is

Replace password-based login with Google OAuth as the primary sign-in method for production. Two existing users, identified by email. No new user self-registration — new users are added via rake task. Client-side GSI flow: Vue gets Google ID token, POSTs to Rails, Rails verifies and issues devise_token_auth tokens.

**Dev/test strategy:** Password auth stays in the codebase. Dev/test users are seeded via rake tasks with known passwords. In production, no users have passwords set, so the password endpoint is inert. The security boundary is the data, not the code — no feature flags or environment checks needed for the auth path itself.

---

## Acceptance Criteria

- [ ] Vue app shows a "Sign in with Google" button using GSI library
- [ ] Clicking it completes the Google OAuth flow and signs the user in
- [ ] Rails endpoint verifies the Google ID token and returns devise_token_auth tokens (same `access-token`/`client`/`uid` format)
- [ ] Only users with an existing record (matched by email) can sign in — unknown emails are rejected
- [ ] After sign-in, `provider` and `uid` columns are populated on the user record
- [ ] Password-less user creation works via Rails console (devise doesn't block on missing password)
- [ ] Existing password-based tokens for both users are invalidated (rake task: `auth:clear_tokens`)
- [ ] Production login UI shows Google button only (no password form)
- [ ] Dev login UI shows Google button + password form (for Cypress / Claude agent use)
- [ ] Works in both local dev and production (Heroku)
- [ ] Rake tasks exist: `auth:seed_dev_users` (dev only), `auth:clear_tokens`, `auth:add_user[email]`
- [ ] `auth:seed_dev_users` aborts if run in production

## Scope

**Not in scope:** Invite UI, full password auth removal (separate task — password endpoints stay but are inert in prod).

---

## Implementation Notes

### Backend

**Migration:**
- Add `provider` (string) and `uid` (string) columns to `users` table
- Add unique index on `[provider, uid]`

**New gem:** `googleauth` — Google's official Ruby library for ID token verification.

**New controller:** `Auth::GoogleController` (or similar), single `create` action:
- Receives `{ credential: "<google_id_token>" }` from frontend
- Verifies with `Google::Auth::IDTokens.verify_oidc(credential, aud: ENV['GOOGLE_CLIENT_ID'])`
- Finds user by email — reject with 401 if not found
- Populates `provider: 'google'` and `uid: payload['sub']` on first Google sign-in
- Generates devise_token_auth tokens and returns them as response headers
- Route: `POST /auth/google` (alongside existing `/auth/sign_in`)

**Key investigation needed at execution time:**
- How devise_token_auth generates tokens programmatically — look for `user.create_new_auth_token` or similar in existing sign-in controller
- Whether devise's `password` validation on the User model allows nil passwords — may need to conditionally skip validation when `provider` is set
- Existing CORS config — verify it allows the new endpoint from Vite dev origins

**Rake tasks** (in `lib/tasks/auth.rake`):
- `auth:clear_tokens` — clears the `tokens` column on all users. Safe to run in any environment.
- `auth:seed_dev_users` — creates dev/test users with known passwords (idempotent). Aborts with `abort "Not in production"` if `Rails.env.production?`. Store credentials in a constant or reference `webclientv4/cypress/CLAUDE.md` for existing test user setup.
- `auth:add_user[email]` — creates a user record with just an email, no password. For production use via `heroku run rake`. Same security level as `rails console` — no additional guard needed.

### Frontend

**Reference:** Find the existing login component in webclientv4 (likely `src/app/auth/` or similar). Match its patterns.

**GSI setup:**
- Add `<script src="https://accounts.google.com/gsi/client" async>` to `index.html`
- Use `google.accounts.id.initialize` + `google.accounts.id.renderButton` for the Google button
- On credential callback: POST to `/auth/google`, extract tokens from response headers, store in localStorage (same as current password flow)

**Login page logic:**
- Production: Google button only
- Dev: Google button + existing password form
- Detection: check an env var (e.g. `VITE_SHOW_PASSWORD_LOGIN=true` in `.env.development`) or `import.meta.env.DEV`

**Auth store / API interceptor:** Should need zero changes — token format is identical.

### Commit scope

Single feature branch, likely 3-4 commits:
1. Migration + model changes
2. Google auth controller + route + rake tasks
3. Frontend: GSI integration + login page changes
4. Backend tests + frontend tests

### Risks / Edge cases

- `user.create_new_auth_token` — need to verify this method exists and returns the expected header hash. The existing `sessions_controller` (or devise_token_auth's sign-in controller) is the reference.
- GSI library may not load in some dev scenarios (ad blockers, network). The password fallback in dev handles this naturally.
- Multiple Vite servers on different ports — GSI's authorized JavaScript origins may need multiple localhost entries in Google Cloud Console. Document this in the setup guide (Task 1).
