# Budget

## Definition

Monthly planning container with a start/end date and open/closed status. Contains incomes and allocations. The current budget is the earliest open budget by start date. Core unit of time in the system — most logic is relative to a budget period.

## Context

The budget is the heartbeat of everycent. Everything revolves around monthly cycles — allocations are created per budget, transactions are viewed per budget, balances are snapshotted when a budget closes.

Budgets are named automatically by their date range (e.g., "Jan 01 - Jan 31, 2015"). Multiple budgets can be open simultaneously — this is how future budgets work. The "current" budget is always the earliest open one by start date.

**Copy replaced recurring.** The original design intended recurring allocations/incomes as templates, but in practice every month was nearly identical to the last. Copy budget emerged from that reality and became the primary way to create new budgets. You copy the current one, then tweak.

**Future budgets came from observation.** After copy budget existed, the future budgets screen was built after observing how the user's wife used a spreadsheet to plan allocations across multiple months. Most allocation editing (estimated 95%) happens on the future budgets screen because of its spreadsheet-like layout.

**The 0 / 0.01 problem.** On the future budgets screen, setting an allocation to 0 signals deletion. But some allocations are seasonal or occasional (e.g., annual expenses) and need to survive across months to be available when copied. The workaround is 0.01 — a technically non-zero amount that keeps the allocation alive without meaningfully affecting the budget. This is a UX workaround masking a missing concept: "inactive but present" as a distinct state.

**Annual transactions.** Another observed workaround — annual costs are placed in the last open budget at their full amount so the number is preserved and doesn't need to be remembered. When the month comes due, the amount is entered into that month's budget using the last-budget entry as reference. Convention is to append the 3-letter month in parentheses to the allocation name (e.g., "Car Insurance (Mar)") to capture when it's due. This workaround stuck because it works, but a better implementation is welcome — as long as it doesn't degrade the user experience. This eventually led to an explicit allocation category for annual transactions to make them easier to identify.

**Design philosophy.** Most budget features came from observing real usage rather than theoretical design. The original intuitions about how budgeting should work turned out to be wrong frequently — the system evolved empirically.

## Contract

- A budget has exactly one status: `open` or `closed`.
- Only open budgets accept allocation changes. Closed budgets should be read-only for allocations (transaction edits may still be allowed — enforcement of allocation immutability is uncertain).
- The current budget is the earliest open budget by start date. There is always at most one "current" budget.
- Closing a budget: snapshots bank account balances, brings forward unpaid credit card transactions, sets status to closed.
- Reopening: only the most recently closed budget can be reopened. Reverses the close process.
- Copy: duplicates incomes and allocations to a new budget one month ahead.
- Total income and total allocation are calculated fields. The difference between them is the unallocated (discretionary) amount — this is intentional, not a bug.

## Gotchas

- Close was originally a performance optimization (snapshot balance to avoid summing all transactions from epoch). It later gained functional significance with credit card brought-forward. Side effect: the transaction screen shows incorrect balances for any budget period except the current one. Known for 12+ years, never painful enough to fix.
- Whether closed budgets truly enforce allocation immutability in code is an open question.
- The 0.01 keep-alive hack is well-understood but has no clean alternative yet.
