# Task: Add actions slot to EcItemList for page action buttons

**ID:** add-actions-slot-to-ecitemlist-for-page-action-buttons
**Status:** done
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-04-02
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

DUP-CSS-02 from the 2026-04-02 audit. Three list pages define identical `.page-actions` CSS (display: flex; gap: 0.75rem) for action buttons below the list. The Angular app handled this with `<mat-card-actions>` — a built-in card actions slot.

EcItemList should provide an `actions` slot that renders below the list content with standardized layout.

**Current duplication:**
- AllocationCategoriesPage.vue:86-89
- BankAccountsPage.vue:139-142
- InstitutionsPage.vue:92-95

---

## Acceptance Criteria

- [ ] EcItemList provides an actions slot
- [ ] All 3 pages migrated to use the slot
- [ ] Duplicated .page-actions CSS removed
