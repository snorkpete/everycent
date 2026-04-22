# Task: Deduplicate SinkFundAllocationData type definition

**ID:** deduplicate-sinkfundallocationdata-type-definition
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

`SinkFundAllocationData` is defined identically in both `transaction.types.ts` (line 27) and `sinkFund.types.ts` (line 1). Canonical home is `sinkFund.types.ts`. Remove the duplicate from `transaction.types.ts` and update imports.

---

## Acceptance Criteria

- [x] `SinkFundAllocationData` removed from `transaction.types.ts`
- [x] `transaction.types.ts` imports `SinkFundAllocationData` from `sinkFund.types.ts` and re-exports it (so existing consumers of `transaction.types` don't break)
- [x] All files that import `SinkFundAllocationData` still compile
- [x] Pre-commit checks pass (type-check + test suite)

---

## Implementation Notes

### Files to change
- `webclientv4/src/app/transactions/transaction.types.ts` — remove the interface definition, add `import type { SinkFundAllocationData } from '../sink-funds/sinkFund.types'` and re-export it
- No other files need changes — consumers importing from `transaction.types.ts` keep working via the re-export

### Current consumers importing from `transaction.types.ts`
- `transactionStore.ts`, `transactionApi.ts`, `TransactionListMobile.spec.ts`, `AccountTransferDialog.spec.ts`, `TransactionList.spec.ts`

### Approach
- Re-export preserves backward compatibility — no import churn across consumers
- Single commit
