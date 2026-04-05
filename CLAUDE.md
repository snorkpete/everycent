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

## Build & Release
1. Build Angular: `cd webclientv3 && npm run build` (outputs to /public)
2. Build v1 legacy: `cd webclient && gulp` (outputs to /public/v1)
3. Commit: `git add . && git commit -m "build of static assets"`

## Deployment
Prerequisite: user must have run `heroku login` in their terminal session.

**Heroku app mapping:**
- **Production**: `everycent` (eu region) — git remote `heroku`
- **Staging**: `everycent-staging` (eu region) — git remote `staging`
- `everycent-euro` is a **separate app**, not the production app for this repo

1. Build Vue assets: `cd webclientv4 && npm run build` (outputs to /public/v4)
2. Commit the built assets: `git add public/ && git commit -m "production build"`
3. Push to all three remotes:
   - `git push origin master` — GitHub (code backup)
   - `git push heroku master` — Heroku production deploy
   - `git push staging master:main` — Heroku staging (temporary; pushes master to staging's main branch)

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
- **Never bypass TypeScript errors** with `@ts-ignore`, `@ts-expect-error`, or bang assertions (`!`). Fix with proper type guards. Suppression requires explicit permission. This includes pre-existing type errors in files you touch — if you modify a file and it has existing type errors, fix them.

## Code Review (Vue App - webclientv4)
- Before committing any changes, run the `senior-code-reviewer` agent over all modified files.
- Before acting on any review feedback, run `domus task list` and check whether the feedback point is already captured as an open task. If it is, note it as already tracked and do not act on it now.
- Apply any remaining feedback from the review before committing.
- Display a summary of what was changed as a result of the review feedback.

## Migration Context
Active migration from Angular 14 to Vue 3 (webclientv4). Migration state tracked in `domus task list`.

See `webclientv4/CLAUDE.md` for Vue 3 setup constraints and conventions.
Reference implementations: store → `transactionStore.ts`, API → `bankAccountApi.ts`, component → `TransactionsPage.vue`.
For detailed coding rules, see `webclientv4/docs/vue-coding-rules.md`.

## Merge Strategy
- **Single-commit feature branch → ready-for-prod**: fast-forward (default `git merge`)
- **Multi-commit feature branch → ready-for-prod**: `--no-ff` (keeps commits grouped in history)
- **ready-for-prod → master**: `--ff-only` (ready-for-prod is just a staging technicality, no merge commits needed)
- **Before committing**: run `git branch --show-current` and verify you're on the expected feature branch (not master). Commits have landed on wrong branches before.
- **When master moves ahead**: rebase the feature branch onto master (`git rebase master`) rather than merging. Keeps history linear. Only use `--no-ff` merges for multi-commit branches into ready-for-prod.
- **Never stash** on the main worktree when merging. Commit first, or use ready-for-prod. Stash creates hidden state and the ready-for-prod pattern makes it unnecessary.

## Ready-for-Prod Pattern

`ready-for-prod` is a mutex workaround: use it as the merge target when `master` is checked out in another worktree.

- **Invariant:** `ready-for-prod` must always be a fast-forward from master. If `git merge ready-for-prod --ff-only` fails, treat as an error — don't resolve silently.
- **Sync immediately before merging:** run `git merge master --ff-only` on `ready-for-prod` right before merging in a feature branch. If master moves between that sync and the merge, re-sync. Don't sync early and trust it stays current.

## Landing Worktree Branches

Full sequence for landing a completed worktree branch:

1. Sync `ready-for-prod` to master: `git checkout ready-for-prod && git merge master --ff-only`
2. Identify the correct branch to merge — check `cat .git/worktrees/<name>/HEAD`. The scaffold `worktree-agent-*` branch stays frozen; commits land on the task branch. Merge the task branch.
3. Merge feature into `ready-for-prod` (single-commit: ff; multi-commit: `--no-ff`)
4. **Stop here.** Show the diff summary and wait for explicit user approval before merging to master.
5. Update task status: `domus task advance` (repeat until done). Commit `.domus/tasks/*.md` + `tasks.jsonl` as a chore commit on `ready-for-prod`.
6. Clean up: `git worktree remove <path>` then `git branch -d <branch>`. Always merge before removing — worktree cleanup can silently delete branches with unmerged commits (issue #38287).
7. Later (at deploy time): `git merge ready-for-prod --ff-only` on master.

### Worktree Branching

- **Default: branch new worktrees from master**, not from current work. Specify otherwise if the new branch explicitly depends on in-progress work.
- Ask before switching context away from a worktree (don't silently switch to the main worktree).

## Worker Dispatch Protocol

- **Model**: dispatch background worktree agents with `model: "sonnet"`. Implementation tasks don't need Opus — cheaper and faster.
- **Branch discipline**: the scaffold `worktree-agent-*` branch stays frozen. Actual commits must land on the task branch. After dispatch, confirm with `cat .git/worktrees/<name>/HEAD`.
- **Full cycle**: dispatch → worker commits on task branch → verify commit exists → show diff to user → wait for explicit approval → merge → clean up worktree and branch.
- **Verification is mandatory**: workers can follow some protocol steps while silently skipping others (e.g., log start, log completion, advance task — but skip the commit). "Worker reported done" does not mean all steps completed. Before reporting to the user, independently verify each step — especially: `git -C <worktree> log --oneline -1` to confirm a commit exists.
- **Review before merge**: keep the worktree alive after the worker finishes. Show the diff (`git log <branch> --not master -p`), then stop and wait for approval before merging to ready-for-prod.

## Domus Workflow
See `.domus/reference/agent-instructions.md` for domus workflow rules (task lifecycle, dispatch, CLI commands, staff roles).

## Cypress E2E Tests
See `webclientv4/cypress/CLAUDE.md` for E2E test rules (typing into PrimeVue inputs, DB setup).

## Vocabulary

The project maintains an explicit domain vocabulary in `vocabulary/`.

### Loading
- At conversation start, read `vocabulary/vocabulary.jsonl` to load all word definitions.
- When working on a feature, debugging, or discussing a domain concept, read the relevant detail files (`vocabulary/<word>.md`) for context on intent, history, and expected behavior.
- Use vocabulary definitions as the source of truth for what domain terms mean. If code behavior diverges from a word's contract, that's a potential bug — flag it.

### Updating
Vocabulary is a living document. Update it as new information surfaces in conversation.

**Do directly (no confirmation needed):**
- Clarifying or improving wording in context/gotchas sections
- Adding new gotchas or context discovered during work
- Fixing factual errors you can verify in code
- Updating status (e.g., partial → dead) when confirmed by the user

**Propose first (get user confirmation):**
- Adding a new vocabulary word
- Changing a definition (the compressed meaning in the JSONL)
- Changing a contract (how something is supposed to work)
- Removing a word

When updating, always update both the detail .md file and the JSONL index entry if the definition changed.

### Growing the vocabulary
- If a concept keeps coming up in conversation that isn't captured, propose it as a new word.
- Look for opportunities to compose existing words into higher-level concepts — vocabulary words are functions of meaning that compose. The goal is to express more with fewer words over time.
- The vocabulary is also a transparency tool: the user can see what each word means to you, catch misconceptions early, and correct them. When proposing or updating, be specific about your understanding so divergences are visible.
