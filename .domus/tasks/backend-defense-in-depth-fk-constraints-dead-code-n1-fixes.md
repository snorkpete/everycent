# Task: Backend defense-in-depth: FK constraints, dead code, N+1 fixes

**ID:** backend-defense-in-depth-fk-constraints-dead-code-n1-fixes
**Status:** deferred
**Autonomous:** false
**Priority:** low
**Captured:** 2026-04-12
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Cleanup and hardening from the comprehensive backend review. All items here are already covered at the model layer or are code quality issues — lower risk than the other review tasks, but still worth doing.

**FK constraints (migrations):**
- allocations → budgets, allocation_categories, bank_accounts
- incomes → budgets, bank_accounts
- transactions → bank_accounts, allocations, sink_fund_allocations, payees
- sink_fund_allocations → bank_accounts
- recurring_allocations → allocation_categories, bank_accounts
- recurring_incomes → bank_accounts
- bank_accounts → users, institutions
- settings → bank_accounts (primary_budget_account_id), allocation_categories (default_allocation_category_id_for_special_events)

**NOT NULL migrations** (already validated at model layer):
- bank_accounts.name, allocation_categories.name, institutions.name, special_events.name, budgets.start_date

**Dead code removal:**
- Duplicate `has_many :bank_accounts` on Household (line 13,16) and User (line 42,45)
- Empty callbacks: Allocation#fix_name, AllocationCategory#fix_name, Institution#fix_name
- Dead methods: Transfers#transfer_to_old, Transfers#transaction_for_transfer_2
- Dead controller: NetWorthReportController
- Dead actions: BankAccountsController#new, #edit
- Dead method: AllocationCategoriesController#select_household
- Missing `has_many :users` and `has_many :special_events` on Household

**N+1 fixes:**
- SinkFundAllocation#spent — use DB sum instead of .to_a.sum
- CumulativeAllocation#spent_for_week — use DB query instead of Ruby filter
- BankAccount#current_balance / #expected_closing_balance — use DB sum instead of .to_a
- CreditCard#build_adjustment_transaction — combine two sum queries into one

**Missing dependent: options:**
- Budget has_many :incomes, :allocations
- BankAccount has_many :transactions, :sink_fund_allocations
- Allocation has_many :transactions
- SpecialEvent has_many :allocations
- All Household associations

**Missing scopes:**
- Budget: scope :open, :closed
- BankAccount: scope :open
- Transaction: scope :for_period
- SinkFundAllocation: scope :open

---

## Acceptance Criteria

- [ ] All FK constraint migrations run without data violations
- [ ] Dead code removed, no regressions
- [ ] N+1 queries replaced with DB-level aggregation
- [ ] All associations have explicit dependent: option
- [ ] Existing backend tests pass (`bundle exec rspec`)

_This task is likely too large for a single pass — split into subtasks when ready to work on it._
