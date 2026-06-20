# Concepts

* [Money units](money-units.md) - all amounts are integer minor units (cents)
* [Allocation naming conventions](allocation-naming-conventions.md) - structured meaning encoded in allocation names
* [Budget close & balance checkpointing](budget-close-checkpointing.md) - closing rolls each account's closing_balance forward
* [Placeholder allocations](placeholder-allocations.md) - sink-fund-funded expenses budgeted at ~0
* [Discretionary money & the budget gap](discretionary-money.md) - discretionary money is the unmodeled remainder of income minus allocations
* [Budget-role analysis sections](budget-role-analysis-sections.md) - how budget_role partitions spend for the NLQ layer
* [Budget membership](budget-membership.md) - allocation_id presence marks a transaction as part of the budget
* [Credit card accounts](credit-card.md) - the statement cycle and brought-forward unlocked by credit_card accounts
* [Brought-forward](brought-forward.md) - unpaid credit-card charges carried into the next budget on close
* [Sink fund accounts](sink-fund.md) - money-storing envelopes unlocked by sink_fund accounts
* [Manual balance adjustment](manual-balance-adjustment.md) - a self-deleting transaction that forces the balance to match the bank
* [Transaction import](transaction-import.md) - how real bank transactions get into EveryCent
* [Transaction import (manual)](transaction-import-manual.md) - frontend-only copy-paste import per import_format
* [Transaction import (CAMT)](transaction-import-camt.md) - the ISO 20022 path, the one importer with a backend component
