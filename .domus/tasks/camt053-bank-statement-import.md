# Task: CAMT.053 bank statement import

**ID:** camt053-bank-statement-import
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-03-22
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

New feature: import transactions from an ABN AMRO CAMT.053 zip export (ISO 20022 format) via a dedicated import page. Replaces the current copy-paste workflow with a file-based import that handles multiple bank accounts in a single zip.

### Key Design Decisions

- **Frontend parsing**: Zip + XML parsed in browser using JSZip + DOMParser (lazy-loaded). No file upload to server.
- **Deduplication**: `external_transaction_id` column on transactions. CAMT transactions use `AcctSvcrRef` (bank-assigned unique ID). Manual/other transactions use `MAN-{random_hex}` via `before_create` callback.
- **`is_manual` flag**: Boolean on transactions to distinguish manual entries from imported ones.
- **Account matching**: `account_no` field populated with full IBAN. Accounts without IBANs are skipped. Unrecognized IBANs in the CAMT file are flagged but skipped.
- **Description extraction**: Two patterns based on transaction type:
  - BEA/GEA (card payments N426, N200, N445): Merchant name extracted from fixed-width `AddtlNtryInf`
  - SEPA (N658, N654, N247, N944): `/NAME/` field from `AddtlNtryInf`
  - International (N785, N787): Best-effort, use full `AddtlNtryInf` trimmed
- **Preview grouped by account**: Shows new transactions, duplicates (greyed out), out-of-period (marked deleted). Balance per account shown for manual verification against bank website.
- **Bulk save endpoint**: One new endpoint, all-or-nothing via DB transaction wrapping.
- **Budget scoping**: Only transactions within the current budget's date range are imported. Out-of-range transactions shown but marked as deleted.
- **Split transactions**: User keeps original bank transaction (adjusts amount) + adds manual transactions. Manual transactions have `MAN-` IDs, untouched by dedup.

### V2: Allocation Auto-Suggest

During preview, suggest allocations by fuzzy-matching transaction descriptions against previous budget's transactions. Two-hop lookup: description match -> previous allocation -> current allocation by name. Auto-assigned, user fixes exceptions. Not a blocker for v1.

### CAMT.053 File Structure

- Zip contains daily XML files, one per account per day
- Filename: `{customer_id}_{account_number}_{date}.xml`
- 9 transaction type codes (N426, N200, N445, N658, N654, N247, N944, N785, N787)
- Every entry has `AcctSvcrRef` (unique bank reference) and `AddtlNtryInf` (description text)
- Amounts in EUR with 18-char zero-padded format, need conversion to cents

### Accounts in scope (from sample export)

| IBAN | Everycent Account |
|---|---|
| NL00ABNA0000000001 | Joint Account |
| NL00ABNA0000000005 | (to be mapped) |
| NL00ABNA0000000003 | (to be mapped) |
| NL00ABNA0000000002 | (to be mapped) |
| NL00ABNA0000000004 | (to be mapped) |

---

## Acceptance Criteria

- [ ] `external_transaction_id` and `is_manual` columns added to transactions table
- [ ] `before_create` callback assigns `MAN-{hex}` when `external_transaction_id` is blank
- [ ] `account_no` populated with IBAN for all active ABN AMRO accounts
- [ ] CAMT.053 zip can be parsed in the browser (JSZip + DOMParser)
- [ ] Descriptions extracted correctly for all transaction types (validated against existing Everycent data)
- [ ] New `/import` route with file input and grouped-by-account preview
- [ ] Preview endpoint returns duplicate flags, period flags, and unmatched IBAN flags
- [ ] Bulk save endpoint creates transactions in a single DB transaction (all-or-nothing)
- [ ] Balance per account shown after preview for manual verification
- [ ] Manual transactions (`is_manual: true`) are untouched by import/dedup
- [ ] Out-of-budget-period transactions shown but marked as deleted in preview

---

## Implementation Notes

- Sample CAMT export analyzed: 37 XML files, 5 accounts, ~187 transactions, Feb 23 – Mar 20 2026
- Description extraction validated against real Everycent data — most match exactly; some truncated in existing data due to copy-paste from bank UI
- All currencies in sample are EUR; non-EUR would need flagging but is unlikely for personal banking
- First import: manually wipe current month's transactions, then import fresh from CAMT
