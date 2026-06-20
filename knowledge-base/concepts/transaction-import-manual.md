---
type: concept
title: Manual import (copy-paste)
description: >-
  Frontend-only import: parses bank data copy-pasted from the bank's web UI into
  EveryCent transactions, per import_format. Ambiguous IDs, duplicate risk.
tags: [domain, import, manual, frontend]
timestamp: 2026-06-17T00:00:00Z
---

# Manual import (copy-paste)

A sub-concept of [transaction import](/concepts/transaction-import.md). The
original and still-needed path.

- **Frontend-only.** The user copies transaction data from the bank's web UI; the
  frontend parses it into [transactions](/tables/transactions.md) according to the
  account's [`import_format`](/tables/bank_accounts.md). There is no backend
  importer for this path.
- **Origin.** The first supported format mirrored Scotia Bank's web interface
  (which is also why the transaction screen exposes separate withdrawal/deposit
  fields — see [transactions](/tables/transactions.md)).
- **ID ambiguity.** Copy-pasted rows lack definitive bank IDs, so there is real
  risk of paste mistakes and duplicates. Dedup relies on the
  `[bank_account_id, bank_ref]` key, with generated `MAN-<hex>` refs where none
  exist.
- **Always needed.** Not every account supports CAMT (e.g. the credit card), so
  manual import is permanent.
- `camt_imported` is **false** for these rows.
