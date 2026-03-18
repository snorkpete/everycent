# Task: Migrate transaction import to Vue

**ID:** migrate-transaction-import-to-vue
**Status:** done
**Refinement:** autonomous
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
