# Task: CAMT.053 frontend parser

**ID:** camt053-frontend-parser
**Status:** done
**Branch:** task/camt053-frontend-parser
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-22
**Parent:** camt053-bank-statement-import
**Depends on:** db-migration-external_transaction_id-and-is_manual
**Idea:** none
**Spec refs:** none

---

## What This Task Is

TypeScript module that parses a CAMT.053 zip file (ABN AMRO bank statement export) and returns structured transaction data grouped by IBAN, ready for display and server submission.

The parser receives:
- A `File` (the zip from file input)
- Bank accounts with their IBANs and account types (for matching + status logic)
- Budget start/end dates (for period filtering)

It returns `TransactionData[]` grouped by IBAN, with `bank_account_id`, `bank_ref`, `status`, and `deleted` flags already set.

---

## Acceptance Criteria

- [ ] Extracts all `.xml` files from a zip using JSZip (mocked in tests)
- [ ] Parses CAMT.053 XML using DOMParser and extracts entries from `Stmt/Ntry` elements
- [ ] Groups transactions by owner IBAN (from `Stmt/Acct/Id/IBAN`)
- [ ] Sets `bank_account_id` by matching IBAN to provided bank accounts via `account_no` field
- [ ] Transactions with unmatched IBANs get `bank_account_id: undefined` (flagged in UI, not dropped)
- [ ] Extracts `bank_ref` from `AcctSvcrRef` (present on every entry)
- [ ] Deduplicates entries across XML files by `AcctSvcrRef` (same ref in two files = keep one)
- [ ] Converts amounts to cents (integer) from the zero-padded EUR format (e.g. `000000000000004.87` → `487`)
- [ ] Sets `withdrawal_amount` / `deposit_amount` based on `CdtDbtInd` (DBIT = withdrawal, CRDT = deposit)
- [ ] Sets `transaction_date` from `BookgDt/Dt`
- [ ] Marks transactions outside budget period as `deleted: true`
- [ ] Sets `status: 'unpaid'` for credit card accounts, `'paid'` for all others
- [ ] Description extraction — two patterns:
  - BEA/GEA card payments (N426, N200, N445): Extract merchant name from `AddtlNtryInf` by splitting on multi-space gaps (merchant is between first and second gap). Keep `,PASxxx` suffix.
  - SEPA types (N658, N654, N247, N944): Use truncated name from `TxDtls/RltdPties/Cdtr/Nm` or `Dbtr/Nm` (matches what the bank UI shows, ~24 char truncation)
  - International (N785, N787): Best-effort — use full `AddtlNtryInf` trimmed
- [ ] Returns output typed as `CamtParseResult` (see interface below)
- [ ] All logic covered by vitest specs using sample XML string fixtures (JSZip mocked)

## Scope Boundaries

- Does NOT make any API calls — pure data transformation
- Does NOT handle lazy-loading wiring — that's the import page's job
- Does NOT check duplicates against the database — that's the preview endpoint's job
- Does NOT set `allocation_id` or `sink_fund_allocation_id` — those are left undefined

---

## Implementation Notes

### Output interface

```typescript
interface CamtAccountResult {
  iban: string;
  bankAccountId: number | undefined;  // undefined if IBAN not matched
  transactions: TransactionData[];
}

interface CamtParseResult {
  accounts: CamtAccountResult[];
}
```

### Input interface

```typescript
interface CamtParserInput {
  file: File;
  bankAccounts: { id: number; accountNo: string; accountType: string }[];
  startDate: string;  // budget start date, ISO format
  endDate: string;    // budget end date, ISO format
}
```

### Description extraction details

**BEA/GEA pattern** (`AddtlNtryInf` starts with `BEA` or `GEA`):
```
"BEA, Betaalpas                  Albert Heijn 2242,PAS363        NR:BS159644, 23.02.26/12:56     ALMERE"
```
Split on 2+ consecutive spaces → take second segment → `"Albert Heijn 2242,PAS363"`. Trim trailing spaces.

**SEPA pattern** (`AddtlNtryInf` contains `/NAME/`):
Use `TxDtls/RltdPties/Cdtr/Nm` or `TxDtls/RltdPties/Dbtr/Nm` (whichever is present). This is the truncated version (~24 chars) that matches what's in the bank's web UI and in existing Everycent data.

Fallback: if `TxDtls` is not present, extract `/NAME/value` from `AddtlNtryInf`.

**International (N785, N787)**: No structured data. Use full `AddtlNtryInf` trimmed. Rare (1-2 per month).

### Transaction type identification

Transaction type is in `BkTxCd/Prtry/Cd`. But for description extraction, we only need to distinguish BEA/GEA vs SEPA vs other:
- Check if `AddtlNtryInf` starts with `BEA` or `GEA` → card payment pattern
- Check if `NtryDtls/TxDtls` exists → SEPA pattern (use structured name)
- Otherwise → best-effort from `AddtlNtryInf`

### File locations

- Parser module: `webclientv4/src/app/transactions/importers/camt053Parser.ts`
- Specs: `webclientv4/src/app/transactions/importers/camt053Parser.spec.ts`
- Follows same directory structure as existing importers (`abnAmroBankImporter.ts`, etc.)

### Dependencies

- `jszip` npm package — must be added to `webclientv4/package.json`
- No dependency on DB migration task — this is pure frontend code

### Testing approach

- Mock JSZip: test function receives extracted XML strings, not actual zip files
- Create minimal CAMT.053 XML fixtures as string constants in spec file
- Test each description extraction pattern with real-world samples
- Test amount conversion, date extraction, dedup, period filtering, IBAN matching, status assignment
- Test unmatched IBAN scenario
