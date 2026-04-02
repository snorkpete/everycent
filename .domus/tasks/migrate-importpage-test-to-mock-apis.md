# Task: Migrate ImportPage test to mock APIs

**ID:** migrate-importpage-test-to-mock-apis
**Status:** proposed
**Autonomous:** false
**Priority:** high
**Captured:** 2026-04-02
**Parent:** migrate-page-tests-to-mock-apis-not-stores
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Migrate ImportPage.spec.ts from mocking importStore to mocking importApi. Complex multi-phase store (file select, preview, save).

---

## Acceptance Criteria

- [ ] ImportPage.spec.ts mocks importApi and budgetApi instead of importStore
- [ ] Real Pinia store is used via single shared Pinia instance
- [ ] budgetApi mocks set up for real store's initialization flow
- [ ] All existing test assertions still pass
- [ ] No `vi.mock` on store files remains

---

## Implementation Notes

**File:** `src/app/import/ImportPage.spec.ts`
**Effort:** High — multi-phase store (file select → preview → review → save), multiple APIs

**Transformation steps:**

1. **Remove** `vi.mock('./importStore')` and the mock store block
2. **Add** `vi.mock('./importApi')` — mock: `preview`, `save`
3. **Keep** `vi.mock('../budgets/budgetApi')` (already mocked at API level) — ensure `getCurrentBudgetId` returns a valid budget ID
4. **Import** the APIs and use `vi.mocked(...)` for test data
5. **Use factories** where applicable — `buildBudget()` for budget data
6. **Single Pinia instance** — see `docs/vue-coding-rules.md` "Testing: Single Pinia Instance"
7. **Keep mocking:** `useNotifications` (PrimeVue toast bridge), `vue-router`
8. **Use real `headingStore`** — pure Pinia store
9. **Use `flushPromises()`** after mount/actions instead of `nextTick()`
10. **Assert on rendered output** when possible

**API method mapping:**
- `importStore.preview(payload)` → `importApi.preview(payload)`
- `importStore.save(payload)` → `importApi.save(payload)`
- Budget initialization → `budgetApi.getCurrentBudgetId()` (already at API level in current spec)

**Key detail:** The import flow is multi-phase — file selection is client-side (CAMT parser), preview hits the API, review is client-side (user marks transactions), save hits the API. The store orchestrates these phases. With real stores, the tests exercise the state machine transitions for free.

**Reference:** `LoginPage.spec.ts` follows this pattern. `docs/vue-coding-rules.md` has the conventions.
