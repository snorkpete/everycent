# API Surface Review (Sonnet)

## Finding 1
- **Files**: `webclientv4/src/app/settings/settingsApi.ts:8`, `app/controllers/settings_controller.rb:30`
- **Type**: shape-mismatch
- **Description**: `settingsApi.save()` is typed as returning `Promise<SettingsData>`, but the backend `POST /settings` controller returns `{ success: true }` — not a settings object. The store then assigns this wrong value back to `settings.value` in `settingsStore.ts:40`. Any component that reads `settings` after a save will have a garbled object (`{ success: true }`) instead of the actual settings shape.

## Finding 2
- **Files**: `webclientv4/src/app/transactions/transaction.types.ts`, `app/serializers/transaction_serializer.rb:30`
- **Type**: shape-mismatch
- **Description**: `TransactionSerializer` returns a `paid` boolean field on every transaction, but `TransactionData` in the frontend has no `paid` property. Any code that reads `transaction.paid` will get `undefined` at runtime despite the backend sending the value. This is a silent, undetected data loss.

## Finding 3
- **Files**: `webclientv4/src/app/allocation-categories/allocationCategory.types.ts`, `app/serializers/allocation_category_serializer.rb`
- **Type**: shape-mismatch
- **Description**: `AllocationCategorySerializer` returns `percentage` in every response, but `AllocationCategoryData` on the frontend only has `id` and `name`. The `percentage` value is silently dropped. Any future UI that needs the percentage (e.g. to display or validate allocations) will need a type change.

## Finding 4
- **Files**: `webclientv4/src/app/budgets/budgetApi.ts:22-27`, `app/controllers/budgets_controller.rb:44-57`, `app/models/budget.rb:59-95`
- **Type**: shape-mismatch
- **Description**: `budgetApi.copy()`, `budgetApi.close()`, and `budgetApi.reopenLast()` are all typed as returning `Promise<void>`. But the backend `copy` and `close` actions call `respond_with(result, BudgetSerializer)` — they return full budget objects. Similarly `reopen_last_budget` calls `respond_with`. The typed `void` hides a usable return value and means callers can't consume the updated budget without an extra fetch.

## Finding 5
- **Files**: `webclientv4/src/app/transactions/transaction.types.ts:20-21`, `app/serializers/allocation_serializer.rb`, `app/serializers/special_event_allocation_serializer.rb`
- **Type**: shape-mismatch
- **Description**: `AllocationData` declares `budget_name` and `allocation_category_name` as optional fields, but `AllocationSerializer` (used for `GET /allocations`) does NOT return these fields. Only `SpecialEventAllocationSerializer` returns them. Code that uses `AllocationData` from `/allocations` and reads `.budget_name` or `.allocation_category_name` will get `undefined`. The type conflates two distinct serializer shapes into one interface.

## Finding 6
- **Files**: `webclientv4/src/app/budgets/future-budgets/futureBudgets.types.ts`, `app/serializers/future_allocation_serializer.rb`, `app/serializers/allocation_serializer.rb`
- **Type**: shape-mismatch
- **Description**: `FutureAllocationSerializer` omits `spent` and `allocation_class` that `AllocationSerializer` includes. `FutureAllocationData` (frontend type) also omits `spent` and `allocation_class`. This is internally consistent, but `FutureAllocationData` lacks `allocation_class` while `AllocationData` has it — meaning components that generically work with allocation data cannot assume `allocation_class` is present. This asymmetry is undocumented.

## Finding 7
- **Files**: `webclientv4/src/app/special-events/SpecialEventAllocationsEditor.vue:150-151, 287-301`, `webclientv4/src/app/import/ImportPage.vue:300, 329-330`
- **Type**: layer-violation
- **Description**: Two components call API modules directly instead of going through a store. `SpecialEventAllocationsEditor.vue` imports and calls `budgetApi.getAll()` and `budgetApi.getAllocations()` and `allocationCategoryApi.getAll()` directly in `onMounted`. `ImportPage.vue` calls `budgetApi.getCurrentBudgetId()` directly. These bypass the store layer and have no centralized error handling or loading state management for those calls.

## Finding 8
- **Files**: `webclientv4/src/app/transactions/AccountTransferDialog.vue:147-148, 217-226, 279-292, 318`
- **Type**: layer-violation
- **Description**: `AccountTransferDialog.vue` calls `bankAccountApi.getOpen()`, `bankAccountApi.getWithBalances()`, `transactionApi.getSinkFundAllocations()`, and `bankAccountApi.transfer()` directly inside the component — all without a store. This means no loading indicator on the global loading store for these calls, no reuse of state if the dialog is opened multiple times, and errors are only surfaced locally via `useNotifications`.

## Finding 9
- **Files**: `webclientv4/src/app/sink-funds/SinkFundTransferDialog.vue:48, 122`
- **Type**: layer-violation
- **Description**: `SinkFundTransferDialog.vue` imports `sinkFundApi` directly and calls `sinkFundApi.transfer()` in `onSave()`. After the transfer it calls `store.fetchDetail()`, but the transfer itself bypasses the store action layer. Contrast with `BankAccountsController` / `SinkFundsController` where mutation operations are expected to go through the store.

## Finding 10
- **Files**: `webclientv4/src/app/budgets/BudgetAllocationList.vue:331`, `webclientv4/src/app/sink-funds/SinkFundAllocationTable.vue:210`, `webclientv4/src/app/sink-funds/SinkFundAllocationListMobile.vue:184`
- **Type**: layer-violation
- **Description**: These three components import API modules solely to pass a function reference as a prop to `AllocationTransactionsDialog` (`:fetch-transactions="budgetApi.getTransactionsForAllocation"` / `sinkFundApi.getTransactionsForAllocation`). The API module leaks into component scope; this is a minor pattern violation but means `AllocationTransactionsDialog` has no error handling on the injected fetch function — errors from the API call silently vanish.

## Finding 11
- **Files**: `webclientv4/src/app/home/HomePage.vue:31, 43-52`
- **Type**: layer-violation
- **Description**: `HomePage.vue` calls `homeApi.getLastTransactionDate()` directly in `onMounted`, bypassing any store. This is the only feature that has an API module but no corresponding store at all. The home page is intentionally simple, but it breaks the consistent architectural pattern. If the data were ever needed elsewhere, there would be no shared state to tap into.

## Finding 12
- **Files**: `webclientv4/src/app/bank-accounts/bankAccountApi.ts:10`, `webclientv4/src/app/institutions/institutionApi.ts:5`
- **Type**: pattern-inconsistency
- **Description**: The `/institutions` GET endpoint is called in two different places under two different identities: `bankAccountApi.getInstitutions()` and `institutionApi.getAll()`. Both hit the same URL. `bankAccountStore.fetchInstitutions()` uses the `bankAccountApi` version while `institutionStore.fetchAll()` uses the `institutionApi` version. This creates duplicated ownership with no canonical owner.

## Finding 13
- **Files**: `webclientv4/src/app/budgets/future-budgets/futureBudgetsApi.ts:9`, `webclientv4/src/app/allocation-categories/allocationCategoryApi.ts:6`
- **Type**: pattern-inconsistency
- **Description**: `futureBudgetsApi.getAllocationCategories()` duplicates the `/allocation_categories` GET call that `allocationCategoryApi.getAll()` already owns. Both call the same endpoint. `futureBudgetsStore` and `budgetStore` each independently fetch allocation categories — neither uses `allocationCategoryStore`, creating three separate owners of the same remote resource.

## Finding 14
- **Files**: `webclientv4/src/app/allocation-categories/allocationCategoryStore.ts:14-19`, `webclientv4/src/app/bank-accounts/bankAccountStore.ts:19-22`, `webclientv4/src/app/transactions/transactionStore.ts:31-35`, `webclientv4/src/app/settings/settingsStore.ts:29-31`, `webclientv4/src/app/import/importStore.ts:67-70`, `webclientv4/src/app/budgets/future-budgets/futureBudgetsStore.ts:70-72`, `webclientv4/src/app/institutions/institutionStore.ts:16-19`
- **Type**: missing-error-handling
- **Description**: Seven store `fetchAll` / `fetchMetadata` actions catch errors, set `error.value`, but do NOT re-throw. The project convention (documented in CLAUDE.md: "Store actions that fail must re-throw after setting `error.value`") is violated. Callers of these methods cannot `await` them and detect failure — they silently succeed from the caller's perspective. The following stores consistently re-throw (correct pattern): `budgetStore`, `budgetListStore`, `specialEventStore`, `accountBalanceStore`, `sinkFundStore`. The inconsistency means callers cannot write uniform try/catch wrappers across stores.

## Finding 15
- **Files**: `webclientv4/src/auth/authStore.ts:41-44`
- **Type**: missing-error-handling
- **Description**: `checkSession()` calls `authApi.validateToken()` and checks `response.data.success === true`. If the response shape ever changes (the validate_token endpoint is from `devise_token_auth` and returns nested `data.data`), this check would silently return `false` without logging. Additionally, `authApi.validateToken()` is the only API call in the codebase that does NOT use `.then((r) => r.data)` unwrapping in the API module — it returns the raw `AxiosResponse` — making `authStore.ts` the only caller that manually accesses `.data.success` instead of receiving pre-unwrapped data.

## Finding 16
- **Files**: `app/controllers/bank_accounts_controller.rb:57-59`, `app/controllers/bank_accounts_controller.rb:65-70`, `app/controllers/budgets_controller.rb:88-90`, `app/controllers/settings_controller.rb:30`
- **Type**: pattern-inconsistency
- **Description**: The backend uses three different patterns for mutation responses: (1) `respond_with(object, Serializer)` — returns full resource, (2) `render json: { success: true/false }` — returns success flag only, (3) `render json: result` — returns arbitrary hash. `manually_adjust_balances` and `mass_update` use pattern 2; `transfer` uses pattern 3 (an arbitrary hash from the model); `allocations_update` on SpecialEventsController uses pattern 1 for success but raw `render json: @special_event.errors` for errors (inconsistent with the `respond_with` error path in ApplicationController which uses `status: 422`). There is no uniform mutation response convention.

## Finding 17
- **Files**: `app/serializers/transaction_without_bank_account_serializer.rb:23`
- **Type**: pattern-inconsistency
- **Description**: `TransactionWithoutBankAccountSerializer` declares `type 'bank_account'` — an obvious copy-paste error. The `type` declaration should be `'transaction'`. This would affect any client code using JSON API type discriminators, and it is inconsistent with every other serializer in the project. (This serializer appears not to be used in any active controller action, but it remains a latent bug.)

## Finding 18
- **Files**: `webclientv4/src/app/account-balances/accountBalanceApi.ts:12-15`, `app/controllers/bank_accounts_controller.rb:53-59`
- **Type**: pattern-inconsistency
- **Description**: `accountBalanceApi.adjustBalances()` posts to `/bank_accounts/manually_adjust_balances` — a non-REST action verb on a bank_accounts endpoint, operated from the `accountBalance` feature module. This is a URL namespace mismatch: the feature is conceptually "account balances" but the endpoint lives under `bank_accounts`. The controller inconsistently handles this non-RESTful action with a raw `render json: { success: true/false }` while the rest of the bank accounts controller uses `respond_with`.
