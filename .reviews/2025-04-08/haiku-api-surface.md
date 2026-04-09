# API Surface Review (Haiku)

## Finding 1
- **Files**: webclientv4/src/auth/authApi.ts:L4-10, webclientv4/src/auth/authStore.ts:L14-19
- **Type**: shape-mismatch
- **Description**: authApi.signIn() and authApi.validateToken() return raw axios responses (not unwrapped), while all other API methods unwrap with `.then((r) => r.data)`. authStore then reads `response.data.success` which creates inconsistent response shape handling. This inconsistency requires direct axios import in authStore to handle AxiosError detection.

## Finding 2
- **Files**: app/controllers/settings_controller.rb:L12-31, app/controllers/bank_accounts_controller.rb:L54-71
- **Type**: pattern-inconsistency
- **Description**: Some controllers use `respond_with(@object, Serializer)` (institutions, bank_accounts via respond_to :json), while settings_controller.rb uses `render json: { success: true }` and `render json: settings` directly without serializer. BankAccountsController also uses raw `render json` for transfer and manually_adjust_balances endpoints instead of respond_with pattern.

## Finding 3
- **Files**: app/controllers/transactions_controller.rb:L48-74, app/controllers/budgets_controller.rb:L75-83, app/controllers/bank_accounts_controller.rb:L54-71
- **Type**: missing-error-handling
- **Description**: TransactionsController.import_preview and import_save use explicit rescue blocks with custom error handling (`render json: { error: e.message }, status: :unprocessable_entity`), while most other controllers rely on respond_with with no visible error handling. Inconsistent error response shapes (error message wrapped vs raw model validation errors).

## Finding 4
- **Files**: app/controllers/special_events_controller.rb:L40-46, app/serializers/future_allocation_serializer.rb:L26
- **Type**: shape-mismatch
- **Description**: SpecialEventsController.allocations updates and calls respond_with, but falls back to `render json: @special_event.errors` on update failure (422 status). This returns a different shape than successful responses. FutureAllocationSerializer includes `has_one :allocation_category` commented out, suggesting intentional shape differences between allocations and future_allocations, but frontend types (AllocationData vs FutureAllocation types in TypeScript) don't reflect this distinction clearly.

## Finding 5
- **Files**: app/serializers/bank_account_serializer.rb:L31-43, app/serializers/account_balance_serializer.rb:L1-8
- **Type**: shape-mismatch
- **Description**: BankAccountsController#index with `include_current_balance=true` returns `BankAccountWithBalanceSerializer` which has different attributes than standard `BankAccountSerializer`. The two serializers have significantly different shapes but the frontend bankAccount.types.ts uses a single BankAccountData interface for both, creating potential shape mismatches when code uses the wrong endpoint.

## Finding 6
- **Files**: app/controllers/budgets_controller.rb:L75-83, app/controllers/budgets_controller.rb:L85-92
- **Type**: pattern-inconsistency
- **Description**: BudgetsController.auto_allocate renders `{ suggestions: suggestions }` directly as JSON, while copy/close/reopen endpoints use respond_with pattern with BudgetSerializer. Frontend budgetApi.autoAllocate expects `response.suggestions` but other budget operations return serialized objects. Inconsistent response wrapper pattern.

## Finding 7
- **Files**: app/controllers/bank_accounts_controller.rb:L31-38, app/controllers/sink_funds_controller.rb:L17-26
- **Type**: pattern-inconsistency
- **Description**: BankAccountsController defines but never calls `show` action (respond_with with serializer), while SinkFundsController also defines show but then overrides loading logic inline. Some controllers have `respond_to :json` (InstitutionsController, SpecialEventsController) while others don't (SinkFundsController, AllocationCategoriesController). Inconsistent use of respond_to directive.

## Finding 8
- **Files**: webclientv4/src/app/budgets/budgetApi.ts:L17, webclientv4/src/app/transactions/transactionApi.ts:L5-10
- **Type**: pattern-inconsistency
- **Description**: budgetApi.getCurrentBudgetId() returns `r.data.budget_id` (unwraps nested field), while other APIs return `r.data` directly. transactionApi.getAll uses snake_case params (`budget_id`, `bank_account_id`) while settingsApi, institutionApi have no parameters. Inconsistent parameter naming conventions between modules.

## Finding 9
- **Files**: webclientv4/src/app/import/importApi.ts:L40-61, webclientv4/src/app/import/importStore.ts:L140-149
- **Type**: layer-violation
- **Description**: importApi has complex buildPreviewPayload helper function that transforms domain objects, but the same transformation logic is partially duplicated in importStore.saveImport() (L170-188). API layer should handle request shaping, not stores. This violates separation of concerns.

## Finding 10
- **Files**: app/controllers/settings_controller.rb:L12-15, webclientv4/src/app/settings/settingsApi.ts:L4-8
- **Type**: shape-mismatch
- **Description**: SettingsController#index returns `Setting.as_hash` (plain object), while SettingsController#create returns `{ success: true }` (boolean response). Frontend settingsApi.save() expects a SettingsData response object, but create returns a success flag. Response shapes are inconsistent between get and post.

## Finding 11
- **Files**: app/controllers/special_events_controller.rb:L24-28, app/controllers/budgets_controller.rb:L38-42
- **Type**: pattern-inconsistency
- **Description**: SpecialEventsController wraps POST params in `special_event` key (L25, 27) while BudgetsController accepts `budget` key. Inconsistent parameter envelope naming across similar create/update endpoints. Frontend must wrap payloads differently per resource, increasing cognitive load.

## Finding 12
- **Files**: app/serializers/sink_fund_serializer.rb:L5, app/serializers/budget_serializer.rb:L15-16, app/serializers/simple_budget_serializer.rb:L14-17
- **Type**: shape-mismatch
- **Description**: SinkFundSerializer uses `type 'bank_account'` (inherits from BankAccount model), while BudgetSerializer uses `type 'budget'`. SimpleBudgetSerializer and FutureBudgetSerializer also use `type 'budget'`. Same resource (Budget) has multiple serializers returning same type but different attribute shapes. Frontend types don't distinguish between SimpleBudget and BudgetDetail responses.
