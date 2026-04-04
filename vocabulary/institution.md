# Institution

## Definition

Bank or financial entity that issues bank accounts. Simple reference/lookup entity.

## Context

Straightforward lookup table. An institution has a name, and bank accounts belong to an institution. No special behavior or business logic beyond grouping accounts by their real-world provider.

## Contract

- One-to-many relationship with bank accounts.
- No cross-household sharing — scoped like everything else.
