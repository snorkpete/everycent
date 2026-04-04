# Account Balances

## Definition

Dashboard view that groups all bank accounts by type and calculates aggregate values: total assets, total liabilities, net current cash, net worth.

## Context

The account balances screen is the "how am I doing overall?" view. It groups accounts using the account_category (asset/liability) and is_cash dimensions into: cash assets, non-cash assets, credit cards (cash liabilities), loans (non-cash liabilities).

## Contract

- Groups: cash assets, non-cash assets, credit cards, loans.
- Calculated values: total assets, total liabilities, net current cash, net cash assets, net non-cash assets, net worth.
- Net worth = sum of current_balance across all accounts.
