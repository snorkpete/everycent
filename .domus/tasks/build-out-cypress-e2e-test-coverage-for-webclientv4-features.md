# Task: Build out Cypress e2e test coverage for webclientv4 features

**ID:** build-out-cypress-e2e-test-coverage-for-webclientv4-features
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-04-14
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Parent workstream to systematically build out Cypress e2e test coverage for all existing features in the Vue app (webclientv4). The Vue migration is functionally complete and serves at `/`, but Cypress coverage is currently thin and ad-hoc — only a handful of flows are exercised end-to-end. The goal is comprehensive e2e coverage of every shipped feature area so regressions are caught before deploy.

This task is a workstream container, not a single unit of work. It will need to be broken into per-feature-area subtasks (one per major screen / domain). Suggested feature areas to cover, drawn from the Vue app structure:

- Authentication (sign-in, sign-out, token refresh)
- Budgets (current + future budget pages, allocations, copy/close/reopen)
- Allocation categories
- Transactions (list, search, add/edit/delete, mobile + desktop)
- Bank accounts (CRUD, opening/closing accounts, balances)
- Sink funds (sink fund list, allocations, mobile card layout)
- Special events (special event allocations editor)
- Institutions
- Reports (once reports migration completes)
- Settings (household, theme, account settings)
- Mobile-specific layouts (separate from desktop coverage where divergent)

Existing Cypress conventions and infrastructure live in `webclientv4/cypress/`. Before writing new tests, read `webclientv4/cypress/CLAUDE.md` for the established rules — notably:

- Do NOT use `.clear()` before `.type()` on PrimeVue Dialog inputs (use `.type('{selectall}value')` or just `.type()` on empty fields).
- Cypress shares the dev database. Always run via `npm run cypress:open:dev` / `npm run cypress:run:dev`.
- The `db:reset` task is scoped to the Cypress test household — safe to run.
- Seed the test household with `npm run cypress:seed-dev-db` if missing.

Also relevant: there's a separate open task `move-cypress-db-seeding-off-bcryptjs-and-pg` covering infrastructure cleanup of the seeding layer; this workstream should not be blocked on it but may benefit from coordinating.

---

## Acceptance Criteria

- [ ] Workstream broken into per-feature-area subtasks (one task per major feature)
- [ ] Every major feature area listed above has at least one Cypress e2e spec covering its happy-path user flows
- [ ] Critical edit/delete/destructive flows have e2e coverage in addition to read/create
- [ ] Mobile layouts have e2e coverage where the mobile codepath diverges materially from desktop
- [ ] All new specs follow the conventions in `webclientv4/cypress/CLAUDE.md`
- [ ] Specs run green via `npm run cypress:run:dev` against a freshly seeded test household

---

## Implementation Notes

- **Refinement needed before dispatch.** This is a raw parent task — it should not be dispatched as-is. The next step is a refinement session to enumerate the actual subtasks (one per feature area) and decide on ordering / priority.
- **Per-feature subtasks** should each be small enough to dispatch individually and scoped to a single feature directory under `webclientv4/src/app/<feature>/`.
- **Reference implementations**: read existing specs under `webclientv4/cypress/e2e/` to match the established style before writing new ones.
- **Don't gold-plate coverage**: prioritise the user-facing flows that would cause real damage if regressed (writes, deletes, money movement) over read-only browsing.
