# Duplication Review (Haiku)

## Finding 1
- **Files**: institutionStore.ts:L11-40, allocationCategoryStore.ts:L11-40, bankAccountStore.ts:L12-53 (partial)
- **Type**: near-duplicate
- **Description**: CRUD Store pattern repeated across multiple feature stores. Both `institutionStore` and `allocationCategoryStore` have identical `fetchAll()` and `save()` patterns with only entity names and error messages differing. This includes the same try-catch-finally structure, loading state management, and error handling. A generic CRUD store factory or base composable could eliminate this duplication and enforce consistent error handling patterns across all entity stores.

## Finding 2
- **Files**: InstitutionEditDialog.vue:L1-62, AllocationCategoryEditDialog.vue:L1-62
- **Type**: exact-duplicate
- **Description**: Both dialogs are nearly identical with only form data handling and field names different. Both have the same structure: `EcFormDialog` wrapper, single `EcTextField`, `toFormData()` function, reactive form state, watch for visibility reset, and identical cancel/save logic. A generic edit dialog component accepting a data type and field config could replace both.

## Finding 3
- **Files**: InstitutionsPage.vue:L52-90, AllocationCategoriesPage.vue:L46-84, BankAccountsPage.vue:L94-155 (partial)
- **Type**: extractable-pattern
- **Description**: Simple CRUD page pattern repeated across three different entity pages: dialog state management (visible, selectedItem, editMode), onMounted heading setup, refresh/edit/add functions, and onSave error handling. The template structure using `EcPageLayout`, `EcItemList`, and item click handlers is also nearly identical. A reusable page composition could reduce this boilerplate significantly.

## Finding 4
- **Files**: institutionApi.ts:L4-14, allocationCategoryApi.ts:L4-15, bankAccountApi.ts:L4-33 (partial)
- **Type**: extractable-pattern
- **Description**: RESTful API object pattern repeated across multiple API modules. All follow the same structure: `getAll()`, `create()`, `update()` methods with identical `.then((r) => r.data)` extraction pattern. The only variations are endpoint names and type generics. A factory function or generic API builder could generate these boilerplate API objects.

## Finding 5
- **Files**: institutionStore.spec.ts:L14-74, allocationCategoryStore.spec.ts:L14-73
- **Type**: near-duplicate
- **Description**: Store test patterns are nearly identical for `fetchAll()` testing. Both files have the same test structure: "fetches and stores X", "sets loading/error states", "clears error on success", and all assertions are duplicated. A generic store test factory or parameterized test suite could generate these tests automatically from entity metadata.

## Finding 6
- **Files**: budgetListStore.ts:L27-102, specialEventStore.ts:L12-105
- **Type**: near-duplicate
- **Description**: Async operation wrapper pattern with identical try-catch-finally logic repeated. Both `fetchAll()`, `create()`, `update()`, and `remove()` methods have the same error handling structure with only different API calls and error messages. Lines 38-50 in `specialEventStore` and lines 48-60 in `budgetListStore` are functionally identical. A reusable async wrapper utility could consolidate this error handling.

## Finding 7
- **Files**: AccountTransferDialog.vue:L1-141 (form field setup), SinkFundTransferDialog.vue:L1-41 (partial), BankAccountEditDialog.vue:L1-85 (partial)
- **Type**: extractable-pattern
- **Description**: Repeated form field pattern with `EcFormDialog` wrapper, `Select` dropdowns with similar structure (`:options`, `option-label`, `option-value`, placeholders), and form validation. The `.field` / `.field-label` div wrapper structure and styling is duplicated across multiple dialogs. Could extract a `FormField` wrapper component for consistency and less boilerplate.

## Finding 8
- **Files**: institutionStore.spec.ts:L76-152, allocationCategoryStore.spec.ts:L76-152
- **Type**: near-duplicate
- **Description**: Test suite for `save()` operations is nearly identical between two store specs. Both follow exact same test structure: "creates new on no id", "updates existing on id present", "re-throws on failure", "sets error message", "loading state management", and "refreshes data after save". These could be generated from a parameterized test factory.

## Finding 9
- **Files**: useCurrentAndPastBudgets.ts:L16-35, budgetListStore.ts:L31-45
- **Type**: near-duplicate
- **Description**: Budget fetching logic duplicated in two places: `useCurrentAndPastBudgets.fetchBudgets()` and `budgetListStore.loadBudgets()` both call `budgetApi.getAll()` identically. Additionally, budget filtering and sorting logic (lines 19-24 in composable, lines 11-25 in store) overlap significantly. These should be consolidated into a single source of truth to avoid divergence.

## Finding 10
- **Files**: sinkFundStore.ts:L86-92, transactionStore.ts:L104-110, budgetStore.ts:L51-57
- **Type**: extractable-pattern
- **Description**: Edit mode toggle pattern repeated identically across three stores: `enterEditMode()`, `exitEditMode()` functions that just toggle an `isEditMode` ref. This is boilerplate that could be extracted into a reusable composable like `useEditMode()`.

## Finding 11
- **Files**: SpecialEventsPage.vue:L137-160, TransactionsPage.vue (partial), SinkFundsPage.vue (partial)
- **Type**: extractable-pattern
- **Description**: Try-catch error notification pattern in component methods is repeated verbatim across page components. Pattern is: `try { await store.action() } catch { notifications.error(store.error ?? 'fallback') }`. This wrapper logic could be extracted into a composable or utility function to ensure consistent error messaging.

## Finding 12
- **Files**: bankAccountApi.ts:L5-21, budgetApi.ts:L11-14, specialEventApi.ts:L5-6
- **Type**: extractable-pattern
- **Description**: Parameterized GET request pattern with optional params is repeated. Multiple API methods use `apiGateway.get<T>(endpoint, { params: {...} })` with near-identical structure. Could extract a helper function to standardize this pattern and reduce boilerplate.

## Finding 13
- **Files**: institution.types.ts:L1-4, allocationCategory.types.ts:L1-4
- **Type**: extractable-pattern
- **Description**: Minimal entity type definition pattern repeated: both are `{ id?: number; name?: string }`. This pattern appears frequently throughout the codebase for simple master-data entities. Could create a generic `SimpleEntity` interface or a factory pattern for these common cases to reduce type file boilerplate.
