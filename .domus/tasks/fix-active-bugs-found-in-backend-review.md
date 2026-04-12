# Task: Fix active bugs found in backend review

**ID:** fix-active-bugs-found-in-backend-review
**Status:** raw
**Autonomous:** false
**Priority:** high
**Captured:** 2026-04-12
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Five bugs found during the comprehensive backend review. All are actively broken or producing wrong results in production.

1. **Report.rb hardcoded household_id = 96** (report.rb:88) — `needs_vs_wants` report ignores the `household` parameter and returns household 96's data for every user. Fix: use `#{household.id}` matching the other two report methods.

2. **Income.mass_update: `return` vs `next`** (income.rb:77) — `return unless income` inside an `each` block returns from the enclosing method, abandoning all remaining items. `Allocation.mass_update` correctly uses `next`. Fix: change `return` to `next`.

3. **ManualBalanceAdjustments ordering bug** (manual_balance_adjustments.rb:10-22) — `where(id: bank_account_ids)` returns records in arbitrary DB order, but the caller pairs them with `adjustments[index]`. Wrong account gets wrong adjustment. Fix: add `.order(:id)` and sort the input array to match, or use a hash lookup.

4. **Transfers#transfer type coercion crash** (transfers.rb:15) — `params[:amount] > 0` where params[:amount] is a string from HTTP. Raises `ArgumentError`. Fix: coerce to integer before comparison.

5. **SinkFund#transfer_allocation operator precedence** (sink_fund.rb:105) — `return if existing_allocation_id == 0 and new_allocation_id == 0` — Ruby's `and` has very low precedence, parses as `(return if x == 0) and (y == 0)`. Fix: use `&&`.

---

## Acceptance Criteria

- [ ] All five bugs fixed
- [ ] Report.rb needs_vs_wants uses the household parameter
- [ ] Income.mass_update processes all items in the array
- [ ] ManualBalanceAdjustments applies correct adjustment to correct account regardless of DB row order
- [ ] Transfer endpoint doesn't crash on string amount input
- [ ] SinkFund transfer_allocation correctly checks both IDs
- [ ] Existing backend tests pass (`bundle exec rspec`)
