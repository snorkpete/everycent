# Idea: CSV import for credit cards

**Captured:** 2026-06-21
**Status:** raw

---

## The Idea

Switch credit-card transaction imports from manual entry to **CSV import from Mijn ICS** (the ABN AMRO credit card portal).

ABN AMRO credit cards are serviced by ICS (International Card Services), which offers **no CAMT export** — only PDF and CSV. (Research confirmed CAMT will never come to the ICS card: it's a bank-account standard, ISO 20022 puts cards in a separate non-statement message family, and no issuer publishes camt for consumer cards.) So CSV is the realistic structured path for cards, the same way CAMT.053 is the path for ABN AMRO bank accounts.

This is the credit-card-specific instance of the broader `resilient-transaction-import` idea (which is staying open precisely because cards have no CAMT).

---

## Why This Is Worth Doing

- Eliminates manual entry of credit-card transactions — the last import path still done by hand now that bank accounts are clean CAMT imports.
- Brings the card into the same structured-import + auto-categorisation flow the bank accounts already enjoy.
- CSV is what every NL bookkeeping tool uses for ICS — proven path.

---

## Open Questions / Things to Explore

**Two go/no-go feasibility checks — only switch to CSV import for cards if BOTH hold:**

1. **Stable unique transaction identifier.** Does the Mijn ICS CSV contain a unique, stable per-transaction ID? Without it, reliable dedup (detecting whether a transaction was already uploaded) is hard. Inspect a real ICS CSV export to confirm. If there's no native ID, can we derive a stable fingerprint (date + amount + description + sequence) reliably enough? (Compare to existing dedup approach — see `transaction-fingerprinting-for-dedup` task and `ImportTransactionClassifier` duplicate detection.)
2. **CSV generation isn't too cumbersome.** How many manual steps to download the CSV from Mijn ICS? If it's a quick export it's worth it; if it's buried/painful, the manual-entry status quo may win. Assess the actual download UX.

**Other:**
- What columns does the ICS CSV actually provide (date, amount, description, merchant, balance)? Map to Everycent's import fields.
- Does auto-categorisation (AutoAllocationSuggester) work as-is on card descriptions, or do card descriptions differ enough to need tuning?
- Heavier alternative — PSD2 / open-banking API — **investigated → effectively a dead end for an individual.** Self-registering as an AISP needs a legal entity (DNB) + fees + eIDAS certs; enterprise aggregators need a company/KYB; GoCardless free tier closed to new signups Jul 2025. Only individual-friendly route is Enable Banking "restricted production" (own accounts, free) — BUT it's unconfirmed the ICS *credit card* is even exposed as a PSD2 account (ICS killed its PSD2 portal Jan 2023; credit cards generally aren't "payment accounts"). So CSV is the path; the only cheap experiment is checking Enable Banking to see if the card surfaces. Don't bank on it.

---

*Background research captured at second-brain `inbox/abn-amro-credit-card-camt-research.md` and `inbox/ics-credit-card-psd2-api-feasibility.md`.*
