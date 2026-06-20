---
type: concept
title: CAMT import
description: >-
  The structured ISO 20022 import path — the one importer with a backend
  component. Definitive server-side IDs enable real deduplication. Preferred where
  supported.
tags: [domain, import, camt, iso20022, backend]
timestamp: 2026-06-17T00:00:00Z
---

# CAMT import

A sub-concept of [transaction import](/concepts/transaction-import.md). The
structured, reliable path.

- **Structured format.** CAMT is the ISO 20022 bank-statement format (European
  banking; fits a typical European-bank setup).
- **Backend component.** Unlike manual import (frontend-only), CAMT has a
  **backend importer** — this is the *only* import path with backend logic,
  because the structured data allows server-side checks.
- **Definitive IDs → real dedup.** CAMT rows carry server-side transaction IDs, so
  duplicates can be detected reliably (no copy-paste ambiguity). This is the main
  reason it's preferred.
- **Selected via `import_format`**, like manual parsers; it "piggybacks" on the
  same per-account selection. Sets
  [`transactions.camt_imported = true`](/tables/transactions.md).
- **Adoption.** Some accounts have largely switched to CAMT-only for data
  reliability; accounts without CAMT support (e.g. the credit
  card) still use [manual import](/concepts/transaction-import-manual.md).
