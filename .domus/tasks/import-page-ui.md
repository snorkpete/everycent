# Task: Import page UI

**ID:** import-page-ui
**Status:** done
**Branch:** task/import-page-ui
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-22
**Parent:** camt053-bank-statement-import
**Depends on:** camt053-frontend-parser, import-preview-backend-endpoint, bulk-import-save-backend-endpoint
**Idea:** none
**Spec refs:** none

---

## What This Task Is

New Vue page for importing CAMT.053 bank statement files. Wires together the frontend parser, preview endpoint, and save endpoint into a complete import flow: upload zip → parse → preview with dedup/validation → save → view results.

---

## Acceptance Criteria

### Route and Navigation
- [ ] New route `/import` with Vue page component
- [ ] Accessible from: (a) link on the transactions screen, (b) new menu item (goes to current budget)
- [ ] Budget ID inherited from transactions screen if navigating from there, or auto-selects current budget from menu
- [ ] Validation warning shown if the selected budget is not the current (open) budget

### File Input
- [ ] PrimeVue `FileUpload` component for zip file selection (drag-and-drop support)
- [ ] Accepts `.zip` files only
- [ ] File input remains available after save for additional imports
- [ ] Selecting a new file resets the preview

### Parse and Preview Flow
- [ ] On file select: calls frontend parser (lazy-loaded via dynamic `import()`) with bank accounts and budget dates
- [ ] Then calls preview endpoint with parsed data
- [ ] Single combined "Processing..." loading state for both steps
- [ ] Errors from parsing or preview displayed as notifications

### Preview Display
- [ ] Results grouped by bank account — each group shows:
  - Account name
  - Balance summary: current balance, net change, projected balance
  - Transaction table with columns: date, description, withdrawal, deposit, allocation (empty in v1 but shown), status
- [ ] Visual indicators per transaction based on `import_status`:
  - `"new"` — normal display
  - `"duplicate"` — greyed out / muted
  - `"out_of_period"` — marked as deleted (same visual pattern as existing transaction screen)
- [ ] Delete toggle per transaction row (same pattern as existing transaction screen)
- [ ] Unmatched IBANs shown as summary line: "IBAN NLxx... — no matching account, N transactions skipped" (no transaction detail)

### Save Flow
- [ ] "Import" / "Save" button triggers save endpoint with confirmed (non-deleted, non-duplicate) transactions
- [ ] All-or-nothing — success or error, no partial saves
- [ ] On success: show totals/summary per account, link to transactions screen (no account param — defaults to joint account)
- [ ] On error: show 422 error message from server
- [ ] File input stays available for another upload after save

### Store
- [ ] Pinia store for import page state and logic (follows project pattern, easier to test)
- [ ] Store manages: parsed results, preview response, loading states, save state
- [ ] Bank accounts fetched via existing bank account API (needs account_no for IBAN matching)
- [ ] Budget fetched via existing budget API (needs start/end dates)

### Testing
- [ ] Vitest specs for the store (parse flow, preview flow, save flow, error handling, loading states)
- [ ] Component specs for key interactions (file select triggers parse, save button triggers save, delete toggle works)

## Scope Boundaries

- Does NOT implement allocation auto-suggest (v2) — allocation column shown but empty
- Does NOT validate closed budgets server-side — future concern
- Does NOT implement per-account navigation after save — single link to transactions screen

---

## Implementation Notes

### User Flow

```
Menu → /import (current budget)
  OR
Transactions screen → /import (selected budget)
  ↓
File input (PrimeVue FileUpload, .zip only)
  ↓
Parse zip (frontend parser, lazy-loaded) + call preview endpoint
  ↓
Preview: grouped by account
  - Account name + balances
  - Transaction table (date, desc, withdrawal, deposit, allocation, status)
  - New = normal, Duplicate = greyed, Out-of-period = deleted style
  - Delete toggle per row
  - Unmatched IBANs = summary line
  ↓
"Import" button → save endpoint (non-deleted, non-duplicate only)
  ↓
Success: totals + link to transactions screen
File input stays for another upload
```

### File locations

- Page component: `webclientv4/src/app/import/ImportPage.vue`
- Store: `webclientv4/src/app/import/importStore.ts`
- Store specs: `webclientv4/src/app/import/importStore.spec.ts`
- Component specs: `webclientv4/src/app/import/ImportPage.spec.ts`
- API module: `webclientv4/src/app/import/importApi.ts` (preview + save endpoint calls)
- Route: add to `webclientv4/src/router/index.ts`

### Bank accounts for IBAN matching

The parser needs bank accounts with `account_no` (IBAN) and `account_type` (for paid/unpaid status). Use the existing `bankAccountApi` but may need an endpoint that returns `account_no` — check if the serializer includes it. If not, add it to the serializer.

### Lazy-loading JSZip

The parser imports `jszip` which is ~45KB gzipped. Lazy-load the parser module via `const { parseCamt053Zip } = await import('./transactions/importers/camt053Parser')` so it's not in the main bundle.

### Reference implementations

- Store pattern: `transactionStore.ts`
- API pattern: `bankAccountApi.ts`
- Component pattern: `TransactionsPage.vue`
- Delete toggle pattern: existing transaction row in transactions screen
- See `webclientv4/docs/vue-coding-rules.md` for detailed coding rules
