# Task: Special Events Types and API Layer

**ID:** special-events-types-and-api-layer
**Status:** done
**Branch:** task/special-events-types-and-api-layer
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-26
**Parent:** migrate-special-events-screen-to-vue
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Create TypeScript types and API module for the special events feature

---

## Acceptance Criteria

- [ ] `specialEvent.types.ts` defines `SpecialEventData` interface with: id (number), name (string), budget_amount (number), actual_amount (number), start_date (string, optional), allocations (SpecialEventAllocationData[], optional)
- [ ] `SpecialEventAllocationData` interface with: id, name, amount, budget_id, spent, allocation_category_id, budget_name, allocation_category_name (match what the backend serializer returns)
- [ ] `specialEventApi.ts` with methods: getAll(), getOne(id), create(data), update(id, data), delete(id), updateAllocations(id, data)
- [ ] API methods wrap payloads in `{ special_event: {...} }` for POST/PUT (match Angular service pattern)
- [ ] The updateAllocations method sends `{ special_event: { allocation_ids: number[], actual_amount: number } }`
- [ ] Full test coverage for `specialEventApi.spec.ts` and `specialEvent.types.ts` (type tests optional, API tests required)
- [ ] All files live under `webclientv4/src/app/special-events/`
- [ ] Tests pass: `npx vitest run src/app/special-events/ --reporter=verbose`

---

## Implementation Notes

**Read these first for conventions:**
- `webclientv4/CLAUDE.md` and `webclientv4/docs/vue-coding-rules.md`

**Reference patterns to follow:**
- API: `webclientv4/src/app/bank-accounts/bankAccountApi.ts` + its spec
- Types: `webclientv4/src/app/transactions/transaction.types.ts`
- Testing: `webclientv4/docs/testing-patterns.md`

**Read for API shape and behavior parity:**
- Backend serializers: `app/serializers/special_event_serializer.rb`, `app/serializers/special_event_allocation_serializer.rb`
- Backend controller: `app/controllers/special_events_controller.rb`
- Angular API service: `webclientv3/src/app/special-events/special-events.service.ts`
- Angular types: `webclientv3/src/app/special-events/special-event-data.model.ts`

**Other:**
- Use `apiGateway` from `src/api/api-gateway.ts`
- Run tests in worktree: `npx vitest run src/app/special-events/ --reporter=verbose`
