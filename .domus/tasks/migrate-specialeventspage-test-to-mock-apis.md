# Task: Migrate SpecialEventsPage test to mock APIs

**ID:** migrate-specialeventspage-test-to-mock-apis
**Status:** done
**Branch:** task/migrate-specialeventspage-test-to-mock-apis
**Autonomous:** true
**Priority:** high
**Captured:** 2026-04-02
**Parent:** migrate-page-tests-to-mock-apis-not-stores
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Migrate SpecialEventsPage.spec.ts from mocking specialEventStore to mocking specialEventApi. Store has router integration and multiple CRUD actions.

---

## Acceptance Criteria

- [ ] SpecialEventsPage.spec.ts mocks specialEventApi instead of specialEventStore
- [ ] Single Pinia instance shared between `setActivePinia` and `createWrapper()`
- [ ] All existing test assertions still pass
- [ ] No `vi.mock` on store files remains
- [ ] Test data uses `buildSpecialEvent()` factory

---

## Implementation Notes

**File:** `src/app/special-events/SpecialEventsPage.spec.ts`
**Effort:** Medium — store has full CRUD (6 API methods) plus router integration

**Transformation steps:**

1. **Remove** `vi.mock('./specialEventStore')` and the mock store block
2. **Add** `vi.mock('./specialEventApi')` — mock: `getAll`, `getOne`, `create`, `update`, `delete`, `updateAllocations`
3. **Import** `specialEventApi` and use `vi.mocked(...)` for test data
4. **Use `buildSpecialEvent()` factory** from `src/test/factories/`
5. **Single Pinia instance** — see `docs/vue-coding-rules.md` "Testing: Single Pinia Instance"
6. **Keep mocking:** `useNotifications` (PrimeVue toast bridge), `vue-router`
7. **Use real `headingStore`** — pure Pinia store
8. **Use `flushPromises()`** after mount/actions instead of `nextTick()`
9. **Assert on rendered output** when possible

**API method mapping:**
- `store.fetchAll()` → `specialEventApi.getAll()`
- `store.create(data)` → `specialEventApi.create(data)` then `specialEventApi.getAll()`
- `store.update(id, data)` → `specialEventApi.update(id, data)` then `specialEventApi.getAll()`
- `store.remove(id)` → `specialEventApi.delete(id)` then `specialEventApi.getAll()`

Note: create, update, and remove all call `fetchAll()` after the main API call, so `getAll` mock must always return valid data.

**Reference:** `LoginPage.spec.ts` follows this pattern. `docs/vue-coding-rules.md` has the conventions.
