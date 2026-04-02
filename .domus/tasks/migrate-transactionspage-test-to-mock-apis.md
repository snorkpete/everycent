# Task: Migrate TransactionsPage test to mock APIs

**ID:** migrate-transactionspage-test-to-mock-apis
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

Migrate TransactionsPage.spec.ts from mocking transactionStore to mocking transactionApi. Complex store with metadata fetching and many user interactions.

---

## Acceptance Criteria

- [ ] TransactionsPage.spec.ts mocks transactionApi instead of transactionStore
- [ ] settingsStore uses real store with mocked settingsApi (not mocked store)
- [ ] Single Pinia instance shared between `setActivePinia` and `createWrapper()`
- [ ] All existing test assertions still pass
- [ ] No `vi.mock` on store files remains
- [ ] Test data uses `buildTransaction()` / `buildSettings()` / `buildBankAccount()` factories

---

## Implementation Notes

**File:** `src/app/transactions/TransactionsPage.spec.ts`
**Effort:** High — complex store with metadata fetching, search form integration, multiple user interactions

**Transformation steps:**

1. **Remove** `vi.mock('./transactionStore')` and `vi.mock('../settings/settingsStore')` and their mock objects
2. **Add** `vi.mock('./transactionApi')` and `vi.mock('../settings/settingsApi')`
3. **Import** the APIs and use `vi.mocked(...)` for test data
4. **Use factories** — `buildTransaction()`, `buildSettings()`, `buildBankAccount()`
5. **Single Pinia instance** — see `docs/vue-coding-rules.md` "Testing: Single Pinia Instance"
6. **Keep mocking:** `useNotifications` (PrimeVue toast bridge)
7. **Use real `headingStore`** — pure Pinia store
8. **Use `flushPromises()`** after mount/actions instead of `nextTick()`
9. **Assert on rendered output** when possible

**API method mapping:**
- `transactionStore.fetch(params)` → `transactionApi.getAll({budgetId, bankAccountId})`
- `transactionStore.save(payload)` → `transactionApi.save({bankAccountId, budgetId, transactions})`
- `transactionStore.getSinkFundAllocations(bankAccountId)` → `transactionApi.getSinkFundAllocations(bankAccountId)`
- `settingsStore` — mock `settingsApi.get()` to return `buildSettings()`

**Key detail:** TransactionsPage likely has search form + bank account selector driving the store fetch. Ensure the mock API returns data consistent with the search params used in each test scenario.

**Reference:** `LoginPage.spec.ts` follows this pattern. `docs/vue-coding-rules.md` has the conventions.
