# Task: Document AllocationData serializer variants

**ID:** document-allocationdata-serializer-variants
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

`AllocationData` in `transaction.types.ts` contains fields (`budget_name`, `allocation_category_name`) that only come from `SpecialEventAllocationSerializer`, not from the standard `AllocationSerializer`. Add a short inline comment noting this.

---

## Acceptance Criteria

- [ ] Comment added to `AllocationData` interface in `transaction.types.ts` noting which fields are `SpecialEventAllocationSerializer`-only
- [ ] No code changes — documentation only
- [ ] Pre-commit checks pass

---

## Implementation Notes

### Files to change
- `webclientv4/src/app/transactions/transaction.types.ts` — add a single-line comment above the `budget_name` / `allocation_category_name` fields

### Approach
- Check `SpecialEventAllocationSerializer` to confirm which fields it adds beyond the standard serializer
- Keep the comment short — one line max per the project's comment convention
- Single commit
