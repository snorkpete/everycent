# Task: Migrate raw Dialog usages to EcFormDialog

**ID:** migrate-raw-dialog-usages-to-ecformdialog
**Status:** raw
**Autonomous:** false
**Priority:** high
**Captured:** 2026-04-02
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

DUP-CSS-04 + DUP-CSS-05 from the 2026-04-02 audit. Four dialogs duplicate `.dialog-footer` CSS, three duplicate `.field` + `.field-label` form layout CSS. EcFormDialog already owns both patterns.

**Approach:** Try EcFormDialog first (baseline). Fall back to extracting an `EcDialogFooter` component only for dialogs that genuinely don't fit EcFormDialog's model.

**Rationale:** Copying exact CSS to get the same visual result means the visual result is an implicit contract with no single source of truth. If the dialog footer look changes, you're hunting through files.

**Current duplication:**
- `.dialog-footer`: TransactionImportDialog.vue:132-136, AccountTransferDialog.vue:377-381, SinkFundTransferDialog.vue:174-178, SpecialEventsPage.vue:216-220
- `.field` + `.field-label`: TransactionImportDialog.vue:115-126, AccountTransferDialog.vue:360-370, SinkFundTransferDialog.vue:155-167

**Dialogs to assess:**
- TransactionImportDialog — file upload + preview, custom layout
- AccountTransferDialog — complex form with conditional fields
- SinkFundTransferDialog — simpler transfer form
- SpecialEventsPage delete confirmation — custom confirmation, not a form dialog

---

## Acceptance Criteria

- [ ] Each dialog assessed for EcFormDialog compatibility
- [ ] Compatible dialogs migrated to EcFormDialog
- [ ] Incompatible dialogs use EcDialogFooter (if needed)
- [ ] All .dialog-footer CSS duplication eliminated
- [ ] All .field/.field-label CSS duplication eliminated (use Ec form components or shared utility)
