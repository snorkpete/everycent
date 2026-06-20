---
type: concept
title: Transaction import
term: import
definition: "Loading transactions into the system via three methods: file import (CAMT, idempotent), manual entry, manual upload (copy-paste). The save is destructive (wipe and replace)."
lexicon: true
description: >-
  How real bank transactions get into EveryCent. Mostly frontend parsing selected
  by import_format; the CAMT path is the one importer with a backend component
  (definitive IDs, real dedup). Parent of the manual and CAMT sub-concepts.
tags: [domain, import, banking, transactions]
timestamp: 2026-06-17T00:00:00Z
---

# Transaction import

How real bank data becomes [transactions](/tables/transactions.md). There are two
import styles, both selected per account by
[`bank_accounts.import_format`](/tables/bank_accounts.md):

- [Manual import](/concepts/transaction-import-manual.md) — frontend parsing of
  copy-pasted bank data.
- [CAMT import](/concepts/transaction-import-camt.md) — structured ISO 20022, with
  a backend component and real deduplication.

## Shared mechanics

- **`import_format`** selects which parser/logic applies. It is **durably live** —
  not every account has CAMT available (e.g. the credit card), so manual import
  (and choosing its parser) will always be needed.
- **`account_no`** is load-bearing here: it matches imported rows to the right
  account.
- **`bank_ref` + the unique `[bank_account_id, bank_ref]` index** is the dedup
  key. Manual rows without a bank ref get a generated `MAN-<hex>`.
- **`camt_imported`** flags provenance (CAMT vs. manual/copy-paste) — mostly
  UI-informational, used to signal which rows have definitive IDs.

## Why provenance matters

Copy-pasted rows have ambiguous IDs (paste mistakes, duplicate risk); CAMT rows
carry definitive server-side IDs. The household has **largely moved to CAMT where
supported** (ABN AMRO accounts) for reliability; the anticipated mixing of the two
didn't materialize, but manual import remains necessary where CAMT isn't offered.
