# Household

## Definition

Tenancy boundary. Everything in the system belongs to exactly one household. No cross-household actions exist. Each household is fully isolated and shares nothing with any other household.

## Context

Multi-tenancy is enforced at the model layer via `acts_as_tenant :household` on every domain model. This means all queries are automatically scoped — there's no way to accidentally leak data between households.

A household can have multiple users (e.g., husband and wife), but all users within a household see and operate on the same data.

## Contract

- Every domain model (budgets, accounts, transactions, allocations, etc.) belongs to exactly one household.
- All queries are scoped to the current household automatically.
- Users belong to a household. Multiple users per household is supported.
- No data is shared across households. For all practical purposes, each household is its own app instance.
