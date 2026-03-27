# Task: Special Event Allocation Editor

**ID:** special-event-allocation-editor
**Status:** done
**Branch:** task/special-event-allocation-editor
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-26
**Parent:** migrate-special-events-screen-to-vue
**Depends on:** special-events-store, special-event-detail-page
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Create the allocation editor for assigning/removing allocations to a special event

---

## Acceptance Criteria

- [ ] `SpecialEventAllocationsEditor.vue` at route `/special-events/:id/allocations`
- [ ] Panel 1 "Current Allocations": table of assigned allocations with remove button per row, total spent in footer
- [ ] Panel 2 "Assign Allocations": budget dropdown + optional category filter, shows available allocations grouped by category with add button
- [ ] Budget dropdown loads from budgetApi (or budget store if available)
- [ ] Category dropdown loads from budget API's allocation categories
- [ ] Available allocations grouped by category with category header rows
- [ ] Add button disabled if allocation already assigned
- [ ] Remove button removes allocation from current list
- [ ] Save button sends updateAllocations with allocation_ids array and calculated actual_amount (sum of spent)
- [ ] Cancel button navigates back to `/special-events/:id`
- [ ] URL query params sync: budget_id and allocation_category_id reflected in URL, restored on load
- [ ] Route registered at `/special-events/:id/allocations`
- [ ] Full test coverage in `SpecialEventAllocationsEditor.spec.ts`
- [ ] Tests pass: `npx vitest run src/app/special-events/ --reporter=verbose`
- [ ] Icon-only buttons have `title` attributes

---

## Implementation Notes

**Read these first for conventions:**
- `webclientv4/CLAUDE.md` and `webclientv4/docs/vue-coding-rules.md`

**Reference patterns to follow:**
- URL sync: `webclientv4/src/app/transactions/TransactionSearchForm.vue` (CLAUDE.md documents this pattern)
- Testing: `webclientv4/docs/testing-patterns.md`

**Angular source (study carefully — this is the most complex component):**
- `webclientv3/src/app/special-events/special-event-edit-allocations/` (allocation editor)
- `webclientv3/src/app/special-events/special-events-allocations-table/` (table reuse pattern)

**Guidance:**
- Budget/category data: check if `budgetApi.ts` or a budget store already exists in webclientv4; use what's available
- Grouping logic: uncategorized allocations first, then each category as a header row, only show categories that have allocations
- `isAllocationAssigned()` checks if allocation ID is already in the current allocations array
- `calculateActualAmount()` sums `allocation.spent` from all assigned allocations
- Ensure thorough test coverage of add/remove/save/grouping logic — this is the highest-risk component
- Run tests in worktree: `npx vitest run src/app/special-events/ --reporter=verbose`
