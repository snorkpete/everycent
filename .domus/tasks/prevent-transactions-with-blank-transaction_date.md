# Task: Restore budget-window enforcement on transaction save (client + server)

**ID:** prevent-transactions-with-blank-transaction_date
**Status:** ready
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-04-22
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The Vue v4 migration dropped the v1/v3 client-side save filter that kept transactions inside the selected budget window; blank/out-of-window dates now persist as invisible orphans or leak into other budgets. Restore enforcement: client save-time pass flags out-of-range rows as deleted with a review message; server drops non-conforming rows in update_with_params; NOT NULL on transaction_date; fix dateless-row gap in abnAmroBankImporter.

**The hard rule (Kion, 2026-07-20):** on the transactions screen you must select a bank
account + budget period before anything shows; after that, ALL operations are scoped to
that selection — a save must NEVER affect a bank account or budget outside the selected
ones. The bank-account half is already server-enforced (`update_with_params` force-sets
`bank_account_id` on every row, `transaction.rb:100`). The budget-window half is the gap
this task closes.

---

## Design decision (locked 2026-07-20) — restore the historical drop semantics, both layers

Supersedes the 2026-06-29 `create!` + 422 design (recorded below under Superseded) after
a git-history dive proved the original system intentionally *dropped* non-conforming rows
rather than erroring:

- **v1 era, Feb 2015 (`94cf38fd9`)**: client save filter dropped rows with dates outside
  the window (blank → `Invalid Date` → also dropped) from the POST.
- **v3 era (`3d8934e86`)**: same filter ported as `extractValidTransactionsInBudget`
  (still in `webclientv3/.../transaction.service.ts`, frozen).
- **v4 migration, Mar 2026 (`2cf89e019`)**: filter never ported — only `!t.deleted`
  survives (`transactionStore.ts:78`). This is the regression.
- The server never enforced anything (unbanged `create` since Jan 2015); prod orphan
  `233503` (created 2026-04-14 via the v4 UI, deleted from prod 2026-06-29) is a direct
  casualty.

**1. Client — save-time pass (restores the v1/v3 layer, made visible):**
On Save, before posting: any non-deleted row whose `transaction_date` is blank OR outside
`selectedBudget.start_date..end_date` gets flagged `deleted = true`; if any rows were
newly flagged, do NOT post — show a message ("N transaction(s) with dates outside the
budget period were marked as deleted — review before saving") and stay in edit mode so
the user reviews. A clean pass posts as normal. Un-delete stays allowed (old behaviour);
an un-deleted out-of-range row is simply re-caught by the next save attempt.

**2. Client — importer gap fix:**
`abnAmroBankImporter.ts:163-169` guards BOTH the date assignment and the out-of-range
`deleted` marking with `if (currentDate ...)` — a row whose date fails to parse gets
neither a date nor the flag and sails through dateless. Fix: missing/unparseable date ⇒
`deleted = true` (matches v1, where `Invalid Date` failed the range check). Audit the
other importers in `webclientv4/src/app/transactions/importers/` for the same gap
(camt053Parser marks `outsidePeriod` but check its dateless handling too).

**3. Server — drop non-conforming rows in `update_with_params` (new backstop):**
Before the create loop, partition the posted set: rows with a present date inside the
posted budget's window are created; the rest are silently dropped (never created).
No raise, no 422, response shape unchanged (the date-filtered requery, as always).
Rationale (Kion): the screen has live running totals (`TransactionSummary.vue:123-159`
computes them from non-deleted in-memory rows) and the store re-fetches immediately after
save (`transactionStore.ts:84-87`), so any server-dropped row visibly shifts the totals —
the user can't miss it. The client pass in (1) means this backstop should ~never fire.

**Considered and rejected — dropped-count in the save response:** v4 discards the save
response entirely (re-fetches instead), and the frozen v3 client also consumes this
endpoint, so surfacing a count means response-shape/compat plumbing. Not worth it; the
client pre-save message is the visibility mechanism.

**4. DB + model (from the original task, still wanted):**
`validates :transaction_date, presence: true` on `Transaction` (defense-in-depth; all
other write paths — transfers, sink-fund, B/F, CAMT import — always set a date) and
`change_column_null :transactions, :transaction_date, false`. Prod data already clean
(see Prod verification below); no backfill needed. With the server drop in (3), rows
without dates never reach `create` on the bulk path, so the unbanged `create` never
soft-fails on presence.

**Branch placement:** behaviour-changing → own feature branch off master. NOT the
healthcheck branch (that's behaviour-preserving work only).

---

## Acceptance Criteria

- [ ] Client save-time pass per Design (1): flags + message + halted post on newly
      flagged rows; clean saves unaffected. Vitest specs for: out-of-window flagged,
      blank-date flagged, already-deleted rows ignored, clean set posts, message wording
- [ ] `abnAmroBankImporter` dateless rows flagged `deleted = true`; other importers
      audited for the same gap (spec each fix)
- [ ] Server: `update_with_params` drops rows with blank or out-of-window dates before
      the create loop; rspec proves dropped rows are not persisted, in-window rows are,
      and response remains the requeried window set
- [ ] `validates :transaction_date, presence: true` + migration
      `change_column_null :transactions, :transaction_date, false` (no backfill needed)
- [ ] rspec + `npm run test` + `npm run type-check` green; 100% coverage on new Vue code;
      senior-code-reviewer run on the Vue changes
- [ ] KB updated in its own commit: `tables/transactions.md` "Update = destroy-and-replace"
      section documents the restored enforcement; also fix the stale "There is no
      budget_id column" claim (budget_id shipped v90, 2026-06-29)
- [ ] No `package-lock.json` / unrelated churn

---

## History / evidence (kept for context)

### Superseded design (2026-06-29): `create!` + controller rescue → 422

Chose batch-atomic 422 to avoid "silent loss". Superseded 2026-07-20: the history dive
showed drop-semantics were the original intended design, enforced client-side 2015–2026;
Kion chose to restore them (with the client message making the drop visible) rather than
introduce a new error mode. The "silent loss" risk the 422 design guarded against is
mitigated by the client pass + visible running-totals shift + post-save re-fetch.

### Verified findings (2026-06-29, dev DB)

- Exactly 3 null-`transaction_date` rows existed globally: `30880` (hh 2), `44937`
  (hh 1), `233503` (hh 96 live — empty manual entry, `MAN-` ref, created 2026-04-14 via
  the v4 UI). All zero-amount, unlinked.
- No guard at any layer: schema nullable, no model validation, unbanged `create` in
  `update_with_params` (wrapper present but inert).
- `assign_budget_id` (budget_id foundation, shipped v90) is written to never raise /
  never invalidate; it runs after validations and derives budget from `transaction_date`
  — complementary with this task, no bad interaction.

### Prod verification + cleanup (2026-06-29)

- Same 3 rows confirmed in prod; all deleted via guarded DELETE (id + still-null-date +
  zero-amount + null allocation). 0 null-date rows remain → NOT NULL migration is clear.
