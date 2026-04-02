# Task: Extract BaseEditDialog component

**ID:** extract-baseeditdialog-component
**Status:** done
**Branch:** task/extract-baseeditdialog-component
**Autonomous:** true
**Priority:** high
**Captured:** 2026-03-28
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

COMP-02: Create EcFormDialog — a reusable layout component for form-in-dialog UX consistency. Not a code-dedup exercise; the goal is that any new dialog gets consistent chrome, footer buttons, and edit-mode behavior without writing custom CSS or duplicating the button pattern.

Supports three modes: view/edit toggle (default), always-edit, and view-only. Consumers provide form content via slots; EcFormDialog handles the dialog wrapper, footer button orchestration, and edit-mode state.

5 current consumers to migrate: InstitutionEditDialog, AllocationCategoryEditDialog, BankAccountEditDialog, SpecialEventForm, BudgetMassEditDialog.

---

## Acceptance Criteria

- [x] `EcFormDialog.vue` exists at `src/app/shared/form/form-dialog/`
- [x] Props: `visible` (v-model), `header`, `width` (default `'30rem'`), `initialEditMode`, `alwaysEdit`, `saveLabel`/`cancelLabel`/`editLabel`/`closeLabel`, `saveDisabled`, `dialogStyle`
- [x] Slots: `default` (scoped `{ editMode }`), `footer-extra` (scoped `{ editMode }`)
- [x] Emits: `update:visible`, `save`, `cancel`
- [x] View/edit mode: shows Make Changes/Close in view, Save/Cancel in edit; manages editMode internally; resets editMode on dialog reopen
- [x] Always-edit mode: always shows Save/Cancel; Cancel emits `cancel` then closes
- [x] Cancel emits in all modes; parent decides what to do (reset form, close for new items, etc.)
- [x] Consistent data-testids: `save-btn`, `cancel-btn`, `edit-btn`, `close-btn`
- [x] 5 consumers migrated: InstitutionEditDialog, AllocationCategoryEditDialog, BankAccountEditDialog, SpecialEventForm, BudgetMassEditDialog
- [x] SpecialEventForm testid updated from `submit-btn` to `save-btn` (Cypress tests updated if affected)
- [x] Full test coverage on EcFormDialog (27 scenarios covering view mode, edit mode, always-edit, dialog chrome, footer-extra slot, reset on reopen)
- [x] All existing consumer tests pass after migration
- [x] No dead CSS (.form-fields, .dialog-footer) remains in migrated consumers

---

## Implementation Notes

### File locations
- Component: `src/app/shared/form/form-dialog/EcFormDialog.vue`
- Spec: `src/app/shared/form/form-dialog/EcFormDialog.spec.ts`

### Component internals
- Wraps PrimeVue `Dialog` (modal, `:style` from `dialogStyle` merged with `{ width }`)
- Manages `editMode` ref internally: initialized from `initialEditMode`, reset when `visible` transitions to true
- When `alwaysEdit` is true, `editMode` is always true and toggle buttons don't appear
- Default slot wrapped in `<div class="form-fields">` (flex column, gap 1rem, padding 0.5rem 0)
- Footer: `<div class="dialog-footer">` containing `footer-extra` slot, then conditional buttons
- Props use Vue 3.5+ reactive destructuring with defaults

### Template structure
```
Dialog(visible, header, modal, :style)
  div.form-fields
    slot(default, { editMode })
  #footer
    div.dialog-footer
      slot(footer-extra, { editMode })
      [if alwaysEdit || editMode]: Save + Cancel
      [if !alwaysEdit && !editMode]: Make Changes + Close
```

### Cancel behavior
- View/edit mode: reverts editMode to false internally, emits `cancel`. Parent resets form data. For new items, parent closes dialog in `@cancel` handler.
- Always-edit mode: emits `cancel`, then emits `update:visible(false)`.

### Testing
- `createWrapper()` with `: VueWrapper` return type
- EcFormDialog itself uses PrimeVue Dialog — use `DialogStub` from `src/test/stubs`
- 27 test scenarios grouped: view mode (7), edit mode (8), always-edit (5), dialog chrome (3), footer-extra (2), reset on reopen (2)
- Note: DialogStub already renders `<slot name="footer" />` so no stub changes needed

### Migration order (simplest first)
1. **InstitutionEditDialog** — simplest view/edit, one field, 30rem
2. **AllocationCategoryEditDialog** — near-identical to Institution
3. **BankAccountEditDialog** — same pattern, 40rem, more fields, section heading CSS stays
4. **SpecialEventForm** — always-edit, custom saveLabel, saveDisabled, testid change (submit-btn → save-btn in spec: 7 occurrences)
5. **BudgetMassEditDialog** — always-edit, wide (72rem), needs `dialogStyle` for maxWidth: '95vw', complex body (form-fields wrapper is benign on single-child table layout)

### Per-consumer migration pattern
- Remove: Dialog/Button imports, `#footer` template, `.form-fields` CSS, `.dialog-footer` CSS, internal `editMode` ref, `close()` function
- Add: EcFormDialog import, replace outer `<Dialog>` with `<EcFormDialog>`
- Keep: `cancel()` handler (now just resets form data + optionally closes for new items), `saveChanges()` handler
- `.section-heading` CSS in BankAccountEditDialog stays (form-content-specific)

### Risks / edge cases
- BudgetMassEditDialog's horizontal scroll: the `.form-fields` wrapper is harmless (flex column on single child = no effect, padding is acceptable). Verify visually.
- No Cypress tests reference `submit-btn` (confirmed via grep)

### Autonomous eligibility
This task is autonomous-eligible. The worker should follow the migration order strictly and run tests after each consumer migration. Natural checkpoint: after building the component + migrating the first 3 view/edit dialogs, run the full test suite. If anything is off, stop and flag for review rather than continuing to the alwaysEdit consumers.
