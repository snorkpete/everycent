# Task: Migrate to Google-only auth with owned opaque tokens

**ID:** migrate-to-google-only-auth-with-owned-opaque-tokens
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-06
**Parent:** none
**Depends on:** none
**Idea:** decide-auth-migration-direction-off-devise_token_auth
**Spec refs:** none

---

## What This Task Is

**Decision (2026-06-06): go Google-only.** Drop `devise` and `devise_token_auth` entirely and replace them with a small **owned opaque bearer-token** scheme. This resolves the `decide-auth-migration-direction-off-devise_token_auth` idea and is the **prerequisite that removes the one true Rails-8 blocker** (so `upgrade-to-rails-81-ruby-34` needs no git-ref bridge and no devise-5 migration).

### Why this shape
- The app is already Google-OAuth-primary; `google_controller.rb` verifies the Google ID token via `googleauth` and currently calls `user.create_new_auth_token`. **The Google path already bypasses devise entirely** — so once password login is gone, devise has no remaining job (its only value here is password management).
- **Opaque DB-backed tokens, NOT JWT.** In a single monolithic backend with one DB, JWT's statelessness buys nothing (no third party / no microservices; every request already loads the user via `acts_as_tenant`, so the "no DB lookup" saving is a read you don't save). Regaining instant revocation under JWT would require a denylist = reintroducing the state JWT removed. Opaque tokens (what GitHub/Stripe PATs use) are the right model.
- **Single token, not devise_token_auth's 4–5 headers.** Its multi-header scheme (access-token/client/uid/expiry) is a consequence of bcrypt-hashing tokens keyed on the user row (non-indexable → must locate user first) plus per-request rotation — and rotation is already disabled (`change_headers_on_each_request = false`). A single deterministic SHA256-digest token is self-locating.

### The build (~60 lines owned + deletions)
- **`sessions` table:** `user_id`, `token_digest` (SHA256, unique-indexed), `expires_at`, plus `user_agent` / `ip_address` (audit / "manage devices").
- **`Session` model:** `issue_for(user, ttl:)` returns a raw `SecureRandom.urlsafe_base64(32)` token once, stores only its SHA256 digest; `authenticate(raw)` looks up by digest + checks expiry → returns user.
- **ApplicationController:** replace `DeviseTokenAuth::Concerns::SetUserByToken` with a `before_action :authenticate!` that reads `Authorization: Bearer`, sets `current_user` (keep the `current_user` accessor so the 18 dependent controllers are untouched). Keep `current_household`.
- **`google_controller`:** swap the last two lines — `Session.issue_for(user)` and return the token in the JSON body (instead of `create_new_auth_token` + merging headers). `googleauth` verification stays unchanged.
- **Logout:** `sessions#destroy` deletes the row (instant revocation).
- **Steal from the Rails 8 generator (don't adopt it wholesale — it's signed-cookie-based):** the `Current` pattern, `user_agent`/`ip_address` columns, `rate_limit` on login (Rails 7.2+; until then use rack-attack or add at 7.2), `allow_unauthenticated_access` ergonomics.

### Staging — STAGE 1 here (code only); DB cleanup is a separate follow-up
Decided 2026-06-06: split into two stages so a bad-auth rollback can't cost data.
- **This task = Stage 1 (code-level only).** The ONLY migration is **additive** — create the new `sessions` table. Remove the gems + application code. **LEAVE all legacy auth columns in place** (`tokens`, `encrypted_password`, `reset_password_token`, `reset_password_sent_at`, `remember_created_at`, `confirmation_token`, `confirmed_at`, `confirmation_sent_at`, `unconfirmed_email`, `sign_in_count`/`*_sign_in_*`, etc.).
- **Why:** a code rollback redeploys the *prior release* (which still bundles devise/devise_token_auth), and that code expects those columns to exist. Leaving them means rollback = redeploy prior Heroku release and old auth works again, zero data loss. The new `sessions` table just sits unused on rollback (harmless). No destructive/irreversible migration until we've lived in prod on the new auth.
- **Stage 2 = follow-up task `drop-legacy-devise-auth-columns`** — drop `tokens` + the vestigial devise columns, only AFTER the new auth has soaked in prod. Depends on this task.

### Removals (Stage 1 — gems + code, NOT columns)
- Gemfile: `devise`, `devise_token_auth`, and the now-orphaned direct `omniauth` line.
- `User`: drop `DeviseTokenAuth::Concerns::User` and the devise modules. (Columns remain in the table but unreferenced — harmless.)
- `ApplicationController`: drop `SetUserByToken`.
- `config/initializers/devise.rb` + `devise_token_auth.rb`; the `mount_devise_token_auth_for` route.
- **Do NOT drop any columns in this task** — deferred to Stage 2 (`drop-legacy-devise-auth-columns`).

### Frontend (webclientv4)
- Collapse `authTokens.ts` from the 4–5 header scheme (`access-token`/`client`/`uid`/`expiry`) to a **single token** read from the login JSON body.
- Request interceptor sends one header: `Authorization: Bearer <token>`. Net simplification.

### Relationship to existing items
- **Subsumes / closely overlaps `remove-password-based-auth-after-google-oauth-migration`** (going Google-only *is* removing password auth). Decide whether to fold that task in as the "remove password UI + columns" slice or close it in favor of this. Also relates to product idea `google-auth-migration`.
- devise 5.0 token-invalidation change is a non-issue here (only affects reset/unlock/confirm tokens; app uses `skip_confirmation!`; logout-everyone is acceptable) — and moot once devise is removed.

---

## Acceptance Criteria

- [ ] `sessions` table migration (user_id, token_digest unique, expires_at, user_agent, ip_address) — the ONLY migration here, and it's additive
- [ ] Legacy auth columns (`tokens`, `encrypted_password`, devise columns) LEFT in place — no destructive migration in this task (rollback safety; Stage 2 = `drop-legacy-devise-auth-columns`)
- [ ] `Session` model: `issue_for` (returns raw token once, stores SHA256 digest) + `authenticate` (digest lookup + expiry)
- [ ] ApplicationController authenticates via `Authorization: Bearer`; `current_user` accessor preserved (18 controllers untouched)
- [ ] `google_controller` issues a session token in the JSON body; `googleauth` verification unchanged
- [ ] Logout endpoint deletes the session row (instant revocation verified)
- [ ] `rate_limit` (or rack-attack) on the login endpoint
- [ ] devise + devise_token_auth + direct omniauth removed from Gemfile; initializers + `mount_devise_token_auth_for` route deleted; `User` stripped of devise concerns
- [ ] Frontend: `authTokens.ts` + interceptor collapsed to a single bearer token
- [ ] `bundle exec rspec` green; webclientv4 suite green; manual Google login + authed request + logout verified end-to-end
- [ ] Decision recorded on whether `remove-password-based-auth-after-google-oauth-migration` is folded in or closed
- [ ] **Open question resolved:** is any non-Google break-glass fallback needed (e.g. locked out of Google / admin recovery)? If yes, design a minimal recovery path before deleting all password machinery.

---

## Implementation Notes

Build this on the **current Rails 7.1 / Ruby 3.4 stack** (after the Ruby bump, before the Rails upgrade). Owned token auth is plain Rails — no framework coupling — so it carries through the subsequent Rails 7.1 → 8.1 steps cleanly. Doing it first deletes the Rails-8 blocker outright (no git-ref bridge, no throwaway devise-5 migration). See `decide-auth-migration-direction-off-devise_token_auth` for the full rationale and `upgrade-to-rails-81-ruby-34` for the surrounding sequence.
