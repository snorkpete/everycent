# Task: Enforce single canonical API owner per endpoint

**ID:** enforce-single-canonical-api-owner-per-endpoint
**Status:** in-progress
**Branch:** task/enforce-single-canonical-api-owner-per-endpoint
**Autonomous:** true
**Priority:** high
**Captured:** 2026-04-10
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Two api-module methods duplicate endpoint ownership, breaking the 1:1 API↔controller invariant that dead-code detection depends on. Fix the current duplicates and add automated enforcement so the invariant can't silently regress.

**Source:** `.reviews/2025-04-08/sonnet-deduped.md` §5.2

**Current duplicates found in code:**
- `/institutions` — `bankAccountApi.getInstitutions()` duplicates `institutionApi.getAll()`. Only caller of the dup is `bankAccountStore.ts:30`.
- `/allocation_categories` — `futureBudgetsApi.getAllocationCategories()` duplicates `allocationCategoryApi.getAll()`. Only caller of the dup is `futureBudgetsStore.ts:66`.

**Report correction:** §5.2 also named `budgetStore` as a third duplicate caller of `/allocation_categories`. Investigation shows `budgetStore.ts:22` uses `allocationCategoryApi.getAll()` (the canonical owner). Not a duplicate. No action for `budgetStore`.

**Enforcement rule (going forward):** endpoint URL strings belong exclusively inside `*api.ts` files, and each endpoint has exactly one owning api module. This is the invariant dead-code detection depends on.

---

## Acceptance Criteria

- [x] `bankAccountApi.getInstitutions()` removed; `bankAccountStore` and all specs switched to `institutionApi.getAll()`.
- [x] `futureBudgetsApi.getAllocationCategories()` removed; `futureBudgetsStore` and all specs switched to `allocationCategoryApi.getAll()`.
- [x] A script scans all `*api.ts` files for endpoint URL literals and fails if any endpoint appears in more than one file.
- [x] A custom ESLint rule fails any `apiGateway.(get|post|put|delete|patch)` call made outside `*api.ts` files.
- [x] Both checks run from the pre-commit hook and fail the commit on violation.

## Out of Scope

- Components calling api modules directly (§5.1 — tracked as `route-specialeventallocationseditor-api-calls-through-a-store`).
- Restructuring api modules beyond removing the two duplicate methods.

---

## Implementation Notes

### Part 1 — Remove the two duplicates

**`/institutions`:**
- Delete `getInstitutions` from `webclientv4/src/app/bank-accounts/bankAccountApi.ts`.
- `webclientv4/src/app/bank-accounts/bankAccountStore.ts:30` — replace `bankAccountApi.getInstitutions()` with `institutionApi.getAll()`. Add the import from `../institutions/institutionApi`.
- Update specs to mock `institutionApi.getAll` instead of `bankAccountApi.getInstitutions`:
  - `bankAccountStore.spec.ts` (lines 9, 71, 80, 91, 101)
  - `BankAccountsPage.spec.ts` (lines 13, 56, 81, 215)
  - `bankAccountApi.spec.ts` — remove the `describe('getInstitutions', …)` block entirely
  - `transactionStore.spec.ts:32` — stale mock. Verify it's no longer referenced anywhere in the file and delete.

**`/allocation_categories`:**
- Delete `getAllocationCategories` from `webclientv4/src/app/budgets/future-budgets/futureBudgetsApi.ts`.
- `webclientv4/src/app/budgets/future-budgets/futureBudgetsStore.ts:66` — replace with `allocationCategoryApi.getAll()`. Add the import from `../../allocation-categories/allocationCategoryApi`.
- Update specs:
  - `futureBudgetsStore.spec.ts` (lines 20, 28)
  - `futureBudgetsApi.spec.ts` — remove the `describe('getAllocationCategories', …)` block
  - `FutureBudgetsPage.spec.ts` (lines 100, 138)

Run `npm run type-check` and `npm run test` after Part 1 to confirm green before moving on.

**Commit 1:** `chore(webclientv4): remove duplicate api-module endpoint owners`

---

### Part 2 — Custom ESLint rule `local/no-api-gateway-outside-api-modules`

**Location:** `webclientv4/tools/eslint-rules/`
- `index.js` — exports a local plugin object: `export default { rules: { 'no-api-gateway-outside-api-modules': rule } }`.
- `no-api-gateway-outside-api-modules.js` — the rule module.

**Rule logic:**
```js
meta: {
  type: 'problem',
  docs: { description: 'apiGateway calls are only allowed inside *api.ts modules' },
  messages: {
    outsideApiModule: 'apiGateway.{{method}} called outside an *api.ts module. Use or create an api module for this endpoint.',
  },
  schema: [],
}

create(context) {
  const filename = context.filename;
  // Allow api modules and any test file (specs mock apiGateway freely).
  if (filename.endsWith('api.ts')) return {};
  if (filename.endsWith('.spec.ts')) return {};

  const methods = new Set(['get', 'post', 'put', 'delete', 'patch']);

  return {
    CallExpression(node) {
      const callee = node.callee;
      if (callee.type !== 'MemberExpression') return;
      if (callee.object.type !== 'Identifier' || callee.object.name !== 'apiGateway') return;
      if (callee.property.type !== 'Identifier') return;
      if (!methods.has(callee.property.name)) return;
      context.report({
        node,
        messageId: 'outsideApiModule',
        data: { method: callee.property.name },
      });
    },
  };
}
```

**Register in `webclientv4/eslint.config.js`:**
```js
import localRules from './tools/eslint-rules/index.js';
// inside the config array:
{
  plugins: { local: localRules },
  rules: { 'local/no-api-gateway-outside-api-modules': 'error' },
}
```

Rule applies to `.ts` and `.vue` script blocks automatically — `eslint-plugin-vue` handles Vue SFC parsing already.

**Tests:** `webclientv4/tools/eslint-rules/no-api-gateway-outside-api-modules.spec.ts`
Use ESLint's `RuleTester` with the rule module. Cases:
- Valid: inside `foo.api.ts` (any apiGateway call OK — file exempt)
- Valid: inside `.spec.ts` (exempt)
- Valid: inside `fooStore.ts` calling `fooApi.getAll()` (not a direct apiGateway call)
- Invalid: inside `fooStore.ts` calling `apiGateway.get('/foo')` — expect 1 error
- Invalid: inside `FooPage.vue`'s script block — expect 1 error

If RuleTester doesn't play cleanly with vitest, run the tests via a plain `node --test` script instead. Either works — pick whichever is less friction.

**Commit 2:** `chore(webclientv4): add custom eslint rule and api-ownership check script` — includes Part 3 below so Parts 2 and 3 land together before Part 4 enables gating.

---

### Part 3 — Duplicate-endpoint scanner

**Location:** `webclientv4/tools/check-api-ownership.mjs` (plain ESM JavaScript, no tsx).

**Logic:**
1. Glob `src/**/*api.ts`, exclude `*.spec.ts`.
2. For each file, read source and match: `/apiGateway\.(get|post|put|delete|patch)\s*(?:<[^>]*>)?\s*\(\s*[`'"]([^`'"]+)[`'"]/g`
3. Normalise each captured URL: replace `${...}` interpolations with `:id` so `/institutions/${id}` and `/institutions/${foo.bar}` both become `/institutions/:id`. This collapses trivial template-literal variation without changing identity.
4. Build `Map<normalisedUrl, string[]>` (files per URL).
5. Any URL with more than one file → print all offending files and URLs, exit 1.
6. Otherwise exit 0.

**No allowlist.** Per-URL identity means the `accountBalance` / `bank_accounts` case from §6.3 is fine — different URLs, different owners.

**Add npm script to `webclientv4/package.json`:**
```json
"check:api-ownership": "node tools/check-api-ownership.mjs"
```

Test the script by running it against the codebase after Part 1 — should exit 0. Run it again after temporarily re-adding a duplicate method to confirm it exits 1 and reports the right files. Remove the temporary duplicate before committing.

---

### Part 4 — Pre-commit wiring

Edit `webclientv4/.husky/pre-commit`. After the existing `lint-staged` call on line 23, before the `cd "$worktree_root"` on line 26, add:

```sh
node tools/check-api-ownership.mjs || { echo "pre-commit: api ownership check failed"; exit 1; }
```

The ESLint rule does not need explicit wiring — it rides `lint-staged`'s `eslint --fix` call via the updated `eslint.config.js`.

**Verification:** stage a harmless change and commit. Confirm the scanner runs and passes. Then temporarily create a duplicate endpoint in an api module, stage, attempt commit, confirm the hook fails with a clear message, revert.

**Commit 3:** `chore(webclientv4): wire api-ownership check into pre-commit hook`

---

### Risks and edge cases

- **RuleTester + vitest integration.** If it fights the vitest harness, fall back to `node --test`. Don't sink time into making it pretty.
- **Regex brittleness in the scanner.** The regex assumes `apiGateway.METHOD(` on a single logical line up to the URL literal. If any caller splits that across lines with weird whitespace, the scanner may miss it. The codebase uses the single-line pattern consistently — check once with a quick grep that every `apiGateway\.` call in `*api.ts` has a string literal on the same line. If any exceptions exist, handle them or normalise them first.
- **`transactionStore.spec.ts:32`** — the stale `getInstitutions` mock. If removing it reveals a test actually depended on it being mocked (e.g. transactionStore indirectly imports bankAccountApi somewhere), swap to mocking `institutionApi.getAll` instead of deleting.
- **Husky hook in worktrees.** Existing hook already handles worktree `node_modules` symlinking — the new scanner call runs from `webclientv4/` cwd which is already set.

### Not in scope

- §5.1 component-to-api-module layer violations (separate task).
- Any api module restructuring beyond deleting the two duplicate methods.
- `budgetStore` — already verified it's not a duplicate.
