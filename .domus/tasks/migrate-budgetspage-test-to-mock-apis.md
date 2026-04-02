# Task: Migrate BudgetsPage test to mock APIs

**ID:** migrate-budgetspage-test-to-mock-apis
**Status:** done
**Branch:** task/migrate-budgetspage-test-to-mock-apis
**Autonomous:** true
**Priority:** high
**Captured:** 2026-04-02
**Parent:** migrate-page-tests-to-mock-apis-not-stores
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Migrate BudgetsPage.spec.ts from mocking budgetListStore to mocking budgetApi. Multiple store actions (copy, close, reopen, add budget).

---

## Acceptance Criteria

- [x] BudgetsPage.spec.ts mocks budgetApi instead of budgetListStore
- [x] Single Pinia instance shared between `setActivePinia` and `createWrapper()`
- [x] All existing test assertions still pass
- [x] No `vi.mock` on store files remains
- [x] Test data uses `buildBudget()` factory

---

## Implementation Notes

**File:** `src/app/budgets/BudgetsPage.spec.ts`
**Effort:** Medium — store has 5 actions mapping to 5 API calls

**Transformation steps:**

1. **Remove** `vi.mock('./budgetListStore')` and the `mockStore = reactive({...})` block
2. **Add** `vi.mock('./budgetApi')` — mock: `getAll`, `copy`, `close`, `reopenLast`, `create`
3. **Import** `budgetApi` and use `vi.mocked(budgetApi.getAll).mockResolvedValue(...)` for test data
4. **Use `buildBudget()` factory** from `src/test/factories/` — replace inline budget objects
5. **Single Pinia instance** — see `docs/vue-coding-rules.md` "Testing: Single Pinia Instance"
6. **Keep mocking:** `useNotifications` (PrimeVue toast bridge), `useConfirm` (PrimeVue confirm bridge), `vue-router`
7. **Use real `headingStore`** — pure Pinia store, no external dependencies
8. **Use `flushPromises()`** after mount/actions instead of `nextTick()`
9. **Assert on rendered output** when possible

**API method mapping:**
- `store.fetchAll()` → `budgetApi.getAll()`
- `store.copyBudget(id)` → `budgetApi.copy(id)` then `budgetApi.getAll()`
- `store.closeBudget(id)` → `budgetApi.close(id)` then `budgetApi.getAll()`
- `store.reopenLastBudget()` → `budgetApi.reopenLast()` then `budgetApi.getAll()`
- `store.addBudget(date)` → `budgetApi.create({start_date})` then `budgetApi.getAll()`

Note: every store action calls `loadBudgets()` after the main API call, which calls `budgetApi.getAll()`. So `getAll` mock must always return valid data.

**Reference:** `LoginPage.spec.ts` follows this pattern. `docs/vue-coding-rules.md` has the conventions.
