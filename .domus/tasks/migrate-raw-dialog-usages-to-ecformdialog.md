# Task: Migrate raw Dialog usages to EcFormDialog

**Status:** done
**Branch:** task/migrate-raw-dialog-usages-to-ecformdialog
**ID:** migrate-raw-dialog-usages-to-ecformdialog
**Status:** proposed
**Autonomous:** true
**Priority:** high
**Captured:** 2026-04-02
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

DUP-CSS-04 + DUP-CSS-05 from the 2026-04-02 audit. Multiple dialogs duplicate `.dialog-footer` and `.field`/`.field-label` CSS that EcFormDialog already owns. Goal: every dialog with footer buttons gets consistent styling from a single source of truth.

**UX lens:** Users should see identical button placement, ordering, and styling in every dialog. Muscle memory — Save is always in the same spot, Cancel always looks the same.

---

## Design (refined 2026-04-03)

### Part 1: Migrate 4 form dialogs to EcFormDialog

All use `alwaysEdit: true` since they're action dialogs (create/transfer/import), not view/edit dialogs.

| Dialog | Fields | Notes |
|--------|--------|-------|
| **AddBudgetDialog** | 1 (date picker) | Simplest candidate, cleanest win |
| **SinkFundTransferDialog** | 3 (from, to, amount) | Straightforward transfer form |
| **AccountTransferDialog** | 8+ (conditional rendering by account type) | Most complex, but standard form layout |
| **TransactionImportDialog** | 2 (format select, textarea) | Standard form, lowest priority |

### Part 2: Extract EcDialogFooter from EcFormDialog

EcFormDialog's footer pattern should be extracted into a standalone `EcDialogFooter` component. Then:
- EcFormDialog uses EcDialogFooter internally (single source of truth)
- AdjustBalancesDialog uses raw Dialog + EcDialogFooter (consistent footer, custom table body)

This gives consistent footer UX even for dialogs whose body doesn't fit EcFormDialog's form-fields layout.

### Part 3: Replace delete confirmation with PrimeVue useConfirm

SpecialEventsPage has a custom delete confirmation dialog. Replace with PrimeVue's `useConfirm` composable + `<ConfirmDialog />`. The confirm logic moves into the delete handler — no custom dialog needed.

### Not migrated

**AllocationTransactionsDialog** — read-only data display with no footer buttons. No UX consistency issue since there's nothing to be inconsistent with.

---

## Acceptance Criteria

- [x] AddBudgetDialog migrated to EcFormDialog with `alwaysEdit: true`
- [x] SinkFundTransferDialog migrated to EcFormDialog with `alwaysEdit: true`
- [x] AccountTransferDialog migrated to EcFormDialog with `alwaysEdit: true`
- [x] TransactionImportDialog migrated to EcFormDialog with `alwaysEdit: true`
- [x] EcDialogFooter extracted from EcFormDialog's footer; EcFormDialog uses it internally
- [x] AdjustBalancesDialog uses raw Dialog + EcDialogFooter for consistent footer
- [x] SpecialEventsPage delete confirmation replaced with PrimeVue `useConfirm` + `ConfirmDialog`
- [x] All duplicated `.dialog-footer` CSS removed
- [x] All duplicated `.field`/`.field-label` CSS removed
- [x] All existing tests pass
