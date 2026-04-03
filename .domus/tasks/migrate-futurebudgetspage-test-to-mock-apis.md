# Task: Migrate FutureBudgetsPage test to mock APIs

**ID:** migrate-futurebudgetspage-test-to-mock-apis
**Status:** done
**Branch:** task/migrate-futurebudgetspage-test-to-mock-apis
**Autonomous:** true
**Priority:** high
**Captured:** 2026-04-02
**Parent:** migrate-page-tests-to-mock-apis-not-stores
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Migrate FutureBudgetsPage.spec.ts from mocking futureBudgetsStore to mocking futureBudgetsApi. Complex store with computed display data.

---

## Acceptance Criteria

- [ ] FutureBudgetsPage.spec.ts mocks futureBudgetsApi instead of futureBudgetsStore
- [ ] Single Pinia instance shared between `setActivePinia` and `createWrapper()`
- [ ] All existing test assertions still pass
- [ ] No `vi.mock` on store files remains
- [ ] Test data uses `buildFutureBudget()` / `buildFutureAllocation()` / `buildFutureIncome()` factories

---

## Implementation Notes

**File:** `src/app/budgets/future-budgets/FutureBudgetsPage.spec.ts`
**Effort:** Medium — store has complex computed display data (pivot tables for incomes/allocations across budgets)

**Baseline note:** Audit-quick-fixes already partially migrated this file — settings are now accessed via real `useSettingsStore()` (not mocked store), and `createWrapper` uses `getActivePinia()!`. The remaining work is migrating the main `futureBudgetsStore` mock to mock `futureBudgetsApi` instead.

**Transformation steps:**

1. **Remove** `vi.mock('./futureBudgetsStore')` and the mock store block
2. **Add** `vi.mock('./futureBudgetsApi')` — mock: `getFutureBudgets`, `getAllocationCategories`, `getSettings`, `massUpdate`
3. **Import** `futureBudgetsApi` and use `vi.mocked(...)` for test data
4. **Use factories** — `buildFutureBudget()`, `buildFutureAllocation()`, `buildFutureIncome()`, `buildAllocationCategory()`, `buildSettings()`
5. **Single Pinia instance** — use `let pinia` pattern (replace existing `getActivePinia()!` with shared `pinia` variable). See `docs/vue-coding-rules.md` "Testing: Single Pinia Instance"
6. **Keep mocking:** `useNotifications` (PrimeVue toast bridge)
7. **Use real `headingStore`** — pure Pinia store
8. **Settings already use real `useSettingsStore()`** — mock `settingsApi` or `futureBudgetsApi.getSettings()` (the store fetches its own settings via `futureBudgetsApi.getSettings()`, not via settingsStore)
9. **Use `flushPromises()`** after mount/actions instead of `nextTick()`
10. **Assert on rendered output** when possible

**API method mapping:**
- `store.fetchAll()` → `Promise.all([futureBudgetsApi.getFutureBudgets(), futureBudgetsApi.getAllocationCategories(), futureBudgetsApi.getSettings()])`
- `store.massUpdate(payload)` → `futureBudgetsApi.massUpdate(payload)` then re-calls all 3 APIs

**Key detail:** `fetchAll` makes 3 parallel API calls. All 3 mocks must return valid data. The store's `incomeDisplayData` and `allocationDisplayData` computeds build pivot tables — build test budgets with specific income/allocation names and category IDs to exercise this.

**Reference:** `LoginPage.spec.ts` follows this pattern. `docs/vue-coding-rules.md` has the conventions.
