# Everycent - Zero Based Budget Manager

## Overview
Personal finance app for zero-based budgeting. Rails 7.1 API + Vue 3 frontend (webclientv4/), Angular 14 safety net (webclientv3/, frozen). PostgreSQL, devise_token_auth, acts_as_tenant by Household, deployed on Heroku.

## Backend Conventions
- All models use `acts_as_tenant :household` for data scoping
- JSON keys use snake_case matching Ruby names. Use model names for nested collections (e.g. `bank_accounts`, not `accounts`)
- Server-side validation is authoritative — never trust client-side data

## Local Dev Notes
Machine-specific info (test user credentials, etc.) in `.claude/local-dev.md` (gitignored).

## Deployment

Use the **deploy skill**. Don't run deploy steps manually.

## Testing (Vue App - webclientv4)
TDD, 100% coverage on new code. Confirm with user before skipping coverage. Run tests after every change.

## Pre-Commit Checks
Before committing, run and verify these pass: `npm run type-check`, `npm run test` (both in webclientv4/), `bundle exec rspec`.

- Restore `package-lock.json` if modified incidentally. Only commit lockfile changes for dependency tasks.
- **Don't suppress errors** (`--no-verify`, `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `!`). Fix them — including pre-existing violations in touched files. In prod code: null guards or early returns. In specs: typed helpers or restructured types. Only use `!` when the value is guaranteed to exist and no cleaner alternative exists. Suppression requires explicit user permission.

## Code Review (Vue App - webclientv4)
Before committing Vue changes, run the `senior-code-reviewer` agent. Check domus for already-tracked items before acting on feedback.

### Refactor Discipline
- **Refactors need active review.** Stage changes for review at each step, explain trade-offs, invite discussion.
- **Push back on scope.** Flag when changes pull in more than necessary, when a better design exists, when changes should be separate commits, or when files are touched without benefit.

## Browser Testing & Automation
When doing browser testing, read `~/.claude/docs/browser-testing-protocol.md` first.

## Design Philosophy

- **Reference implementations over written rules.** When creating a new file, read the reference implementation and match its pattern. When modifying, follow the file's own style. Exception: if the task is a refactor, the canonical reference takes precedence.
- **Extract components through the UX lens, not code-dedup.** "Does the next developer get consistent UX for free?" matters more than line savings. Custom CSS in layout code hints at a hidden reusable component.

## Vue Frontend
See `webclientv4/CLAUDE.md` for Vue 3 setup constraints and conventions.
Reference implementations: store → `transactionStore.ts`, API → `bankAccountApi.ts`, component → `TransactionsPage.vue`.
For detailed coding rules, see `webclientv4/docs/vue-coding-rules.md`.

## Merging

Invoke the **housekeeper skill** for any merge, land, or close-out operation. Don't DIY a merge even if the steps feel routine.

- **Never stash** on the main worktree. Commit first.
- **Before committing** anywhere: run `git branch --show-current` and verify you're on the expected branch.

## Housekeeping Commits
- **Direct to master** for `.domus/`, `CLAUDE.md`, and `vocabulary/` changes — no feature branch needed.
- **Vocabulary changes get their own commits** (separate from feature work).
- **When staging `.domus/` changes**, always include the index files (`tasks.jsonl`, `ideas.jsonl`) alongside any `.md` files.

## Worktrees

- **Default to a separate worktree** for non-trivial work. The main worktree is the user's active workspace (dev server, open files). Only operate on the main worktree when explicitly told to.
- **Default: branch new worktrees from master**, not from current work. Specify otherwise if the new branch explicitly depends on in-progress work.
- **Ask before switching the main worktree's branch** (checkout, merge, rebase) outside of merging. The user runs the dev server there — switching branches disrupts their running session.
- **The `healthcheck` branch/worktree (`/Users/kion/code/everycent-healthcheck`) is the standing home for behaviour-preserving internal-improvement work** — work that improves the system's internals without changing how it behaves for users. This covers regular code audits and the fixes they surface, system/dependency updates with no logic change, and behaviour-preserving internal swaps (e.g. Ruby/Rails upgrades, or swapping the auth implementation while auth behaves identically for users). Put this category of work here rather than spinning a fresh worktree; reserve new worktrees for behaviour-changing feature work.

## Worker Dispatch
When dispatching workers, read `~/.claude/docs/worker-dispatch-protocol.md` first.

## Domus Workflow
See `.domus/reference/agent-instructions.md` for domus workflow rules (task lifecycle, dispatch, CLI commands, staff roles).
- **Don't assume task frontmatter fields** — domus evolves and field names go stale. Let the CLI generate frontmatter and read the actual created file.

## Cypress E2E Tests
See `webclientv4/cypress/CLAUDE.md` for E2E test rules.

## Vocabulary
Domain vocabulary lives in `vocabulary/`. Read `vocabulary/INSTRUCTIONS.md` and `vocabulary/vocabulary.md` when working on domain concepts.
