# Everycent - Zero Based Budget Manager

## Overview
Personal finance app for zero-based budgeting. Rails 7.1 API backend + Angular 14 frontend, with active Vue 3 migration.

## Tech Stack
- **Backend**: Ruby 3.2.3, Rails 7.1.3, PostgreSQL
- **Frontend (production)**: Angular 14.3, TypeScript (webclientv3)
- **Frontend (active migration)**: Vue 3 + Vite + PrimeVue 4 + Pinia (webclientv4)
- **Auth**: devise + devise_token_auth (token-based, stored in localStorage)
- **Multi-tenancy**: acts_as_tenant scoped by Household
- **Deployment**: Heroku with Puma

## Project Structure
Three frontend generations:
- `webclientv3/` — Angular 14 (current production frontend)
- `webclientv4/` — Vue 3 (active migration target)
- `webclient/` — Legacy AngularJS (v1)

Backend: `app/` (Rails controllers, models, serializers), `config/`, `db/`, `spec/`.

## Backend Conventions
- RESTful JSON API with ActiveModel::Serializers for responses
- All models use `acts_as_tenant :household` for data scoping
- Controllers inherit from ApplicationController (includes auth + serialization)
- Use `respond_with` for consistent API responses
- FactoryBot for test fixtures, database cleaner for isolation
- JSON keys match Ruby model/attribute names (snake_case). Use model names for nested collections (e.g. `bank_accounts`, not `accounts`)
- Server-side validation is authoritative. Always validate on the backend regardless of what the frontend sends — never trust client-side data.

## API Routes
Auth mounted at `/auth` (devise_token_auth). Key resources:
`/budgets`, `/allocations`, `/bank_accounts`, `/transactions`, `/sink_funds`,
`/allocation_categories`, `/institutions`, `/special_events`, `/settings`, `/reports`

## Database
PostgreSQL. Key tables: users, households, budgets, incomes, allocations,
allocation_categories, bank_accounts, transactions, sink_funds, institutions, settings.

## Local Dev Notes
Machine-specific development info (test user credentials, etc.) lives in `.claude/local-dev.md` (gitignored).

## Build & Release
> v3 (Angular) is frozen; v1 (AngularJS) is dormant. This section is only for occasional rebuilds during the Vue v4 cutover — skip entirely once v4 is the default (pending reports migration).

1. Build Angular: `cd webclientv3 && npm run build` (outputs to /public)
2. Build v1 legacy: `cd webclient && gulp` (outputs to /public/v1)
3. Commit: `git add . && git commit -m "build of static assets"`

## Deployment

Invoke the **deploy skill** for production deploys. The skill owns the procedure — login check, test gate, "What's New" updates, build, push, migrations. Don't run the steps manually.

**Heroku app mapping** (reference for sanity-checking when poking around the CLI directly):
- **Production**: `everycent` (eu region) — git remote `heroku`
- **Staging**: `everycent-staging` (eu region) — git remote `staging`
- `everycent-euro` is a **separate app**, not the production app for this repo

## Testing (Vue App - webclientv4)
- Use test-driven development (TDD). Write tests before implementation.
- Aim for 100% test coverage on all new code. Every function, branch, and edge case should be tested.
- If 100% coverage is not feasible for a specific piece of code, do not silently skip it — confirm with the user first and document the reason.
- Run tests after every change to ensure nothing is broken.

## Pre-Commit Checks
- Before committing, run `npm run type-check` (in webclientv4/) and verify there are no TypeScript errors. Do not commit with type errors.
- Before committing, run `npm run test` (in webclientv4/) and verify all tests pass. Do not commit with failing tests.
- Before committing, run `bundle exec rspec` and verify all backend tests pass. Do not commit with failing tests.
- Before staging, restore `package-lock.json` if it was modified incidentally (`git checkout -- webclientv4/package-lock.json`). Only commit lockfile changes when the task specifically involves adding, removing, or updating dependencies.
- **Never use `--no-verify`** to bypass pre-commit hooks. If hooks fail, fix the underlying issue. Using `--no-verify` requires explicit permission from the user.
- **Never add `eslint-disable` comments** to suppress lint errors without explicit permission from the user. Fix the code instead. This includes pre-existing violations in files you touch — if you modify a file and encounter existing lint errors, fix them.
- **Never bypass TypeScript errors** with `@ts-ignore`, `@ts-expect-error`, or bang assertions (`!`). Fix with proper type guards. Suppression requires explicit permission. This includes pre-existing type errors in files you touch — if you modify a file and it has existing type errors, fix them. In prod code: use null guards or early returns. In spec files: use typed helpers or restructure so types flow correctly. Only use `!` when you can clearly articulate why the value is guaranteed to exist and there is no cleaner alternative.

## Code Review (Vue App - webclientv4)
- Before committing any changes, run the `senior-code-reviewer` agent over all modified files.
- Before acting on any review feedback, run `domus task list` and check whether the feedback point is already captured as an open task. If it is, note it as already tracked and do not act on it now.
- Apply any remaining feedback from the review before committing.
- Display a summary of what was changed as a result of the review feedback.

### Refactor Discipline
- **Refactors need active review.** Stage changes for review at each step, explain trade-offs, and invite discussion. Don't batch large changes silently — the risk is subtle regressions, and the user wants to stay close to these changes.
- **Push back on scope.** Flag proactively when a change pulls in more than necessary, when a better design alternative exists, when changes should be separate commits/tasks, or when files are touched without material benefit.

## Debugging: Pre-Fix Validation Sequence
Before investigating unexpected browser behavior or making code changes to fix a bug:
1. **Confirm servers are running.** Check Rails (`lsof -i :3000`) and Vite (`lsof -i :4200`) before chasing code-level causes — missing server is a common culprit.
2. **Reproduce before fixing.** For a reported visual or layout bug, first confirm you can see the problem (screenshot, DOM inspection, measurement). Only then make changes, so the fix can be validated against the original problem.
3. **Get visual confirmation before updating tests.** After a visual change, show the result and wait for user sign-off before fixing failing tests — tests are downstream of the visual decision, and revisions make test churn wasteful.

## Browser Testing & Automation
- **Use only `mcp__claude-in-chrome__*` tools.** Never mix with `mcp__chrome-devtools__*` — they connect to different browser contexts and produce confused results (wrong tab screenshots, about:blank snapshots).
- **Use DevTools device emulation for mobile testing** (Cmd+Shift+M in DevTools). Never use `resize_window` — resizing affects all tabs in the window and disrupts other open sessions.

## Design Philosophy

- **Reference implementations over written rules.** When creating a new file, read the reference implementation and match its pattern. When modifying an existing file, follow the file's own style — it is the reference. Exception: if the task is explicitly moving away from the existing style (a refactor), the canonical reference implementation takes precedence.
- **Extract components through the UX lens, not code-dedup.** The right question is "does the next developer get consistent UX for free?" — not "how many lines does this save?" If using a shared component means correct layout/behaviour without custom CSS or copy-paste, extract it even if line savings are modest. Custom CSS in layout code is a smell that hints at a hidden reusable component.

## Migration Context
Vue 3 migration is functionally complete — Vue serves at `/` (root), Angular at `/v3/` as fallback. Angular code is frozen; no new features should be added to webclientv3.

See `webclientv4/CLAUDE.md` for Vue 3 setup constraints and conventions.
Reference implementations: store → `transactionStore.ts`, API → `bankAccountApi.ts`, component → `TransactionsPage.vue`.
For detailed coding rules, see `webclientv4/docs/vue-coding-rules.md`.

## Merging

Invoke the **housekeeper skill** for any merge, land, or close-out operation, and for syncing `ready-for-master` back to master. Housekeeper owns the protocol — ready-for-master staging, single-commit ff vs multi-commit `--no-ff`, pre-merge rebase, worktree handling, conflict resolution. Don't DIY a merge even if the steps feel routine — the skill exists to enforce safety rails (never switch the main worktree branch, never stash on the main worktree, never merge directly to master).

Two commit rules that apply outside merging too, so they live here:
- **Never stash** on the main worktree. Commit first. Stash creates hidden state and is never the right tool when housekeeper's flow is available.
- **Before committing** anywhere: run `git branch --show-current` and verify you're on the expected branch. Commits have landed on wrong branches before.

## Housekeeping Commits
- **Direct to master** for `.domus/`, `CLAUDE.md`, and `vocabulary/` changes — no feature branch needed. These are docs/housekeeping, not code.
- **Vocabulary changes get their own commits** (separate from feature work) so the evolving vocabulary is reviewable in git log.
- **When staging `.domus/` changes**, always include the index files (`tasks.jsonl`, `ideas.jsonl`) alongside any `.md` files — staging only the `.md` files causes index drift.

## Worktrees

- **Default to a separate worktree** for non-trivial work. The main worktree is the user's active workspace (dev server, open files). Only operate on the main worktree when explicitly told to.
- **Default: branch new worktrees from master**, not from current work. Specify otherwise if the new branch explicitly depends on in-progress work.
- **Ask before switching the main worktree's branch** (checkout, merge, rebase) outside of merging. The user runs the dev server there — switching branches disrupts their running session. (For merging operations, housekeeper handles this — never switches the main worktree at all.)

## Worker Dispatch Protocol

- **Model**: dispatch background worktree agents with `model: "sonnet"`. Implementation tasks don't need Opus — cheaper and faster.
- **Branch discipline**: the scaffold `worktree-agent-*` branch stays frozen. Actual commits must land on the task branch. After dispatch, confirm with `cat .git/worktrees/<name>/HEAD`.
- **Full cycle**: dispatch → worker commits on task branch → verify commit exists → show diff to user → wait for explicit approval → merge → clean up worktree and branch.
- **Verification is mandatory**: workers can follow some protocol steps while silently skipping others (e.g., log start, log completion, advance task — but skip the commit). "Worker reported done" does not mean all steps completed. Before reporting to the user, independently verify each step — especially: `git -C <worktree> log --oneline -1` to confirm a commit exists.
- **Review before merge**: keep the worktree alive after the worker finishes. Show the diff (`git log <branch> --not master -p`), then stop and wait for approval before merging to ready-for-master.

## Domus Workflow
See `.domus/reference/agent-instructions.md` for domus workflow rules (task lifecycle, dispatch, CLI commands, staff roles).
- **Don't assume task frontmatter fields** — domus evolves and field names go stale. Let the CLI generate frontmatter and read the actual created file rather than reporting from memory.

## Cypress E2E Tests
See `webclientv4/cypress/CLAUDE.md` for E2E test rules (typing into PrimeVue inputs, DB setup).

## Vocabulary

The project maintains an explicit domain vocabulary in `vocabulary/`. At conversation start, read `vocabulary/vocabulary.md` for all word definitions; read `vocabulary/<word>.md` for detail when working on that concept. See `vocabulary/INSTRUCTIONS.md` for loading, updating, and growing rules.
