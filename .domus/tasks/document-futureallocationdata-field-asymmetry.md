# Task: Document FutureAllocationData field asymmetry

**ID:** document-futureallocationdata-field-asymmetry
**Status:** done
**Autonomous:** true
**Priority:** low
**Captured:** 2026-04-10
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

`FutureAllocationData` in `futureBudgets.types.ts` intentionally omits `spent` and `allocation_class` compared to `AllocationData`. Add a short comment noting the asymmetry is intentional so future developers don't "fix" it.

---

## Acceptance Criteria

- [ ] Comment added to `FutureAllocationData` interface noting intentional omission of `spent` and `allocation_class`
- [ ] No code changes — documentation only
- [ ] Pre-commit checks pass

---

## Implementation Notes

### Files to change
- `webclientv4/src/app/budgets/future-budgets/futureBudgets.types.ts` — add a single-line comment

### Approach
- Keep comment short — one line, explains WHY not WHAT
- Single commit
