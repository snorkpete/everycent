# Cypress E2E Test Guidelines

## Typing into PrimeVue Inputs

**Do NOT use `.clear()` before `.type()` on dialog form fields.**

PrimeVue InputText uses a controlled input pattern (`:model-value` + `@update:modelValue`).
When `.clear()` fires `Ctrl+A`, it can briefly de-focus the input. The space character in
a subsequent `.type()` call may then be intercepted by PrimeVue Dialog's keyboard handler
before the input recaptures focus, truncating the typed value at the space.

**Rule:** For fields that start empty (e.g., Add dialogs), just use `.type('value')` directly.
For fields with existing content that need to be replaced, use `.type('{selectall}new value')`.

```typescript
// WRONG — truncates values containing spaces
cy.get(`#${id}`).clear().type('Republic Bank');

// CORRECT — field starts empty
cy.get(`#${id}`).type('Republic Bank');

// CORRECT — replacing existing content
cy.get(`#${id}`).type('{selectall}Republic Bank');
```

## Database Setup

Cypress tasks in `cypress/support/db.cjs` operate on the same database as the Rails dev server.
Always run Cypress using the dev-db scripts to keep them in sync:

- `npm run cypress:open:dev` — open Cypress UI
- `npm run cypress:run:dev` — run headless

If the test household doesn't exist yet, seed it first:
```
npm run cypress:seed-dev-db
```

The `db:reset` task deletes data **scoped to the Cypress test household only** — it will not
touch other households in the shared dev database.
