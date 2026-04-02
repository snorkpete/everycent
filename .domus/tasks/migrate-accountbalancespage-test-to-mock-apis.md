# Task: Migrate AccountBalancesPage test to mock APIs

**ID:** migrate-accountbalancespage-test-to-mock-apis
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

Migrate AccountBalancesPage.spec.ts from mocking accountBalanceStore to mocking accountBalanceApi. Store has many computed properties.

---

## Acceptance Criteria

- [ ] AccountBalancesPage.spec.ts mocks accountBalanceApi instead of accountBalanceStore
- [ ] Single Pinia instance shared between `setActivePinia` and `createWrapper()`
- [ ] All existing test assertions still pass
- [ ] No `vi.mock` on store files remains
- [ ] Test data uses `buildAccountBalance()` factory

---

## Implementation Notes

**File:** `src/app/account-balances/AccountBalancesPage.spec.ts`
**Effort:** Medium — store has many computed properties but they all derive from `accounts` array

**Transformation steps:**

1. **Remove** `vi.mock('./accountBalanceStore')` and the `mockStore = reactive({...})` block
2. **Add** `vi.mock('./accountBalanceApi')` — mock: `getAll`, `adjustBalances`
3. **Import** `accountBalanceApi` and use `vi.mocked(accountBalanceApi.getAll).mockResolvedValue(...)` for test data
4. **Use `buildAccountBalance()` factory** from `src/test/factories/` — build accounts with specific `account_category` and `is_cash` values to exercise the store's computed category filters
5. **Single Pinia instance** — see `docs/vue-coding-rules.md` "Testing: Single Pinia Instance"
6. **Keep mocking** `useNotifications` (PrimeVue toast bridge)
7. **Use real `headingStore`** — pure Pinia store
8. **Use `flushPromises()`** after mount/actions instead of `nextTick()`
9. **Assert on rendered output** when possible

**API method mapping:**
- `store.fetch()` → `accountBalanceApi.getAll(includeClosed)`
- `store.adjustBalances(adjustments)` → `accountBalanceApi.adjustBalances(changed)` then `accountBalanceApi.getAll()`

**Key detail:** The store has 11 computed properties (currentAccounts, cashAssetAccounts, netWorth, etc.) all derived from the `accounts` ref. With real stores, these get exercised for free — build test accounts with the right `account_category` and `is_cash` combinations.

**Reference:** `LoginPage.spec.ts` follows this pattern. `docs/vue-coding-rules.md` has the conventions.
