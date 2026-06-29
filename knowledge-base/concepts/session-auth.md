---
type: concept
title: Session authentication (Google login + opaque bearer tokens)
term: authentication
definition: "Google-only login that mints an opaque DB-backed bearer token (only its SHA256 digest stored, 7-day sliding TTL). Fail-closed: every request needs a valid token unless the endpoint explicitly opts out."
lexicon: true
description: >-
  How the 2026-rebuilt auth works and why: Google-only login minting opaque
  DB-backed bearer tokens (chosen over JWT for a monolith), fail-closed
  per-request validation via the Authenticatable concern, sliding 7-day TTL, two
  accepted Google client IDs (web + permanent MCP path), and the additive
  migration that left legacy devise columns awaiting a soak-gated drop.
tags: [domain, auth]
timestamp: 2026-06-21T00:00:00Z
---

# Session authentication

How a request proves who it is. Rebuilt in 2026 to replace `devise` +
`devise_token_auth` with an **owned, opaque, DB-backed bearer-token** scheme and
**Google-only** login. (This also cleared the Rails 8 upgrade blocker — devise gone.)
Tables: [users](/tables/users.md) (identity) and [sessions](/tables/sessions.md)
(tokens).

## Why opaque DB tokens, not JWT

In a **single-backend monolith** JWT's statelessness buys nothing — you'd add a
server-side denylist for revocation anyway. Opaque tokens stored in the DB (the model
GitHub/Stripe PATs use) are simpler, and **revocation is just a row delete**.

## Login

`POST /auth/google` with a Google ID token in `credential`. The server verifies it
(`Google::Auth::IDTokens.verify_oidc`) against the accepted audiences, looks up the
user by **email** (the sole join key — no tenant scope; email is globally unique),
and on a match calls `Session.start!`, returning the raw token in the JSON body.
**Users are pre-created out-of-band** — login matches an existing email; it never
registers. There is no password, email-confirmation, or password-reset flow.

A non-prod `POST /auth/dev_login` (enabled only when `EVERYCENT_DEV_LOGIN=true` and
not production) mints a session from an email directly, for local/test use.

### Two Google client IDs

`verify_oidc` accepts **two** audiences:
- `GOOGLE_CLIENT_ID` — the web app.
- `GOOGLE_MCP_CLIENT_ID` — a **permanent** alternative access path: driving the NLQ
  tooling through Claude Code over MCP (the `/mcp/*` endpoints) instead of the in-app
  chat — a more capable agent against the same tools. Tokens minted under this client
  authenticate as the same user.

## Per-request validation (fail-closed)

A global `before_action :authenticate_user!` (the `Authenticatable` concern) runs on
`ApplicationController`; **only login endpoints `skip` it**, so forgetting to protect a
controller leaves it *protected*, not open. Each request sends
`Authorization: Bearer <token>`; `Session.authenticate` digests it, finds the session,
checks `active?`, and slides expiry. `current_user = @current_session.user`;
`current_household = current_user.household` feeds `acts_as_tenant`.

## Token lifetime & revocation

7-day TTL, **sliding**: a request extends expiry only when the session is `> 1 day`
idle (`SLIDE_AFTER`), so active use stays logged in without writing on every request.
Logout (`DELETE /auth/sign_out`) deletes the row; `GET /auth/validate` checks a token
is still good. Break-glass recovery: `heroku run rails console` → `Session.start!` →
inject the token.

## Migration state

The rebuild was **additive** — it added the `sessions` table + `last_active_at` and
**left all legacy devise columns on [users](/tables/users.md) in place**. The
destructive drop is gated on prod soak (domus task
`drop-legacy-devise-auth-columns-post-prod-soak`); see [dead
schema](/tracking/dead-schema.md) D11–D13. Shipped to prod in the v87 release.
