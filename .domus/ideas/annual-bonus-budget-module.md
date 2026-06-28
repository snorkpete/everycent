# Idea: Annual / Bonus Budget Module

**Captured:** 2026-06-22
**Status:** raw

---

## The Idea

An annual/bonus budget module that feeds into Everycent. Today the bonus is budgeted in an external spreadsheet, and Everycent data is manually copied back into that spreadsheet to provide the "actuals" — so Everycent never sees the budgeted figures, and producing the actuals requires awkward manual data copies each time.

The module would let users define a bonus/annual budget that sits **outside** the normal (monthly) zero-based budget period, while still leveraging Everycent for the actuals, since the spend is already being tracked in Everycent.

A few worked examples of how the bonus is currently budgeted exist in the external spreadsheet and can be used as reference when scoping this.

---

## Why This Is Worth Doing

- Removes the need for the external spreadsheet entirely — one source of truth instead of two.
- Eliminates the manual, error-prone data copying of actuals out of Everycent and back into the spreadsheet.
- Brings budgeted figures into Everycent for the first time for this class of spend, so budget-vs-actual can be computed in-app rather than by hand.
- Fits Everycent's purpose: the spend is already tracked here, so the actuals side is essentially free — only the budgeting/period side is missing.

---

## Open Questions / Things to Explore

- How does a bonus budget relate to the existing monthly zero-based budget periods/allocations? Does it layer on top, or live entirely separately?
- How are "actuals" mapped back from Everycent transactions to bonus budget line items — category mapping, a dedicated tag, or a new `allocation_class`?
- Does a bonus budget span multiple months, or sit entirely outside the period model?
- UI: where does this live? A separate section/page, or an extension of the existing budget views?
- Is this a one-off per bonus event, or a recurring annual construct?
- What can the existing worked examples in the external spreadsheet tell us about the shape of the line items and the budgeting logic to replicate?
