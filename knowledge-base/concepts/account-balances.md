---
type: concept
title: Account Balances
term: account-balances
definition: "Dashboard grouping accounts by type (cash / non-cash assets, credit cards, loans) with aggregate calculations including net worth."
lexicon: true
doc_status: stub
tags: [domain, stub]
timestamp: 2026-06-20T00:00:00Z
---

# Account Balances

> **Stub — restored from prior vocabulary notes; pending review against current code.**

## Context

The account balances screen is the "how am I doing overall?" view. It groups [bank accounts](/tables/bank_accounts.md) using the account_category (asset/liability) and is_cash dimensions into: cash assets, non-cash assets, credit cards (cash liabilities), loans (non-cash liabilities).

## Contract

- Groups: cash assets, non-cash assets, credit cards, loans.
- Calculated values: total assets, total liabilities, net current cash, net cash assets, net non-cash assets, net worth.
- Net worth = sum of current_balance across all accounts.
