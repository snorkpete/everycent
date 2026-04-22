# Task: Add paid field to TransactionData type

**ID:** add-paid-field-to-transactiondata-type
**Status:** done
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-04-10
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The backend `TransactionSerializer` returns a `paid` boolean field (line 30) but the frontend `TransactionData` interface doesn't declare it. This means the field is silently dropped by TypeScript — any code accessing `transaction.paid` gets no type support.

---

## Acceptance Criteria

- [ ] `paid?: boolean` added to `TransactionData` interface in `transaction.types.ts`
- [ ] If a test factory exists for transactions, add `paid` there too
- [ ] Pre-commit checks pass (type-check + test suite)
- [ ] No new type errors introduced

---

## Implementation Notes

### Files to change
- `webclientv4/src/app/transactions/transaction.types.ts` — add `paid?: boolean` to `TransactionData` (after `status` field, near the other serializer-sourced fields)
- `webclientv4/src/test/factories/transactionFactory.ts` — add `paid` if the factory builds `TransactionData`

### Approach
- Add the field as optional (`?`) to match the existing convention in this interface
- Place it after `status` to mirror the serializer attribute order

### Risks
- None. Additive-only change.

### Commit scope
- Single commit
