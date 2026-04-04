# Money Representation

## Definition

All monetary amounts are stored as integers in cents. No floats anywhere in the money path.

## Context

Standard practice to avoid floating-point precision issues with currency. Every amount field in the database is an integer representing cents. The frontend formats for display.

## Contract

- All amounts are integers (cents).
- No floating-point currency anywhere.
- Frontend is responsible for display formatting (dividing by 100, adding currency symbols, etc.).
