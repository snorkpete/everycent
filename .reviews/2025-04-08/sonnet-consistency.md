# Consistency Review (Sonnet)

## Finding 1
- **Files**: `src/app/account-balances/accountBalanceStore.ts:12-23`, `src/app/allocation-categories/allocationCategoryStore.ts:11-21`, `src/app/bank-accounts/bankAccountStore.ts:12-24`, `src/app/institutions/institutionStore.ts:11-20`, `src/app/settings/settingsStore.ts:17-34`, `src/app/transactions/transactionStore.ts:25-36`, `src/app/transactions/transactionStore.ts:38-72`, `src/app/budgets/future-budgets/futureBudgetsStore.ts:60-75`, `src/app/import/importStore.ts:61-72`
- **Type**: pattern-divergence
- **Description**: Inconsistent error re-throwing contract in Pinia store action functions. "Read" actions (fetch/fetchAll/fetchMetadata) are split into two groups: those that silently swallow errors by not re-throwing (allocationCategoryStore.fetchAll, bankAccountStore.fetchAll+fetchInstitutions, institutionStore.fetchAll, settingsStore.fetchAll, transactionStore.fetchMetadata+fetch, futureBudgetsStore.fetchAll, importStore.fetchMetadata) and those that explicitly re-throw to their callers (accountBalanceStore.fetch, budgetStore.fetch, budgetListStore.fetchAll, sinkFundStore.fetchAll+fetchDetail, specialEventStore.fetchAll+fetchOne). All "write" actions (save/create/update/remove) consistently re-throw. This divergence means callers cannot uniformly decide whether to catch the error themselves — some pages silently fail on initial load while others catch and show notifications.

## Finding 2
- **Files**: `src/app/special-events/specialEventStore.ts:38-49`, `src/app/special-events/specialEventStore.ts:52-63`, `src/app/allocation-categories/allocationCategoryStore.ts:23-39`, `src/app/bank-accounts/bankAccountStore.ts:38-54`, `src/app/institutions/institutionStore.ts:23-39`
- **Type**: pattern-divergence
- **Description**: Inconsistent store action naming for CRUD operations. `specialEventStore` uses separate `create`, `update`, and `remove` functions matching HTTP verbs. All other stores with similar create/update operations (allocation-categories, bank-accounts, institutions) use a unified `save` function that branches on whether `id` is present. This means callers of `specialEventStore` must decide which action to call, while callers of the others always call `save`.

## Finding 3
- **Files**: `src/app/special-events/SpecialEventForm.vue:32-33`, `src/app/special-events/SpecialEventsPage.vue:70`, `src/app/special-events/SpecialEventDetailPage.vue:66` vs `src/app/institutions/InstitutionEditDialog.vue:29-30`, `src/app/institutions/InstitutionsPage.vue:36`, `src/app/allocation-categories/AllocationCategoryEditDialog.vue:29-30`, `src/app/bank-accounts/BankAccountEditDialog.vue:123-124`, `src/app/budgets/AddBudgetDialog.vue:22-23`, `src/app/budgets/future-budgets/BudgetMassEditDialog.vue:9`
- **Type**: naming
- **Description**: `SpecialEventForm` emits a `submit` event to communicate form completion, while every other dialog/form component in the codebase emits `save`. Callers of `SpecialEventForm` use `@submit="onSubmit"` while all others use `@save="onSave"`. This is the only component that deviates from the `save` event naming convention.

## Finding 4
- **Files**: `src/auth/authApi.ts:4-9` vs `src/app/account-balances/accountBalanceApi.ts:4-15`, `src/app/allocation-categories/allocationCategoryApi.ts:4-15`, `src/app/bank-accounts/bankAccountApi.ts:4-33`, `src/app/budgets/budgetApi.ts:6-47` (and all other `*Api.ts` files)
- **Type**: pattern-divergence
- **Description**: `authApi` returns raw Axios `AxiosResponse` objects (no `.then(r => r.data)` unwrapping). Every other API module in the codebase unwraps `.then(r => r.data)` so callers receive the payload directly. `authStore` must therefore navigate `response.data.success` and `e.response?.data?.errors?.[0]` — a path no other store needs to traverse. Additionally, `authStore` uses `axios.isAxiosError(e)` for error detection while all other stores use `e instanceof Error`.

## Finding 5
- **Files**: `src/app/sink-funds/sinkFund.types.ts:1-15` vs `src/app/transactions/transaction.types.ts:27-41`
- **Type**: pattern-divergence
- **Description**: `SinkFundAllocationData` is defined identically in two separate type files. `sinkFund.types.ts` declares it for the sink-fund module; `transaction.types.ts` re-declares an identical interface for the transactions module. The two are structurally the same (same fields, same optionality). There is no re-export or cross-import relationship between them — callers in each module use their local copy, creating a maintenance risk if one diverges.

## Finding 6
- **Files**: `src/app/account-balances/accountBalance.types.ts:1-15`, `src/app/bank-accounts/bankAccount.types.ts:5-36`, `src/app/sink-funds/sinkFund.types.ts:17-32` vs `src/app/allocation-categories/allocationCategory.types.ts:1-3`, `src/app/institutions/institution.types.ts:1-3`
- **Type**: type-inconsistency
- **Description**: Inconsistent field optionality patterns across domain type interfaces. `AccountBalanceData` declares all fields as required (no `?`). `BankAccountData` and `SinkFundData` declare almost all fields as optional (`?`). `AllocationCategoryData` and `InstitutionData` declare all fields as optional including `id`. This means different modules enforce different type safety levels — some guard `id != null` defensively everywhere while others assume fields are present.

## Finding 7
- **Files**: `src/app/shared/util/cents-to-dollars.ts`, `src/app/shared/util/dollars-to-cents.ts`, `src/app/shared/util/format-date.ts`, `src/app/shared/util/title-case.ts`, `src/app/shared/util/total.ts`, `src/app/shared/form/list-field/ec-list-field.types.ts` vs `src/app/home/formatFriendlyDate.ts`, `src/app/home/relativeDate.ts`, `src/app/budgets/budgetHeaderLines.ts`, `src/app/bank-accounts/isAutoAllocateEligible.ts`, `src/app/import/formatSkipReasons.ts`
- **Type**: naming
- **Description**: File naming uses two different conventions: `shared/util/` files and `ec-list-field.types.ts` use kebab-case (`cents-to-dollars.ts`, `format-date.ts`, `ec-list-field.types.ts`), while all other non-component utility/helper files outside `shared/util/` use camelCase (`formatFriendlyDate.ts`, `relativeDate.ts`, `budgetHeaderLines.ts`, `isAutoAllocateEligible.ts`, `formatSkipReasons.ts`). There is no consistent rule governing which convention to apply.

## Finding 8
- **Files**: `src/app/budgets/future-budgets/FutureBudgetsPage.vue:3-10` vs `src/app/account-balances/AccountBalancesPage.vue:3-31`, `src/app/budgets/BudgetsPage.vue:3-47`, `src/app/budgets/BudgetPage.vue:3-59`, `src/app/import/ImportPage.vue:3-55`, `src/app/special-events/SpecialEventsPage.vue:3-12`, `src/app/special-events/SpecialEventDetailPage.vue:3-32`
- **Type**: pattern-divergence
- **Description**: `FutureBudgetsPage` places its toolbar controls (Refresh button, variable-only toggle, dash toggle) inside a custom `<div class="page-header">` rendered as a content child, and also inside a `<tr class="toolbar-row">` within the table `<thead>`. All other pages use `EcPageLayout`'s `#toolbar`, `#toolbar-left`, or `#toolbar-right` named slots for toolbar content. `FutureBudgetsPage` is the only page that bypasses the shared toolbar slot system.

## Finding 9
- **Files**: `src/app/account-balances/AdjustBalancesDialog.vue:47-63` vs `src/app/sink-funds/SinkFundTransferDialog.vue:55-57`, `src/app/transactions/AccountTransferDialog.vue:159-165`, `src/app/budgets/BudgetsPage.vue:174-199`
- **Type**: pattern-divergence
- **Description**: Inconsistent dialog visible-state binding. Dialogs that wrap `EcFormDialog` or that have `v-model:visible` support (`SinkFundTransferDialog`, `AccountTransferDialog`, `TransactionImportDialog`) are used with `v-model:visible="showX"` at call sites. `AdjustBalancesDialog` uses a `:visible` + `@update:visible` manual binding at its call site (`AccountBalancesPage.vue:85`). The `EcFormDialog`-backed dialogs in `InstitutionsPage`, `AllocationCategoriesPage`, `BankAccountsPage`, `BudgetsPage` also use the manual `:visible` / `@update:visible` split rather than `v-model:visible`.

## Finding 10
- **Files**: `src/app/special-events/SpecialEventDetailPage.vue:125-135` vs `src/app/special-events/SpecialEventsPage.vue:148-162`, `src/app/bank-accounts/BankAccountsPage.vue:147-155`, `src/app/institutions/InstitutionsPage.vue:81-89`
- **Type**: pattern-divergence
- **Description**: `SpecialEventDetailPage.onSubmit` manually calls `store.update(id, payload)` and then separately calls `store.fetchOne(id)` to refresh the current event. However, `specialEventStore.update` already internally calls `fetchAll()` before re-throwing, so the extra `fetchOne` call is an additional refresh. All other pages (bank accounts, institutions, allocation categories) rely entirely on the store action to refresh state — they do not call a second fetch after the save action.

## Finding 11
- **Files**: `src/app/home/HomePage.vue:41-53` vs `src/app/transactions/AccountTransferDialog.vue:147-148,216-291`, `src/app/sink-funds/SinkFundTransferDialog.vue:48,122`, `src/app/import/ImportPage.vue:300,330`, `src/app/sink-funds/SinkFundAllocationTable.vue:200`, `src/app/sink-funds/SinkFundAllocationListMobile.vue:170`
- **Type**: pattern-divergence
- **Description**: Some components bypass Pinia stores and call API modules directly. `HomePage` calls `homeApi` directly in `onMounted`. `AccountTransferDialog` calls `bankAccountApi.getOpen()`, `bankAccountApi.getWithBalances()`, `transactionApi.getSinkFundAllocations()`, and `bankAccountApi.transfer()` directly. `SinkFundTransferDialog` calls `sinkFundApi.transfer()` directly. `ImportPage` calls `budgetApi.getCurrentBudgetId()` directly. `SinkFundAllocationTable` and `SinkFundAllocationListMobile` pass `sinkFundApi.getTransactionsForAllocation` directly as a prop. The rest of the app fetches data exclusively through stores.

## Finding 12
- **Files**: `src/app/budgets/budgetListStore.ts:27-29` vs all other stores (`accountBalanceStore.ts`, `allocationCategoryStore.ts`, `bankAccountStore.ts`, `budgetStore.ts`, etc.)
- **Type**: pattern-divergence
- **Description**: `budgetListStore` is the only store that extracts the error message coercion into a local helper function (`function errorMessage(e: unknown, fallback: string): string`). All other stores inline the `e instanceof Error ? e.message : 'Fallback string'` ternary directly in every catch block. This means the same boilerplate is repeated 25+ times across other stores but refactored only once.

## Finding 13
- **Files**: `src/app/settings/SettingsPage.vue:85,137-162` vs `src/app/institutions/InstitutionEditDialog.vue`, `src/app/allocation-categories/AllocationCategoryEditDialog.vue`, `src/app/bank-accounts/BankAccountEditDialog.vue`
- **Type**: pattern-divergence
- **Description**: `SettingsPage` manages edit-mode state and form layout directly in the page component (`editMode = ref(false)`, manual Save/Cancel buttons, form fields rendered inline). All other editable forms use the `EcFormDialog` component which encapsulates the edit-mode toggle, save/cancel buttons, and dialog chrome. `SettingsPage` is the only full-page form that reimplements the edit/view/save/cancel pattern rather than reusing the shared dialog infrastructure.

## Finding 14
- **Files**: `src/app/sink-funds/sinkFundStore.ts:56` vs `src/app/special-events/specialEventStore.ts:25`
- **Type**: naming
- **Description**: Both stores expose a function to load a single record by ID, but they use different names: `sinkFundStore` uses `fetchDetail(id)` and `specialEventStore` uses `fetchOne(id)`. Similarly, `accountBalanceStore` exposes a `fetch()` (no suffix), `budgetStore` exposes `fetch(budgetId)`, while most other stores use `fetchAll()`. There is no consistent convention for single-record vs. collection fetch naming.

## Finding 15
- **Files**: `src/app/budgets/useAllocationGrouping.ts:23-25` vs `src/app/budgets/useWantsNeedsBudgetBreakdown.ts:5-6`
- **Type**: type-inconsistency
- **Description**: The two composables in the same `budgets/` folder accept refs with different wrapper types. `useAllocationGrouping` requires its parameters typed as `ComputedRef<T>` (the narrower type). `useWantsNeedsBudgetBreakdown` accepts `Ref<T>` (the broader type). Both receive reactive data derived from stores. Since `ComputedRef` extends `Ref`, passing a `ComputedRef` to `useWantsNeedsBudgetBreakdown` works, but passing a plain writable `ref` to `useAllocationGrouping` fails at the type level, creating an asymmetric API between the two composables.

## Finding 16
- **Files**: `src/app/institutions/InstitutionsPage.vue:25` vs `src/app/allocation-categories/AllocationCategoriesPage.vue:21`, `src/app/bank-accounts/BankAccountsPage.vue:64-65`
- **Type**: style-inconsistency
- **Description**: Refresh buttons inconsistently expose loading state. `InstitutionsPage` and `SpecialEventsPage`/`SpecialEventDetailPage` bind `:loading="store.loading"` on their Refresh buttons so PrimeVue shows a spinner. `AllocationCategoriesPage`, `BankAccountsPage`, `BudgetsPage` (via `@click="store.fetchAll()"` on the refresh button), and `FutureBudgetsPage` do not bind `:loading`, so the button has no visual feedback during an in-flight request.
