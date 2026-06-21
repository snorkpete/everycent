# Everycent Vocabulary

> Generated from `knowledge-base/` frontmatter by `rake kb:vocabulary`. Do not edit by hand — change the source file's `definition` and regenerate.

Domain words with compressed definitions, loaded at session start. Follow the link for full context, mechanics, history, and gotchas in the knowledge base.

**account-balances** — Dashboard grouping accounts by type (cash / non-cash assets, credit cards, loans) with aggregate calculations including net worth. · [concepts/account-balances.md](concepts/account-balances.md)

**allocation** — Budget line item; the core money-out unit of zero-based budgeting. Has amount + category, tracks spent/remaining. Identity across budgets is name-based, not relational. · [tables/allocations.md](tables/allocations.md)

**allocation-category** — Label that groups allocations. Unique per household, shared across all budgets. · [tables/allocation_categories.md](tables/allocation_categories.md)

**allocation-class** — Higher classification of an allocation: need, want, or savings. A mechanism for evaluating spending alignment; underdeveloped. Stored in allocation_class (a refactor candidate, R1). · [concepts/allocation-class.md](concepts/allocation-class.md)

**authentication** — Google-only login that mints an opaque DB-backed bearer token (only its SHA256 digest stored, 7-day sliding TTL). Fail-closed: every request needs a valid token unless the endpoint explicitly opts out. · [concepts/session-auth.md](concepts/session-auth.md)

**auto-allocate** — Suggests which allocation a transaction belongs to by matching its description against the previous budget's transactions. Match types: exact or contains. · [concepts/auto-allocate.md](concepts/auto-allocate.md)

**auto-allocation** — Suggests an allocation for each imported transaction by matching its description against the previous budget's already-allocated transactions, then mapping to the same-named allocation in the current budget. The live answer to 'how do we tag transactions easily?' · [concepts/auto-allocation.md](concepts/auto-allocation.md)

**bank-account** — Universal value-tracking primitive — any container of monetary value (accounts, investments, assets, credit cards, loans). Single-table subclasses via account_type. · [tables/bank_accounts.md](tables/bank_accounts.md)

**brought-forward** — Credit-card mechanism: unpaid transactions copied to the next period with a (B/F) suffix plus a balancing transaction; originals marked paid. · [concepts/brought-forward.md](concepts/brought-forward.md)

**budget** — Monthly planning container with start/end dates and open/closed status; holds incomes and allocations. The current budget is the earliest open one. The core unit of time. · [tables/budgets.md](tables/budgets.md)

**budget-period** — The month-long window a budget covers. Most time-scoped logic is relative to this. · [concepts/budget-period.md](concepts/budget-period.md)

**chat-setting** — Per-household singleton config for the NLQ chat: the enable flag, the selected LLM model, and the tool-iteration cap. Singleton by convention, not by DB constraint. · [tables/chat_settings.md](tables/chat_settings.md)

**close-budget** — End-of-period process: rolls each account's closing_balance forward, brings forward unpaid credit-card transactions, sets status closed. Began as a performance optimization. · [concepts/budget-close-checkpointing.md](concepts/budget-close-checkpointing.md)

**copy-budget** — Duplicate incomes and allocations into a new budget one month ahead. The primary mechanism for creating budgets — it replaced the never-built recurring allocations. · [concepts/copy-budget.md](concepts/copy-budget.md)

**credit-card** — Bank-account subclass with statement-cycle tracking and paid/unpaid transactions. Transactions default to unpaid; unpaid at budget close are brought forward. · [concepts/credit-card.md](concepts/credit-card.md)

**family-type** — Household setting (couple or single) that shapes the discretionary-money split and person-name display. · [concepts/family-type.md](concepts/family-type.md)

**future-budgets** — Spreadsheet-like screen for editing allocations across all open budgets by name; where ~95% of budget editing happens. Enforces name consistency; home of the 0 = delete / 0.01 = keep-alive behavior. · [concepts/future-budgets.md](concepts/future-budgets.md)

**household** — Tenancy boundary. Everything belongs to exactly one household; full isolation, no cross-household actions. · [tables/households.md](tables/households.md)

**import** — Loading transactions into the system via three methods: file import (CAMT, idempotent), manual entry, manual upload (copy-paste). The save is destructive (wipe and replace). · [concepts/transaction-import.md](concepts/transaction-import.md)

**income** — Money coming into a budget — a named source with an amount, optionally linked to a bank account. A planning declaration only. · [tables/incomes.md](tables/incomes.md)

**institution** — Bank or financial entity that issues bank accounts. A simple reference/lookup entity. · [tables/institutions.md](tables/institutions.md)

**llm-model** — Per-household registry of selectable LLM models — provider, name, endpoint URL, and five per-million-token cost rates. The cost rates are forward-looking (currently dummy pricing over a free local model). · [tables/llm_models.md](tables/llm_models.md)

**llm-usage-record** — Append-only log of LLM calls from the NLQ chat — token counts, point-in-time cost-rate snapshots, computed (simulated) cost, and per-turn telemetry. Written by the frontend via POST /mcp/llm_usage. · [tables/llm_usage_records.md](tables/llm_usage_records.md)

**manual-balance-adjustment** — Singleton corrective transaction reconciling the calculated balance with reality; at most one per bank account, replaced entirely when recalculated. · [concepts/manual-balance-adjustment.md](concepts/manual-balance-adjustment.md)

**money-representation** — All monetary amounts are stored as integers in cents. No floats anywhere in the money path. · [concepts/money-units.md](concepts/money-units.md)

**nlq-chat** — A natural-language-query chat over the household's finances. The model and agent loop run in the browser; Rails only exposes stateless /mcp/* tool endpoints plus three support tables (config, model registry, usage log). Shipped but not yet in active use. · [concepts/nlq-chat.md](concepts/nlq-chat.md)

**payee-name** — A cleaned merchant string derived from a transaction's description at create time, for NLQ embedding quality — not entity resolution and not transaction tagging. Internal transfers/bookkeeping resolve to NULL. Reuses the legacy payee_name column. · [concepts/payee-name.md](concepts/payee-name.md)

**reports** — Backward-looking analysis: net worth over time, category spending (budget vs actual), needs vs wants. All retrospective. · [concepts/reports.md](concepts/reports.md)

**session** — A live login session: stores only the SHA256 digest of an opaque bearer token, with a 7-day sliding TTL. Created on Google login, validated per request, deleted on logout (revocation). · [tables/sessions.md](tables/sessions.md)

**settings** — Household-level config singleton: primary budget account, family type, person names, default categories. · [tables/settings.md](tables/settings.md)

**sink-fund** — A bank account (type sink_fund) subdivided into named envelopes via sink-fund allocations. Not a separate model — a bank account with the sink-fund concern. · [concepts/sink-fund.md](concepts/sink-fund.md)

**sink-fund-allocation** — One obligation/envelope within a sink fund. Real balance is current_balance = Σ(deposit − withdrawal); persists across budget periods unlike regular allocations. · [tables/sink_fund_allocations.md](tables/sink_fund_allocations.md)

**special-event** — Named event with budgeted and actual amounts; primarily a retrospective cost-analysis tool. (The amounts are a frontend-maintained cache — see bugs B8.) · [tables/special_events.md](tables/special_events.md)

**transaction** — Individual money movement with a withdrawal or deposit amount; belongs to a bank account, optionally links an allocation OR a sink-fund allocation (mutually exclusive). · [tables/transactions.md](tables/transactions.md)

**transfer** — Paired transactions moving money between accounts, or between allocations and sink-fund allocations. One withdrawal + one deposit. · [concepts/transfer.md](concepts/transfer.md)

**user** — A person who logs in. Belongs to one household; a household can have several (this one has two). Email is the sole Google-login join key. Most columns are dead devise residue. · [tables/users.md](tables/users.md)

**zero-based-budgeting** — Core philosophy: every cent gets a job. In practice the unallocated remainder is deliberate discretionary money split among household members — see discretionary money & the budget gap. · [concepts/zero-based-budgeting.md](concepts/zero-based-budgeting.md)


## NLQ chat

**conversation** — The full back-and-forth with the NLQ chat LLM until the user clears it. Identified by conversation_id. · [concepts/conversation.md](concepts/conversation.md)

**step** — One inner LLM call within a turn. A no-tool turn is one step; a tool-calling turn is several. Ordered by step_index. (Some frameworks call this a 'turn'.) · [concepts/chat-step.md](concepts/chat-step.md)

**turn** — One exchange within a conversation: a user message plus its eventual user-facing answer. One-to-many with steps; identified by conversation_turn_id. · [concepts/chat-turn.md](concepts/chat-turn.md)


## Dead / partial

**payee** _(dead)_ — Dead table. The v1 idea for easy transaction tagging — a payee list whose default_allocation_name let a description resolve to an allocation. Never stuck; replaced by description-based auto-allocation. · [tables/payees.md](tables/payees.md)

**recurring-allocation** _(dead)_ — Templates for auto-populating new budgets. Never truly implemented — copy budget replaced the need. Dead code / DB artifacts. · [concepts/recurring-allocation.md](concepts/recurring-allocation.md)

**standing-order** _(dead)_ — Allocation tied to a specific bank account for recurring fixed payments; originally solved cash-flow routing between personal and joint accounts. · [concepts/standing-order.md](concepts/standing-order.md)

**weekly-budget** _(partial)_ — Alternative view splitting a monthly budget into weeks with proportional allocation distribution. Partially implemented; stalled. · [concepts/weekly-budget.md](concepts/weekly-budget.md)
