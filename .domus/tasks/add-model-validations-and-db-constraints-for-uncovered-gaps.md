# Task: Add model validations and DB constraints for uncovered gaps

**ID:** add-model-validations-and-db-constraints-for-uncovered-gaps
**Status:** refined
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-04-12
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The backend review found columns with no validation at either the model or DB layer. These need model validations (quick, safe) plus DB migrations (belt-and-suspenders).

**Model validations to add:**
- `Allocation`: validates amount (numericality, integer), name (presence)
- `Income`: validates amount (numericality, integer), name (presence)
- `SinkFundAllocation`: validates amount (numericality, integer)
- `Household`: validates name (presence)
- `BankAccount`: validates inclusion on account_type (normal, credit_card, sink_fund), account_category (asset, liability, current), status (open, closed)
- `AllocationCategory`: validates percentage (numericality, 0-100 range)
- `Setting`: validates uniqueness on household_id

**DB migrations:**
- `transactions.status`: add default 'paid', NOT NULL
- `settings.household_id`: add unique index
- NOT NULL on: allocations.name, allocations.amount, incomes.name, incomes.amount, sink_fund_allocations.amount, households.name

---

## Acceptance Criteria

- [ ] All listed model validations added
- [ ] DB migrations created and run successfully
- [ ] Existing data doesn't violate new constraints (check with a data audit query before migrating)
- [ ] Existing backend tests pass (`bundle exec rspec`)
- [ ] No nil amounts can enter allocations, incomes, or sink_fund_allocations
- [ ] No invalid account_type/account_category/status strings can be saved on bank_accounts
