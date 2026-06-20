---
type: concept
title: Sink fund accounts
description: >-
  Behavior unlocked when a bank account has account_type sink_fund: money-storing
  envelopes (sink_fund_allocations), a dedicated screen, and internal
  reassignment between envelopes.
tags: [domain, banking, sink-fund, envelopes]
timestamp: 2026-06-17T00:00:00Z
---

# Sink fund accounts

The feature-set switched on when a [bank account](/tables/bank_accounts.md) has
`account_type: sink_fund`. Implemented by the `SinkFund` concern. A sink fund
holds money set aside for irregular/future expenses.

## Envelopes, not goals

A sink-fund account owns many `sink_fund_allocations` (table not yet documented in
full). In practice these are **envelopes that store money** — not targets building
toward a goal. A `target` field exists but is **effectively unused by design**: a
validation that would check allocations against a target is **disabled** in code
and is a [refactor candidate](/tracking/refactor-candidates.md) (R4) to remove.

`sink_fund_allocation_balance` = Σ of the allocations' amounts.

## Relationship to spending

A transaction funded from a sink fund carries `sink_fund_allocation_id` and **no
`allocation_id`** — so it sits **outside** the monthly budget and out of
allocation reporting. See [budget membership](/concepts/budget-membership.md). On
the budget side, such an expense often appears as a
[placeholder allocation](/concepts/placeholder-allocations.md) (~0 amount) so the
line is visible without claiming monthly income.

## Dedicated screen

The sink-fund type makes the account selectable in a separate sink-fund screen
that shows per-allocation balances and the transactions against each allocation,
and supports editing allocations (`update_sink_fund_allocations`: create / update
/ delete by id).

## Internal reassignment

Money can be moved **between sink-fund allocations** (e.g. clothing → car) without
polluting transaction data. The mechanism (believed to be
`apply/reverse_transactions_to_sink_fund_allocations` and/or `transfer_allocation`,
using a "single movement transaction" trick) is **to be confirmed** when
`sink_fund_allocations` is documented — see [open questions](/tracking/open-questions.md) (Q7).
This is distinct from inter-account `Transfers` (which move money between any two
accounts).
