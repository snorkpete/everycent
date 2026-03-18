# Task: Migrate transaction import to Vue

**ID:** migrate-transaction-import-to-vue
**Status:** open
**Refinement:** raw
**Priority:** normal
**Captured:** 2026-03-14
**Parent:** none
**Depends on:** migrate-transactions-screen-to-vue
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Port the transaction import dialog and ABN Amro bank + credit card importer services to Vue. Depends on the core transactions screen migration.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

### Execution log (2026-03-18)

All work done in the `integrate-domus` worktree at `.claude/worktrees/agent-acfe5922/`.

**Step 1: Importer plain functions**

Created `webclientv4/src/app/transactions/importers/` with:
- `abnAmroBankImporter.ts` — ports `AbnAmroImporterService.convertFromBankFormat`. Multi-line format: date line, description line, `Amount:±` line. Handles skippable lines (2-char initials, month headers, `Account:` lines). Uses `Math.ceil(amount * 100)` for cents. Tests cover full sample (5 transactions), date filtering, empty input, date format variations.
- `abnAmroCreditCardImporter.ts` — ports `AbnAmroCreditCardImporterService.convertToTransactions`. Two transaction types: regular (date, description, cardholder, amount) and iDEAL (no cardholder line). Date format `"20 jul. 2025"`, amount format `"- € 2,99"`.
- `scotiaImporter.ts` — ports `ScotiaImporterService._convertFromNewTransactionFormat`. Groups lines into chunks of 4. Converts date to ISO string (original stored `Date` object but `TransactionData.transaction_date` is typed as `string`). Returns `{}` for incomplete groups.
- `transactionImporter.ts` — dispatcher routing by `importType` string (`'abn-amro-bank'`, `'abn-amro-creditcard'`, `'new-bank-account'`). Unknown/undefined type → empty array.

All four have full spec files. Wallaby was not detecting the new `importers/` directory at time of commit (needs restart) — known issue with new directories.

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
