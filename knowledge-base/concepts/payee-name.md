---
type: concept
title: Payee name (description cleaning for NLQ)
term: payee-name
definition: "A cleaned merchant string derived from a transaction's description at create time, for NLQ embedding quality — not entity resolution and not transaction tagging. Internal transfers/bookkeeping resolve to NULL. Reuses the legacy payee_name column."
lexicon: true
tags: [domain, nlq, import]
timestamp: 2026-06-21T00:00:00Z
---

# Payee name

`transactions.payee_name` holds a **cleaned merchant string** derived from the raw
bank `description` at create time — e.g. `"NETFLIX.COM LOS GATOS USA"` → `"Netflix"`.

Its purpose is narrow and forward-looking: **NLQ embedding quality.** A clean payee
string embedded per transaction makes semantic queries like *"how much do we spend
on fast food?"* work far better than the raw description. It is **not** entity
resolution (no payee records, no FK) and **not** transaction tagging (that is
[auto-allocation](/concepts/auto-allocation.md)). Internal transfers and bookkeeping
rows have no merchant, so they resolve to **NULL** by design.

## Lineage — old column, new job

The `payee_name` column is an artifact of the abandoned v1 [payees](/tables/payees.md)
feature (Trinidad-era). That feature died; the empty column was **repurposed** for
this NLQ use rather than adding new schema. The sibling columns `payee_id` (D6) and
`payee_code` (D-Trinidad) stay dead — this work deliberately reused only the string
column. See [transactions](/tables/transactions.md).

## How a name is resolved

`PayeeNameResolver.call(txn) → [outcome, name]` is the **single source of truth**,
used by **both** a `Transaction before_create` callback (so import + manual entry
apply it) **and** the one-shot historical `PayeeBackfill`, so they can't drift:

1. **`PayeeTransferDetector.transfer?`** — is this an internal money-move that has no
   merchant? **Structural skips first** (`brought_forward_status` present,
   `sink_fund_allocation_id` present, app-transfer descriptions like
   `"Internal Allocation Transfer"` / `"Withdrawal - "` / `"Deposit - "`), then a
   **hand-curated household vocabulary** (member names/surnames, sink-fund labels,
   credit-card-payment and own-account phrases). If a transfer → `:cleared`, name NULL.
2. **`PayeeNameExtractor.extract`** — otherwise clean the description via a **registry
   keyed by `bank_account.import_format`** (`abn-amro-bank`, `abn-amro-creditcard`,
   `abn-amro-creditcard-2026`): strip PAS suffix, processor/app-store prefixes, the
   store-code digit token, trailing locations/legal-suffixes/country codes. **Case is
   preserved** (titleizing corrupts acronyms/domains; embeddings tolerate case). Found
   → `:named`; unregistered format → `:no_extractor`, name NULL.

The callback only writes when `payee_name` is blank, so a provided value is kept.
`payee_name` is **not exposed in `TransactionSerializer`** — it exists for the
embedding layer, not (yet) the UI.

## The brought-forward double-count trap

`Transaction#to_brought_forward_version` builds the carry-forward copy with `dup`,
which copies `payee_name`. The `before_create` callback's "skip if present" guard
would then let the copy **inherit the merchant name and double-count in NLQ**. Fix:
`to_brought_forward_version` explicitly **nulls `payee_name` on the dup**, so the
detector re-clears it (the copy carries `brought_forward_status`, the first structural
skip). Any future attribute-setting `before_create` callback must account for this dup
interaction. See [brought-forward](/concepts/brought-forward.md).

## Lifecycle & household specifics

- **Permanent:** extractor, detector, resolver, the `before_create` callback.
- **One-shot:** `PayeeBackfill` service + `payee:backfill` rake (backfills NULL
  `payee_name` rows; deleted after a successful prod soak — tracked in domus).
- **Household-specific (system-vs-household tier):** the transfer vocabulary and the
  cardholder-annotation regexes encode this household's conventions (member
  names/surnames, sink-fund labels). They currently sit in prod code and carry real
  identifiers — a **config-refactor candidate** and a known PII concern, tracked
  separately.
