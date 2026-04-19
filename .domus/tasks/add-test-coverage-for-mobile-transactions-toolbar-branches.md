# Task: Add test coverage for mobile transactions toolbar branches

**ID:** add-test-coverage-for-mobile-transactions-toolbar-branches
**Status:** ready
**Autonomous:** false
**Priority:** high
**Captured:** 2026-04-04
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

TransactionsPage.spec.ts: isMobile defaults to false in test env (matchMedia mock). All new mobile paths are uncovered: initMobileSearch URL/defaults, emitMobileFetch, import popup menu, mobile add button. Add at least happy-path tests with isMobile=true.

---

## Acceptance Criteria

In a new `describe('mobile mode', ...)` block in `TransactionsPage.spec.ts`:

- [ ] Mobile toolbar renders when isMobile is true — TransactionsToolbarMobile present, desktop TransactionSearchForm absent
- [ ] Mobile list + summary render — TransactionListMobile and TransactionSummaryMobile present, desktop versions absent
- [ ] `initMobileSearch` defaults: no URL query → picks first account + first budget, calls router.replace + store.fetch
- [ ] `initMobileSearch` URL params: route.query with budget_id and bank_account_id → those values win over defaults
- [ ] `onMobileBankAccountChange`: toolbar emits update → state updated, router.replace + store.fetch called with new id
- [ ] `onMobileBudgetChange`: same shape for budget id
- [ ] `fetchMobileTransactions` guard: when either selection is null, router.replace and store.fetch are NOT called

### Non-goals

- Not testing TransactionsToolbarMobile internals (import menu, add button) — belongs to its own spec
- Not touching the matchMedia global mock in src/test/setup.ts
- Not adding isMobile=false regression tests — existing tests already cover desktop

---

## Implementation Notes

- Mock `useResponsive` to return `isMobile: ref(true)` for the mobile describe block
- vue-router mock needs to be factored so `route.query` can vary per test (currently hardcoded to `{}`)
- Add stubs for TransactionsToolbarMobile, TransactionListMobile, TransactionSummaryMobile (same pattern as existing stubs)
- To test initMobileSearch defaults path: set up API mocks, mount, flush, assert router.replace + store.fetch called with first account/budget ids
- To test URL params path: set route.query before mount, flush, assert the query values are used instead of defaults
- Single commit scope
