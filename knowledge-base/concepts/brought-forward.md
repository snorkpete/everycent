---
type: concept
title: Brought-forward (credit-card carry-over)
term: brought-forward
definition: "Credit-card mechanism: unpaid transactions copied to the next period with a (B/F) suffix plus a balancing transaction; originals marked paid."
lexicon: true
description: >-
  At budget close, unpaid credit-card charges are copied into the next budget so
  what's still owed stays visible, with a balancing adjustment. Reopen reverses
  it. Carrying the same charge indefinitely is intended.
tags: [domain, credit-card, budget-lifecycle, transactions]
timestamp: 2026-06-17T00:00:00Z
---

# Brought-forward (credit-card carry-over)

**Credit-card only.** Generated at [budget close](/concepts/budget-close-checkpointing.md)
by the `CreditCard` concern on [bank accounts](/tables/bank_accounts.md), reversed
on reopen.

## Why it exists

The credit-card billing cycle does not align with the budget period, so some
charges can legitimately be paid in a later month (interest-free). Brought-forward
copies each still-**unpaid** charge into the next budget period so the amount
**still owed** remains visible there.

## Mechanism (close)

`add_brought_forward_transactions(start, end)`:

1. **Copy** each unpaid transaction in the period into the next period via
   `to_brought_forward_version` — dated the day after the period end, description
   suffixed `(B/F)`, `status: unpaid`, `brought_forward_status: added`, fresh
   `bank_ref`, `payee_name` re-derived.
2. **Add a balancing adjustment** transaction (`description: 'Balance B/F Adj
   Entry'`, `status: paid`, `brought_forward_status: adjustment`) with negated
   withdrawal/deposit sums, so the copies don't distort the new period's balance.
   (Skipped if its net is zero.)
3. **Mark the originals** `status: paid`, `brought_forward_status: brought_forward`.

## The three brought_forward_status roles

| Value | On | Meaning |
|---|---|---|
| `brought_forward` | the copied **originals** | "this was carried forward"; reverted on reopen |
| `added` | the **copies** in the new period | the visible still-owed rows; deleted on reopen |
| `adjustment` | the **balancing** entry | offsets the copies; deleted on reopen |

## Mechanism (reopen)

`remove_brought_forward_transactions` reverses everything:

- originals (`brought_forward` / paid) → back to `unpaid`, status cleared;
- rows tagged `added` or `adjustment` on/after the carry date → **hard-deleted**.

So reopen is a clean physical reversal, not a state archive.

## Indefinite carry is intended

A brought-forward copy is itself a charge that can be carried **again** next
close. Carrying the same charge across multiple periods ("we haven't paid *this*
one yet") is **by design** — illogical at the individual-charge level (the card
company doesn't track charges individually) but a valid mental model. Rare in
practice, but supported. An agent should not "correct" repeated carry.
