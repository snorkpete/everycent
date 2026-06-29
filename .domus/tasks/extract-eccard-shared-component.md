# Task: Extract EcCard shared component

**ID:** extract-eccard-shared-component
**Status:** ready
**Autonomous:** false
**Priority:** high
**Captured:** 2026-04-04
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

The bordered-surface card chrome (`border: 1px solid var(--p-surface-300)` +
`p-surface-0` background + `border-radius: 6px`) is hand-rolled inline across ~17
components. Extract a **thin, chrome-only `EcCard` wrapper** (slot + the three chrome
properties, **no padding**) so card UX is consistent for free. Flagged by
senior-code-reviewer during the visual-audit-setup-screens review (2026-04-04).

**Scope confirmed by a 2026-06 audit** (original task said "4 places"; the pattern has
since spread to ~20 selectors). v1 covers the `p-surface-0` cards only.

**Behaviour/UX-preserving refactor.** Vue (webclientv4), healthcheck workstream. Per
CLAUDE.md refactor discipline this is **human-in-loop + staged review** — NOT an
autonomous worker job.

### Why chrome-only / no padding
The audit found padding varies widely across consumers (1.25rem / 1rem / 0.75rem /
flex / overflow). Baking padding in would force per-consumer overrides. So `EcCard`
owns ONLY border + bg + radius; the consumer keeps its own padding and inner-layout
CSS. Bonus: one component serves desktop AND mobile (mobile just applies tighter
padding itself).

---

## Acceptance Criteria

- [ ] New `EcCard.vue` in `src/app/shared/layout/` (sibling to `EcItemList.vue` —
      follow its conventions). Renders one bordered surface: `border: 1px solid
      var(--p-surface-300)`, `p-surface-0` background, `border-radius: 6px`, default
      slot. **No padding baked in.**
- [ ] Unit test coverage for `EcCard` (renders slot content; applies chrome) per
      webclientv4 TDD / 100%-coverage-on-new-code rule.
- [ ] All v1 consumers (list below) migrated to `<EcCard>`; their inline
      border/bg/radius declarations removed; their padding / layout extras
      (flex, overflow, border-bottom on inner headers) **retained** on the consumer.
- [ ] `WhatsNew`'s `border-left: 4px` accent preserved (applied consumer-side, not
      baked into EcCard).
- [ ] UX preserved: each migrated page renders visually identical (border, bg, radius,
      spacing) — verified visually, desktop + mobile.
- [ ] `npm run type-check` + `npm run test` green; senior-code-reviewer run on the diff.

### v1 consumers (from 2026-06 audit)
Desktop: SettingsPage `.settings-card`, TransactionsPage `.content-card`,
SpecialEventDetailPage `.header-card`, SpecialEventAllocationsEditor `.header-card` +
`.panel`, WhatsNew `.highlight-card` (+accent), BudgetsPage `.content-card`, BudgetPage
`.content-card`, ImportPage `.account-group`, ChatSettingsPage `.settings-card`,
SinkFundsPage `.content-card`, AccountBalancesPage `.content-card`.
Mobile: SpecialEventDetailMobile `.header-card`, SpecialEventAvailableAllocationsMobile
`.panel`, SpecialEventCurrentAllocationsMobile `.panel`, BudgetsListMobile
`.budget-card`, AccountCategoryTableMobile `.category-table-mobile`.

### Explicitly OUT of scope (v1)
- The 3 `p-surface-50` summary strips (BudgetSummaryStrip, AccountBalanceSummaryStrip,
  + mobile variants) — a distinct "summary strip" pattern; may warrant its own
  `EcSummaryStrip` later, don't overload EcCard with a variant prop now.
- `TransactionSummary` top-only-radius (`6px 6px 0 0`) header strips.
- Table wrappers with no background, menu links, other incidental `6px` uses.

---

## Implementation Notes

- **Key design call (settle during staged review): how consumers apply padding.**
  Consumers currently put `padding` on the card selector itself. With chrome-only
  EcCard, padding moves consumer-side — either a padded wrapper element inside the
  slot, or the consumer's existing content element keeps its padding. Recommend NO
  padding prop (keeps EcCard truly thin per original intent); pick the cleanest
  per-consumer mechanism during review. Do NOT re-introduce padding opinions into
  EcCard.
- **Reference:** `src/app/shared/layout/EcItemList.vue` for the shared-layout component
  idiom (structure, scoped style, naming).
- **Staged migration:** build + test EcCard first, then migrate consumers in small
  batches, staging each for review (CLAUDE.md: refactors need active review; push back
  if a consumer's "card" turns out to differ enough to not fit). The originally-named
  4 (Transactions, SpecialEventDetail, SpecialEventAllocationsEditor, Settings) are a
  sensible first batch.
- **Watch:** consumers with layout extras on the same selector (`.content-card` flex +
  overflow; ImportPage `.account-group` border-bottom on header; AccountCategoryTableMobile
  overflow:hidden) — those extras stay on the consumer, only the chrome moves to EcCard.
