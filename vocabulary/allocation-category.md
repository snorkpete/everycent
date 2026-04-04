# Allocation Category

## Definition

A label that groups allocations (e.g., "Groceries", "Utilities"). Unique per household. Shared across all budgets.

## Context

Categories provide the grouping structure for the budget view and reports. They're persistent — unlike allocations which are per-budget, categories exist at the household level and are reused across all budgets.

## Contract

- Name must be unique within a household.
- One-to-many relationship with allocations.
- Used in category spending reports to compare budget vs actual over time.
