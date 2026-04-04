# Standing Order

**Status: Dead**

## Definition

Allocation tied to a specific bank account, representing a recurring fixed payment (e.g., insurance, subscription). Marked via `is_standing_order` flag on the allocation, which persists the `bank_account_id`.

## Context

**Origin.** In the previous household financial setup, salaries were paid into personal bank accounts. Most money was transferred to a joint account for household bills, but some standing orders (direct debits) came from the personal accounts. The standing order mechanism calculated how much to leave in each personal account to cover those direct debits before transferring the remainder.

**Why it died.** The household payment structure changed — salaries now go into the joint account, and discretionary money is transferred out to personal accounts. The original problem (calculate the leave-behind amount) no longer exists.

**Current state.** The `is_standing_order` flag and related logic still exist in the codebase. It's unclear whether it will be formally removed or repurposed.

## Contract

- When `is_standing_order` is true, `bank_account_id` is persisted on the allocation.
- When false, `bank_account_id` is cleared on save.
- Feature is not actively used and may be removed.
