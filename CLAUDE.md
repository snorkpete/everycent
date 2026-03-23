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
Active migration from Angular 14 to Vue 3 (webclientv4). Migration state tracked in `domus task list`.

See `webclientv4/CLAUDE.md` for Vue 3 setup constraints and conventions.
Reference implementations: store → `transactionStore.ts`, API → `bankAccountApi.ts`, component → `TransactionsPage.vue`.
For detailed coding rules, see `webclientv4/docs/vue-coding-rules.md`.

## Domus Workflow
See `.domus/reference/agent-instructions.md` for domus workflow rules (task lifecycle, dispatch, CLI commands, staff roles).

## Cypress E2E Tests
See `webclientv4/cypress/CLAUDE.md` for E2E test rules (typing into PrimeVue inputs, DB setup).
