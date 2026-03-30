# Task: Extract shared test stubs (DialogStub etc)

**ID:** extract-shared-test-stubs-dialogstub-etc
**Status:** done
**Autonomous:** false
**Priority:** high
**Captured:** 2026-03-28
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

TEST-03: DialogStub duplicated in 5+ test files. Other stubs (RouterLink, FileUpload) also repeated. Extract to src/test/stubs.ts. Introduce now, migrate existing tests gradually.

---

## Acceptance Criteria

- [x] DialogStub extracted to `src/test/stubs.ts` and imported by 13 spec files

---

## Implementation Notes

**Completed scope:** Only DialogStub (PrimeVue `Dialog`) had real duplication (5+ files). It was extracted and all duplicates migrated.

**Out of scope (verified 2026-03-29):** The original task description assumed FileUploadStub, ProgressSpinnerStub, and RouterLinkStub were also duplicated. On inspection, each is used in only one spec file — no duplication exists. The 4 "inline dialog stubs" in InstitutionsPage, BankAccountsPage, AllocationCategoriesPage, and FutureBudgetsPage are stubs for *page-specific edit dialog components* (e.g. `InstitutionEditDialog`), not PrimeVue's `Dialog` — they are correctly defined inline with component-specific props.
