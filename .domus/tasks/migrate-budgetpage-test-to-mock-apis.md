# Task: Migrate BudgetPage test to mock APIs

**ID:** migrate-budgetpage-test-to-mock-apis
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

Migrate BudgetPage.spec.ts from mocking budgetStore to mocking budgetApi. Store used by multiple child components.

---

## Acceptance Criteria

- [ ] BudgetPage.spec.ts mocks budgetApi and allocationCategoryApi instead of budgetStore
- [ ] settingsStore uses real store with mocked settingsApi (not mocked store)
- [ ] Single Pinia instance shared between `setActivePinia` and `createWrapper()`
- [ ] All existing test assertions still pass
- [ ] No `vi.mock` on store files remains
- [ ] Test data uses `buildBudgetDetail()` / `buildSettings()` factories

---

## Implementation Notes

**File:** `src/app/budgets/BudgetPage.spec.ts`
**Effort:** Medium — budgetStore uses two APIs, plus settingsStore needs real treatment

**Transformation steps:**

1. **Remove** `vi.mock('./budgetStore')` and `vi.mock('../settings/settingsStore')` and their mock objects
2. **Add** `vi.mock('./budgetApi')` and `vi.mock('../allocation-categories/allocationCategoryApi')` and `vi.mock('../settings/settingsApi')`
3. **Import** the APIs and use `vi.mocked(...)` for test data
4. **Use factories** — `buildBudgetDetail()`, `buildAllocationCategory()`, `buildSettings()`
5. **Single Pinia instance** — see `docs/vue-coding-rules.md` "Testing: Single Pinia Instance"
6. **Keep mocking:** `useNotifications` (PrimeVue toast bridge), `vue-router`
7. **Use real `headingStore`** — pure Pinia store
8. **Use `flushPromises()`** after mount/actions instead of `nextTick()`
9. **Assert on rendered output** when possible

**API method mapping:**
- `budgetStore.fetch(id)` → `budgetApi.get(id)` + `allocationCategoryApi.getAll()` (Promise.all)
- `budgetStore.save()` → `budgetApi.save(budget)`
- `settingsStore` — mock `settingsApi.get()` to return `buildSettings()`, then the real store works

**Key detail:** `budgetStore.fetch()` calls both `budgetApi.get()` and `allocationCategoryApi.getAll()` in parallel. Both mocks must return valid data for the store to populate.

**Reference:** `LoginPage.spec.ts` follows this pattern. `docs/vue-coding-rules.md` has the conventions.
