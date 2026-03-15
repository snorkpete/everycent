# Task: Migrate transaction calculator to Vue

**ID:** migrate-transaction-calculator-to-vue
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

Port the floating transaction selection calculator to Vue. Shows total of checked transactions when 1+ are selected, with a Clear button. Self-contained: reads selected flag from transaction store. Depends on the core transactions screen migration.

---

## UX Spec (from redesign session 2026-03-15)

The redesign task (`redesign-transactions-screen-ux`) reserves the column space for the calculator — this task implements the logic on top of that reserved space.

- Activated by `Σ` toolbar button (toggles on/off, off by default)
- When active: the reserved 32px column at the left of the table reveals checkboxes
- Checked rows get a subtle background highlight
- Running total of checked transactions' `net_amount` appears in the middle cell of summary bar row 2, labelled `Σ`, replacing the intentionally empty cell
- When `Σ total === Diff`, both values highlight green — visual "you found them" signal

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
