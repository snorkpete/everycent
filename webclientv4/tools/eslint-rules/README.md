# Local ESLint Rules

Custom ESLint rules specific to this codebase. Registered as a flat-config plugin in `eslint.config.js` under the namespace `local`.

## Layout

- `index.js` — plugin entry point. Re-exports each rule under its name. Add new rules to the `rules` object here.
- `<rule-name>.js` — one file per rule. Plain JavaScript ESM (not TypeScript) so ESLint can load it without a TS toolchain.
- `<rule-name>.spec.mjs` — tests for the rule, using ESLint's `RuleTester`.

## Adding a new rule

1. Write the rule in `<rule-name>.js`.
2. Add it to `index.js`'s `rules` object.
3. Enable it in `eslint.config.js` (`'local/<rule-name>': 'error'`).
4. Write tests in `<rule-name>.spec.mjs` following the existing pattern.

## Why `node:test` instead of vitest

These tests use Node's built-in test runner (`node --test`), not vitest, which is what the rest of the codebase uses.

The reason is that ESLint's `RuleTester.run()` calls `describe()` and `it()` internally to register its own test cases. Vitest forbids calling these from inside a running `it()` block ("Calling the suite function inside test function is not allowed"), so wrapping `tester.run(...)` inside a vitest `it()` block crashes. `node:test` allows the nested calls.

The tradeoff is that rule tests live in a different runner from everything else. To keep them from being forgotten:

- The `tools/` directory is excluded from vitest in `vite.config.ts`, so vitest won't try to pick up these `.spec.mjs` files.
- `npm run test` runs both runners sequentially: `vitest run && npm run test:eslint-rules`. Either failing fails the whole command.
- `npm run test:eslint-rules` runs them on their own.

## Why `.js` instead of `.ts` for the rules themselves

ESLint loads rule modules at config time via plain `import`. Using TypeScript would require a TS compilation step in the loader, which adds complexity for a small payoff. The rules are short, the API is documented inline via JSDoc (`@type {import('eslint').Rule.RuleModule}`), and editors give type hints from the JSDoc reference. Plain JS keeps the toolchain minimal.
