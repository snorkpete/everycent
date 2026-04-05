# Everycent Vocabulary

Domain words with compressed definitions. See `<word>.md` for detailed context, intent, history, and gotchas. See `INSTRUCTIONS.md` for loading/updating/growing rules.

**household**
Tenancy boundary. Everything belongs to exactly one household. No cross-household actions. Each household is fully isolated and shares nothing.

**budget**
Monthly planning container with a start/end date and open/closed status. Contains incomes and allocations. The current budget is the earliest open budget by start date. Core unit of time in the system.

**income**
Money coming into a budget. Named source with an amount, optionally linked to a bank account.

**allocation**
Budget line item — the core unit of zero-based budgeting. Has an amount, a category, and optionally links to a bank account and special event. Tracks spent and remaining. Identity across budgets is name-based, not relational.

**allocation-category**
Label that groups allocations. Unique per household, shared across all budgets.

**allocation-class**
Higher classification of an allocation: need, want, or savings. Mechanism for evaluating spending alignment. Underdeveloped in the system.

**bank-account**
Universal value-tracking primitive. Any container holding monetary value — bank accounts, investments, physical assets, credit cards, loans. Single-table subclasses via account_type discriminator.

**institution**
Bank or financial entity that issues bank accounts. Simple reference/lookup entity.

**transaction**
Individual money movement. Has withdrawal or deposit amount, belongs to a bank account, optionally links to an allocation OR sink fund allocation (mutually exclusive). Three entry methods: file import, manual entry, manual upload.

**sink-fund**
Bank account (type sink_fund) subdivided into named obligations/goals via sink fund allocations. Not a separate model — a bank account with the sink fund concern.

**sink-fund-allocation**
One obligation/goal within a sink fund. Has a target amount, tracks current balance and progress. Persistent across budget periods unlike regular allocations.

**special-event**
Named event with budget estimate and actual amount. Primarily a retrospective cost analysis tool — understand past event costs to plan future ones.

**settings**
Household-level config singleton. Primary budget account, family type, person names, default categories.

**credit-card**
Bank account subclass with statement cycle tracking and paid/unpaid transaction management. Transactions default to unpaid. Unpaid at budget close are brought forward.

**zero-based-budgeting**
Core philosophy: every cent gets a job. In practice, the unallocated remainder is discretionary spending split equally between partners — intentionally untracked.

**close-budget**
End-of-period process. Snapshots bank balances, brings forward unpaid credit card transactions, sets status to closed. Originally a performance optimization that grew into a functional step.

**copy-budget**
Duplicate incomes and allocations to a new budget one month ahead. The primary mechanism for creating new budgets — replaced the never-implemented recurring allocations.

**brought-forward**
Credit card mechanism. Unpaid transactions copied to next period with (B/F) suffix, plus a balancing transaction. Originals marked paid. Useful fiction for personal payment tracking.

**transfer**
Paired transactions moving money between accounts or between allocations and sink fund allocations. One withdrawal + one deposit.

**manual-balance-adjustment**
Singleton corrective transaction to reconcile calculated balance with reality. At most one per bank account, replaced entirely when recalculated.

**auto-allocate**
Suggests which allocation a transaction belongs to by matching descriptions against previous budget's transactions. Match types: exact or contains.

**import**
Loading transactions into the system. Three methods: file import (CAMT, idempotent), manual entry, manual upload (copy-paste from bank portal). Save process is destructive (wipe and replace).

**future-budgets**
Spreadsheet-like screen for editing allocations across all open budgets by name. Where 95% of budget editing happens. Enforces allocation name consistency. Home of the 0/0.01 behavior.

**account-balances**
Dashboard grouping accounts by type (cash/non-cash assets, credit cards, loans) with aggregate calculations including net worth.

**budget-period**
The month-long window a budget covers. Most time-scoped logic is relative to this.

**family-type**
Household setting: couple or single. Shapes discretionary money split and person name display.

**reports**
Backward-looking analysis: net worth over time, category spending (budget vs actual), needs vs wants. All retrospective.

**money-representation**
All monetary amounts stored as integers in cents. No floats anywhere in the money path.

**design-philosophy**
Features come from observing real usage, not theoretical design. Most original intuitions were wrong. User workarounds that stick signal missing features.

## Dead / partial

**standing-order** (dead)
Allocation tied to a specific bank account for recurring fixed payments. Originally solved cash flow routing between personal and joint accounts.

**recurring-allocation** (dead)
Templates for auto-populating new budgets. Never truly implemented — copy budget replaced the need. Dead code / database artifacts.

**weekly-budget** (partial)
Alternative view splitting monthly budget into weeks with proportional allocation distribution. Partially implemented, development stalled.
