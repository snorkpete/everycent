# Task: Add strong parameter filtering to endpoints that bypass it

**ID:** add-strong-parameter-filtering-to-endpoints-that-bypass-it
**Status:** deferred
**Refinement:** refined
**Autonomous:** false
**Priority:** low
**Captured:** 2026-04-12
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Five controller endpoints bypass Rails strong parameter filtering, passing raw `params` objects to models:

1. **BankAccountsController#transfer** (bank_accounts_controller.rb:64) — `BankAccount.transfer(params)` — entire unfiltered params object
2. **BudgetsController#mass_update** (budgets_controller.rb:86) — `Budget.mass_update(params)` — entire unfiltered params object
3. **BankAccountsController#manually_adjust_balances** (bank_accounts_controller.rb:55) — `params[:adjustments]` unpermitted array
4. **SettingsController#create** (settings_controller.rb:18-28) — reads params directly, no permit call anywhere
5. **SinkFundsController#transfer_allocation** (sink_funds_controller.rb:35-39) — raw string params[:amount] set as integer column, no validation or permit

Each needs a dedicated strong params method with an explicit permit list.

---

## Acceptance Criteria

- [ ] Each of the five endpoints uses a dedicated permitted params method
- [ ] No raw `params` object is passed to any model method
- [ ] Type coercion applied where needed (e.g., amount to integer)
- [ ] Existing backend tests pass (`bundle exec rspec`)

---

## Implementation Notes

_Remove if empty._
