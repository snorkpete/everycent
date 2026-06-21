# Idea: Payee Name Backfill for Historical Transactions

**Captured:** 2026-03-26
**Status:** implemented

---

## ✅ Implemented — but via a DIFFERENT approach than proposed below (2026-06-21)

The goal (backfill historical `payee_name`) is implemented, but **NOT** with the embeddings/fuzzy-matching design described in this idea.

- **Proposed (below):** embed known payee names + null-payee descriptions, nearest-neighbour match, confidence thresholds, human-in-the-loop review. This was tethered to NLQ phase-3 embeddings — which were never built.
- **Actual:** **description-based detection.** `PayeeBackfill` service (`app/services/payee_backfill.rb`) + `lib/tasks/payee_backfill.rake`, driven by `PayeeNameExtractor` per-format extractor classes. No embeddings, no vector NN.
- **Reusable parts retained:** `PayeeNameExtractor` + import-time payee/transfer detection stay; the one-shot backfill rake + service get removed after the prod run via contingent cleanup task `remove-payee-backfill-rake-task-and-payeebackfill-service-after-successful-run`.
- **Execution note:** confirm the prod hh96 backfill has actually been run and the data accepted (the cleanup task gates on it).

*Everything below is the original (superseded) embeddings proposal, kept for history.*

---

## The Idea

`payee_name` on the `transactions` table was never historically populated. New transactions on supported bank accounts now have it, but the historical record is largely empty.

This matters because `payee_name` is the cleaned, human-readable merchant name (e.g. "Netflix", "Albert Heijn") vs the raw bank description (e.g. "CRD PUR 0312 NFLX*NETFLIX.COM 123456"). Including it in transaction embeddings significantly improves semantic search quality for NLQ.

### Approach

Use known payee names (from recent transactions) as a reference set, then find historical transactions that likely refer to the same payees. Fuzzy matching with human-in-the-loop confirmation.

1. **Build reference set** — collect all distinct `payee_name` values from populated transactions. Embed each as a vector.
2. **Embed historical descriptions** — for all transactions where `payee_name` is null, embed the `description` field.
3. **Nearest-neighbour matching** — for each unmatched embedding, find closest payee embedding. Record candidate payee, similarity score, original description.
4. **Confidence thresholds:**
   - High confidence (above A): queue for auto-application, spot-check only
   - Medium (between A and B): queue for human review
   - Low (below B): leave unmatched, flag for manual handling
5. **Human review interface** — simple UI or CSV showing description, candidate payee, confidence, accept/reject.
6. **Re-embed** — once `payee_name` is populated, re-run embedding for those transactions with the enriched string.

### What This Is Not

- Does not attempt to infer payees for accounts where payee data will never be available
- Does not auto-commit matches without a review step — data integrity > automation
- Not a blocker for NLQ — NLQ works with whatever `payee_name` data exists; this just improves it

---

## Why This Is Worth Doing

Directly improves NLQ search quality across historical data. Also improves general data cleanliness — having clean payee names makes reporting and manual browsing easier even without NLQ.

---

## Open Questions / Things to Explore

- What similarity score threshold is appropriate? Needs empirical tuning against real data.
- How many historical transactions are unmatched? Worth querying before starting.
- How many distinct known payees exist today? Small reference set = lower match coverage.
- Is a CSV review workflow sufficient or does it need a proper UI?
- Should unmatched transactions be periodically re-run as the known payee set grows?
- Start conservative (human review for everything) and loosen thresholds once trusted.
