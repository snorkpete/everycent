# Task: Import preview backend endpoint

**ID:** import-preview-backend-endpoint
**Status:** done
**Branch:** task/import-preview-backend-endpoint
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-22
**Parent:** camt053-bank-statement-import
**Depends on:** db-migration-external_transaction_id-and-is_manual
**Idea:** none
**Spec refs:** none

---

## What This Task Is

New endpoint that accepts parsed CAMT transactions grouped by bank account, validates them server-side, checks for duplicates against existing DB transactions, and returns the enriched list with status flags and balance projections. The frontend uses this response to display the import preview before the user confirms the save.

The frontend parser has already done IBAN matching, period filtering, and status assignment — but the server re-validates on principle, and only the server can check for duplicates against the DB.

---

## Acceptance Criteria

- [ ] New controller action (e.g. `POST /transactions/import_preview`) accepts full transaction data grouped by bank account
- [ ] Controller uses `set_current_tenant_through_filter` + `before_action { set_current_tenant current_household }` — this is non-negotiable. All model lookups are automatically scoped to the authenticated user's household. Do NOT add manual household checks; rely on `acts_as_tenant`.
- [ ] Validates budget exists (via `Budget.find` — tenant-scoped, returns 404 if not in household)
- [ ] Validates each `bank_account_id` exists (via `BankAccount.find` — tenant-scoped)
- [ ] Validates each `iban` matches the `account_no` on the corresponding bank account record. Mismatch returns a validation error.
- [ ] Validates transaction dates are valid dates and amounts are non-negative integers
- [ ] Checks each `bank_ref` against existing transactions for that `bank_account_id`. Marks matches as `import_status: "duplicate"`.
- [ ] Re-validates transaction dates against budget `start_date..end_date`. Transactions outside the range are flagged `import_status: "out_of_period"`. Server is authoritative — overrides whatever the frontend sent.
- [ ] New (non-duplicate, in-period) transactions are flagged `import_status: "new"`
- [ ] Returns three balance values per bank account: `current_balance` (Everycent's existing balance), `net` (sum of new incoming transactions), `projected_balance` (current + net)
- [ ] Internal logic split into modular, independently testable functions (e.g. `check_duplicates`, `validate_period`, `compute_projected_balance`)
- [ ] RSpec coverage for each validation, dedup logic, balance computation, and the combined endpoint

## Scope Boundaries

- Does NOT save any transactions — preview only
- Does NOT do allocation suggestions — that's the v2 auto-suggest task
- Does NOT handle IBAN-to-bank-account resolution — the frontend already did that; this endpoint validates the mapping

---

## Implementation Notes

### Request shape

```json
{
  "budget_id": 213,
  "bank_accounts": [
    {
      "bank_account_id": 9600001,
      "iban": "NL00ABNA0000000001",
      "transactions": [
        {
          "transaction_date": "2026-03-20",
          "description": "Albert Heijn 2242,PAS363",
          "withdrawal_amount": 487,
          "deposit_amount": 0,
          "bank_ref": "0320162157706096",
          "status": "paid"
        }
      ]
    }
  ]
}
```

### Response shape

```json
{
  "bank_accounts": [
    {
      "bank_account_id": 9600001,
      "current_balance": 69031,
      "net": -13784,
      "projected_balance": 55247,
      "transactions": [
        {
          "transaction_date": "2026-03-20",
          "description": "Albert Heijn 2242,PAS363",
          "withdrawal_amount": 487,
          "deposit_amount": 0,
          "bank_ref": "0320162157706096",
          "status": "paid",
          "import_status": "new"
        }
      ]
    }
  ]
}
```

`import_status` values: `"new"`, `"duplicate"`, `"out_of_period"`

### Balance computation

Three values per bank account:
- `current_balance`: Uses existing `BankAccount#current_balance` method — `closing_balance + sum(deposits - withdrawals)` for all transactions after `closing_date`
- `projected_balance`: `current_balance + net` — what Everycent would show after saving the new transactions
- `net`: Sum of net amounts (`deposit - withdrawal`) of `"new"` incoming transactions only — duplicates and out-of-period excluded

### Tenant scoping pattern

This action lives on the existing `TransactionsController`, which already has the tenant scoping boilerplate. All `Budget.find`, `BankAccount.find`, `Transaction.where(...)` calls are automatically scoped to the household. Never bypass this with `.unscoped` or manual `household_id` filters.

### Duplicate check implementation

```ruby
# For each bank account, fetch existing bank_refs in one query
existing_refs = Transaction.where(bank_account_id: bank_account_id)
                           .where.not(bank_ref: nil)
                           .pluck(:bank_ref)
                           .to_set

# Then flag each incoming transaction
incoming.each do |txn|
  txn[:import_status] = existing_refs.include?(txn[:bank_ref]) ? "duplicate" : "new"
end
```

### File locations

- Controller: `app/controllers/transactions_controller.rb` — add `import_preview` action to existing controller
- Route: `config/routes.rb` — add `post '/transactions/import_preview'` (or nest under existing transactions resource)
- Specs: `spec/controllers/transactions_controller_spec.rb` — add context for import_preview

### Testing approach

- Use FactoryBot to create budget, bank accounts, and existing transactions with known `bank_ref` values
- Test dedup: send transactions with refs that exist and don't exist, verify `import_status` flags
- Test period validation: send dates inside and outside budget range
- Test IBAN validation: send mismatched IBAN, verify error
- Test balance computation: create known transactions, verify `current_balance` and `projected_balance`
- Test tenant scoping: verify a different household's data is not accessible
