# Task: Add percentage field to AllocationCategoryData

**ID:** add-percentage-field-to-allocationcategorydata
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

The backend `AllocationCategorySerializer` returns `id`, `name`, and `percentage`, but the frontend `AllocationCategoryData` interface only declares `id` and `name`. The `percentage` field (integer) is silently untyped.

---

## Acceptance Criteria

- [ ] `percentage?: number` added to `AllocationCategoryData` interface in `allocationCategory.types.ts`
- [ ] Pre-commit checks pass (type-check + test suite)
- [ ] No new type errors introduced

---

## Implementation Notes

### Files to change
- `webclientv4/src/app/allocation-categories/allocationCategory.types.ts` — add `percentage?: number` to `AllocationCategoryData`

### Approach
- Add the field as optional (`?`) to match the existing convention
- The backend schema comment confirms it's an integer column

### Risks
- None. Additive-only change.

### Commit scope
- Single commit
