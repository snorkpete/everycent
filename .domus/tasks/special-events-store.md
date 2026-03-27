# Task: Special Events Store

**ID:** special-events-store
**Status:** done
**Branch:** task/special-events-store
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-26
**Parent:** migrate-special-events-screen-to-vue
**Depends on:** special-events-types-and-api-layer
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Create Pinia store for managing special events state

---

## Acceptance Criteria

- [ ] `specialEventStore.ts` using `defineStore('specialEvents', () => {...})` composition API pattern
- [ ] State: specialEvents (ref array), currentSpecialEvent (ref, nullable), loading (ref boolean), error (ref string, nullable)
- [ ] Actions: fetchAll(), fetchOne(id), create(data), update(id, data), remove(id), updateAllocations(id, data)
- [ ] Actions set loading/error state correctly; failed actions re-throw after setting error.value
- [ ] fetchOne populates currentSpecialEvent with the full event including allocations
- [ ] Full test coverage in `specialEventStore.spec.ts`
- [ ] Tests pass: `npx vitest run src/app/special-events/ --reporter=verbose`

---

## Implementation Notes

**Read these first for conventions:**
- `webclientv4/CLAUDE.md` and `webclientv4/docs/vue-coding-rules.md`

**Reference pattern to follow:**
- Store: `webclientv4/src/app/transactions/transactionStore.ts` + its spec
- Testing: `webclientv4/docs/testing-patterns.md`

**Guidance:**
- Follow the exact pattern: refs for state, async functions for actions, return public API at end
- Import from the types and API created in task 1 (`specialEvent.types.ts`, `specialEventApi.ts`)
- Run tests in worktree: `npx vitest run src/app/special-events/ --reporter=verbose`
