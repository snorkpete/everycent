---
okf_version: "0.1"
---

# EveryCent Knowledge Bundle

* [About this bundle](about.md) - scope, reading guide, and conventions
* [Money units](concepts/money-units.md) - foundational: all amounts are integer minor units

# Tables (budget core)

* [households](tables/households.md) - tenant root / isolation boundary
* [budgets](tables/budgets.md) - the monthly period container
* [incomes](tables/incomes.md) - plan-only inflow lines
* [allocations](tables/allocations.md) - the core money-out unit
* [allocation_categories](tables/allocation_categories.md) - grouping buckets; budget_role drives NLQ analysis sectioning
* [bank_accounts](tables/bank_accounts.md) - where money lives; site of close, brought-forward, adjustment, transfers
* [transactions](tables/transactions.md) - actual money movement synced from real bank data
* [sink_fund_allocations](tables/sink_fund_allocations.md) - money-storing envelopes inside a sink-fund account
* [special_events](tables/special_events.md) - a non-recurring spending occasion grouping allocations across budgets
* [institutions](tables/institutions.md) - household-scoped lookup of financial institutions
* [settings](tables/settings.md) - per-household singleton config row

# Dead tables (abandoned v1 ideas)

* [payees](tables/payees.md) - dead; v1 transaction-tagging via default allocations
* [recurring_allocations](tables/recurring_allocations.md) - dead; v1 budget-creation templates
* [recurring_incomes](tables/recurring_incomes.md) - dead; income half of the same templates

# Domain concepts

* [Budget close & balance checkpointing](concepts/budget-close-checkpointing.md) - closing rolls each account's closing_balance forward
* [Placeholder allocations](concepts/placeholder-allocations.md) - sink-fund-funded expenses budgeted at ~0
* [Allocation naming conventions](concepts/allocation-naming-conventions.md) - structured meaning in allocation names
* [Discretionary money & the budget gap](concepts/discretionary-money.md) - why the budget target is a deliberate non-zero gap
* [Budget-role analysis sections](concepts/budget-role-analysis-sections.md) - how budget_role partitions spend for the NLQ layer
* [Budget membership](concepts/budget-membership.md) - allocation_id presence marks a transaction as part of the budget
* [Auto-allocation](concepts/auto-allocation.md) - suggests an allocation by matching descriptions against the previous budget
* [Payee name](concepts/payee-name.md) - cleaned merchant string for NLQ embedding; the repurposed payee_name column
* [Credit card accounts](concepts/credit-card.md) - the statement cycle and brought-forward unlocked by credit_card accounts
* [Brought-forward](concepts/brought-forward.md) - unpaid credit-card charges carried into the next budget on close
* [Sink fund accounts](concepts/sink-fund.md) - money-storing envelopes unlocked by sink_fund accounts
* [Manual balance adjustment](concepts/manual-balance-adjustment.md) - a self-deleting transaction that forces the balance to match the bank
* [Transaction import](concepts/transaction-import.md) - how real bank transactions get into EveryCent
* [Transaction import (manual)](concepts/transaction-import-manual.md) - frontend-only copy-paste import per import_format
* [Transaction import (CAMT)](concepts/transaction-import-camt.md) - the ISO 20022 path, the one importer with a backend component

# Legacy

* [Trinidad banking model (deprecated)](legacy/trinidad-banking-model.md) - explains a class of dead schema

# Tracking registers

* [Bugs & investigations](tracking/bugs.md) - known live defects (B)
* [Dead schema](tracking/dead-schema.md) - vestigial tables/columns (D)
* [Incomplete features](tracking/incomplete-features.md) - started, never finished (I)
* [Refactor candidates](tracking/refactor-candidates.md) - clarity improvements (R)
* [Open questions](tracking/open-questions.md) - unresolved threads (Q)

# Not yet documented (pending)

Tables present in the schema but not yet covered: the **auth** tables (`users`,
`sessions`) and the **AI/chat** tables (`chat_settings`, `llm_models`,
`llm_usage_records`).
