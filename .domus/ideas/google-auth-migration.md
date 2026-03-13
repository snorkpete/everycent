# Idea: Migrate Auth to Google OAuth

**Date:** 2026-03-11
**Project:** Everycent Migration

---

## The Idea

Replace the current username/password auth (devise + devise_token_auth) with Google OAuth as the primary sign-in method, and eventually decommission the username/password flow entirely.

---

## Why This Is Worth Doing

- Removes the burden of credential management from the app (no password reset flows, no storage of hashed passwords)
- Better security posture — leverages Google's auth infrastructure
- Simpler onboarding for new users
- Prerequisite for Everycent becoming a real product

---

## Open Questions / Things to Explore

- How to migrate existing accounts — users currently identified by email, so the email from Google OAuth can be the linking key
- Whether to run both auth methods in parallel during a transition period, or cut over in one step
- How devise_token_auth handles OAuth providers — does it support Google out of the box, or does this require replacing it?
- Session/token format changes and whether the Vue app localStorage keys would need to change
- What happens to existing sessions during the cutover
