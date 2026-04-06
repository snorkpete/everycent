---
name: deploy
description: Use to deploy the Vue v4 app to Heroku production from a clean master — updates "What's New", rebuilds static assets, pushes to origin + heroku, runs migrations. Fires on /deploy, "deploy to production", "ship this to prod".
version: 1.0.0
---

# Deploy to Production

Deploy the Vue v4 app to Heroku production, starting from "everything committed on master." Updates the "What's New" home page content, rebuilds static assets, pushes to origin + heroku, and runs migrations.

## Prerequisites — tell the user this first

Before doing anything else, output this message:

> **Before we continue:** make sure you're logged in to Heroku on the terminal.
> Run `heroku login` if you haven't already this session. Once you're logged in, let me know and I'll proceed.

Wait for confirmation before continuing.

## Step 1 — Precondition checks

Run these in the repo root and report results:

```bash
git branch --show-current
git status --short
git fetch origin
git log origin/master..HEAD --oneline
```

Abort (with explanation) if any of these fail:
- Not on `master` branch
- Working tree not clean
- Local `master` is behind `origin/master` (would need a pull first)

If local is ahead of origin, that's expected — those are the commits being deployed. If local matches origin exactly, ask the user whether to proceed (nothing new to deploy).

## Step 2 — Review deployed commits

Show the user what's being deployed:

```bash
git log origin/master..HEAD --oneline
git log origin/master..HEAD --stat
```

Summarise in plain language which changes are **user-facing** (affect workflow, visible UI, new features) vs **internal** (refactors, test changes, infrastructure). The user-facing ones are candidates for "What's New."

## Step 3 — Update "What's New"

Read `webclientv4/src/app/home/whatsNewContent.ts`.

Structure:
- `HIGHLIGHTS` — big-card items with `{title, body, date}`. Use for changes that affect workflow or need a moment of explanation.
- `NOTEWORTHY` — bullet strings. Use for smaller quality-of-life improvements.

Propose updates based on Step 2:
- New `HIGHLIGHTS` entries for workflow-affecting changes (use today's date, ISO format)
- New `NOTEWORTHY` bullets for smaller improvements
- **Prune candidates** — list existing entries older than ~30 days and ask the user which to drop (the file's own comment says "Prune entries when they're no longer new")

Show the proposed diff and wait for the user to refine the wording. Tone: direct, friendly, written for a non-technical user ("wifey-facing" per file comment).

Once content is settled, write the file and commit:

```bash
git add webclientv4/src/app/home/whatsNewContent.ts
git commit -m "chore(home): update what's new for deploy"
```

If the user decides no update is needed this deploy, skip the commit and continue.

## Step 4 — Build Vue assets

```bash
cd webclientv4 && npm run build
```

This compiles TypeScript + bundles the app. If the build fails, stop and surface the error — do not proceed.

## Step 5 — Commit built assets

```bash
git status --short public/
```

If `public/v4/` changed:

```bash
git add public/
git commit -m "production build"
```

If nothing changed (rare, but possible if the source changes were non-UI), skip this step.

## Step 6 — Push to remotes

Commits were already reviewed in Steps 2–3 and validated by the build in Step 4. Push sequentially, reporting each:

```bash
git push origin master
git push heroku master
```

If either push fails, report `<remote> push failed` and stop — the user will investigate separately.

**Do not push to `staging`** unless the user explicitly asked for a staging deploy at the start. If requested, run `git push staging master:main` as a third push; on failure, report `staging push failed` and continue (staging failure does not block production).

## Step 7 — Run migrations

```bash
heroku run rails db:migrate --app everycent
```

The `--app everycent` flag is **required** — multiple heroku remotes exist and Heroku CLI cannot infer the target. Migrations are idempotent, so running this every deploy is safe whether there are pending migrations or not.

Report the output tail (last ~10 lines) so the user can see what ran.

## Done

Summarise:
- Commits deployed (count + titles)
- What's New updated? (yes/no)
- Migrations run (any actually executed, or all up-to-date)
- Staging pushed? (yes/no/skipped)
