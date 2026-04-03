# Task: Migrate SinkFundsPage test to mock APIs

**ID:** migrate-sinkfundspage-test-to-mock-apis
**Status:** done
**Branch:** task/migrate-sinkfundspage-test-to-mock-apis
**Autonomous:** true
**Priority:** high
**Captured:** 2026-04-02
**Parent:** migrate-page-tests-to-mock-apis-not-stores
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Migrate SinkFundsPage.spec.ts from mocking sinkFundStore to mocking sinkFundApi. Store has detail fetch and edit mode.

---

## Acceptance Criteria

- [ ] SinkFundsPage.spec.ts mocks sinkFundApi instead of sinkFundStore
- [ ] Single Pinia instance shared between `setActivePinia` and `createWrapper()`
- [ ] All existing test assertions still pass
- [ ] No `vi.mock` on store files remains
- [ ] Test data uses `buildSinkFund()` / `buildSinkFundAllocation()` factories

---

## Implementation Notes

**File:** `src/app/sink-funds/SinkFundsPage.spec.ts`
**Effort:** Medium — store has list + detail fetching, edit mode, and computed balance properties

**Transformation steps:**

1. **Remove** `vi.mock('./sinkFundStore')` and the `mockStore = reactive({...})` block
2. **Add** `vi.mock('./sinkFundApi')` — mock: `getAll`, `get`, `save`, `transfer`, `getTransactionsForAllocation`
3. **Import** `sinkFundApi` and use `vi.mocked(...)` for test data
4. **Use factories** from `src/test/factories/` — `buildSinkFund()`, `buildSinkFundAllocation()`
5. **Single Pinia instance** — see `docs/vue-coding-rules.md` "Testing: Single Pinia Instance"
6. **Keep mocking:** `useNotifications` (PrimeVue toast bridge), `vue-router`
7. **Use real `headingStore`** — pure Pinia store
8. **Use `flushPromises()`** after mount/actions instead of `nextTick()`
9. **Assert on rendered output** when possible

**API method mapping:**
- `store.fetchAll()` → `sinkFundApi.getAll()`
- `store.fetchDetail(id)` → `sinkFundApi.get(id)`
- `store.save()` → `sinkFundApi.save(sinkFund)` (sets `isEditMode = false` on success)
- `store.cancelEdit()` → re-calls `sinkFundApi.get(id)` to reload
- `store.addObligation()` → pure client-side (pushes empty allocation to array, no API call)

**Key detail:** Store has computed properties (`visibleAllocations`, `totalAssignedBalance`, `unassignedBalance`, `totalTarget`, `totalOutstanding`) all derived from `sinkFund.sink_fund_allocations`. Build allocations with specific `status`, `current_balance`, and `target` to exercise these.

**Reference:** `LoginPage.spec.ts` follows this pattern. `docs/vue-coding-rules.md` has the conventions.
