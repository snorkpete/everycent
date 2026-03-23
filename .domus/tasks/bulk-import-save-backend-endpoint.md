# Task: Bulk import save backend endpoint

**ID:** bulk-import-save-backend-endpoint
**Status:** done
**Branch:** task/bulk-import-save-backend-endpoint
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-22
**Parent:** camt053-bank-statement-import
**Depends on:** import-preview-backend-endpoint
**Idea:** none
**Spec refs:** none

---

## What This Task Is

New endpoint that accepts confirmed transactions grouped by bank account after the user has reviewed the import preview. Saves transactions across multiple bank accounts in a single DB transaction (all-or-nothing). Re-validates everything server-side. Returns the standard transaction + bank account response for all affected accounts.

Unlike the existing `Transaction.update_with_params` (which does delete-all + create-all), this is **insert-only**. It only adds new transactions — existing transactions are untouched, duplicates (by `bank_ref`) are silently skipped.

---

## Acceptance Criteria

- [ ] New action `import_save` on `TransactionsController` — `POST /transactions/import_save`
- [ ] Uses same tenant scoping pattern as all other actions (`set_current_tenant_through_filter` + `before_action`)
- [ ] Re-validates server-side: budget exists, bank accounts exist, IBANs match `account_no`, transaction dates within budget period, `bank_ref` dedup check
- [ ] Duplicate `bank_ref` transactions (already in DB for that account) are silently skipped, not errored
- [ ] For each bank account: creates only new transactions (insert-only). Does NOT delete or modify existing transactions. This is NOT the `update_with_params` pattern.
- [ ] All bank account saves wrapped in a single `ActiveRecord::Base.transaction` — if any account fails, everything rolls back
- [ ] CAMT-imported transactions have `camt_imported: true` set
- [ ] `bank_ref` round-trips correctly: CAMT transactions keep their `AcctSvcrRef`, the `before_create` callback leaves pre-set values alone
- [ ] On success: returns all transactions for the budget period per account (existing + newly created), using existing serializers, plus balances (`current_balance`, `net`, `projected_balance`) — same shape as preview response. Post-save, `net` will be 0 and `projected_balance` = `current_balance`. No `import_status` field on transactions after successful save.
- [ ] On validation error: returns 422 with descriptive error message. Include `import_status` per transaction where relevant (e.g. which transaction had the out-of-period date).
- [ ] Empty input: if `bank_accounts` is empty or all transactions are duplicates, succeeds with zero creates and returns current balances as-is.
- [ ] RSpec coverage: multi-account save, rollback on failure, dedup skip, balance computation, tenant scoping, empty input, validation error responses

## Scope Boundaries

- Does NOT handle allocation assignment — transactions are saved with `allocation_id: nil` (v2 auto-suggest sets this during preview, before save)
- Does NOT replace the existing single-account `create`/`update_all` actions — those continue to work as before

---

## Implementation Notes

### Request shape

Same as preview endpoint:
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
          "status": "paid",
          "camt_imported": true
        }
      ]
    }
  ]
}
```

### Response shape

Same shape as preview response for consistency:
```json
{
  "bank_accounts": [
    {
      "bank_account_id": 9600001,
      "current_balance": 55247,
      "net": 0,
      "projected_balance": 55247,
      "transactions": [ ...serialized transactions... ]
    }
  ]
}
```

### Implementation approach

```ruby
def import_save
  budget = Budget.find(params[:budget_id])

  ActiveRecord::Base.transaction do
    params[:bank_accounts].each do |account_params|
      bank_account = BankAccount.find(account_params[:bank_account_id])
      validate_iban_match!(bank_account, account_params[:iban])

      existing_refs = Transaction.where(bank_account_id: bank_account.id)
                                 .where.not(bank_ref: nil)
                                 .pluck(:bank_ref).to_set

      account_params[:transactions].each do |txn_params|
        next if existing_refs.include?(txn_params[:bank_ref])
        validate_in_budget_period!(txn_params[:transaction_date], budget)

        Transaction.create!(
          permitted_import_fields(txn_params).merge(
            bank_account_id: bank_account.id,
            camt_imported: true
          )
        )
      end
    end
  end

  # return updated transactions + balances for all accounts
end
```

**Important:** Use strong parameters or an explicit whitelist (`permitted_import_fields`) when creating transactions — do NOT pass raw params directly to `create!`. Only permit: `transaction_date`, `description`, `withdrawal_amount`, `deposit_amount`, `bank_ref`, `status`.

Note: insert-only. Existing transactions are never deleted or modified.

### Reuse from preview endpoint

The preview and save endpoints share validation logic (budget check, IBAN check, period check, dedup check). Extract these into shared private methods or a service object that both actions use. The preview endpoint was built first — the save endpoint should refactor shared logic out of it rather than duplicating.

### File locations

- Controller: `app/controllers/transactions_controller.rb` — add `import_save` action
- Route: `config/routes.rb` — add `post '/transactions/import_save'`
- Specs: `spec/controllers/transactions_controller_spec.rb` — add context for import_save
- Shared logic may warrant a service object in `app/services/` if the controller gets too large
