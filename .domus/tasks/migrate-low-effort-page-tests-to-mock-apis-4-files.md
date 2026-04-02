# Task: Migrate low-effort page tests to mock APIs (4 files)

**ID:** migrate-low-effort-page-tests-to-mock-apis-4-files
**Status:** done
**Branch:** task/migrate-low-effort-page-tests-to-mock-apis-4-files
**Autonomous:** true
**Priority:** high
**Captured:** 2026-04-02
**Parent:** migrate-page-tests-to-mock-apis-not-stores
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Migrate AllocationCategoriesPage, InstitutionsPage, BankAccountsPage, SettingsPage specs from mocking stores to mocking APIs. Simple stores, few API calls. Use real Pinia stores, mock at API boundary.

---

## Acceptance Criteria

- [x] AllocationCategoriesPage.spec.ts mocks API, uses real Pinia store
- [x] InstitutionsPage.spec.ts mocks API, uses real Pinia store
- [x] BankAccountsPage.spec.ts mocks API, uses real Pinia store
- [x] SettingsPage.spec.ts mocks API, uses real Pinia store
- [x] All existing test assertions still pass
- [x] No `vi.mock('./someStore')` remains in any of the 4 files

---

## Implementation Notes

**Files:** AllocationCategoriesPage.spec.ts, InstitutionsPage.spec.ts, BankAccountsPage.spec.ts, SettingsPage.spec.ts
**Effort:** Low — each has a simple store with 1-2 API calls

**For each spec file, apply this transformation:**

1. **Remove** `vi.mock('./<feature>Store')` and the `mockStore = reactive({...})` block
2. **Add** `vi.mock('./<feature>Api')` — mock each API method with `vi.fn()` (e.g. `getAll: vi.fn()`, `create: vi.fn()`, `update: vi.fn()`)
3. **Import** the real API module and use `vi.mocked(api.getAll).mockResolvedValue(...)` to set up responses
4. **Use test factories** from `src/test/factories/` for test data (e.g. `buildInstitution()`, `buildBankAccount()`, `buildSettings()`) — replace inline test data objects
5. **Single Pinia instance** — create one `pinia` in `beforeEach`, pass it to both `setActivePinia(pinia)` and `plugins: [pinia]` in `createWrapper()`. Never call `createPinia()` twice. See `docs/vue-coding-rules.md` "Testing: Single Pinia Instance".
6. **Keep mocking `useNotifications`** — it bridges PrimeVue's toast service which needs a provider not available in tests. This is an external-service bridge, not a store.
7. **Use real `headingStore`** — it's a pure Pinia store with no external dependencies. Do not mock it.
8. **Use `flushPromises()`** after mount/actions instead of `nextTick()` — API mocks are async
9. **Assert on rendered output** when possible. Fall back to asserting on input params only when rendered output isn't practical (should be rare).

**Files and their API layers:**
- `AllocationCategoriesPage.spec.ts` → mock `allocationCategoryApi` (getAll, create, update)
- `InstitutionsPage.spec.ts` → mock `institutionApi` (getAll, create, update)
- `BankAccountsPage.spec.ts` → mock `bankAccountApi` (getAll, create, update)
- `SettingsPage.spec.ts` → mock `settingsApi` (get, update)

**Reference:** `LoginPage.spec.ts` already follows this pattern (mocks `authApi`, uses real `authStore`, single Pinia instance).
