# Task: Extract useListPage composable

**ID:** extract-uselistpage-composable
**Status:** raw
**Autonomous:** false
**Priority:** high
**Captured:** 2026-03-28
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

COMP-06: BankAccountsPage, AllocationCategoriesPage, InstitutionsPage have identical dialog state management, edit/add handlers, save handling.

**Updated framing (2026-04-02):** The visual layer is done — EcPageLayout + EcItemList now handle the page structure and list rendering, giving UX consistency for free. The remaining duplication is ~15 lines of dialog state management per page (`showDialog`, `selectedItem`, `openAdd()`, `openEdit(item)`, `handleSave()`).

The question is whether a `useListPage()` composable on top of the visual components buys anything:
- Is the composable part of the component's API? Does it make EcItemList + EcFormDialog easier to use consistently?
- Does having it prevent misuse (e.g. forgetting to reset `selectedItem` on close)?
- Or is 15 lines of straightforward dialog state simple enough to just follow as a pattern?

**During refinement:** Check the 3-4 list pages. Are they actually identical in their dialog logic, or do they have subtle differences that would make a composable awkward?

---

## Acceptance Criteria

- [ ] Decision: extract composable or document as pattern-to-follow
- [ ] If composable: all list pages (BankAccountsPage, AllocationCategoriesPage, InstitutionsPage) use it
- [ ] If pattern: document the standard dialog state shape in vue-coding-rules.md

---

## Implementation Notes

The visual duplication has been resolved by EcPageLayout + EcItemList. This task is specifically about the behavioural/state management layer.
