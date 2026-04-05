# ICS Credit Card Import — Research

**Date:** 2026-03-27
**Status:** GoCardless ruled out; manual CAMT.053 import remains the only viable path.

## Finding

GoCardless (formerly Nordigen) cannot be used to automate ICS credit card statement import.

## Why

- **PSD2 scope.** The EU open banking directive GoCardless implements covers *bank accounts*, not credit cards.
- **ICS is a separate legal entity from ABN AMRO** — it is not covered by ABN AMRO's PSD2 access, so GoCardless's bank connection wouldn't reach ICS card data even if it worked for cards.
- **GoCardless closed to new signups since July 2025** — no new integrations possible regardless of the above.

## Implications

- Do not re-investigate GoCardless if ICS import comes up again.
- The current approach (manual CAMT.053 file download + CSV parsing) remains the only viable option unless ICS itself exposes an API (they do not currently).
- Future investment should go toward making the manual import flow more resilient, not toward automated bank connection.
