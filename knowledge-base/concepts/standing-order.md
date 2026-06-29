---
type: concept
title: Standing Order
term: standing-order
definition: "Allocation tied to a specific bank account for recurring fixed payments; originally solved cash-flow routing between personal and joint accounts."
lexicon: true
description: >-
  Why the standing-order feature is dead: it once computed how much to leave in
  personal accounts to cover direct debits before transferring the remainder to
  a joint account, but a changed household payment structure removed that
  problem. The is_standing_order flag and its bank_account_id persistence logic
  still linger in code.
status: dead
doc_status: stub
tags: [domain, stub]
timestamp: 2026-06-20T00:00:00Z
---

# Standing Order

> **Stub — restored from prior vocabulary notes; pending review against current code.**

## Context

**Origin.** In the previous household financial setup, salaries were paid into personal bank accounts. Most money was transferred to a joint account for household bills, but some standing orders (direct debits) came from the personal accounts. The standing order mechanism calculated how much to leave in each personal account to cover those direct debits before transferring the remainder.

**Why it died.** The household payment structure changed — salaries now go into the joint account, and discretionary money is transferred out to personal accounts. The original problem (calculate the leave-behind amount) no longer exists.

**Current state.** The `is_standing_order` flag and related logic still exist in the codebase. It's unclear whether it will be formally removed or repurposed. See [dead schema](/tracking/dead-schema.md).

## Contract

- When `is_standing_order` is true, `bank_account_id` is persisted on the [allocation](/tables/allocations.md).
- When false, `bank_account_id` is cleared on save.
- Feature is not actively used and may be removed.
