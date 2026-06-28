# Task: Migrate all spec.ts files to use test factories

**ID:** migrate-all-spects-files-to-use-test-factories
**Status:** deferred
**Autonomous:** false
**Priority:** low
**Captured:** 2026-04-05
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Replace all inline test data object literals in webclientv4/**/*.spec.ts with builders from src/test/factories/. Gradual migration strategy agreed 2026-03-29: migrate-on-touch. This task tracks the completion criterion so the 'migrate on touch' rule in vue-testing-patterns.md can be retired once all specs are migrated. Done when no spec.ts file contains hand-built inline domain-type literals (BankAccount, Transaction, etc.) that a factory exists for.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

**Related follow-up (folded in from abandoned idea `extract-buildsettingsstore-and-similar-store-factories-for-test-setup`, 2026-06-21):** while/after migrating specs, check whether a **store-setup factory** (e.g. `buildSettingsStore`/`buildHeadingStore`) is now warranted. This is distinct from the data factories this task covers — it's about the test *setup* boilerplate (mock API + `flushPromises`).

Apply the rule of three: extract only if the same store-setup pattern appears 3+ times in a *consistent* form. As of 2026-06-21 it did **not** clearly meet that bar — settingsStore setup appeared ~3–4 times in 4 inconsistent styles (direct field assignment / `vi.mock` / API-mock+guard / not at all). Re-evaluate once specs are converted to a consistent boundary-mock pattern.

**Caveat (confirmed):** the router `beforeEach` guard already calls `settingsStore.fetchAll()` on navigation (`src/router/index.ts:181`), so router-navigated specs don't need inline settingsStore setup — only directly-mounted-component specs do. Factor that in before extracting.
