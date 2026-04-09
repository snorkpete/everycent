# Duplication Review (Sonnet)

## Finding 1
- **Files**: `accountBalanceStore.ts:L12-23`, `allocationCategoryStore.ts:L11-21`, `bankAccountStore.ts:L12-24`, `institutionStore.ts:L11-21`, `budgetStore.ts:L16-32`, `budgetListStore.ts:L31-46`, `futureBudgetsStore.ts:L60-75`, `sinkFundStore.ts:L43-67`, `specialEventStore.ts:L12-91`, `settingsStore.ts:L17-34`, `transactionStore.ts:L25-102`, `importStore.ts:L61-72`
- **Type**: exact-duplicate
- **Description**: Every async store action follows the exact same 7-line pattern: `loading.value = true; error.value = null; try { ... } catch (e: unknown) { error.value = e instanceof Error ? e.message : 'fallback'; [throw e;] } finally { loading.value = false; }`. This pattern appears 34 times across 12 stores. A shared helper — either a `withLoading(errorRef, loadingRef, fn)` utility or a `useAsyncAction()` composable — would eliminate all this boilerplate and make error handling consistent (some actions `throw e` after setting `error.value`, others don't, which is an inconsistency bug hidden inside the duplication).

## Finding 2
- **Files**: `AllocationCategoriesPage.vue:L1-97`, `InstitutionsPage.vue:L1-103`
- **Type**: exact-duplicate
- **Description**: These two pages are structurally identical: `EcPageLayout` > `EcItemList` with an item slot rendering a `<a class="*-name">` link and a "View" button, a `#page-actions` slot with an "Add" button and a "Refresh" button, then an edit dialog, and a `dialogVisible / selected* / dialogEditMode` pattern in the script. The CSS for the clickable name link (`.category-name` / `.institution-name`) is also a copy of each other at 7 identical lines. These could be collapsed into a single generic list page or a shared `useEditDialog` composable covering the `dialogVisible`, `selectedItem`, `dialogEditMode`, `editItem()`, `addItem()`, and `onSave()` logic.

## Finding 3
- **Files**: `AllocationCategoryEditDialog.vue:L1-62`, `InstitutionEditDialog.vue:L1-62`
- **Type**: exact-duplicate
- **Description**: These two dialogs are byte-for-byte identical in structure — both wrap `EcFormDialog`, render a single `EcTextField` for `name`, use the same `toFormData` / `watch(visible)` / `Object.assign` / `saveChanges` / `cancel` pattern. The only differences are the prop types and the header string. They could be a single parameterised component (e.g. `EcNameOnlyEditDialog`) or the shared form logic extracted into a `useFormDialog(props, toFormData)` composable.

## Finding 4
- **Files**: `transactions/importers/abnAmroBankImporter.ts:L136-146`, `transactions/importers/abnAmroCreditCardImporter.ts:L38-48`, `transactions/importers/abnAmroCreditCard2026Importer.ts:L60-70`
- **Type**: exact-duplicate
- **Description**: All three importer files define identical private `parseLocalDate(dateStr)` and `formatDate(date)` functions (same implementation, same body). These should be extracted to a shared `importerUtils.ts` helper in the `importers/` folder. Additionally, each importer independently defines a `MONTH_MAP` constant (with minor variations in locale handling), which is another partial duplication worth consolidating.

## Finding 5
- **Files**: `sink-funds/sinkFund.types.ts:L1-15`, `transactions/transaction.types.ts:L27-41`
- **Type**: exact-duplicate
- **Description**: `SinkFundAllocationData` is defined identically in both files — every field name, type, and optionality is the same. `transaction.types.ts` independently re-declares the interface rather than importing it from `sinkFund.types.ts`. This means any future field change must be applied in two places and there's no guarantee they stay in sync.

## Finding 6
- **Files**: `transactionStore.ts:L25-36,L61-72`, `importStore.ts:L61-72`
- **Type**: exact-duplicate
- **Description**: Both stores contain an identical `fetchMetadata()` function: `loading.value = true; error.value = null; const [, loadedAccounts] = await Promise.all([fetchBudgets(), bankAccountApi.getOpen()]); bankAccounts.value = loadedAccounts;` — same logic, same fallback message `'Failed to load metadata'`. Both also use `useCurrentAndPastBudgets()` and track the same `bankAccounts` / `selectedBudget` / `currentAndPastBudgets` state. The shared metadata fetching could be extracted into a composable so both stores compose it rather than copy it.

## Finding 7
- **Files**: `AccountBalancesPage.vue:L116-121`, `SinkFundsPage.vue:L149-153`, `SinkFundsToolbarMobile.vue:L120-124`, `TransactionsPage.vue:L416-419`
- **Type**: exact-duplicate
- **Description**: The `:deep(.icon-btn--active.p-button)` scoped CSS block with `background-color: var(--p-primary-50); color: var(--p-primary-color);` is copy-pasted identically into four separate component `<style scoped>` blocks. The accompanying `icon-btn` / `icon-btn--active` class pattern used on the `<Button>` component is also repeated across these files. This should live in a global or shared stylesheet, or the "toggle button" should be wrapped in a shared `EcToggleButton` component that encapsulates the styling.

## Finding 8
- **Files**: `BudgetSummary.vue:L52-88`, `BudgetSummaryStrip.vue:L82-130`
- **Type**: near-duplicate
- **Description**: Both components independently compute `totalIncome`, `totalAllocations`, and `totalDiscretionaryAmount` from `budgetStore.budget`, read `settingsStore.settings.family_type / wife / husband`, and call `useWantsNeedsBudgetBreakdown(allocations, totalIncome)`. The difference is that `BudgetSummary` includes deleted allocations while `BudgetSummaryStrip` filters them out — but the entire scaffolding is duplicated. A shared composable `useBudgetTotals(includeDeleted?)` would eliminate the repeated store access and reduce calculations to one definition.

## Finding 9
- **Files**: `AllocationCategoryEditDialog.vue:L33-61`, `InstitutionEditDialog.vue:L33-61`, `BankAccountEditDialog.vue:L127-249`, `SpecialEventForm.vue:L35-66`
- **Type**: extractable-pattern
- **Description**: All four dialog/form components implement the same form reset pattern: `toFormData(props.*)` helper + `reactive(toFormData(...))` + `watch(() => props.visible, (isVisible) => { if (isVisible) Object.assign(formData, toFormData(...)); })`. This is a composable-worthy pattern: a `useFormReset(getProps, toFormData)` composable returning `formData` would eliminate the boilerplate in every dialog.

## Finding 10
- **Files**: `budgets/budgetStore.ts:L51-57`, `transactions/transactionStore.ts:L104-110`, `sink-funds/sinkFundStore.ts:L86-92`
- **Type**: exact-duplicate
- **Description**: Three stores define identical `enterEditMode()` and `exitEditMode()` functions that simply set `isEditMode.value = true` and `isEditMode.value = false`. All three also implement a `cancelEdit()` that sets `isEditMode.value = false` then re-fetches. This edit-mode lifecycle is a candidate for a shared `useEditMode(fetchFn)` composable.

## Finding 11
- **Files**: `BudgetAllocationList.vue:L390-398`, `SinkFundAllocationTable.vue:L229-231`, `SinkFundAllocationListMobile.vue:L194-196`
- **Type**: exact-duplicate
- **Description**: The `(dialogVisible, selectedAllocationId, selectedAllocationName)` trio of refs plus the pattern of opening `AllocationTransactionsDialog` by setting them is copy-pasted across three components. The show-transactions trigger code (`selectedAllocationId.value = allocation.id ?? 0; selectedAllocationName.value = allocation.name ?? ''; dialogVisible.value = true;`) is also the same. A `useAllocationTransactionsDialog(fetchFn)` composable returning these refs and an `openDialog(allocation)` function would remove all three copies.

## Finding 12
- **Files**: `sink-funds/SinkFundAllocationTable.vue:L233-237`, `sink-funds/SinkFundAllocationListMobile.vue:L224-228`
- **Type**: exact-duplicate
- **Description**: The `outstanding(allocation)` function is copy-pasted verbatim between the desktop table and mobile list components for sink funds: `const target = allocation.target ?? 0; if (target === 0) return 0; return (allocation.current_balance ?? 0) - target;`. This should be a shared pure function in `sinkFund.utils.ts` or co-located with the types.

## Finding 13
- **Files**: `AllocationCategoriesPage.vue:L86-97`, `InstitutionsPage.vue:L92-103`
- **Type**: exact-duplicate
- **Description**: The scoped CSS for the "clickable entity name link" is identical in both pages — 7 lines defining `font-size: 0.9rem; color: var(--p-primary-color); text-decoration: none; cursor: pointer;` and a `:hover { text-decoration: underline; }` rule. The same pattern (with slightly different class names) also appears in `BudgetsPage.vue` (`.budget-name-link`), `SpecialEventsPage.vue` (`.event-link`), and `BankAccountsPage.vue` (`.account-name`). This is a global link-that-looks-like-text style that should be a shared CSS utility class.

## Finding 14
- **Files**: `AccountBalancesPage.vue:L131-144`, `BudgetPage.vue:L137-144`, `SinkFundsPage.vue:L161-170`, `TransactionsPage.vue:L421-430`, `BudgetsPage.vue:L279-288`
- **Type**: near-duplicate
- **Description**: Every major page defines a `.content-card` CSS class with nearly identical rules: `border: 1px solid var(--p-surface-300); border-radius: 6px; background-color: var(--p-surface-0); margin-bottom: 0.5rem` (sometimes `0.75rem`). This is duplicated in 5 files and should be a global shared CSS class, or the `EcPageLayout` component should accept a `content-card` slot or variant that renders with that styling.

## Finding 15
- **Files**: `budgets/future-budgets/futureBudgetsApi.ts:L8-9`, `allocation-categories/allocationCategoryApi.ts:L5-6`
- **Type**: near-duplicate
- **Description**: `futureBudgetsApi.getAllocationCategories()` hits `/allocation_categories` and returns `AllocationCategoryData[]` — the exact same endpoint and return type as `allocationCategoryApi.getAll()`. The `futureBudgetsStore` calls its own copy rather than the canonical `allocationCategoryApi`. This is an unnecessary API duplication; `futureBudgetsStore` should import and call `allocationCategoryApi.getAll()` directly, matching how `budgetStore` and `settingsStore` already do it.
