# Tables

* [households](households.md) - tenant root / isolation boundary
* [budgets](budgets.md) - the monthly period container
* [incomes](incomes.md) - plan-only inflow lines
* [allocations](allocations.md) - the core money-out unit
* [allocation_categories](allocation_categories.md) - grouping buckets; budget_role drives NLQ analysis sectioning
* [bank_accounts](bank_accounts.md) - where money lives; site of close, brought-forward, adjustment, transfers
* [transactions](transactions.md) - actual money movement synced from real bank data
* [sink_fund_allocations](sink_fund_allocations.md) - money-storing envelopes inside a sink-fund account
* [special_events](special_events.md) - a non-recurring spending occasion grouping allocations across budgets
* [institutions](institutions.md) - household-scoped lookup of financial institutions
* [settings](settings.md) - per-household singleton config row
