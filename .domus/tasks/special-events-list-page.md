# Task: Special Events List Page

**ID:** special-events-list-page
**Status:** done
**Branch:** task/special-events-list-page
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-26
**Parent:** migrate-special-events-screen-to-vue
**Depends on:** special-events-store
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Create the main special events list page with table, add/delete actions, and route

---

## Acceptance Criteria

- [ ] `SpecialEventsPage.vue` displays a DataTable with columns: name, start_date, budget_amount, actual_amount, difference (calculated: budget - actual), actions
- [ ] "Add Special Event" button opens a Dialog with form fields: name (required text), budget_amount (required money, EcMoneyField), start_date (optional date via PrimeVue DatePicker)
- [ ] Form dialog title shows "Add Special Event" for new, "Edit Special Event" for edit
- [ ] Delete button with confirmation dialog removes the event and refreshes the list
- [ ] View button navigates to `/special-events/:id`
- [ ] Form component is extracted as `SpecialEventForm.vue` so detail page can reuse it
- [ ] Route registered in `src/router/index.ts` at path `/special-events` (inside authenticated layout)
- [ ] Nav menu entry added for Special Events
- [ ] Full test coverage for `SpecialEventsPage.spec.ts` and `SpecialEventForm.spec.ts`
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
- `webclientv3/src/app/special-events/special-events.component.ts` + `.html` (list page)
- `webclientv3/src/app/special-events/special-event-edit-details-form/` (form dialog)

**Guidance:**
- Use PrimeVue DataTable, Dialog, Button, DatePicker
- Use `EcMoneyField` for money inputs (native input, not PrimeVue — see CLAUDE.md)
- `EcMoneyField` binds to strings, so the form needs a separate `FormData` type where `budget_amount` is a string. Convert to number before sending to the API.
- Use `useNotifications()` for success/error toasts
- PrimeVue Dialog must be stubbed in tests (see testing-patterns.md for DialogStub)
- Check existing route registration and nav menu patterns in `src/router/index.ts` and the nav component
- Run tests in worktree: `npx vitest run src/app/special-events/ --reporter=verbose`
