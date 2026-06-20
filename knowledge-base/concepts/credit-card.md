---
type: concept
title: Credit card accounts
description: >-
  Behavior unlocked when a bank account has account_type credit_card: the
  statement cycle (statement_day / payment_due_day) and brought-forward on budget
  close.
tags: [domain, banking, credit-card, statement-cycle]
timestamp: 2026-06-17T00:00:00Z
---

# Credit card accounts

The feature-set switched on when a [bank account](/tables/bank_accounts.md) has
`account_type: credit_card`. Implemented by the `CreditCard` concern.

## Charge settlement

A credit-card **withdrawal** (a charge) defaults to
[`status: unpaid`](/tables/transactions.md). It becomes `paid` when covered by a
payment/deposit to the card — one payment typically clears **many** charges
(the card company doesn't tie payments to specific charges).

## Statement cycle

Two day-of-month fields on the account drive the cycle:

- `statement_day` — when the statement closes.
- `payment_due_day` — when payment is due.

Derived dates (via a `RelativeDate` date extension): current/previous statement
start & end, payment-due dates, and period starting balances
(`current_period_starting_balance`, `previous_period_starting_balance`). These
support showing where the card sits in its cycle and what's owed.

## Brought-forward on close

Because the statement cycle rarely aligns with the budget period, unpaid charges
can be carried into the next budget at close. That mechanism is its own concept:
[brought-forward](/concepts/brought-forward.md).

## UI extras

The credit-card type also surfaces additional UI elements (certain totals). These
are UI-tier; full detail belongs to the eventual frontend documentation.
