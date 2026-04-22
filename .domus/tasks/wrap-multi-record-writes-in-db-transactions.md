# Task: Wrap multi-record writes in DB transactions

**ID:** wrap-multi-record-writes-in-db-transactions
**Status:** done
**Autonomous:** false
**Priority:** high
**Captured:** 2026-04-12
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Six multi-record write operations lack DB transaction wrappers. If any step fails midway, the database is left in an inconsistent state — partially closed budgets, half-completed transfers, deleted transactions with no replacements.

Affected code:
- `Budget#close` (budget.rb:78-86) — iterates all bank accounts updating balances, then marks budget closed
- `Budget#reopen_last_budget` (budget.rb:88-107) — reverse of close
- `Transaction.update_with_params` (transaction.rb:82-101) — delete_all then re-create one by one
- `Transfers#transfer` (transfers.rb:37-58) — creates debit on source, credit on destination as two independent writes
- `SinkFund#update_sink_fund_allocations` (sink_fund.rb:54-82) — creates, updates, deletes in a loop
- `BudgetsController#update` (budgets_controller.rb:60-72) — eight separate DB writes for budget+incomes+allocations

---

## Acceptance Criteria

- [ ] Each of the six operations is wrapped in `ActiveRecord::Base.transaction do ... end`
- [ ] Existing backend tests still pass (`bundle exec rspec`)
- [ ] If any step raises within the transaction, all changes are rolled back
- [ ] No partial state is possible on failure

---

## Implementation Notes

_Remove if empty._
