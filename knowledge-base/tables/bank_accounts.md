---
type: table
title: bank_accounts
description: >-
  Where money physically lives, and the execution site for budget close,
  brought-forward, manual adjustment, and transfers. Two orthogonal axes:
  account_category (asset/liability/current) and account_type
  (normal/credit_card/sink_fund) which gates feature concerns.
resource: everycent:table:bank_accounts
tags: [table, core, banking, balances]
timestamp: 2026-06-17T00:00:00Z
---

# bank_accounts

A real-world account whose transactions sum to a balance — chequing, credit card,
sink fund, cash, or a hard asset / loan. It is also the **execution site** for the
budget lifecycle: budget close, brought-forward, manual balance adjustment, and
inter-account transfers all run here via four mixed-in concerns.

`acts_as_tenant :household`.

## Two orthogonal axes

Do not conflate these — they answer different questions.

- **`account_category`** — *accounting nature*. Exactly `asset`, `liability`,
  `current`. Drives the account-balances screen grouping and ordering.
- **`account_type`** — *which UI/behavior feature-set is switched on*. Exactly
  `normal`, `credit_card`, `sink_fund`. Maps 1:1 to the mixed-in concerns:
  - `normal` — baseline UI, no special features.
  - `credit_card` — unlocks statement-cycle math + brought-forward on close, plus
    CC UI extras. See [credit card accounts](/concepts/credit-card.md).
  - `sink_fund` — unlocks the dedicated sink-fund screen (per-allocation
    balances, transactions per allocation, internal reassignment). See
    [sink fund accounts](/concepts/sink-fund.md).

A **loan / liability** is *not* a type: it is `account_type: normal` +
`account_category: liability` + `is_cash: true`, optionally pointing at its
backing asset (see `asset_bank_account_id`).

## Schema

| Column | Meaning |
|---|---|
| `id` | Primary key. |
| `name` | Required. |
| `account_category` | `asset` / `liability` / `current`. Accounting nature; drives balances-screen grouping. |
| `account_type` | `normal` / `credit_card` / `sink_fund`. Feature-set switch (see above). Default `normal`. |
| `is_cash` | Marks an account whose balance is **real money** (cash, bank, credit, loan) vs. a **hard/illiquid asset** (car, house). Used with `account_category` to sub-group the balances screen. Default `true`. |
| `opening_balance` | Starting balance before any transactions; the base the rolling checkpoint builds on. |
| `closing_balance` | **The rolling balance checkpoint** — `opening_balance + Σ(deposit − withdrawal)` up to `closing_date`. Advanced on budget close, recomputed on reopen. See [budget close & balance checkpointing](/concepts/budget-close-checkpointing.md). |
| `closing_date` | Date the checkpoint is valid as of. |
| `status` | `open` / `closed`. Closed accounts are hidden in the UI (and excluded from the transaction screen's account picker) — used for finished loans / closed real-world accounts. Default `open`. |
| `statement_day` | CC statement closing day-of-month (1–31). CC only. |
| `payment_due_day` | CC payment due day-of-month (1–31). CC only. |
| `import_format` | Selects the (mostly frontend) import parser. Durably live — see [transaction import](/concepts/transaction-import.md). Default `""`. |
| `account_no` | Account number; **load-bearing for import** (matching imported rows to the account). See [transaction import](/concepts/transaction-import.md). |
| `institution_id` | → `institutions`. Informational lookup ("from Scotia / ABN AMRO"). `optional`. Rarely used functionally. |
| `asset_bank_account_id` | Self-FK. On a **liability** account, points at the backing **asset** account; the asset side sees them as `has_many :loans`. **Validated: settable only when `account_category = liability`.** |
| `household_id` | Tenant scope. |
| `account_type_description` | **DEAD (D9).** |
| `user_id` | **DEAD (D7).** Model TODO: "not used anymore". |
| `allow_default_allocations` | **DEAD (D8)** — Trinidad/sub-account vestige. |
| `default_sub_account_amount` | **DEAD (D8)** — Trinidad/sub-account vestige. |
| `created_at` / `updated_at` | Timestamps. |

## Mixed-in concerns

- **CreditCard** — statement cycle + brought-forward generation. See
  [credit card accounts](/concepts/credit-card.md) and [brought-forward](/concepts/brought-forward.md).
- **SinkFund** — sink-fund accounts and their allocations. See [sink fund accounts](/concepts/sink-fund.md).
- **ManualBalanceAdjustments** — the single reconciliation row. See [manual balance adjustment](/concepts/manual-balance-adjustment.md).
- **Transfers** — inter-account transfers (distinct from sink-fund-internal reassignment). Creates a withdrawal on the from-account and a deposit on the to-account; rejects allocation+sink-fund on the same leg and out-of-period dates.

## Balance methods (reference)

- `current_balance` = `closing_balance + Σ(deposit − withdrawal)` for transactions **after** `closing_date`.
- `expected_closing_balance` = same, bounded to `closing_date .. next_closing_date`.
- `update_balance(budget_id, closing_date)` (called at close) adds the period's net to `closing_balance`.

All balance math uses the **deposit-positive** sign frame; allocation **spend**
uses the opposite frame — see the note in [budgets](/tables/budgets.md) / the
checkpointing concept. (`update_balance` lacks the nil-guards used elsewhere — see
[bugs](/tracking/bugs.md) B6.)
