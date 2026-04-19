# Task: Refactor budget screens to new mobile dev standards

**ID:** refactor-budget-screens-to-new-mobile-dev-standards
**Status:** done
**Branch:** task/refactor-budget-screens-to-new-mobile-dev-standards
**Autonomous:** true
**Priority:** high
**Captured:** 2026-04-13
**Parent:** make-ui-mobile-friendly
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Five files under `webclientv4/src/app/budgets/` still carry inline `v-if="isMobile"` branches, mixing mobile and desktop markup in the same component:

- `BudgetsPage.vue` (budgets list screen)
- `BudgetPage.vue` (single budget details screen)
- `BudgetAllocationList.vue`
- `BudgetIncomeList.vue`
- `BudgetSummaryStrip.vue`

This is the same smell already cleaned up for transactions (commit `79bca676`) and sink funds. Extract the mobile markup into dedicated `*Mobile.vue` components so the desktop components are mobile-branch-free and the mobile components are desktop-branch-free.

Pure code refactor. No feature work, no visual changes.

---

## Acceptance Criteria

- [ ] In the five files listed above, no `isMobile`-gated **template branches** remain — desktop components contain no mobile markup and mobile components contain no desktop markup. Trivial prop-level uses (e.g. `:size="isMobile ? 'sm' : 'md'"`) are acceptable if extracting them would be net-worse; flag any such cases in the PR description.
- [ ] Mobile markup lives in dedicated `*Mobile.vue` components under `webclientv4/src/app/budgets/`, following the transactions refactor pattern (see commit `79bca676`).
- [ ] Mobile and desktop layout/behaviour on both screens (budgets list, budget details) are visually and functionally unchanged. **Visual verification happens in the main session during review, not inside the worker.** After the worker commits, the main session starts Vite on `:4203` inside the worker's worktree and compares it tab-by-tab against prod at `localhost:3000` using `claude-in-chrome` (both desktop and mobile widths, both screens). Deltas are sent back to the worker via `SendMessage` for fixes.
- [ ] Each extracted mobile component has its own `*.spec.ts` test file with coverage matching the transactions mobile components' standard.
- [ ] Existing desktop component specs still pass; mobile-only assertions are moved into the new mobile spec files.
- [ ] `npm run type-check`, `npm run test`, and `bundle exec rspec` all pass.
- [ ] Senior code reviewer agent run over all modified files with feedback addressed.

---

## Out of Scope

- Future budgets screen (`future-budgets/`) — separate task if/when it needs a mobile pass.
- Mass budgets screen.
- Any new features (e.g. exposing "View Transactions" on budgets mobile — that was in the old combined task but is explicitly excluded here).

---

## Implementation Notes

### Reference implementation

Commit `79bca676` — "extract dedicated mobile components for transactions screen". Read the diff first. The new mobile components live alongside their desktop counterparts in `webclientv4/src/app/transactions/`:

- `TransactionListMobile.vue` + `.spec.ts`
- `TransactionsToolbarMobile.vue` + `.spec.ts`
- `TransactionSummaryMobile.vue` + `.spec.ts`

Match that pattern: naming (`<Desktop>Mobile.vue`), test file naming, component location.

### File-by-file guidance

Ordered by isMobile density, lightest first:

| File | Lines | `isMobile` refs | Approach |
|---|---:|---:|---|
| `BudgetIncomeList.vue` | 184 | 2 | Likely trivial. Extract mobile branches to `BudgetIncomeListMobile.vue` only if there are real markup branches; if both refs are prop-level, leave in place and note. |
| `BudgetSummaryStrip.vue` | 226 | 2 | Same — inspect first, extract if markup branches exist. |
| `BudgetPage.vue` | 156 | 3 | Page-level conditional: should end up selecting between desktop and mobile child components rather than branching on markup itself. Follow `TransactionsPage.vue` as reference for how the page hosts the two variants. |
| `BudgetsPage.vue` | 432 | 4 | Same page-level pattern as `BudgetPage.vue`. |
| `BudgetAllocationList.vue` | 582 | **25** | **Main lift.** Most mobile markup lives here. Extract to `BudgetAllocationListMobile.vue`. Expect this component to carry the card/list layout equivalent of `TransactionListMobile.vue`. |

The number of `*Mobile.vue` files produced is driven by what's actually there — do not invent mobile components for files whose `isMobile` usage turns out to be prop-level only.

### Specs

- Move any mobile-specific assertions out of the existing `*.spec.ts` files into the new `*Mobile.spec.ts` files.
- Desktop specs should end up with zero mobile-mode setup after the move.
- New mobile spec files follow the transactions mobile specs as reference for structure and coverage depth.

### Branch and commit

- Branch name: `task/refactor-budget-screens-mobile`
- Branch from `master`.
- **One commit** for the whole refactor — matches the transactions refactor shape. Do not split per-file.
- Commit message style: match `79bca676`.

### Visual parity — handled in main session, not by the worker

Workers are subagents with `isolation: "worktree"`: they receive one prompt and return one result, so they cannot drive an interactive tab-by-tab visual comparison with the user in the loop. That check lives in the main session, **after** the worker commits.

The worker does **not** need to start a dev server or open a browser. The worker's job is: refactor, tests green, reviewer run, commit, stop.

For reference — what the main session will do during review (not the worker's responsibility):

- `cd` into the worker's worktree and run `npm run dev -- --port 4203` from `webclientv4/` (port must stay in `4200–4210` for Google auth).
- Rails on `:3000` stays shared — it's already serving the compiled prod Vue bundle, which is the "before" baseline.
- Open two `claude-in-chrome` tabs (`:4203` refactor vs `:3000` prod) and compare both screens at desktop and mobile widths.
- If deltas are found, main session sends the worker back via `SendMessage`.

### Known risks / edges

- `BudgetAllocationList.vue` is 582 lines with 25 `isMobile` refs. Expect the bulk of the work here. Resist the urge to refactor unrelated things while in the file — pure isMobile extraction only.
- `BudgetsPage.vue` (list) contains budget-summary data rendering that may share logic with the details page — watch for accidental duplication when extracting. Prefer a single mobile child component reused across pages over copy-paste.
- Pre-existing spec flakiness (`BudgetAllocationList`/`BudgetIncomeList` ordering in the full suite, per project notes) may surface. Not this task's problem to solve — re-run if flaky, do not modify those tests beyond what's required to move mobile assertions out.

### Review loop

- Before committing, run the senior-code-reviewer agent over all modified files (per project `CLAUDE.md`).
- Apply review feedback, then commit.
- Do not push, do not merge — stop after commit and report back.
