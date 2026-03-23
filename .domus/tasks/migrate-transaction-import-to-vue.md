# Task: Migrate transaction import to Vue

**ID:** migrate-transaction-import-to-vue
**Status:** done
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-14
**Parent:** none
**Depends on:** migrate-transactions-screen-to-vue
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Port the transaction import dialog and importer logic to Vue. The importer parses raw text pasted from a bank statement and converts it into `TransactionData[]`. After import, transactions are merged into `draftTransactions` and the page enters edit mode for review before saving.

Importers to port (Angular → Vue plain functions):
- ABN Amro bank (new format) — `AbnAmroImporterService.convertFromBankFormat`
- ABN Amro credit card — `AbnAmroCreditCardImporterService`
- Scotia — `ScotiaImporterService`

Importers to drop (not needed): FCB, Republic, ABN Amro old format.

---

## Acceptance Criteria

- [ ] Each importer is a plain TypeScript module (no classes, no DI) with a single exported function
- [ ] Each importer has full unit test coverage (ports existing Angular specs — see Angular source reference below)
- [ ] A `transactionImporter.ts` dispatcher maps `importType` string → the correct importer function
- [ ] `TransactionImportDialog.vue` opens as a PrimeVue Dialog with:
  - Textarea for pasting raw bank data
  - Select dropdown pre-filled with `store.selectedBankAccount?.import_format`
  - Import and Cancel buttons
- [ ] On Import: runs the importer, filters out `deleted: true` results, emits `'imported'` with `TransactionData[]`
- [ ] `transactionStore` gains an `addImportedTransactions(transactions: TransactionData[])` action
- [ ] `TransactionsPage` Import button opens the dialog; on `'imported'` event calls `store.addImportedTransactions()`
- [ ] After import the transactions list shows the new rows and the page is in edit mode (Save/Cancel visible)
- [ ] Vue `save()` filters out `deleted: true` transactions before posting — only the `deleted` flag, not date range (see rationale in Implementation Notes)

---

## Implementation Notes

### Files to create
- `webclientv4/src/app/transactions/importers/abnAmroBankImporter.ts` + `.spec.ts`
- `webclientv4/src/app/transactions/importers/abnAmroCreditCardImporter.ts` + `.spec.ts`
- `webclientv4/src/app/transactions/importers/scotiaImporter.ts` + `.spec.ts`
- `webclientv4/src/app/transactions/importers/transactionImporter.ts` + `.spec.ts`
- `webclientv4/src/app/transactions/TransactionImportDialog.vue` + `.spec.ts`

### Files to modify
- `webclientv4/src/app/transactions/transactionStore.ts` — add `addImportedTransactions()`
- `webclientv4/src/app/transactions/transactionStore.spec.ts` — test new action
- `webclientv4/src/app/transactions/TransactionsPage.vue` — wire up Import button
- `webclientv4/src/app/transactions/TransactionsPage.spec.ts` — test wiring

### Import type strings (dispatcher + dropdown)
These are the exact `importType` string values used throughout:

| Display label | `importType` value |
|---|---|
| ABN Amro Bank Account | `'abn-amro-bank'` |
| ABN Amro Credit Card | `'abn-amro-creditcard'` |
| Scotia Bank Account | `'new-bank-account'` |

The dispatcher routes: `abn-amro-bank` → `abnAmroBankImporter`, `abn-amro-creditcard` → `abnAmroCreditCardImporter`, `new-bank-account` → `scotiaImporter`.

### Importer function signature
All three importers export a single function:
```ts
(input: string, startDate: string, endDate: string) => TransactionData[]
```

### Dialog open/close mechanism
`TransactionsPage` holds a `showImportDialog = ref(false)`. The Import button sets it `true`. `TransactionImportDialog` takes a `visible` prop and emits `'update:visible'` (standard PrimeVue Dialog pattern) plus `'imported'` with the filtered transaction array. On import or cancel, the dialog sets `visible` to `false`.

### `addImportedTransactions` ordering
```
if (!isEditMode) enterEditMode()   // clones transactions → draftTransactions
draftTransactions.push(...transactions)  // append imported (already filtered)
```
If already in edit mode, existing draft edits are preserved and imported rows are appended.

### `save()` filter — deleted only, not date range
Angular's `extractValidTransactionsInBudget` filters both `deleted` AND date range. Vue only needs the `deleted` filter because:
- Imported transactions: out-of-range ones are already marked `deleted: true` by the importer, so the deleted filter covers them
- Existing transactions: they came from the server already scoped to the budget period, so date filtering adds nothing

Fix: before calling `transactionApi.save()`, filter `draftTransactions` with `.filter(t => !t.deleted)`.

### Specs
- Importer specs: use the Angular specs in `webclientv3/src/app/transactions/importers/` as a reference for what cases to cover, but write them fresh in Vitest style — not a direct clone
- Dialog spec: the Angular dialog spec is `xdescribe` (skipped/empty), so write it from scratch with no Angular reference

### Angular source reference
- `webclientv3/src/app/transactions/importers/` — importer services and specs (reference for test cases)
- `webclientv3/src/app/transactions/transaction.service.ts:40` — `extractValidTransactionsInBudget` (deleted filter logic)

---

### Execution log (2026-03-18)

All work done in the `integrate-domus` worktree at `.claude/worktrees/agent-acfe5922/`.

**Step 1: Importer plain functions**

Created `webclientv4/src/app/transactions/importers/` with:
- `abnAmroBankImporter.ts` — ports `AbnAmroImporterService.convertFromBankFormat`. Multi-line format: date line, description line, `Amount:±` line. Handles skippable lines (2-char initials, month headers, `Account:` lines). Uses `Math.ceil(amount * 100)` for cents. Tests cover full sample (5 transactions), date filtering, empty input, date format variations.
- `abnAmroCreditCardImporter.ts` — ports `AbnAmroCreditCardImporterService.convertToTransactions`. Two transaction types: regular (date, description, cardholder, amount) and iDEAL (no cardholder line). Date format `"20 jul. 2025"`, amount format `"- € 2,99"`.
- `scotiaImporter.ts` — ports `ScotiaImporterService._convertFromNewTransactionFormat`. Groups lines into chunks of 4. Converts date to ISO string (original stored `Date` object but `TransactionData.transaction_date` is typed as `string`). Returns `{}` for incomplete groups.
- `transactionImporter.ts` — dispatcher routing by `importType` string (`'abn-amro-bank'`, `'abn-amro-creditcard'`, `'new-bank-account'`). Unknown/undefined type → empty array.

All four have full spec files.

**Step 2: transactionStore additions**

- `addImportedTransactions(imported)`: enters edit mode if not already in it, then pushes to `draftTransactions`. Tests: enters edit mode, appends, preserves existing drafts, skips `enterEditMode` when already editing, appends multiple at once.
- `save()` fix: filters `deleted` transactions before API call. Test added.

**Step 3: TransactionImportDialog**

New `TransactionImportDialog.vue`:
- PrimeVue Dialog with `visible` prop + `update:visible` + `imported` emits
- Select dropdown pre-filled from `store.selectedBankAccount?.import_format` via `watch` on `props.visible`
- Import button disabled when `!selectedFormat || !store.selectedBudget`
- `runImport()` calls `transactionImporter()`, filters deleted, emits `imported` then closes

Spec covers: rendering, format pre-fill, Import button args, filtered emit, dialog close, Cancel close, disabled when no budget.

**Step 4: TransactionsPage wiring**

- Import button: removed `disabled`, added `@click="showImportDialog = true"`
- Added `<TransactionImportDialog v-model:visible="showImportDialog" @imported="onImport" />`
- `onImport()` delegates to `store.addImportedTransactions()`

**Code review findings applied:**
- `TransactionImportDialog.spec.ts`: strengthened disabled button assertion from `exists()` to also check `attributes('disabled')`
- Refactored from dynamic `await import()` to static top-level import of `transactionImporter` (required for `vi.mock` hoisting to work correctly)

**Pre-existing test failures (unchanged):**
- 3 in `transactionStore.spec.ts` — `fetchMetadata` tests (mock uses `getWithBalances`, store uses `getOpen`)
- 12 in `TransactionSearchForm.spec.ts` — `useRouter` not exported from vue-router mock

**Post-completion polish (2026-03-18):**
- Import button had `severity="secondary"` which made it look visually identical to the disabled Transfer button (both gray outlined). Removed `severity="secondary"` so Import gets a purple outline — clearly actionable, distinct from the disabled state. Commit: `e02cf52d`.
