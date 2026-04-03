# Task: Migrate FutureBudgetsPage money display to EcMoneyDisplay

**Status:** done
**Branch:** task/migrate-futurebudgetspage-money-display-to-ecmoneydisplay
**ID:** migrate-futurebudgetspage-money-display-to-ecmoneydisplay
**Status:** proposed
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-04-03
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

FutureBudgetsPage uses `centsToDollars()` with custom CSS classes instead of EcMoneyDisplay. Most usages map to existing props, but the "Total Income" row uses a custom `.amount-income` style (`color: var(--p-primary-600); font-weight: 600`) that has no corresponding HighlightMode.

## Design Decision: Add `Income` HighlightMode

Add `Income: 'income'` to the HighlightMode const object. In EcMoneyDisplay's `highlightClasses`, it applies `.income` unconditionally (income is always income — no sign-based logic). CSS: `color: var(--p-primary-600)`.

The font weight (`600`) is already handled by `emphasis="Subtotal"` — no new emphasis needed.

This is a minimal, single-value extension to HighlightMode. No new props or structural changes to EcMoneyDisplay.

## Usages in FutureBudgetsPage

| Row | Current | Migration |
|-----|---------|-----------|
| Income amounts (line 49) | `centsToDollars()` + `.amount-cell` | `EcMoneyDisplay` with `highlight-mode="None"` |
| Total Income (line 68) | `centsToDollars()` + `.amount-income` | `EcMoneyDisplay` with `highlight-mode="Income"`, `emphasis="Subtotal"` |
| Category totals (line 82) | `displayAmount()` + `.amount-cell` | `EcMoneyDisplay` with `highlight-mode="None"` |
| Allocation amounts (line 122) | `displayAmount()` + `.amount-cell` | `EcMoneyDisplay` with `highlight-mode="None"` |
| Total Allocations (line 142) | `centsToDollars()` + `.amount-cell` | `EcMoneyDisplay` with `highlight-mode="None"`, `emphasis="Total"` |
| Person amounts (lines 151-167) | `centsToDollars()` + `.amount-cell` | `EcMoneyDisplay` with `highlight-mode="None"` |
| Fixed Total (line 177) | `displayAmount()` + `.amount-cell` | `EcMoneyDisplay` with `highlight-mode="None"`, `emphasis="Total"` |
| Total Discretionary (line 189) | `centsToDollars()` + `discretionaryClass()` | `EcMoneyDisplay` with `highlight-mode="Balance"`, `emphasis="Total"` |

---

## Acceptance Criteria

- [ ] `Income` added to HighlightMode const object and type
- [ ] EcMoneyDisplay handles `highlight-mode="Income"` with `.income` CSS class (`color: var(--p-primary-600)`)
- [ ] EcMoneyDisplay spec covers the new Income highlight mode
- [ ] All FutureBudgetsPage money display migrated to EcMoneyDisplay
- [ ] `.amount-income`, `.amount-positive`, `.amount-negative`, `.amount-zero`, `.amount-cell` CSS removed from FutureBudgetsPage
- [ ] `displayAmount()` and `discretionaryClass()` helpers removed if no longer used
- [ ] All existing tests pass
