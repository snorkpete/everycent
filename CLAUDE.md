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
- Apply any feedback from the review before committing.
- Display a summary of what was changed as a result of the review feedback.

## Migration Context
There is a planned migration from Angular 14 to Vue 3 + Vite + PrimeVue 4 + Pinia.
See `MIGRATION_PLAN.md` for details. New frontend will live in `webclientv4/`.

## Capturing Knowledge for Future Sessions
Proactively identify information that would be lost when a session closes and suggest
capturing it before that happens. Good candidates include:
- Design decisions and the reasoning behind them
- Open questions about a feature or idea that need answering before work can start
- New ideas that emerge during conversation (see Ideas workflow below)
- Patterns or conventions established during a session that aren't yet in CLAUDE.md
- Anything that would cause a future session to have to re-derive or re-discuss something

When something qualifies, suggest where it should be captured (MIGRATION_PLAN.md,
CLAUDE.md, or a memory file) and do it proactively rather than waiting to be asked.

## Ideas Workflow

Ideas are tracked in two places:
- `.domus/ideas/ideas.jsonl` — the index (one JSON object per line, I am the primary consumer)
- `.domus/ideas/<id>.md` — full detail file for each idea

### JSONL schema
```json
{
  "id": "kebab-case-slug",
  "title": "Human Readable Title",
  "file": ".domus/ideas/<id>.md",
  "date_captured": "YYYY-MM-DD or null",
  "status": "raw | refined | scoped | implemented | abandoned | deferred",
  "tags": ["<controlled vocab — see below>"],
  "summary": "One or two sentence description.",
  "needs_refinement": true,
  "date_status_changed": "YYYY-MM-DD or null",
  "date_implemented": "YYYY-MM-DD or null",
  "outcome_note": "Brief note when status is abandoned or deferred, else null"
}
```

### Status lifecycle
`raw` → `refined` → `scoped` → `implemented` | `abandoned` | `deferred`
- **raw** — just captured, open questions unresolved
- **refined** — open questions answered, idea well understood
- **scoped** — concrete implementation plan exists, ready to become tasks
- **implemented** — done; set `date_implemented`
- **abandoned** — evaluated and not worth pursuing; explain in `outcome_note`
- **deferred** — consciously parked; not dead but not ready

### Tag vocabulary
See `.domus/ideas/tags.md`. Read that file when you need to tag an idea — do not load it otherwise.

### When to update the index
- **New idea captured** — create the `.md` file AND add a line to `ideas.jsonl`
- **Idea discussed or refined** — update `needs_refinement`, `status`, `date_status_changed` in the index
- **Idea implemented** — set `status: implemented` and `date_implemented`
- **Idea abandoned/deferred** — set status and write `outcome_note`

## Cypress E2E Tests
See `webclientv4/cypress/CLAUDE.md` for E2E test rules (typing into PrimeVue inputs, DB setup).
