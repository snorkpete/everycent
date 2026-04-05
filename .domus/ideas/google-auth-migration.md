# Idea: Migrate Auth to Google OAuth

**Captured:** 2026-03-11
**Last refined:** 2026-04-05
**Status:** raw

---

## The Idea

Replace the current username/password auth (devise + devise_token_auth) with Google OAuth as the primary sign-in method, and eventually decommission the username/password flow entirely.

**Approach: parallel auth.** Add Google OAuth alongside existing devise auth (not a hard cutover). New sign-ins use Google. Existing password accounts can be removed incrementally and devise cleanup happens over time.

---

## Why This Is Worth Doing

- Removes the burden of credential management from the app (no password reset flows, no storage of hashed passwords)
- Better security posture — leverages Google's auth infrastructure
- Simpler onboarding for new users
- Prerequisite for Everycent becoming a real product
- **Prerequisite for NLQ phase 2** — see `natural-language-querying-nlq-for-everycent`. The chat feature uses pay-per-use LLM APIs, so access must be gated behind solid auth before being exposed publicly.
- Learning goal: properly understand what it takes to offload authentication to an external provider (vs following a tutorial without understanding)

---

## Open Questions / Things to Explore

- How devise_token_auth handles OAuth providers — does it support Google out of the box, or does this require replacing it?
- Session/token format changes and whether the Vue app localStorage keys would need to change
- What happens to existing sessions during the parallel-auth transition
- How to handle account linking — user's Google email matches their existing everycent account
- Rollout order relative to NLQ phase 1 — does auth need to fully ship before phase 1 work starts, or can they proceed in parallel?
