# Idea: Decide auth migration direction off devise_token_auth

**Status:** scoped
**Date:** 2026-06-05

---

## DECISION (2026-06-06): Go Google-only

Chosen **Option 2 — go Google-only.** Drop `devise` and `devise_token_auth`; replace with an owned opaque bearer-token scheme (not JWT). **Sequencing: auth-first** — Ruby 3.4 bump → auth migration → Rails upgrade. Rationale: since devise is being deleted anyway, the git-ref bridge + devise-5 migration (Option B / Rails-first) is throwaway work; deleting the blocker first makes the Rails upgrade clean. The security-sensitive auth change lands on the stable, currently-running Rails 7.1 (one thing changing at a time), and owned token auth is framework-agnostic so it carries through the upgrade.

Scoped into task **`migrate-to-google-only-auth-with-owned-opaque-tokens`** (full build/removal/frontend detail lives there).

Open question carried into that task: whether a non-Google break-glass fallback (locked out of Google / admin recovery) is needed before deleting all password machinery.

---

## The Idea

devise_token_auth is dormant and is the one true blocker for the Rails 7.1 → 8.1 upgrade. We need to decide how to migrate off it. The whole decision reduces to ONE fork — **keep password login, or go Google-only** — which is itself driven by the existing deferred task `remove-password-based-auth-after-google-oauth-migration`.

### Findings (researched 2026-06)
- **devise_token_auth is dormant.** Last release 1.2.6 (Nov 21 2025); historically ~1 release/year. The Rails-8-unblocking fix (PR #1675, bumps the devise constraint to `< 6`) is **merged to master (Feb 15 2026) but UNRELEASED** — owner (lynndylanhurley) absent; volunteers merge but don't cut releases; 185 open issues. Waiting for an official release is effectively futile.
- **devise itself is healthy** (heartcombo / Carlos Antonio da Silva; 5.0.4 May 2026; fast security releases). devise 5.0 is required for clean Rails 8 support.
- **The app is already Google-OAuth-primary.** `google_controller.rb` verifies the Google ID token via the maintained `googleauth` gem, then calls `user.create_new_auth_token`. **Key insight: the Google login path already bypasses devise entirely** — it never invokes `database_authenticatable` or Warden. So devise's auth modules currently serve ONLY the password path.

### The fork (the actual decision)
1. **Keep password login** (Google + password fallback) → keep devise, swap `devise_token_auth` → **devise-jwt** (0.13.0, Jan 2026, supports devise 5.x; Denylist/JTIMatcher revocation). Do NOT roll your own here — you'd be reimplementing password hashing + reset, the evolving-crypto you shouldn't touch.
2. **Go Google-only** (remove passwords) → devise has no remaining job (its only value here is password management); drop devise AND devise_token_auth. Replace with a minimal **owned opaque bearer-token** scheme: a `sessions` table (`user_id`, `token_digest` SHA256, `expires_at`, `user_agent`), look up per request, delete to revoke. Identity is already Google's via `googleauth`; the token layer is ~60 lines of non-crypto glue.

### Why opaque tokens, not JWT
In a single monolithic backend with one DB, JWT's statelessness buys nothing (no third party / no microservices; the app already loads the user every request via `acts_as_tenant`, so the "no DB lookup" saving is a read you don't save). To regain instant revocation under JWT you'd add a denylist table = reintroduce the state JWT removed. Opaque DB-backed tokens (what devise_token_auth already does, and what GitHub/Stripe PATs do) are the right model. devise_token_auth's multi-header scheme (`access-token`/`client`/`uid`/`expiry`) is heavier than needed — the split is a consequence of bcrypt-hashing tokens keyed on the user row (non-indexable → must locate the user first) plus per-request rotation, and rotation is **disabled** in our config (`change_headers_on_each_request = false`). A single deterministic-digest token is self-locating and is the mainstream secure pattern.

### Rails 8 built-in generator note
`bin/rails generate authentication` output is a **generator (owned code), not an auto-updating gem** — it freezes like roll-your-own. Its mechanism is **signed-cookie-based** (session identified by integer id in `cookies.signed[:session_id]`), so adapting to a bearer API means **replacing its core transport** — the vetted part is the cookie path you'd throw away. Worth stealing from it: the `Current` pattern, `user_agent`/`ip_address` audit columns, `rate_limit` on login, `allow_unauthenticated_access` ergonomics. For a Google-primary API, roll-your-own and adapt-the-generator collapse into nearly the same thing.

---

## Why This Is Worth Doing

- It is the **one true blocker** for getting onto supported Rails 8.1 (and off EOL Ruby 3.2). Resolving the direction unblocks the whole upgrade.
- The current dependency (devise_token_auth) is dormant and a maintenance/security liability — staying on it indefinitely is the worst option.
- Settling the password-login fork also resolves the long-deferred `remove-password-based-auth-after-google-oauth-migration` task.

---

## Open Questions / Things to Explore

- **THE decision:** keep password login, or go Google-only? Everything else follows. (Two real users; Google OAuth already primary.)
- If Google-only: is there ANY scenario needing a non-Google fallback (e.g. locked out of Google, admin break-glass)? If yes, that argues for keeping a password path.
- Sequencing: use the **git-ref bridge** (point Gemfile at devise_token_auth master/#1675 SHA) to unblock Rails 8 now and do the auth migration as the first post-upgrade task? Or migrate auth first, then upgrade with zero auth blocker?
- If going owned-tokens: confirm the frontend changes (collapse the multi-header `authTokens.ts` + interceptor to a single `Authorization: Bearer` token read from the login JSON body).
- devise 5.0 token-invalidation change is a non-issue (only affects reset/unlock/confirm tokens, not sessions; app uses `skip_confirmation!`; logout-everyone is acceptable) — confirmed, no action needed.

---

## Related

- Blocks: the **Rails 8.1 + Ruby 3.4 upgrade** task (devise_token_auth is the one true blocker).
- Drives / driven by: `remove-password-based-auth-after-google-oauth-migration` (deferred).
