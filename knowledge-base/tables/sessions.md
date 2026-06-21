---
type: table
title: sessions
term: session
definition: "A live login session: stores only the SHA256 digest of an opaque bearer token, with a 7-day sliding TTL. Created on Google login, validated per request, deleted on logout (revocation)."
lexicon: true
description: >-
  The live auth token store. One row per active login; holds token_digest (never
  the raw token), a sliding 7-day expiry, and audit fields. Replaced
  devise_token_auth's in-user token store.
resource: everycent:table:sessions
tags: [table, auth, core]
timestamp: 2026-06-21T00:00:00Z
---

# sessions

The **live authentication** store, introduced by the 2026 auth rebuild that replaced
`devise_token_auth` with owned opaque bearer tokens. One row = one active login. The
full scheme (login, per-request validation, revocation, rationale) is in
[session auth](/concepts/session-auth.md); this page is the table.

`belongs_to :user`; `user has_many :sessions, dependent: :destroy`. **Not**
`acts_as_tenant` — auth precedes tenant scoping.

## Schema

| Column | Meaning |
|---|---|
| `id` | Primary key. |
| `user_id` | → [user](/tables/users.md). Required. |
| `token_digest` | **`SHA256(raw token)`** — the raw token is never stored. Unique index; the per-request lookup key (`find_by(token_digest:)`). |
| `expires_at` | Hard expiry. Set to `7.days.from_now` at creation; **slid** forward on use. `active?` = `expires_at > now`. |
| `last_active_at` | Last-use timestamp. Gates the slide: expiry is only extended if the session is `> 1 day` idle (`SLIDE_AFTER`), so most requests do no write. |
| `ip_address` / `user_agent` | Captured at creation. **Audit only** — not checked during validation. |
| `created_at` / `updated_at` | Timestamps. |

## Lifecycle

- **Create** — `Session.start!(user:, user_agent:, ip_address:)` mints a 32-byte
  `urlsafe_base64` token, stores its digest, returns `[session, raw_token]`. Raw token
  goes to the client once.
- **Validate** — `Session.authenticate(raw)` digests the presented token, looks up the
  row, checks `active?`, slides expiry (throttled), returns the session or nil.
- **Revoke** — logout (`DELETE /auth/sign_out`) hard-deletes the row. No soft-delete.
