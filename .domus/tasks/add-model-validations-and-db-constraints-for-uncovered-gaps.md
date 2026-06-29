# Task: Add model validations and DB constraints for uncovered gaps

**ID:** add-model-validations-and-db-constraints-for-uncovered-gaps
**Status:** ready
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-04-12
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The backend review found columns with no validation at either the model or DB layer.
Add model validations (quick, safe) plus DB migrations (belt-and-suspenders). A
2026-06 code-drift + prod-data audit (below) confirms exactly what's missing and how
to migrate safely — this task is now self-contained and auto-dispatchable.

**Model validations to add:**
- `Allocation`: amount (numericality, only_integer), name (presence)
- `Income`: amount (numericality, only_integer), name (presence)
- `SinkFundAllocation`: amount (numericality, only_integer) — NOTE: `name` presence
  already exists, do NOT re-add it
- `Household`: name (presence)
- `BankAccount`: inclusion on account_type (normal, credit_card, sink_fund),
  account_category (asset, liability, current), status (open, closed). No Rails enums
  exist — use plain `:inclusion` validators on the string columns.
- `AllocationCategory`: percentage (numericality, 0..100) **with `allow_nil: true`**
  (audit found 55 legitimately-null percentages — a non-nil rule would lock them)
- `Setting`: uniqueness on household_id (plain unique — Setting is a per-household
  singleton, so household_id itself is the unique key; NO `scope:` needed)

**DB migrations:**
- `transactions.status`: add default 'paid', NOT NULL
- `settings.household_id`: add unique index
- NOT NULL on: allocations.name, allocations.amount (+ default 0), incomes.name,
  incomes.amount, sink_fund_allocations.amount, households.name

---

## Data Audit (2026-06, prod) — pre-validated, backfills baked into the plan

Drift check: none of the above validations currently exist (existing validations on
those models are on *other* fields). No existing DB constraints on the target columns.

Prod-data check for constraint violations:
- **Clean (0 violations), NOT NULL is safe as-is:** allocations.name, incomes.amount,
  incomes.name, sink_fund_allocations.amount, households.name, transactions.status.
- **settings.household_id:** 0 duplicates, 0 nulls → unique index is safe.
- **allocations.amount: 69 NULL rows** → would FAIL the NOT NULL migration. All 69 are
  in closed/historical or non-live data (no impact on the live household's current
  budgets; the live-household subset is entirely pre-2018 closed-budget bookkeeping
  rows that predate the 0/0.01 placeholder convention). **Resolution: backfill to 0.**
- **bank_accounts: 7 rows with blank account_type/status**, ALL in non-live households
  (none live). **Resolution: backfill blanks to column defaults** (status→'open',
  account_type→'normal') before adding the inclusion validations, so no record is
  locked.
- **allocation_categories.percentage: 55 NULLs, 0 out-of-range** → handled by
  `allow_nil: true` on the validation (no DB constraint added for percentage).

### Required backfill (run inside the migration, BEFORE adding constraints)
```sql
UPDATE allocations    SET amount = 0        WHERE amount IS NULL;
UPDATE bank_accounts  SET status = 'open'   WHERE status IS NULL OR status NOT IN ('open','closed');
UPDATE bank_accounts  SET account_type='normal' WHERE account_type IS NULL OR account_type NOT IN ('normal','credit_card','sink_fund');
```
All idempotent (`WHERE` guards), so safe on any DB state.

---

## Acceptance Criteria

- [ ] All listed model validations added (mind the `allow_nil` on percentage and the
      already-present SinkFundAllocation name presence)
- [ ] rspec model specs added for every new validation (TDD; covers the valid + invalid
      cases per validator)
- [ ] Migration backfills the 3 statements above, THEN applies NOT NULL / default /
      unique index — in that order, single migration
- [ ] `bundle exec rspec` green
- [ ] No nil amounts can enter allocations, incomes, or sink_fund_allocations
- [ ] No invalid account_type/account_category/status strings can be saved on
      bank_accounts
- [ ] No `package-lock.json` / unrelated churn

---

## Implementation Notes

- Worker runs the migration against the LOCAL/test DB only — it does NOT push or deploy.
  The backfill + constraints apply to prod when the human deploys (deploy skill runs
  `db:migrate`). The prod data is already audited, so the migration is pre-cleared.
- Amounts are stored in cents (integers) — `numericality: { only_integer: true }`.
- Keep it backend-only; no Vue changes, so the webclientv4 pre-commit checks are N/A.
