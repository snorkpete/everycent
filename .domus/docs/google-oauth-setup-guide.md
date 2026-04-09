# Google OAuth Setup Guide for Everycent

**Written:** April 2026
**Note:** Google Cloud Console UI changes frequently. If a step doesn't match what you see, check for renamed menu items or restructured pages.

---

## Overview

This guide walks through setting up Google OAuth 2.0 credentials so the Everycent app can offer "Sign in with Google". The deliverable is two credential values:

- `GOOGLE_CLIENT_ID` — public, used by both the frontend and backend
- `GOOGLE_CLIENT_SECRET` — private, backend only

You'll need a Google account with access to [Google Cloud Console](https://console.cloud.google.com).

---

## Step 1: Check for an Existing Google Cloud Project

**How to check if already done:**
1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your Google account
3. Look at the project selector at the top of the page (it shows the current project name next to the Google Cloud logo)
4. Click it to open the project picker and look for an existing project named "Everycent" or similar

**If a project exists:** Skip to Step 3 to check whether it already has OAuth credentials configured.

**If no suitable project exists:**

1. In the project picker, click **New Project**
   - Alternatively: go to **IAM & Admin > Create a Project** from the left navigation menu
2. Enter a **Project name** (e.g. `Everycent`)
   - Project names: 4–30 characters, letters, numbers, hyphens, spaces allowed
   - Google will auto-generate a **Project ID** (e.g. `everycent-123456`) — this is permanent, the name is not
3. Leave **Location** as "No organisation" unless you have a Google Workspace org
4. Click **Create**

**What you should see when done:** The console switches to your new project. The project name appears in the selector at the top.

---

## Step 2: Enable the Required APIs

**How to check if already done:**
1. In the left sidebar, go to **APIs & Services > Enabled APIs & services**
2. Look for "Google Identity" or check if there are any OAuth credentials already present

For a standard Sign in with Google flow using the Google Identity Services (GIS) JavaScript library, you do not need to enable any additional API — the OAuth 2.0 flow works without enabling extra APIs. However, if you plan to call Google APIs on behalf of users (not needed for basic sign-in), you'd enable those APIs here.

**Action required:** Nothing. Move to Step 3.

---

## Step 3: Configure the OAuth Consent Screen

This is the screen users see when they click "Sign in with Google". It shows your app name, logo, and what data it wants access to.

**How to check if already done:**
1. In the left sidebar, go to **APIs & Services > OAuth consent screen**
2. If you see a configured consent screen with an app name, it's already done — review it for accuracy and skip to Step 4

**If not configured yet:**

1. Go to **APIs & Services > OAuth consent screen**
2. For **User Type**, choose:
   - **External** — choose this. It allows any Google account to sign in. The app starts in "Testing" status (only test users you add can sign in) and you publish it when ready
   - (Internal is only for Google Workspace organisations — you'd need a Workspace org for that)
3. Click **Create**

**On the "App information" page (Branding/OAuth consent screen):**
- **App name:** `Everycent`
- **User support email:** your email address
- **App logo:** optional — leave blank for now
- **App domain / Homepage URL:** `https://everycent.herokuapp.com` (optional, can add later)
- **Authorized domains:** add `everycent.herokuapp.com` and `everycent-staging.herokuapp.com`
- **Developer contact information:** your email address
- Click **Save and Continue**

**On the "Scopes" page:**
1. Click **Add or Remove Scopes**
2. Add these three scopes:
   - `.../auth/userinfo.email` — see the user's email address
   - `.../auth/userinfo.profile` — see basic profile info (name, photo)
   - `openid` — authenticate the user via OpenID Connect
3. These are **non-sensitive scopes** — they do not require Google verification to use in production
4. Click **Update**, then **Save and Continue**

**On the "Test users" page:**
- Add your own Google email address as a test user
- While the app is in "Testing" status, only listed test users can sign in (up to 100 users)
- Click **Save and Continue**

**On the "Summary" page:**
- Review everything and click **Back to Dashboard**

**What you should see when done:** The OAuth consent screen page shows your app name, user type "External", and publishing status "Testing".

---

## Step 4: Create an OAuth 2.0 Client ID

**How to check if already done:**
1. Go to **APIs & Services > Credentials**
2. Look in the "OAuth 2.0 Client IDs" section for an existing entry of type "Web application"
3. If one exists and is named for Everycent, click it to review and check/update the redirect URIs in Step 5

**If no credential exists yet:**

1. Go to **APIs & Services > Credentials**
2. Click **+ Create Credentials** at the top
3. Choose **OAuth client ID**
4. For **Application type**, select **Web application**
5. For **Name**, enter `Everycent Web Client` (this is a label for your own reference)
6. Do **not** fill in URIs yet — configure them in Step 5 first
7. Click **Create**

**What you should see when done:** A dialog appears showing your **Client ID** and **Client secret**. Copy both values immediately and store them safely (see Step 6). You can always retrieve them later from the credentials list, but the secret is masked after the dialog closes (click the credential name to reveal it again).

---

## Step 5: Configure Redirect URIs and JavaScript Origins

This step registers exactly which URLs Google is allowed to redirect to after authentication. If a URL is not registered, Google will reject the request with a `redirect_uri_mismatch` error.

**Key concepts:**
- **Authorized JavaScript origins** — the domain(s) where your app is hosted. Google checks this when the browser initiates the OAuth flow. No path, no trailing slash.
- **Authorized redirect URIs** — the specific URL Google sends the user to after they authenticate. Must match exactly, including path and port.

**How to check if already done:**
1. Go to **APIs & Services > Credentials**
2. Click your "Everycent Web Client" credential
3. Review the existing origins and redirect URIs against the lists below

**Add these Authorized JavaScript Origins:**

| Environment | URL |
|---|---|
| Local Rails (compiled assets) | `http://localhost:3000` |
| Local Vite dev server (default) | `http://localhost:4200` |
| Local Vite dev server (alt ports) | `http://localhost:4201` through `http://localhost:4210` |
| Production | `https://everycent.herokuapp.com` |
| Staging | `https://everycent-staging.herokuapp.com` |

Note: Add the full range `4200`–`4210` upfront. Vite increments the port if 4200 is in use, and revisiting this page to add ports is annoying.

**Add these Authorized Redirect URIs:**

The redirect URIs depend on the OAuth flow you implement. For a server-side (backend-handled) flow:

| Environment | URI |
|---|---|
| Local dev | `http://localhost:3000/auth/google/callback` |
| Production | `https://everycent.herokuapp.com/auth/google/callback` |
| Staging | `https://everycent-staging.herokuapp.com/auth/google/callback` |

For a client-side (GIS token flow without server redirect), you may not need redirect URIs at all — the JavaScript origins are sufficient. If you use the `devise_token_auth` + `omniauth-google-oauth2` server-side flow (most likely for this Rails app), add the redirect URIs above.

Click **Save**.

**What you should see when done:** All origins and redirect URIs appear in the credential's detail page without errors.

---

## Step 6: Store the Credentials

You now have two values from Step 4:

| Value | Sensitivity | Used by |
|---|---|---|
| `GOOGLE_CLIENT_ID` | **Public** — safe to expose in frontend code | Frontend (JavaScript) + Backend (Rails) |
| `GOOGLE_CLIENT_SECRET` | **Private** — never expose to the browser | Backend (Rails) only |

### Local Development

**Recommended:** Use a `.env` file (already in `.gitignore`).

Create or edit `/.env` in the project root:

```
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here
```

Rails reads this via the `dotenv-rails` gem (if installed) or you can access it as `ENV['GOOGLE_CLIENT_ID']` in initializers. Check `Gemfile` for `gem 'dotenv-rails'` — if absent, add it to the development group.

For the Vue frontend (Vite), create `webclientv4/.env.local` (also gitignored):

```
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

Access it in Vue/TypeScript code as `import.meta.env.VITE_GOOGLE_CLIENT_ID`. Note: Vite only exposes variables prefixed with `VITE_` to the browser. **Do not add `VITE_GOOGLE_CLIENT_SECRET`** — that would expose the secret in the browser bundle.

**Do not** check `.env` or `.env.local` into git. Verify both are in `.gitignore`.

### Production (Heroku)

Set config vars using the Heroku CLI:

```bash
heroku config:set GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com --app everycent
heroku config:set GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here --app everycent
```

For staging:

```bash
heroku config:set GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com --app everycent-staging
heroku config:set GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here --app everycent-staging
```

You can verify config vars are set with:

```bash
heroku config --app everycent
```

Heroku config vars are available to Rails as `ENV['GOOGLE_CLIENT_ID']` and `ENV['GOOGLE_CLIENT_SECRET']` at runtime.

**For the frontend client ID on Heroku:** The Vite build runs locally before deploy, so `VITE_GOOGLE_CLIENT_ID` must be set in `webclientv4/.env.local` before building. The built output (in `public/v4/`) bakes the value in at build time. You do not need `VITE_GOOGLE_CLIENT_ID` as a Heroku config var. Just ensure your local `.env.local` has the correct value before running `npm run build`.

### Tradeoffs Summary

| Approach | Tradeoff |
|---|---|
| `.env` file locally | Simple, standard. Just don't commit it. |
| Heroku config vars | The Heroku standard. Separate per app (staging vs prod). Use the CLI — the dashboard is slower. |
| Rails credentials (`credentials.yml.enc`) | Works but adds complexity: master key must be set as `RAILS_MASTER_KEY` on Heroku. Not worth it for simple string env vars. |
| Hardcoding in config files | Never. Commits secrets to git history permanently. |

**Recommendation:** `.env` locally, Heroku config vars in production. This matches what the rest of the app almost certainly already uses for database and other credentials.

---

## Step 7: Publish the App (When Ready for Real Users)

While the app is in "Testing" status, only users you've explicitly added as test users can sign in. This is fine during development.

When the implementation is working and you're ready for all users to sign in:

1. Go to **APIs & Services > OAuth consent screen**
2. Click **Publish App**
3. Confirm the dialog

Because Everycent only requests `openid`, `email`, and `profile` scopes, **Google verification is not required**. These are non-sensitive scopes. The app goes live immediately.

**What you should see when done:** Publishing status changes from "Testing" to "In production".

---

## Verification Checklist

Before handing off to the implementation task, confirm all of these:

- [ ] GCP project exists and is selected in the console
- [ ] OAuth consent screen is configured (app name, support email, scopes)
- [ ] OAuth 2.0 Client ID of type "Web application" exists
- [ ] All localhost ports (4200–4210) are in Authorized JavaScript Origins
- [ ] Production and staging domains are in Authorized JavaScript Origins
- [ ] Redirect URIs match what the backend callback routes will expect
- [ ] `GOOGLE_CLIENT_ID` is in local `.env` file
- [ ] `GOOGLE_CLIENT_SECRET` is in local `.env` file
- [ ] `VITE_GOOGLE_CLIENT_ID` is in `webclientv4/.env.local`
- [ ] Both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set as Heroku config vars on production
- [ ] Both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set as Heroku config vars on staging
- [ ] Neither `.env` nor `.env.local` is committed to git
