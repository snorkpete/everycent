# Consistency Review (Haiku)

## Finding 1
- **Files**: institutionStore.ts:L6-41, settingsStore.ts:L10-49, bankAccountStore.ts:L6-56, transactionStore.ts:L13-72, budgetStore.ts:L9-88, sinkFundStore.ts:L6-111, specialEventStore.ts:L6-104, accountBalanceStore.ts:L6-40
- **Type**: pattern-divergence
- **Description**: Inconsistent fetch method naming across stores. Some stores use `fetchAll()` (institutions, settings, bank-accounts, sink-funds, special-events), while others use `fetch()` (transactions, budget, account-balances). Additionally, some stores have `fetchDetail()` or `fetchOne()` for individual items (sink-funds uses fetchDetail, special-events uses fetchOne), creating ambiguity. No consistent naming convention for fetching lists vs. individual items.

## Finding 2
- **Files**: institutionApi.ts:L4-14, bankAccountApi.ts:L4-33, settingsApi.ts, transactionApi.ts, budgetApi.ts
- **Type**: style-inconsistency
- **Description**: All API methods use identical patterns `.then((r) => r.data)` for returning response data. This is consistent and correct, but represents a single pattern that could benefit from DRY principle using a wrapper function.

## Finding 3
- **Files**: institutionStore.ts:L6, budgetListStore.ts:L6, transactionStore.ts:L13, settingsStore.ts:L10, accountBalanceStore.ts:L6, bankAccountStore.ts:L6, allocationCategoryStore.ts:L6, sinkFundStore.ts:L6, specialEventStore.ts:L6, budgetStore.ts:L9
- **Type**: naming
- **Description**: Store name inconsistency in defineStore calls. Some use singular names (useInstitutionStore -> 'institutions', useBudgetStore -> 'budget'), while others use plural or different conventions (useBankAccountStore -> 'bankAccounts', useSinkFundStore -> 'sinkFund'). The naming inside defineStore doesn't match a consistent pattern relative to the store function name.

## Finding 4
- **Files**: InstitutionEditDialog.vue:L28-30, AllocationCategoryEditDialog.vue:L28-30, SpecialEventForm.vue:L30-32, BankAccountEditDialog.vue, SpecialEventsPage.vue:L128, transactionStore.ts:L127
- **Type**: naming
- **Description**: Inconsistent event names for form/dialog submissions. Most form components emit `save` (InstitutionEditDialog, AllocationCategoryEditDialog, BankAccountEditDialog), but SpecialEventForm emits `submit`. Similarly, delete operations use different names: `deleteEvent` in components but `deleteTransaction` in stores, while specialEventStore uses `remove` (L66) as the store method name.

## Finding 5
- **Files**: budgetListStore.ts:L27-29, institutionStore.ts:L16-17, settingsStore.ts:L29-30, transactionStore.ts:L67-68, bankAccountStore.ts:L19-20,L32-33
- **Type**: pattern-divergence
- **Description**: Inconsistent error handling patterns across stores. budgetListStore has a dedicated `errorMessage(e: unknown, fallback: string)` helper function that handles Error type checking, while all other stores inline this pattern repeatedly using `e instanceof Error ? e.message : 'Failed to...'`. No DRY principle applied to error message extraction across stores.

## Finding 6
- **Files**: InstitutionEditDialog.spec.ts:L8, InstitutionsPage.spec.ts:L36-43, SettingsPage.spec.ts:L60, AllocationCategoryEditDialog.spec.ts, AllocationCategoriesPage.spec.ts
- **Type**: pattern-divergence
- **Description**: Inconsistent test stub usage. Some spec files import DialogStub from the shared test/stubs location, while others define it inline. This creates duplication and maintenance burden. No consistent pattern for when to use shared stubs vs. inline definitions.

## Finding 7
- **Files**: InstitutionsPage.vue:L60-67, SettingsPage.vue:L137-147, BudgetsPage.vue:L150-153, AccountBalancesPage.vue:L17-19, HomePage.vue:L41-50
- **Type**: style-inconsistency
- **Description**: Inconsistent patterns for handling async operations in onMounted. Some pages call store methods directly without awaiting (InstitutionsPage.refresh(), BudgetsPage.store.fetchAll()), others chain .then()/.catch() promises (SettingsPage, HomePage), and a few use async/await patterns. No consistent approach to error handling in initialization.

## Finding 8
- **Files**: InstitutionEditDialog.vue:L22-26, AllocationCategoryEditDialog.vue:L22-26, BankAccountEditDialog.vue, EcFormDialog.vue:L20-25, SpecialEventForm.vue:L25-28
- **Type**: pattern-divergence
- **Description**: Inconsistent prop patterns for controlling edit mode in dialog/form components. Most edit dialogs use `initialEditMode` as a required prop (InstitutionEditDialog, AllocationCategoryEditDialog), the shared EcFormDialog defines it as optional with default value, while SpecialEventForm uses a different pattern entirely with `always-edit` prop on EcFormDialog and no initialEditMode prop.

## Finding 9
- **Files**: institutionStore.ts:L1-4, transactionStore.ts:L1-10, budgetListStore.ts:L1-4, accountBalanceStore.ts:L1-4, specialEventStore.ts:L1-4
- **Type**: style-inconsistency
- **Description**: Inconsistent import statement formatting for stores. All files correctly use `import type` for TypeScript-only imports, but they vary in how they organize runtime vs. type imports. Some group all type imports together, others intersperse them. This minor style inconsistency affects readability.

## Finding 10
- **Files**: sinkFundStore.ts:L75, budgetStore.ts:L40, settingsStore.ts:L40, institutionStore.ts:L28-31,L32, specialEventStore.ts:L52-56
- **Type**: pattern-divergence
- **Description**: Inconsistent save/update patterns across stores. Some stores assign the returned saved data directly to state (sinkFundStore, budgetStore, settingsStore), while others call `fetchAll()` to refresh the list (specialEventStore, institutionStore). This creates unpredictable behavior where some UIs update immediately with returned data while others must wait for a full list refresh.
