# Task: Special Event Detail Page

**ID:** special-event-detail-page
**Status:** done
**Branch:** task/special-event-detail-page
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-26
**Parent:** migrate-special-events-screen-to-vue
**Depends on:** special-events-store, special-events-list-page
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Create the detail page showing a single special event with its allocations

---

## Acceptance Criteria

- [ ] `SpecialEventDetailPage.vue` shows event name, budget_amount, actual_amount, start_date in a header/card
- [ ] Displays allocations in a table with columns: name, budget_name, allocation_category_name, amount, spent
- [ ] Table footer shows total spent
- [ ] "Edit Details" button opens the `SpecialEventForm.vue` dialog (from task 3) in edit mode
- [ ] "Adjust Allocations" button navigates to `/special-events/:id/allocations`
- [ ] "Back" button navigates to `/special-events`
- [ ] Route registered at `/special-events/:id`
- [ ] Loads event data via store.fetchOne(id) using route param
- [ ] Full test coverage in `SpecialEventDetailPage.spec.ts`
- [ ] Tests pass: `npx vitest run src/app/special-events/ --reporter=verbose`
- [ ] Icon-only buttons have `title` attributes

---

## Implementation Notes

**Read these first for conventions:**
- `webclientv4/CLAUDE.md` and `webclientv4/docs/vue-coding-rules.md`

**Reference patterns to follow:**
- Component: `webclientv4/src/app/transactions/TransactionsPage.vue`
- Testing: `webclientv4/docs/testing-patterns.md`

**Angular source (read for behavior parity):**
- `webclientv3/src/app/special-events/special-event/special-event.component.ts` + `.html` (detail page)
- `webclientv3/src/app/special-events/special-events-allocations-table/` (allocations table)

**Guidance:**
- Reuse `SpecialEventForm.vue` from task 3 for the edit dialog. If task 3 hasn't landed yet, create a minimal stub and note it needs replacement.
- The allocations table can be inline — follow the simplest approach unless reuse with task 5 is obvious
- Run tests in worktree: `npx vitest run src/app/special-events/ --reporter=verbose`
