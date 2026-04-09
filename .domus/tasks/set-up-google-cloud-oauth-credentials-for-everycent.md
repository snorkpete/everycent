# Task: Set up Google Cloud OAuth credentials for Everycent

**ID:** set-up-google-cloud-oauth-credentials-for-everycent
**Status:** done
**Branch:** task/set-up-google-cloud-oauth-credentials-for-everycent
**Autonomous:** true
**Priority:** high
**Captured:** 2026-04-09
**Parent:** none
**Depends on:** none
**Idea:** google-auth-migration
**Spec refs:** none

---

## What This Task Is

The app needs Google OAuth credentials before any code can use Google sign-in. This is a manual, human-only task — no code changes. The deliverable is a step-by-step guide the user follows to set up everything in Google Cloud Console and configure the app's environment.

---

## Acceptance Criteria

- [ ] A step-by-step guide exists (in `.domus/docs/`) walking through the full Google Cloud Console setup — project creation, consent screen, credential creation, redirect URIs, env var configuration — written for someone who has never done this before
- [ ] Guide covers both local dev and production (Heroku) setup
- [ ] Guide specifies exactly which redirect URIs to add (for localhost + everycent production domain)
- [ ] Guide includes a section on where to store each config value (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, frontend client ID reference) — options with tradeoffs and a recommendation for each, based on best practices for a Rails API + Vue SPA on Heroku
- [ ] Guide notes that `GOOGLE_CLIENT_ID` is public (safe for frontend) and `GOOGLE_CLIENT_SECRET` is backend-only
- [ ] Following the guide end-to-end results in working credentials ready for the implementation task

## Scope

**Not in scope:** Code changes. The guide is the deliverable.

---

## Implementation Notes

**Deliverable:** `.domus/docs/google-oauth-setup-guide.md`

**Guide structure — each step should have:**
1. How to check if you've already done this step (the user may have experimented in the past)
2. What to do if it doesn't exist yet
3. What you should see when it's done

**Sections:**
1. **Check for existing GCP project** — go to console.cloud.google.com, look for an existing project. If one exists, check if it already has OAuth credentials.
2. **Create GCP project** (if needed) — name it, select org if applicable.
3. **Configure OAuth consent screen** — app name, support email, scopes (`openid`, `email`, `profile`). Note: basic sign-in scopes don't require Google verification.
4. **Create OAuth 2.0 Client ID** — Web application type. Check if one already exists first.
5. **Set redirect URIs** — list exact URIs for:
   - Local dev: add `http://localhost:3000` (Rails, for compiled assets) and `http://localhost:4200` through `http://localhost:4210` (Vite dev servers) as authorized JavaScript origins. Pre-register the range upfront to avoid revisiting this.
   - Production: the Heroku app URL
   - Staging: the staging app URL
6. **Config storage** — where to put each value, with options and recommendations:
   - `GOOGLE_CLIENT_ID` (public, needed by both frontend and backend)
   - `GOOGLE_CLIENT_SECRET` (private, backend only)
   - Cover: Heroku config vars, local `.env` file, Vite `import.meta.env`, Rails `ENV[]`
   - Recommend one approach per value with tradeoffs

**Mark as autonomous** — a worker can produce this guide via web research without human input.

**Risks:**
- Google Cloud Console UI changes frequently — note the date the guide was written at the top.
