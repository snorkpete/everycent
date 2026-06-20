---
type: corrections
title: Pending corrections
description: >-
  Transient processing instructions. Describes edits to existing files (already
  distributed) so a downstream agent can apply the corrected position. Delete
  once applied.
tags: [corrections, transient, maintenance]
timestamp: 2026-06-17T00:00:00Z
---

# Pending corrections

**Status: TRANSIENT.** This file is not a permanent concept. It lists edits to
existing files that were already distributed and so were not rewritten in place.
A downstream agent (or human) should apply these edits to the target files, then
**delete this file**. It is intentionally not linked from any `index.md`.

The substance is the new concept
[discretionary money & the budget gap](/concepts/discretionary-money.md). These
corrections make the existing files consistent with it. **No other content
changes.**

---

## Cause

A literal reading of "zero-based" was baked into three table files, asserting
that allocations fully consume income (aim for zero unallocated). That is
**wrong**: discretionary/personal money is the deliberate, unmodeled remainder
(`income − allocations`), and the budget target is a **positive gap**, not zero.
See the new concept for the full explanation.

---

## C1 — `tables/budgets.md`

**Find** (the intro paragraph, currently ending):

> "Fully assigned" (the zero-based constraint: planned income fully consumed by
> allocations) is measured *within* one budget.

**Replace the parenthetical/claim with** language to this effect:

> EveryCent is zero-based in *concept*, but allocations do **not** fully consume
> income in *implementation*: the remainder is deliberate discretionary money.
> See [discretionary money & the budget gap](/concepts/discretionary-money.md).

Keep the rest of the paragraph (period container, one month, envelope for incomes
and allocations).

## C2 — `tables/allocations.md`

**Find** (intro):

> One row is one budgeted outflow line in a [budget](/tables/budgets.md) — the
> zero-based unit of "this much money is assigned to this purpose."

**Adjust** so it does not imply allocations consume all income. Suggested:

> One row is one budgeted outflow line in a [budget](/tables/budgets.md) — money
> deliberately assigned to a specific purpose. Note that **not** all income is
> allocated: the unallocated remainder is discretionary money, never modeled as
> an allocation — see
> [discretionary money & the budget gap](/concepts/discretionary-money.md).

## C3 — `tables/incomes.md`

**Find** (intro, last sentence):

> Total income for a budget is the pool allocations must fully consume
> (zero-based).

**Replace with** language to this effect:

> Total income is the pool allocations draw from — but allocations do **not**
> fully consume it. The remainder is discretionary money; see
> [discretionary money & the budget gap](/concepts/discretionary-money.md).

## C4 — `index.md` (bundle root)

Add to the **Domain concepts** section a listing entry:

> * [Discretionary money & the budget gap](concepts/discretionary-money.md) - why the budget target is a deliberate non-zero gap

## C5 — `concepts/index.md`

Add a listing entry:

> * [Discretionary money & the budget gap](discretionary-money.md) - discretionary money is the unmodeled remainder of income minus allocations

## C6 — `about.md` (optional, low priority)

The line calling EveryCent "zero-based budgeting" is fine as *philosophy*. If
desired, append a pointer:

> (zero-based in concept; see
> [discretionary money & the budget gap](/concepts/discretionary-money.md) for how
> the implementation deliberately leaves a discretionary remainder).

---

## Note for the open-questions register

Consider adding a Q-entry: the **`allocation_id` = budget-membership** invariant
(documented inside the discretionary-money concept) is system-wide and should be
promoted to its own concept when `transactions` is documented.

---

# Batch 2 — allocation_categories pass

Added with the new files `tables/allocation_categories.md` and
`concepts/budget-role-analysis-sections.md`. The corrections below reconcile
already-distributed files with what that pass established.

## C7 — `concepts/placeholder-allocations.md` (causality fix)

The current file frames the ≤10-cent amount as a **designed marker** for
sink-fund-funded expenses. That causality is **wrong**. Correct it:

- The 0.01 amount is a **UI workaround from the mass-edit allocations feature**,
  not a designed sentinel. Mass-edit matches allocations across budgets by name,
  with one amount field per budget; in that form **amount 0 means "remove this
  allocation from this budget."** Entering **0.01** keeps a near-zero allocation
  alive without triggering that delete.
- `PLACEHOLDER_MAX_CENTS = 10` / the `> 10` filter is therefore the **model
  tolerating that UI artifact** so workaround amounts don't count as real spend
  or real budget — keep all the model facts (threshold, `non_placeholder_amount_sql`,
  "spending against them isn't overspend").
- It *coincides* with sink-fund-funded lines (which legitimately want ~0 in the
  monthly budget) but the 0.01 itself is incidental, not semantic.
- Note it may disappear if the "amount 0 = delete" behavior is replaced by an
  explicit per-budget delete — see refactor R2.

Net: keep the model mechanics; replace the "designed marker" origin story with
the mass-edit-workaround origin.

## C8 — `tracking/refactor-candidates.md`

Extend **R1** and add **R2**:

- **R1 (extend)**: the same "internal money movement, not spending" idea is named
  `transfer` as a `budget_role` but `bookkeeping` as an `allocation_class`.
  Consider unifying on one term across both axes.
- **R2 (new)**: mass-edit "amount 0 = delete this allocation from this budget",
  with the 0.01 escape hatch to keep near-zero allocations. Working but clunky;
  candidate to replace with an explicit per-budget delete (would also retire the
  0.01 placeholder workaround). See
  [placeholder allocations](/concepts/placeholder-allocations.md).

## C9 — `tracking/open-questions.md`

Add **Q5**: why is `allocation_categories.name` unique per household
(case-insensitive)? Possibly a UI concern or another technical reason; not
remembered. See [allocation_categories](/tables/allocation_categories.md).

(Q-numbering: existing entries are Q1–Q4; this is Q5. Also still pending from
Batch 1: promote the `allocation_id` = budget-membership invariant to its own
concept when `transactions` is documented.)

## C10 — `about.md` (knowledge tiers — new bundle principle)

Add a short subsection under conventions distinguishing two tiers of knowledge,
and tag household-specific items wherever they appear:

- **EveryCent-system knowledge** — true for any instance of the app (e.g. the
  `> 10` placeholder filter, `budget_role` semantics, `allocation_id` = budget
  membership).
- **Household-specific knowledge** — data conventions of this particular
  household that shape behavior but are not part of the product (e.g. the two
  `transfer` categories — sink-fund injection and overspend top-up — the
  permanent miscellaneous allocation, the ~200 discretionary gap).

An agent should know which tier a fact lives in: system facts generalize,
household facts do not.

## C11 — index updates

- `index.md` (root), **Tables** section, add:
  `* [allocation_categories](tables/allocation_categories.md) - grouping buckets; budget_role drives NLQ analysis sectioning`
  and remove `allocation_categories` from the "Not yet documented (pending)" list.
- `index.md` (root), **Domain concepts** section, add:
  `* [Budget-role analysis sections](concepts/budget-role-analysis-sections.md) - how budget_role partitions spend for the NLQ layer`
- `tables/index.md`, add the `allocation_categories` line.
- `concepts/index.md`, add the `budget-role-analysis-sections` line (and the
  `discretionary-money` line from Batch 1, if not yet applied).

---

# Batch 3 — bank_accounts / transactions pass

New files added this pass: `tables/bank_accounts.md`, `tables/transactions.md`,
and concepts `budget-membership`, `credit-card`, `brought-forward`, `sink-fund`,
`manual-balance-adjustment`, `transaction-import` (+ `-manual`, `-camt`).
Corrections below reconcile already-distributed files.

## C12 — `concepts/budget-close-checkpointing.md` (rewrite the storage section)

The file currently leaves "where checkpoints are stored" as an OPEN question and
implies per-period totals. **Resolved — replace with:**

- The checkpoint is a **single rolling per-account balance**: `bank_accounts.closing_balance`
  as of `bank_accounts.closing_date`. **Not** per-budget history.
- **Close** (`Budget#close`): for each account, `update_balance(budget_id, end_date)`
  adds the period's net `Σ(deposit − withdrawal)` to `closing_balance` and advances
  `closing_date`; then `add_brought_forward_transactions` (credit-card carry-over);
  then budget `status = closed`.
- **Reopen** is **last-closed-budget only** (`Budget#reopen_last_budget`): recomputes
  `closing_balance = opening_balance + Σ(deposit − withdrawal) for transactions
  *before* the reopened budget's start`, sets `closing_date = start_date − 1`, and
  `remove_brought_forward_transactions`.
- Remove the old "OPEN: where checkpoints are stored" section (Q2 is resolved).
- Add the **dual sign convention** note: balances use deposit-positive; allocation
  spend uses withdrawal-positive (by design — see C-note on B5 below).
- Cross-link [brought-forward](/concepts/brought-forward.md).

### Known limitation to record in that concept

Because the checkpoint is a single rolling value (latest closed budget only),
**UI totals for *past* budgets that rely on closing balance can be wrong** — there
is no per-budget stored total to restore them from. A long-standing design idea is
a **per-budget totals table** (refactor R6). No real-world trigger yet. Also note:
closed budgets "should not be edited" but this **is not enforced** (ties to B3).

## C13 — `tracking/bugs.md`

- **Reclassify B5**: it is **not a bug**. Remove from the bug register and record
  as a *designed dual-perspective sign convention* (bank-account view
  `deposit − withdrawal` vs. allocation `spent` = `withdrawal − deposit`). Keep a
  one-line caution that the two frames must not be mixed.
- **Add B6**: `BankAccount#update_balance` sums `deposit_amount`/`withdrawal_amount`
  **without nil-guards**, unlike sibling methods that use `|| 0`. Low-risk (schema
  default 0) but inconsistent; could raise on a nil amount. Owner: keep recorded.

## C14 — `tracking/dead-schema.md`

Add:
- **D6**: `transactions.payee_id` (abandoned normalized `payees` table).
- **D7**: `bank_accounts.user_id` (model TODO "not used anymore").
- **D8**: `bank_accounts.allow_default_allocations`, `bank_accounts.default_sub_account_amount` (Trinidad/sub-account vestiges).
- **D9**: `bank_accounts.account_type_description`.
- **D-Trinidad (quarantined)**: `transactions.payee_code` — Trinidad artifact, **held for possible salvage** before deletion; do NOT auto-recommend dropping. Distinct from plain dead schema.

## C15 — `tracking/refactor-candidates.md`

- **R3**: remove dead transfer deadwood — `transfer_to_old`, `transaction_for_transfer_2`
  (note: `Transfers` vs sink-fund-internal reassignment are **different scopes**,
  not duplication — only the `_old`/`_2` methods are dead).
- **R4**: remove the disabled sink-fund target validation; `sink_fund_allocations.target`
  is effectively unused by design (envelopes, not goals).
- **R6**: per-budget totals table (retrospective balance/total correctness). See C12.

## C16 — `tracking/open-questions.md`

- **Q6**: tie transactions to a budget via explicit `budget_id` instead of the
  current date-range membership? Border-date transactions sometimes need date
  nudging; an explicit FK could simplify. Most consequential structural question
  so far. See [transactions](/tables/transactions.md), [budget membership](/concepts/budget-membership.md).
- **Q7**: confirm the sink-fund-internal reassignment mechanism
  (`apply/reverse_transactions_to_sink_fund_allocations` / `transfer_allocation`,
  "single movement transaction" trick) when documenting `sink_fund_allocations`.
  See [sink fund accounts](/concepts/sink-fund.md).
- Resolved & removable: **Q2** (checkpoint storage — answered, see C12). The
  earlier `allocation_id` = budget-membership promotion is **done**
  ([budget membership](/concepts/budget-membership.md)).

## C17 — index updates

- `index.md` (root): move `bank_accounts` and `transactions` out of "Not yet
  documented" into **Tables**; add the seven new concepts to **Domain concepts**
  (budget-membership, credit-card, brought-forward, sink-fund,
  manual-balance-adjustment, transaction-import [+ manual, camt]); remove
  `bank_accounts`, `transactions` from the pending list.
- `tables/index.md`: add `bank_accounts`, `transactions`.
- `concepts/index.md`: add the seven new concept entries (+ the two import
  sub-concepts), and (if not already applied from earlier batches)
  `budget-role-analysis-sections` and `discretionary-money`.

---

# Batch 4 — sink_fund_allocations / special_events / institutions / settings

New files: `tables/sink_fund_allocations.md`, `tables/special_events.md`,
`tables/institutions.md`, `tables/settings.md`.

## C18 — `concepts/sink-fund.md` (correct the target framing)

The file says a `target` field exists and is "effectively unused." **Correct it:**
- There is **no `target` column.** `target`/`target=` are methods aliasing the
  `amount` column.
- The envelope's real balance is **`current_balance` = Σ(deposit − withdrawal)**
  over its transactions — **not** `amount`. `amount` is near-vestigial
  (display-only + one UI shortfall readout slated for removal).
- Keep the "envelopes, not goals" point; fix the mechanism wording accordingly.

## C19 — `tracking/refactor-candidates.md` (reframe R4)

**R4** is not "remove an unused target column." Reframe: remove the dead
target-design methods on `SinkFundAllocation` — `target`, `target=`, `difference`,
`spent`, `remaining` — and the disabled `check_sink_fund_allocation_balance_against_current_balance`
validation. There is **no `target` column**; `amount` is near-vestigial
(display-only, with the UI "shortfall from target" readout to be ripped out too).

## C20 — `tracking/bugs.md`

- **Add B8**: `special_events.budget_amount` / `actual_amount` are a
  **frontend-maintained cache** with no backend computation or validation; they
  drift from the true allocation-derived totals (refresh only on event re-save).
  Fix direction: compute/validate server-side, or derive on read. See
  [special_events](/tables/special_events.md).
- **Note**: there is **no** settings/`Setting.first` bug — it resolves within the
  tenant scope like the rest of the system (do not add one).

## C21 — `tracking/dead-schema.md`

- **D10**: `settings.bank_charges_allocation_name` — Trinidad-era auto-categorization
  of bank-charge transactions by description; dead (possibly never fully built).
  Add to the Trinidad cluster.

## C22 — `legacy/trinidad-banking-model.md`

Add `settings.bank_charges_allocation_name` (D10) to the "schema left behind"
list — another Trinidad residue.

## C23 — index updates

- `index.md` (root) **Tables**: add `sink_fund_allocations`, `special_events`,
  `institutions`, `settings`; remove all four from "Not yet documented".
- `tables/index.md`: add the four.
- After this, the only tables remaining in "Not yet documented" are: `payees`
  (dead), `users`, `sessions`, `chat_settings`, `llm_models`, `llm_usage_records`,
  `recurring_allocations` (dead), `recurring_incomes` (dead).
