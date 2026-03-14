# Everycent - Zero Based Budget Manager

## Overview
Personal finance app for zero-based budgeting. Rails 7.1 API backend + Angular 14 frontend (with planned Vue 3 migration).

## Tech Stack
- **Backend**: Ruby 3.2.3, Rails 7.1.3, PostgreSQL
- **Frontend (current)**: Angular 14.3, TypeScript, Angular Material 14, RxJS
- **Auth**: devise + devise_token_auth (token-based, stored in localStorage)
- **Multi-tenancy**: acts_as_tenant scoped by Household
- **Deployment**: Heroku with Puma

## Project Structure
```
app/                    # Rails backend (controllers, models, serializers)
config/                 # Rails configuration (routes, database, initializers)
db/                     # Migrations (57) and schema
spec/                   # RSpec tests (models, controllers, factories)
webclientv3/            # Angular 14 frontend (current)
  src/app/              # Feature modules (budgets, transactions, bank-accounts, etc.)
  src/api/              # ApiGateway HTTP abstraction
webclient/              # Legacy AngularJS frontend (v1)
public/                 # Compiled frontend assets served by Rails
```

## Common Commands

### Backend
```bash
rails s                          # Start Rails server on :3000
rspec                            # Run all backend tests
rspec spec/models                # Run model tests only
rspec spec/controllers           # Run controller tests only
bundle install                   # Install Ruby dependencies
rails db:migrate                 # Run pending migrations
```

### Frontend (Angular v3)
```bash
cd webclientv3
npm start                        # Dev server on :4200 (proxies to Rails :3000)
npm test                         # Karma + Jasmine tests
npm run build                    # Production build to /public
```

## Key Conventions

### Backend (Ruby/Rails)
- RESTful JSON API with ActiveModel::Serializers for responses
- All models use `acts_as_tenant :household` for data scoping
- Controllers inherit from ApplicationController (includes auth + serialization)
- Use `respond_with` for consistent API responses
- FactoryBot for test fixtures, database cleaner for isolation

### Frontend (Angular)
- Component selector prefix: `ec-` (e.g., `ec-add-budget`)
- Inline templates preferred for smaller components
- ApiGateway service for all HTTP calls (returns Observables)
- Token auth headers: access-token, client, expiry, token-type, uid
- Feature-based module organization

### Naming
- Components: `PascalCaseComponent` / selector: `ec-kebab-case`
- Services: `PascalCaseService`
- Models/interfaces: `PascalCaseData`
- Serializers: `PascalCaseSerializer`

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

## Testing (Vue App - webclientv4)
- Use test-driven development (TDD). Write tests before implementation.
- Aim for 100% test coverage on all new code. Every function, branch, and edge case should be tested.
- If 100% coverage is not feasible for a specific piece of code, do not silently skip it — confirm with the user first and document the reason.
- Run tests after every change to ensure nothing is broken.

## Code Review (Vue App - webclientv4)
- Before committing any changes, run the `senior-code-reviewer` agent over all modified files.
- Before acting on any review feedback, run `domus task list` and check whether the feedback point is already captured as an open task. If it is, note it as already tracked and do not act on it now.
- Apply any remaining feedback from the review before committing.
- Display a summary of what was changed as a result of the review feedback.

## Migration Context
There is a planned migration from Angular 14 to Vue 3 + Vite + PrimeVue 4 + Pinia.
See `MIGRATION_PLAN.md` for details. New frontend will live in `webclientv4/`.

## Capturing Knowledge for Future Sessions

Proactively identify information that would be lost when a session closes and
capture it before that happens. Use the right destination:

- **Ideas** (`domus idea add`) — concepts not yet decided, open questions, directions
  worth exploring. When in doubt: idea = "should we do this?"
- **Tasks** (`domus task add`) — decided, concrete work that needs doing.
  When in doubt: task = "we've decided to do this."
- **Memory** — orientation only: what's actively in progress, non-obvious setup
  quirks not visible from the codebase
- **CLAUDE.md** — only when new behavioral rules emerged that should govern every
  future session (be conservative)
- **MIGRATION_PLAN.md** — phase/step completion and migration-specific decisions

Prefer domus over memory whenever the information is "what we decided or what needs doing."

## Domus Data Access Rules

**Never read or write `.domus/**/*.jsonl` or `.domus/**/*.md` frontmatter directly.**
All domus data must go through the CLI (`domus task`, `domus idea`). The CLI keeps the JSONL index and the markdown detail file in sync atomically — direct edits break that invariant silently.

If you find yourself about to touch a JSONL or MD frontmatter directly, stop and:
1. Check `domus <command> --help` — the capability may already exist.
2. If it genuinely doesn't exist, tell the user explicitly: what you needed to do, why the CLI couldn't do it, and what command or flag would close the gap. Then capture a task for it.
3. Do not proceed with direct file access without the user's explicit approval.

If the user approves direct access as a one-off workaround, you **must** update both files together — the JSONL index entry and the corresponding `.md` frontmatter — or the workspace will be left in an inconsistent state.

The complement: you **can and should** directly edit the body content of `.domus/**/*.md` files (below the frontmatter) — that's where execution context, notes, and decisions live. The CLI owns the frontmatter; Claude owns the body.

## Ideas Workflow

Ideas live in `.domus/ideas/`. Managed via `domus idea` CLI. Skills: `/capture-idea`, `/idea-refined`.
CLI lives at `~/code/domus`, linked globally via `bun link`. In Bash, use full path: `/Users/kion/.bun/bin/domus`.

**Status lifecycle:** `raw` → `refined` → `scoped` → `implemented` | `abandoned` | `deferred`
- **raw** — captured, open questions unresolved
- **refined** — well understood, decided worth pursuing
- **scoped** — concrete plan exists; create task(s) to execute it. Convention: one
  top-level task per idea, broken into sub-tasks if the work warrants it.
- **implemented / abandoned / deferred** — terminal states; add `--note` for context

**Tags:** See `.domus/tags/shared.md` and `.domus/tags/ideas.md` — read when tagging, not otherwise.

**Cross-project targeting:** When capturing an idea about the domus tool itself (CLI commands, workflow, the domus system), use `domus --root /Users/kion/code/domus idea <subcommand>`. Everycent ideas (budgeting app, Vue migration, Rails, Angular) use the default (no flag).

**When to update:**
- New idea → `domus idea add --title "..." --summary "..."` (or `/capture-idea`)
- Discussed/refined → `domus idea status <id> refined` (or `/idea-refined`)
- Scoped → `domus idea status <id> scoped` + create task(s)
- Implemented → `domus idea status <id> implemented`
- Abandoned/deferred → `domus idea status <id> abandoned|deferred --note "<reason>"`

## Tasks Workflow

Tasks live in `.domus/tasks/`. Managed via `domus task` CLI. Skills: `/capture-task`, `/update-task-status`, `/task-ready`.
CLI lives at `~/code/domus`, linked globally via `bun link`. In Bash, use full path: `/Users/kion/.bun/bin/domus`.

**Refinement levels:** `raw` → `refined` → `autonomous`
- **raw** — open questions, not ready to execute
- **refined** — well understood, needs human oversight during execution
- **autonomous** — fully specified, Claude can execute end-to-end

**Tags:** See `.domus/tags/shared.md` and `.domus/tags/tasks.md` — read when tagging, not otherwise.

**Cross-project targeting:** When capturing a task about the domus tool itself (CLI commands, workflow, the domus system), use `domus --root /Users/kion/code/domus task <subcommand>`. Everycent tasks (budgeting app, Vue migration, Rails, Angular) use the default (no flag).

**Reading task data:** Use `domus task list` for day-to-day use. Icons: `○` open `◑` in-progress `●` done `✕` cancelled `⏸` deferred. Use `--json` when you need fields not shown in the list (summary, tags, dependencies, dates, outcome notes).

**When to update:**
- New task → `domus task add --title "..." --summary "..." --refinement raw|refined|autonomous` (or `/capture-task`)
- Status change → `domus task status <id> <status>`

## Cypress E2E Tests
See `webclientv4/cypress/CLAUDE.md` for E2E test rules (typing into PrimeVue inputs, DB setup).
