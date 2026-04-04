# Future Budgets

## Definition

Spreadsheet-like screen for editing allocations and incomes across all open budgets simultaneously. The primary budget editing interface — estimated 95% of allocation editing happens here.

## Context

**Origin.** Built after observing how the user's wife used a spreadsheet to plan allocations across multiple months. The spreadsheet layout (allocations as rows, budgets as columns) turned out to be the natural way to think about budgets over time.

**Enforces allocation name consistency.** Because you edit by allocation name across budgets (not budget by budget), names naturally stay consistent. This is what makes name-based allocation identity work in practice.

**The 0 / 0.01 problem lives here.** Setting an allocation to 0 signals deletion. 0.01 is the keep-alive hack for seasonal allocations that need to survive across months. This is a UX workaround masking a missing "inactive but present" state.

## Contract

- Operates on all open budgets.
- Edits allocations by name across budgets.
- 0 = delete the allocation from that budget.
- 0.01 = keep the allocation alive without meaningful budget impact.
- Changes propagate through the copy chain (since copy duplicates allocations by name).
