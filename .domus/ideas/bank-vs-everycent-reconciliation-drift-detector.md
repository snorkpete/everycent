# Idea: Bank-vs-Everycent reconciliation drift detector

**Captured:** 2026-10-03
**Status:** raw

---

## The Idea

A reconciliation pass that diffs a bank export (CAMT.053) against Everycent transactions for a period and reports drift, rather than relying on the account balance to reveal problems.

Motivation: current_balance is computed as closing_balance + sum of transactions after closing_date, so a wrong checkpoint plus a compensating error in the period transactions yields a correct-looking balance while the underlying budget is wrong. A live reconciliation found exactly that — the displayed balance matched the bank to the cent while two transactions sat in the wrong budget period and the prior period's closing checkpoint was wrong. Balance equality is not evidence of correctness.

Primary failure mode to catch: hand-entered transactions get a MAN-<hash> bank_ref, so (a) a later CAMT import of the same transaction has no ref collision and inserts a genuine duplicate, and (b) the hand-typed date can differ from the bank's booking date — and when that difference crosses the period boundary (the 25th), spend is attributed to the wrong budget and the closing-balance checkpoint is corrupted. The (bank_account_id, bank_ref) unique index does not protect against either.

Candidate output: entries present in the bank but absent in Everycent; entries present in Everycent with no bank counterpart; ref matches with amount mismatches; and date mismatches that cross a period boundary (the high-value class).

Open questions: where this lives (rake task vs MCP/NLQ tool vs a UI screen); whether it should propose corrections or only report; how to represent the known-benign patterns so they are not flagged — booking lag (card date vs next-business-day booking) and the split+adj convention (bank line kept, plus a reversing 'adj' entry and the category splits, netting to the bank amount).

---

## Why This Is Worth Doing

_To be filled in._

---

## Open Questions / Things to Explore

- _Add open questions here_
