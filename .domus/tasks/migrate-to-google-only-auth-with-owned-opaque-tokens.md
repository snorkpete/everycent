# Task: Migrate to Google-only auth with owned opaque tokens

**ID:** migrate-to-google-only-auth-with-owned-opaque-tokens
**Status:** ready
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

## Decisions locked (2026-06-13 refinement session)

These resolve every open question from the original capture. A worker/driver should treat them as settled.

1. **Token TTL = 7 days, sliding.** `authenticate` extends `expires_at` on use so active sessions persist and idle ones die. **Throttle the extension write to ≤ once/day** (only bump if `expires_at` is more than ~1 day from a fresh TTL) — avoids a DB write on every authenticated request.
2. **Break-glass recovery = the Rails console. No extra code.** If locked out of Google, recover via `heroku run rails console --app everycent` → `Session.issue_for(user)` → inject the raw token into the browser's `localStorage` (the FE's single-token key) → reload. `issue_for` must therefore be **console-friendly** (see build). The recovery runbook will be **validated and written up as a private note in the second-brain everycent project AFTER this ships** — deliberately NOT a skill and NOT checked into this repo (don't document an auth-bypass recipe in tracked code). This RESOLVES the original "break-glass fallback?" open question.
3. **Keep the method name `authenticate_user!`** (not `authenticate!`). All 17 domain controllers + `Mcp::AppController` already declare `before_action :authenticate_user!`; reusing the name means **zero controller edits** — only `ApplicationController` defines the new method body.
4. **Auth enforcement stays per-controller, NOT global.** Do not add a global `before_action :authenticate_user!` to `ApplicationController`. Keeping it opt-in preserves the current posture of the two controllers that have no auth (`google_controller` = login; `NetWorthReportController` = empty dead class, see blast radius).
5. **No rate limiting in this task.** It guarded password brute-force, which no longer exists; the Google credential is cryptographically verified, and session tokens are 256-bit (`urlsafe_base64(32)`) looked up by SHA256 digest through a unique index (no timing oracle) — brute force is infeasible. Rate limiting is deferred to the Rails 7.2 step of `upgrade-to-rails-81-ruby-34`, which gets `rate_limit` for free.
6. **Add a uniform 401 in `google_controller`.** Today it returns distinct messages for "Invalid Google token" vs "No account found" — an account-enumeration signal. Collapse to one generic 401 message regardless of cause. (Cheap, real; replaces what rate-limiting would otherwise mitigate.)
7. **Keep `protect_from_forgery with: :null_session`; delete only the stale devise comment above it.** It is load-bearing: `ApplicationController < ActionController::Base`, so removing the directive re-enables the default `:exception` strategy, which would raise on token-less mutating requests (our bearer requests carry no CSRF token). CSRF is a non-vector for bearer auth, but the directive must stay to suppress the default.
8. **Pin the FE token's `localStorage` key as a named constant** (e.g. `ec_auth_token`) so the break-glass step and future refactors have a stable reference.
9. **Build on the `healthcheck` branch** (now rebased onto master, which already includes the chat/MCP `mcpToolApi` gateway work — see Frontend scope).

### The build (~60 lines owned + deletions)
- **`sessions` table:** `user_id` (indexed), `token_digest` (SHA256, unique-indexed), `expires_at`, plus `user_agent` / `ip_address` (audit / "manage devices").
- **`Session` model** (NOT tenant-scoped — it is the thing that establishes the user, before any tenant is set):
  - `issue_for(user, user_agent: nil, ip_address: nil)` — keyword args optional so `Session.issue_for(user)` works bare from a console (break-glass). Returns a raw `SecureRandom.urlsafe_base64(32)` token once; stores only its SHA256 digest; sets `expires_at = 7.days.from_now`.
  - `authenticate(raw)` — digest lookup + expiry check → returns user; slides `expires_at` (throttled ≤1/day).
  - `digest(raw)` — `Digest::SHA256.hexdigest`.
- **`User`:** add `has_many :sessions, dependent: :destroy`.
- **ApplicationController:** drop `DeviseTokenAuth::Concerns::SetUserByToken`. Add private `authenticate_user!` (reads `Authorization: Bearer`, stashes `@current_user` + `@current_session`, else renders uniform 401) and `current_user`/`current_household` accessors. Keep the name `authenticate_user!` (decision 3). Keep `protect_from_forgery :null_session` (decision 7).
- **`google_controller`:** swap the two header lines for `Session.issue_for(user, user_agent: request.user_agent, ip_address: request.remote_ip)` returned in the **JSON body** (`data: { email:, token: }`). `googleauth` verification unchanged. Uniform 401 (decision 6).
- **Logout:** new `Auth::SessionsController#destroy` deletes `@current_session` row (instant revocation). Route `delete '/auth/sign_out'` (FE path unchanged).

### Verified blast radius (recon 2026-06-13 — don't re-investigate)
- **Auth is per-controller:** `before_action :authenticate_user!` in 17 domain controllers + `app/controllers/mcp/app_controller.rb`. `google_controller` and `NetWorthReportController` have none.
- **`NetWorthReportController` is an empty dead class** — nothing routes to it. The live net-worth endpoint is `GET /reports/net_worth` → `reports#net_worth`, which **is** behind `authenticate_user!`. So net_worth is protected; the empty controller is unrelated cruft — **leave it alone** (separate cleanup, not this task).
- **`acts_as_tenant` is `require_tenant = false`** (`config/initializers/acts_as_tenant.rb`). So `User.find_by` / `session.user` at auth time (before any tenant is set) is unscoped and safe. Auth runs, then each controller sets the tenant via `set_current_tenant_through_filter` — same order as today.
- **One test helper fans out to 40+ specs:** `spec/rails_helper.rb` `AuthHelper#auth_request(user)` currently does `sign_in user` + `request.headers.merge!(user.create_new_auth_token)`. Rewrite it once to mint a `Session` token and set `Authorization: Bearer` → all dependent controller specs follow. Also remove `Devise::Test::ControllerHelpers` + the devise mapping from `rails_helper`.
- **Devise file inventory:** initializers `config/initializers/devise.rb` + `devise_token_auth.rb`; `User` (`include DeviseTokenAuth::Concerns::User` + devise modules); `ApplicationController` (`SetUserByToken`); routes (`mount_devise_token_auth_for 'User', at: '/auth'`); specs (`spec/controllers/auth/google_controller_spec.rb` asserts header tokens, `spec/routing/auth_routes_spec.rb` route-ordering guard, `spec/tasks/auth_rake_spec.rb` + the `auth:*` rake tasks reference passwords/`tokens`). `config/initializers/secret_token.rb` is **core Rails** (CSRF/cookie secret), NOT devise — leave it.

### Staging — STAGE 1 here (code only); DB cleanup is a separate follow-up
Decided 2026-06-06: split into two stages so a bad-auth rollback can't cost data.
- **This task = Stage 1 (code-level only).** The ONLY migration is **additive** — create the new `sessions` table. Remove the gems + application code. **LEAVE all legacy auth columns in place** (`tokens`, `encrypted_password`, `reset_password_token`, `reset_password_sent_at`, `remember_created_at`, `confirmation_token`, `confirmed_at`, `confirmation_sent_at`, `unconfirmed_email`, `sign_in_count`/`*_sign_in_*`, etc.).
- **Why:** a code rollback redeploys the *prior release* (which still bundles devise/devise_token_auth), and that code expects those columns to exist. Leaving them means rollback = redeploy prior Heroku release and old auth works again, zero data loss. The new `sessions` table just sits unused on rollback (harmless). No destructive/irreversible migration until we've lived in prod on the new auth.
- **Stage 2 = follow-up task `drop-legacy-devise-auth-columns-post-prod-soak`** — drops `tokens` + the vestigial devise columns, only AFTER the new auth has soaked in prod. Stays a **distinct task for later** (confirmed 2026-06-13): keeping the columns is the rollback safety net; clean up once the new auth is battle-tested.

### Removals (Stage 1 — gems + code, NOT columns)
- Gemfile: `devise`, `devise_token_auth`, and the now-orphaned direct `omniauth` line.
- `User`: drop `DeviseTokenAuth::Concerns::User` and the devise modules. (Columns remain in the table but unreferenced — harmless.)
- `ApplicationController`: drop `SetUserByToken`.
- `config/initializers/devise.rb` + `devise_token_auth.rb`; the `mount_devise_token_auth_for` route.
- **Do NOT drop any columns in this task** — deferred to Stage 2.

### Frontend (webclientv4)
- **Chat / MCP path is already handled** — `toolExecutor` now routes through `apiGateway` via `mcpToolApi.ts` (landed on master, commit `b50cc622a`). It no longer touches `getTokens()`; auth comes from the request interceptor. **So the chat feature inherits `Authorization: Bearer` for free — do not touch it.**
- Collapse `authTokens.ts` / `auth.types.ts` from the 4–5 header scheme to a **single token** read from the login JSON body and stored under a named constant key (decision 8).
- `authInterceptor.ts`: `attachAuthHeaders` sends one header `Authorization: Bearer <token>`. **Remove `saveAuthHeaders`** (the response interceptor) and its registration in `api-gateway.ts` — the token now comes from the login body, not per-response headers, and the single token never rotates.
- `authApi.ts` / `authStore.ts`: `logInWithGoogle` reads the token from the response **body**; **remove the password `logIn`/`signIn`**; `logOut` unchanged (still `DELETE /auth/sign_out` + clear).
- `LoginPage.vue`: **remove** the password form, the toggle button, `showPasswordForm`, `login()`, and now-unused imports. Keep the Google button.

### Out of scope (deliberate cuts — flag if you disagree)
- Rate limiting (→ Rails 7.2 step). Legacy-column drop (→ Stage 2). Dead-gem cleanup (`launchy`/`mimemagic`/etc. — its own task). `NetWorthReportController` dead-class removal. Touching the chat/MCP client (already done).

### Relationship to existing items
- **`remove-password-based-auth-after-google-oauth-migration`** — stays its **own distinct task** (decided 2026-06-13). This task removes the password *login path* (endpoint + UI); the sibling/Stage-2 work covers the eventual column/data cleanup once the new auth is battle-tested. Not folded, not closed.
- **`drop-legacy-devise-auth-columns-post-prod-soak`** = Stage 2, depends on this task.
- devise 5.0 token-invalidation change is a non-issue (only reset/unlock/confirm tokens; app uses `skip_confirmation!`; logout-everyone is acceptable) — moot once devise is removed.

### Commit structure (one branch on `healthcheck`)
1. **BE owned-token auth + `sessions` migration** (model, ApplicationController, google_controller, logout, routes, User, Gemfile/initializer removals).
2. **FE Bearer + login cleanup** (authTokens/types, interceptor + gateway registration, authApi/authStore, LoginPage).
3. **Test rewrites** (`auth_request` helper, `google_controller_spec`, `auth_routes_spec`, `auth_rake_spec` + `auth:*` rake tasks, FE specs to 100% on new code).

The suite only fully greens at the end — BE and FE auth must land together (atomic; the Heroku release ships both).

---

## Acceptance Criteria

- [ ] `sessions` table migration (user_id indexed, token_digest unique, expires_at, user_agent, ip_address) — the ONLY migration here, and it's additive
- [ ] Legacy auth columns LEFT in place — no destructive migration (rollback safety; Stage 2 = `drop-legacy-devise-auth-columns-post-prod-soak`)
- [ ] `Session` model: `issue_for(user, user_agent: nil, ip_address: nil)` (console-friendly; returns raw token once, stores SHA256 digest, 7-day expiry) + `authenticate` (digest lookup + expiry + sliding extend, write throttled ≤1/day); not tenant-scoped
- [ ] `User has_many :sessions, dependent: :destroy`
- [ ] ApplicationController authenticates via `Authorization: Bearer`; method name kept as `authenticate_user!`; enforcement stays per-controller (no global before_action); `current_user`/`current_household` preserved (18 controllers untouched); `protect_from_forgery :null_session` kept, stale devise comment removed
- [ ] `google_controller` issues a session token in the JSON body; `googleauth` verification unchanged; **uniform 401** (no invalid-token vs no-account distinction)
- [ ] Logout endpoint (`Auth::SessionsController#destroy`, `DELETE /auth/sign_out`) deletes the session row — instant revocation verified
- [ ] devise + devise_token_auth + direct omniauth removed from Gemfile; `devise.rb` + `devise_token_auth.rb` initializers + `mount_devise_token_auth_for` route deleted; `User` stripped of devise concerns; `secret_token.rb` left intact
- [ ] Frontend: `authTokens.ts`/types + interceptor collapsed to a single bearer token under a named `localStorage` key; `saveAuthHeaders` response interceptor removed; password `logIn`/`signIn` removed; `LoginPage.vue` password form removed; **chat/`toolExecutor` untouched**
- [ ] Tests: `auth_request` helper rewritten (Bearer); devise test helpers removed from `rails_helper`; `google_controller_spec`, `auth_routes_spec`, `auth_rake_spec` + `auth:*` rake tasks updated; FE specs green at 100% on new code
- [ ] `bundle exec rspec` green; webclientv4 `npm run test` + `npm run type-check` green; manual end-to-end verified in a browser (Google login → authed request → logout)
- [ ] `senior-code-reviewer` run on **both the Rails (backend) and the Vue changes** before commit (Vue per webclientv4 CLAUDE.md; backend review explicitly requested 2026-06-13 given the auth sensitivity). Run inline — not a dispatched worker, which skips it.
- [ ] Break-glass recovery validated by hand once (console-mint → localStorage-inject → authed request) and the runbook captured as a private note in the second-brain everycent project (NOT a skill, NOT in-repo)

---

## Implementation Notes

Build on the **`healthcheck` branch** (rebased onto master, Rails 7.1 / Ruby 3.4, includes the `mcpToolApi` chat work). Owned token auth is plain Rails — no framework coupling — so it carries through the subsequent Rails 7.1 → 8.1 steps cleanly. Doing it first deletes the Rails-8 blocker outright (no git-ref bridge, no throwaway devise-5 migration).

**Not autonomous — human-in-the-loop.** Despite being fully specified, this is security-sensitive, inherently atomic across BE+FE+tests (red in any intermediate state), and requires manual browser verification, break-glass validation, and senior review of the Vue changes. Drive it interactively; do not dispatch to an unattended worker.

See `decide-auth-migration-direction-off-devise_token_auth` for the full rationale and `upgrade-to-rails-81-ruby-34` for the surrounding sequence.
