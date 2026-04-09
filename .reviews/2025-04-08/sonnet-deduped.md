# Deduplicated Codebase Health Review (Sonnet)

Consolidated from four Sonnet lens reports: duplication, consistency, api-surface, dependency-health.
Where a finding was surfaced by multiple lenses, the originating reports are noted.

## Disposition Key

- **fix** — create a task, do the work
- **won't-fix** — not worth fixing, suppress in future runs
- **defer** — real issue but not now, needs investigation
- **absorb** — fold into another finding/task
- **drive-by** — fix opportunistically when touching related code

---

## 1. Store Action Patterns

### 1.1 Async Loading/Error Boilerplate
- **Sources**: S-DUP #1, S-CON #1, S-CON #12, S-API #14
- **Severity**: High
- **Priority**: High
- **Disposition**: fix
- **Description**: Every async store action repeats the same 7-line `loading=true; error=null; try/catch/finally` pattern (34 instances across 12 stores). Only `budgetListStore` extracts the error message coercion into a helper. Additionally, error re-throwing is inconsistent: 7 fetch actions silently swallow errors while others re-throw, violating the documented convention that store actions must re-throw.
- **Comment**: Per-store loading/error boilerplate is redundant — `loadingIndicatorStore` already tracks global loading via interceptor. Rip out per-store `loading` refs and try/catch/error machinery. Handle errors at call site or via API gateway error interceptor. 3 template-display cases (AccountBalancesPage, ImportPage, LoginPage) need individual assessment. Also absorbs 2.11 (inconsistent loading on refresh buttons) and 4.1 (settingsApi.save() shape bug — resolves naturally when stores stop assigning API responses to state).

### 1.2 Edit Mode Toggle Duplication
- **Sources**: S-DUP #10
- **Severity**: Low
- **Priority**: Low
- **Disposition**: won't-fix
- **Description**: `budgetStore`, `transactionStore`, and `sinkFundStore` define identical `enterEditMode()` / `exitEditMode()` / `cancelEdit()` functions.
- **Comment**: Trivial one-liner functions — composable adds indirection for ~6 lines saved per store. Will resurface if pattern grows.

### 1.3 Inconsistent CRUD Action Naming
- **Sources**: S-CON #2
- **Severity**: Low
- **Priority**: Low
- **Disposition**: fix
- **Description**: `specialEventStore` uses separate `create`, `update`, `remove` methods; all other stores use a unified `save` that branches on `id`.
- **Comment**: Align `specialEventStore` to unified `save` pattern. Drive-by when touching this store. Bundle with 2.6 (emit naming) and 2.7 (redundant fetch).

### 1.4 Inconsistent Fetch Method Naming
- **Sources**: S-CON #14
- **Severity**: Low
- **Priority**: Low
- **Disposition**: won't-fix
- **Description**: No consistent convention: `fetch()`, `fetchAll()`, `fetchDetail()`, `fetchOne()` used interchangeably across stores.
- **Comment**: Names are descriptive of what they do — forcing a convention adds rename churn for no functional benefit.

### 1.5 Duplicated `fetchMetadata()` in transactionStore / importStore
- **Sources**: S-DUP #6
- **Severity**: Medium
- **Priority**: Medium
- **Disposition**: fix
- **Description**: Both stores contain identical `fetchMetadata()`: same `Promise.all`, same state tracking, same fallback message. Both use `useCurrentAndPastBudgets()` and track `bankAccounts / selectedBudget / currentAndPastBudgets`.
- **Comment**: Extract transaction search context (budgets list, open bank accounts, selected budget) into a composable or store. This is a missing domain concept — transactionStore and importStore both reinvent it because it doesn't exist yet.

### 1.6 Duplicated Budget Summary Computations
- **Sources**: S-DUP #8
- **Severity**: Medium
- **Priority**: Low
- **Disposition**: fix
- **Description**: `BudgetSummary.vue` and `BudgetSummaryStrip.vue` independently compute `totalIncome`, `totalAllocations`, `totalDiscretionaryAmount` from the same store data. One includes deleted allocations, the other doesn't.
- **Comment**: Extract `useBudgetTotals` composable. Investigate whether deleted allocations inclusion/exclusion is intentional in each component — may be a latent bug. If both modes are needed, use options object (`{ includeDeleted: true }`) not a positional boolean.

---

## 2. UI Component Duplication

### 2.1 Identical CRUD Pages (AllocationCategories / Institutions)
- **Sources**: S-DUP #2, S-DUP #13
- **Severity**: Medium
- **Priority**: Medium
- **Disposition**: won't-fix
- **Description**: `AllocationCategoriesPage.vue` and `InstitutionsPage.vue` are structurally identical: `EcPageLayout > EcItemList`, same dialog state pattern, same CSS for clickable name links. The CSS pattern also appears in `BudgetsPage`, `SpecialEventsPage`, and `BankAccountsPage`.
- **Comment**: Two simple, stable pages. Generic list page is premature abstraction — the moment one entity needs a second field, the abstraction becomes a liability. CSS duplication covered by 3.3.

### 2.2 Identical Edit Dialogs (AllocationCategory / Institution)
- **Sources**: S-DUP #3
- **Severity**: Medium
- **Priority**: Medium
- **Disposition**: absorb → 2.3
- **Description**: `AllocationCategoryEditDialog.vue` and `InstitutionEditDialog.vue` are byte-for-byte identical in structure. Single `EcTextField` for `name`, same form lifecycle. Only prop type and header differ.
- **Comment**: The real issue is EcFormDialog's verbose API, not the dialog duplication. Address when tackling 2.3.

### 2.3 Form Reset Boilerplate / EcFormDialog API
- **Sources**: S-DUP #9
- **Severity**: Medium
- **Priority**: Medium
- **Disposition**: fix
- **Description**: Four+ dialog/form components implement identical form reset: `toFormData()` helper + `reactive()` + `watch(visible)` + `Object.assign`. Appears in AllocationCategoryEditDialog, InstitutionEditDialog, BankAccountEditDialog, SpecialEventForm.
- **Comment**: Reduce EcFormDialog boilerplate. Dialog should own visibility and form data lifecycle (reset-on-open, reactive state). Current API forces every consumer to reimplement watch/Object.assign/reactive/dialogVisible scaffolding. Absorbs 2.2 (identical edit dialogs), 2.4 (allocation transactions dialog state), and 2.10 (inconsistent visible-state binding).

### 2.4 Allocation Transactions Dialog State
- **Sources**: S-DUP #11
- **Severity**: Low
- **Priority**: Low
- **Disposition**: absorb → 2.3
- **Description**: The `(dialogVisible, selectedAllocationId, selectedAllocationName)` trio plus open-dialog trigger is copy-pasted across `BudgetAllocationList`, `SinkFundAllocationTable`, `SinkFundAllocationListMobile`.
- **Comment**: Resolves naturally when dialogs own their own visibility (2.3).

### 2.5 Duplicated `outstanding()` in Sink Fund Components
- **Sources**: S-DUP #12
- **Severity**: Low
- **Priority**: Low
- **Disposition**: fix (drive-by)
- **Description**: `SinkFundAllocationTable` and `SinkFundAllocationListMobile` define identical `outstanding(allocation)` function.
- **Comment**: Move to `sinkFund.utils.ts`.

### 2.6 `SpecialEventForm` Emits `submit` Instead of `save`
- **Sources**: S-CON #3
- **Severity**: Low
- **Priority**: Low
- **Disposition**: fix (bundle with 1.3)
- **Description**: Every other form/dialog emits `save`; `SpecialEventForm` is the only one emitting `submit`.
- **Comment**: Rename emit from `submit` to `save`. Bundle with 1.3 (specialEventStore alignment).

### 2.7 `SpecialEventDetailPage` Redundant Fetch After Update
- **Sources**: S-CON #10
- **Severity**: Low
- **Priority**: Low
- **Disposition**: fix (bundle with 1.3/2.6)
- **Description**: `onSubmit` calls `store.update()` (which already calls `fetchAll()` internally) then separately calls `store.fetchOne()`. Other pages rely solely on the store action to refresh.
- **Comment**: Remove redundant `fetchOne()` call. Bundle with 1.3/2.6 since we're in the same files.

### 2.8 `SettingsPage` Reimplements Edit/Save/Cancel Inline
- **Sources**: S-CON #13
- **Severity**: Low
- **Priority**: Low
- **Disposition**: won't-fix
- **Description**: `SettingsPage` manages edit-mode state and form layout directly in the page component instead of using `EcFormDialog` like all other editable forms.
- **Comment**: Settings is intentionally a full-page form, not a dialog — different UX pattern, not an inconsistency. Page-level edit/save/cancel is appropriate here.

### 2.9 `FutureBudgetsPage` Bypasses `EcPageLayout` Toolbar Slots
- **Sources**: S-CON #8
- **Severity**: Low
- **Priority**: Low
- **Disposition**: defer
- **Description**: Uses custom `<div class="page-header">` and `<tr class="toolbar-row">` instead of `EcPageLayout` `#toolbar` slots. Only page that bypasses the shared toolbar system.
- **Comment**: Needs investigation. If toolbar controls are inside thead because they need to scroll/pin with the table, won't-fix (layout-driven decision). If they're just in the wrong place due to the page being built before EcPageLayout had toolbar slots, fix.

### 2.10 Inconsistent Dialog Visible-State Binding
- **Sources**: S-CON #9
- **Severity**: Low
- **Priority**: Low
- **Disposition**: absorb → 2.3
- **Description**: Some dialogs use `v-model:visible`, others manually split `:visible` + `@update:visible`. No consistent pattern.
- **Comment**: Disappears when dialogs own their own visibility (2.3).

### 2.11 Inconsistent Loading State on Refresh Buttons
- **Sources**: S-CON #16
- **Severity**: Low
- **Priority**: Low
- **Disposition**: absorb → 1.1
- **Description**: Some pages bind `:loading="store.loading"` on Refresh buttons (showing spinner); others don't.
- **Comment**: Moot once per-store loading refs are removed (1.1). All buttons use global loading or none.

---

## 3. CSS Duplication

### 3.1 `:deep(.icon-btn--active)` Copy-Pasted in 4 Components
- **Sources**: S-DUP #7
- **Severity**: Low
- **Priority**: Medium
- **Disposition**: fix
- **Description**: Identical scoped CSS in `AccountBalancesPage`, `SinkFundsPage`, `SinkFundsToolbarMobile`, `TransactionsPage`.
- **Comment**: Extract `EcToggleButton` component. The `:deep` hack is the signal — PrimeVue Button shouldn't need external style overrides for a toggle state.

### 3.2 `.content-card` CSS Duplicated in 5 Pages
- **Sources**: S-DUP #14
- **Severity**: Low
- **Priority**: Medium
- **Disposition**: fix
- **Description**: Nearly identical border/radius/background rules in `AccountBalancesPage`, `BudgetPage`, `SinkFundsPage`, `TransactionsPage`, `BudgetsPage`.
- **Comment**: Extract `EcCard` component. Consistent visual container — component not CSS class, so the contract (border, radius, background, spacing) is owned in one place.

### 3.3 Clickable Entity Name Link CSS
- **Sources**: S-DUP #13
- **Severity**: Low
- **Priority**: Low
- **Disposition**: fix
- **Description**: 7-line CSS block for "clickable name link" duplicated across `AllocationCategoriesPage`, `InstitutionsPage`, `BudgetsPage`, `SpecialEventsPage`, `BankAccountsPage`.
- **Comment**: Global CSS utility class for clickable entity name links. Pure styling, no behavior.

---

## 4. Type System & API Surface

### 4.1 `settingsApi.save()` Returns Wrong Shape (Runtime Bug)
- **Sources**: S-API #1
- **Severity**: High
- **Priority**: High
- **Disposition**: absorb → 1.1
- **Description**: Backend `POST /settings` returns `{ success: true }`, but `settingsApi.save()` is typed as `Promise<SettingsData>`. The store assigns this to `settings.value`, so any component reading settings after a save gets `{ success: true }` instead of settings data.
- **Comment**: Bug resolves naturally when store stops assigning API response to state (1.1). Ensure save actions re-fetch rather than assign. Fix the return type on `settingsApi.save()` as a drive-by. Downgraded from Critical — corruption self-heals on navigation since fetchAll runs on mount.

### 4.2 `TransactionData` Missing `paid` Field
- **Sources**: S-API #2
- **Severity**: Medium
- **Priority**: Medium
- **Disposition**: fix
- **Description**: Backend serializer returns a `paid` boolean, but `TransactionData` has no `paid` property. Silent data loss.
- **Comment**: Add `paid: boolean` to `TransactionData`. Field is actively used for walker transactions. Check for untyped access patterns.

### 4.3 `AllocationCategoryData` Missing `percentage` Field
- **Sources**: S-API #3
- **Severity**: Low
- **Priority**: Low
- **Disposition**: fix (drive-by)
- **Description**: Backend returns `percentage` but frontend type only has `id` and `name`. Not currently used in UI.
- **Comment**: Add `percentage` to `AllocationCategoryData` to match backend serializer.

### 4.4 Budget API Actions Typed as `void`
- **Sources**: S-API #4
- **Severity**: Low
- **Priority**: Low
- **Disposition**: fix (drive-by)
- **Description**: `budgetApi.copy()`, `close()`, `reopenLast()` return `Promise<void>` but backend returns full budget objects.
- **Comment**: Type return values correctly to match backend responses.

### 4.5 `AllocationData` Conflates Two Serializer Shapes
- **Sources**: S-API #5
- **Severity**: Medium
- **Priority**: Low
- **Disposition**: fix (documentation only)
- **Description**: Single `AllocationData` type covers both `AllocationSerializer` and `SpecialEventAllocationSerializer`, which return different fields (`budget_name`, `allocation_category_name` only from the latter).
- **Comment**: Add a comment to `AllocationData` documenting which fields are only returned by `SpecialEventAllocationSerializer`. Type shape is correct as-is.

### 4.6 `FutureAllocationData` Asymmetry
- **Sources**: S-API #6
- **Severity**: Low
- **Priority**: Low
- **Disposition**: fix (documentation only)
- **Description**: `FutureAllocationSerializer` omits `spent` and `allocation_class` that `AllocationSerializer` includes. Undocumented asymmetry.
- **Comment**: Add comment to `FutureAllocationData` noting which fields are intentionally omitted vs `AllocationData` and why.

### 4.7 `SinkFundAllocationData` Defined in Two Places
- **Sources**: S-DUP #5, S-CON #5
- **Severity**: Medium
- **Priority**: Medium
- **Disposition**: fix (drive-by)
- **Description**: Identically defined in `sinkFund.types.ts` and `transaction.types.ts` with no cross-import. Any field change must be applied in two places.
- **Comment**: Single definition in `sinkFund.types.ts`, cross-import from `transaction.types.ts`.

### 4.8 Inconsistent Field Optionality Across Types
- **Sources**: S-CON #6
- **Severity**: Medium
- **Priority**: Medium
- **Disposition**: fix
- **Description**: `AccountBalanceData` has all required fields; `BankAccountData`/`SinkFundData` mostly optional; `AllocationCategoryData`/`InstitutionData` all optional including `id`. Different safety levels.
- **Comment**: Establish convention: fields guaranteed by backend (PKs, validated fields, computed fields, fields with defaults) are required in types. Only mark optional what's genuinely nullable. Apply incrementally as types are touched. `BankAccountData` needs a split into two types matching the two serializers. Scope risk — may expand; manage during task creation.

### 4.9 `ComputedRef` vs `Ref` Parameter Types in Composables
- **Sources**: S-CON #15
- **Severity**: Low
- **Priority**: Low
- **Disposition**: won't-fix
- **Description**: `useAllocationGrouping` requires `ComputedRef<T>` while `useWantsNeedsBudgetBreakdown` accepts `Ref<T>`. Asymmetric API.
- **Comment**: No real-world impact — `ComputedRef` extends `Ref`.

---

## 5. Architecture & Layer Violations

### 5.1 Components Calling APIs Directly (Bypassing Stores)
- **Sources**: S-CON #11, S-API #7, S-API #8, S-API #9, S-API #10, S-API #11
- **Severity**: High
- **Priority**: Medium
- **Disposition**: split — mostly won't-fix, one fix
- **Description**: Multiple components bypass Pinia stores: `HomePage` calls `homeApi` directly; `AccountTransferDialog` calls `bankAccountApi` + `transactionApi` + `bankAccountApi.transfer()`; `SinkFundTransferDialog` calls `sinkFundApi.transfer()`; `ImportPage` calls `budgetApi.getCurrentBudgetId()`; `SpecialEventAllocationsEditor` calls multiple APIs; `SinkFundAllocationTable`/`SinkFundAllocationListMobile` pass API functions as props. No centralized error handling or loading state for these calls.
- **Comment**: Won't-fix for HomePage, transfer dialogs, ImportPage `getCurrentBudgetId`, and API-as-prop pattern — these are intentional exceptions to the store-layer rule (leaf pages, fire-and-forget modals, single calls). Fix `SpecialEventAllocationsEditor` — multiple direct API calls with no error handling is a real gap, not a justified exception.

### 5.2 Duplicated API Endpoint Ownership
- **Sources**: S-DUP #15, S-API #12, S-API #13
- **Severity**: Medium
- **Priority**: High
- **Disposition**: fix
- **Description**: Two endpoints have duplicate callers: `/institutions` is called by both `bankAccountApi.getInstitutions()` and `institutionApi.getAll()`; `/allocation_categories` is called by `futureBudgetsApi.getAllocationCategories()`, `allocationCategoryApi.getAll()`, and `budgetStore` independently. No canonical owner.
- **Comment**: High priority. Duplicate API endpoint callers break dead code detection, which depends on 1:1 mapping between API modules and Rails controllers. Single canonical owner per endpoint; other modules import from the owner. `/institutions` → `institutionApi` only. `/allocation_categories` → `allocationCategoryApi` only.

### 5.3 `authApi` Returns Raw AxiosResponse
- **Sources**: S-CON #4, S-API #15
- **Severity**: Medium
- **Priority**: Medium
- **Disposition**: fix (drive-by)
- **Description**: `authApi` is the only API module that doesn't unwrap `.then(r => r.data)`. Forces `authStore` to navigate `response.data.success` and use `axios.isAxiosError()` unlike any other store.
- **Comment**: Add `.then(r => r.data)` unwrapping to `authApi`, align `authStore` to match.

---

## 6. Backend Inconsistencies

### 6.1 Inconsistent Mutation Response Patterns
- **Sources**: S-API #16
- **Severity**: Medium
- **Priority**: Low
- **Disposition**: won't-fix
- **Description**: Three different patterns: (1) `respond_with(object, Serializer)` returns full resource, (2) `render json: { success: true/false }` returns flag only, (3) `render json: result` returns arbitrary hash. Error response shapes also vary.
- **Comment**: Not all actions are RESTful resources — operations like mass update, transfer, balance adjustment legitimately return different shapes. The inconsistency reflects different action types, not sloppy code.

### 6.2 `TransactionWithoutBankAccountSerializer` Wrong `type`
- **Sources**: S-CON #17
- **Severity**: Low
- **Priority**: Low
- **Disposition**: fix
- **Description**: Declares `type 'bank_account'` instead of `'transaction'` — copy-paste error. Possibly unused.
- **Comment**: Verify if serializer is referenced. If unused, delete. If used, fix the type declaration.

### 6.3 `accountBalanceApi` URL Namespace Mismatch
- **Sources**: S-CON #18
- **Severity**: Low
- **Priority**: Low
- **Disposition**: won't-fix
- **Description**: Posts to `/bank_accounts/manually_adjust_balances` from the `accountBalance` feature module. Conceptual mismatch but functionally correct.
- **Comment**: Frontend and backend organise by different concerns (feature vs resource). Both correct in their own context.

---

## 7. Naming & Conventions

### 7.1 File Naming Split (kebab-case vs camelCase)
- **Sources**: S-CON #7
- **Severity**: Low
- **Priority**: Low
- **Disposition**: fix (drive-by)
- **Description**: `shared/util/` files use kebab-case; all other utility files use camelCase. No consistent rule.
- **Comment**: Rename `shared/util/` files from kebab-case to camelCase to match codebase convention.

---

## 8. Importers

### 8.1 Identical Utility Functions in ABN AMRO Importers
- **Sources**: S-DUP #4
- **Severity**: Low
- **Priority**: Low
- **Disposition**: fix
- **Description**: Three importer files define identical `parseLocalDate()`, `formatDate()`, and near-identical `MONTH_MAP` constants.
- **Comment**: Extract shared functions to `importers/importerUtils.ts`.

---

## 9. Dependency Health

### 9.1 `bcryptjs` / `pg` in Frontend Dependencies
- **Sources**: S-DEP #1, S-DEP #2
- **Severity**: High
- **Priority**: Medium
- **Disposition**: defer
- **Description**: PostgreSQL client and bcrypt library exist in the Vue app's devDependencies solely for Cypress seed scripts. DB operations don't belong in a frontend project.
- **Comment**: Investigate whether Cypress DB seeding can move to Rails rake tasks. If not, find alternative approach. The deps work fine where they are, just architecturally misplaced.

### 9.2 `puma` 5.4.0 (CVE Exposure)
- **Sources**: S-DEP #4
- **Severity**: Medium
- **Priority**: High
- **Disposition**: fix
- **Description**: Misses CVE-2022-23634 (HTTP request smuggling) fixed in 5.6.2. Current stable is 6.x.
- **Comment**: `bundle update puma`, but needs full regression testing. Puma 6 has breaking changes (config options, thread/worker defaults). High effort — test all deployment scenarios.

### 9.3 `newrelic_rpm` 7.2.0
- **Sources**: S-DEP #3
- **Severity**: Medium
- **Priority**: Medium
- **Disposition**: fix
- **Description**: Years out of date; outside active support window. Current is 9.x.
- **Comment**: Medium effort. Not load-bearing — if it breaks, monitoring degrades but app still runs.

### 9.4 `acts_as_tenant` 0.5.0
- **Sources**: S-DEP #5
- **Severity**: Low
- **Priority**: Medium
- **Disposition**: fix
- **Description**: Misses thread-safety and Rails 7 compatibility fixes. Current is 0.6.x.
- **Comment**: Load-bearing (multi-tenancy layer) — needs careful testing even though it's a minor bump. High effort.

### 9.5 `rack-cors` 1.1.1
- **Sources**: S-DEP #6
- **Severity**: Low
- **Priority**: Medium
- **Disposition**: fix
- **Description**: Current is 2.0.x; 1.1.x may have Rack 3 compatibility issues with Rails 7.1.
- **Comment**: Not broken now but staying current avoids compounding pain on the next Rails upgrade. High effort.

### 9.6 `@vueuse/core` for Single Composable
- **Sources**: S-DEP #7
- **Severity**: Low
- **Priority**: High
- **Disposition**: fix
- **Description**: 300+ composable library pulled in for one `useBreakpoints` call, replaceable with ~15 lines of native `matchMedia`.
- **Comment**: Replace `useBreakpoints` with native `matchMedia` composable, remove dependency. Low effort.

### 9.7 `mimemagic` Git-Pinned Workaround
- **Sources**: S-DEP #8
- **Severity**: Low
- **Priority**: Low
- **Disposition**: defer
- **Description**: Pinned to 2021 GitHub SHA. Rails 7.1 `Marcel` may make it vestigial.
- **Comment**: Investigate if `MimeMagic` is still called anywhere. If unused, remove. If used, switch to current released gem or Rails 7.1's `Marcel`.

### 9.8 `active_model_serializers` Unmaintained
- **Sources**: S-DEP #9
- **Severity**: Low
- **Priority**: Medium
- **Disposition**: fix
- **Description**: AMS 0.10.x effectively unmaintained since 2019. Known Rails 7 incompatibilities. Maintenance liability that grows with each Rails upgrade.
- **Comment**: Migration off AMS is a project-level effort. High effort — will need subtasks for evaluating replacement (jsonapi-serializer vs Jbuilder vs plain render), incremental migration path, and testing.

### 9.9 Dead macOS Notification Gems
- **Sources**: S-DEP #10
- **Severity**: Low
- **Priority**: Low
- **Disposition**: fix
- **Description**: `ruby_gntp` (Growl) and `terminal-notifier-guard` are unmaintained relics. Pure noise.
- **Comment**: Remove both gems. Investigate current best option for continuous Ruby test runner (guard replacement).

### 9.10 Overly Tight `devise_token_auth` Constraint
- **Sources**: S-DEP #11
- **Severity**: Low
- **Priority**: Low
- **Disposition**: fix
- **Description**: `~> 1.2.2` locks out 1.3.x which has Ruby 3.2 and Rails 7.1 fixes.
- **Comment**: Auth layer — needs thorough testing after loosening constraint and updating. High effort.

### 9.11 Overly Tight `faker` Constraint
- **Sources**: S-DEP #12
- **Severity**: Low
- **Priority**: Low
- **Disposition**: fix
- **Description**: `~> 3.2.0` locks to 3.2.x patch series. Current is 3.5.x.
- **Comment**: Test-only gem, loosen to `~> 3.2`. Low effort.

### 9.12 `primeicons` in Runtime Dependencies
- **Sources**: S-DEP #13
- **Severity**: Cosmetic
- **Priority**: Low
- **Disposition**: fix
- **Description**: CSS-only import bundled at build time. Should be `devDependency`.
- **Comment**: Move from `dependencies` to `devDependencies`. Trivial.

---

## Summary

| Disposition | Count |
|---|---|
| fix | 30 |
| won't-fix | 8 |
| absorb | 5 |
| defer | 4 |
| split (partial fix) | 1 |
| **Total** | **49** (1 finding split into fix + won't-fix) |

### Top Actions (by priority)
1. **1.1 Async store boilerplate** — rip out per-store loading/error, lean on existing infrastructure (absorbs 2.11, 4.1)
2. **5.2 Duplicate API endpoint ownership** — breaks dead code detection tooling
3. **9.6 Remove @vueuse/core** — replace one composable with 15 lines, drop large dependency
4. **9.2 Update puma** — CVE exposure, high effort (regression testing)
5. **2.3 EcFormDialog API** — reduce dialog boilerplate, dialog owns lifecycle (absorbs 2.2, 2.4, 2.10)
6. **4.8 Type optionality convention** — establish required vs optional based on backend guarantees
7. **1.5 Transaction search context** — extract missing domain concept
