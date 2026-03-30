# Vue 3 Frontend (webclientv4)

## Architecture Constraints

### Viewport-Locked Layout
`App.vue` uses `height: 100vh; overflow: hidden`. `.main-content` is `display: flex; flex-direction: column; overflow: hidden`. `<router-view>` is wrapped in `.page-content` with `flex: 1; min-height: 0; overflow: hidden`.

**All scrolling must happen within page components.** Document-level scroll is gone. Future screens must set `overflow: auto` on their own container. Required for sticky headers to work.

### URL Sync Pattern for Search Forms
Call `router.replace({ query: { ... } })` in `emitFetch()` when selection changes; read from `route.query` on init. Reference implementation: `TransactionSearchForm.vue`.

## Development Setup

- **No proxy** — Axios hits Rails directly at `http://localhost:3000` (CORS configured). Do not add a proxy.
- **Angular comparison** — `localhost:3000` also serves the Angular v3 app. Same credentials work. Open both side by side to verify feature parity during migration.
- **JetBrains** — open `webclientv4/` as project root to avoid tsconfig resolution issues.
- **matchMedia mock** — global mock in `src/test/setup.ts`, required by PrimeVue DatePicker and Select. Do not remove it.
- **Always use npm scripts** — use `npm run dev`, `npm run build`, `npm run test`, never invoke tools directly (`npx vite`, `npx vitest`, etc.). If an npm script fails, fix the underlying problem (install deps, fix PATH) rather than bypassing the script.

## Coding Conventions

Reference implementations:
- Store: `src/app/transactions/transactionStore.ts`
- API: `src/app/bank-accounts/bankAccountApi.ts`
- Component: `src/app/transactions/TransactionsPage.vue`

For detailed rules and pattern explanations (e.g. during a code review), see `docs/vue-coding-rules.md`.

Key rules:
- Feature code under `src/app/<feature>/`; shared form components under `src/app/shared/form/`
- Use a separate `FormData` type when form shape differs from the API type (number fields bound to `EcTextField` must be strings)
- **`EcMoneyField`** — native `<input>`, not PrimeVue. Emits on `input`, reformats on `blur`. Has `highlightMode?: 'positive' | 'zero'` prop.
- Store actions that fail must re-throw after setting `error.value`
- `useNotifications()` at `src/app/notifications/` — `.success()` / `.error()`
- Deep-clone reactive Vue props with `structuredClone(toRaw(props.x))` — `structuredClone` alone throws on Proxy objects
- **Icon-only buttons must have a `v-tooltip`** explaining what the button does in plain language (not just the action — what it achieves). Never use the native HTML `title` attribute — always use PrimeVue's `v-tooltip` directive.
- **Use PrimeVue design tokens for colors** — never hardcode hex colors or rgba values in CSS. Use `var(--p-green-600)`, `var(--p-red-600)`, `var(--p-surface-*)`, `var(--p-text-muted-color)`, etc. Exception: MenuSidebar theme preview swatches.
- Use `bankAccountApi.getOpen()` for dropdowns/selection UI — returns open accounts sorted by category

## Testing

- `createWrapper()` helper must have explicit `: VueWrapper` return type annotation
- **PrimeVue Dialog teleports to `document.body`** — always stub in tests (`stubs: { Dialog: DialogStub }`). See `docs/testing-patterns.md` for the stub template.
- **Wallaby for interactive sessions; `npx vitest run <spec> --reporter=verbose` for worktree agents** — Wallaby cannot see worktree files
- Interceptors live in `src/api/interceptors/` — each has its own spec with full coverage

See `cypress/CLAUDE.md` for E2E test rules.
