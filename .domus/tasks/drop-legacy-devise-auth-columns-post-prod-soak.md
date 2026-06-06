# Task: Drop legacy devise auth columns (post-prod-soak)

**ID:** drop-legacy-devise-auth-columns-post-prod-soak
**Status:** raw
**Autonomous:** false
**Priority:** low
**Captured:** 2026-06-06
**Parent:** none
**Depends on:** migrate-to-google-only-auth-with-owned-opaque-tokens
**Idea:** none
**Spec refs:** none

---

## What This Task Is

**Stage 2 of the auth migration.** Stage 1 (`migrate-to-google-only-auth-with-owned-opaque-tokens`) removed the devise/devise_token_auth gems + code but deliberately **left the legacy auth columns in the DB** for rollback safety. This task does the deferred **destructive** migration: drop those now-unused columns — but only **after the new Google-only auth has soaked in prod** long enough to be confident no rollback is needed.

### Do NOT start until
- The new auth has run in prod for a meaningful window with no auth incidents, AND
- There's no remaining intent to roll back to the devise-based release.

(Once these columns are dropped, a code rollback to the devise era would crash — that's the whole reason this is staged separately.)

### Columns to drop (verify against the live schema first)
From the `users` table: `tokens`, `encrypted_password`, `reset_password_token`, `reset_password_sent_at`, `remember_created_at`, `confirmation_token`, `confirmed_at`, `confirmation_sent_at`, `unconfirmed_email`, `sign_in_count`, `current_sign_in_at`, `last_sign_in_at`, `current_sign_in_ip`, `last_sign_in_ip`. Keep `provider` / `uid` only if the new auth still uses them (it may not — re-check at the time).

### Note
This can land anytime after the prod soak — it is independent of the Rails 8 upgrade (which only needed the gems gone in Stage 1). If the `omniauth` direct line wasn't fully removed in Stage 1, mop it up here.

---

## Acceptance Criteria

- [ ] Confirmed new auth has soaked in prod with no incidents; no rollback intent remains
- [ ] Migration drops the legacy devise/devise_token_auth columns from `users` (list verified against live schema)
- [ ] `provider`/`uid` retention decision made based on what the new auth actually uses
- [ ] `bundle exec rspec` green; schema annotations refreshed; deploy + migrate green in prod

---

## Implementation Notes

Pairs with Stage 1 `migrate-to-google-only-auth-with-owned-opaque-tokens` (see its "Staging" section). Low priority / no rush — purely cleanup once the new auth is proven.
