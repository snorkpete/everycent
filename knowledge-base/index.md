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

# Domain concepts

* [Budget close & balance checkpointing](concepts/budget-close-checkpointing.md) - how closing stores balance checkpoints
* [Placeholder allocations](concepts/placeholder-allocations.md) - sink-fund-funded expenses budgeted at ~0
* [Allocation naming conventions](concepts/allocation-naming-conventions.md) - structured meaning in allocation names

# Legacy

* [Trinidad banking model (deprecated)](legacy/trinidad-banking-model.md) - explains a class of dead schema

# Tracking registers

* [Bugs & investigations](tracking/bugs.md) - known live defects (B)
* [Dead schema](tracking/dead-schema.md) - vestigial tables/columns (D)
* [Incomplete features](tracking/incomplete-features.md) - started, never finished (I)
* [Refactor candidates](tracking/refactor-candidates.md) - clarity improvements (R)
* [Open questions](tracking/open-questions.md) - unresolved threads (Q)

# Not yet documented (pending)

Tables present in the schema but not yet covered: `bank_accounts`,
`institutions`, `transactions`, `payees`, `sink_fund_allocations`,
`special_events`, `recurring_allocations`, `recurring_incomes`, `settings`,
`users`, `sessions`, `chat_settings`, `llm_models`, `llm_usage_records`,
`allocation_categories`. Next priority: `allocation_categories` (referenced
heavily by [allocations](tables/allocations.md)).
