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
- **TypeScript** — type-check with `npm run type-check` (runs `vue-tsc -b --noEmit`, the `-b` flag is essential). If type-check reports stale errors, clear the build cache: `rm node_modules/.tmp/tsconfig.app.tsbuildinfo`.
- **Worktree node_modules** — the project uses npm. Run `npm install` inside each worktree — do not symlink from another worktree (symlinked `node_modules` break Vite asset resolution via `@fs`, e.g. primeicons fonts fail). Do not run `bun install` in this project; bun auto-migrates `package-lock.json` to its own `bun.lock`, creating lockfile drift. (A "should we migrate to bun?" discussion is in `project_next-up.md`.)
- **Worktree `.env.local`** — `.env.local` is gitignored and absent in fresh worktrees. Tests don't need it (`VITE_GOOGLE_CLIENT_ID` is stubbed where required), but `npm run dev` does — Google sign-in silently no-ops without the client ID. Copy it in from the main checkout before running the dev server in a worktree.

## Mobile Development Pattern

Separate mobile layouts into dedicated components, not inline `v-if` branches inside the shared template.

**Pattern:** container component uses `v-if="isMobile"` / `v-else` to select between a mobile-specific component and the desktop component. Mobile-specific files are named `*Mobile.vue` (e.g. `SinkFundsToolbarMobile.vue`, `SinkFundAllocationListMobile.vue`).

**Why:** The prior approach (scattered `v-if="isMobile"` inside TransactionsPage/BudgetsPage) creates template soup. Separate components give mobile and desktop layouts independent codepaths with no shared template noise.

**Card/list pattern for mobile list screens:**
- Render items as `<li>` cards, not table rows
- Tap the card (`@click` on `<li>`) to expand hidden detail rows
- `@click.stop` on interactive elements inside the expanded section to prevent collapse
- 2×2 grid for secondary fields, full-width action button at bottom of expanded section
- Never reuse table layouts as mobile layouts — use card/list primitives

**Reference implementation:** `SinkFundsPage.vue`, `SinkFundsToolbarMobile.vue`, `SinkFundAllocationListMobile.vue`.

## Coding Conventions

Reference implementations:
- Store: `src/app/transactions/transactionStore.ts`
- API: `src/app/bank-accounts/bankAccountApi.ts`
- Component: `src/app/transactions/TransactionsPage.vue`

For detailed rules and pattern explanations (e.g. during a code review), see `docs/vue-coding-rules.md`.

Key rules:
- Feature code under `src/app/<feature>/`; shared form components under `src/app/shared/form/`
- Use a separate `FormData` type when form shape differs from the API type (number fields bound to `EcTextField` must be strings)
- **`EcMoneyField`** — native `<input>`, not PrimeVue. Emits on `input`, reformats on `blur`. Props: `highlightMode?: 'positive' | 'zero'`, `inline?: boolean` (hides label, row layout for tables/strips). `label` is optional (defaults to `''`).
- Store actions that fail must re-throw after setting `error.value`
- **`EcMoneyDisplay`** — read-only money display at `src/app/shared/form/money-field/EcMoneyDisplay.vue`. Props: `modelValue` (cents), `highlightMode?: HighlightMode` (`None`, `Balance`, `Difference`), `emphasis?: Emphasis` (`Item`, `Subtotal`, `Total`, `Headline`). Uses const object + type pattern for domain enums.
- `useNotifications()` at `src/app/notifications/` — `.success()` / `.error()`
- Deep-clone reactive Vue props with `structuredClone(toRaw(props.x))` — `structuredClone` alone throws on Proxy objects
- **Icon-only buttons must have a `v-tooltip`** explaining what the button does in plain language (not just the action — what it achieves). Never use the native HTML `title` attribute — always use PrimeVue's `v-tooltip` directive.
- **Use PrimeVue design tokens for colors** — never hardcode hex colors or rgba values in CSS. Use `var(--p-green-600)`, `var(--p-red-600)`, `var(--p-surface-*)`, `var(--p-text-muted-color)`, etc. Exception: MenuSidebar theme preview swatches.
- Use `bankAccountApi.getOpen()` for dropdowns/selection UI — returns open accounts sorted by category
- **Check PrimeVue built-in props before building custom behavior.** Use `mcp__primevue__get_component_props` to see all available props — PrimeVue components are feature-rich and often cover common needs (e.g. `showClear`, `filter`, `editable`, `fluid`). Only build custom solutions when PrimeVue genuinely doesn't support the behavior.

## Testing

- **Mount helper must be named `createWrapper()`** — not `mountPage`, `mountDialog`, `mountComponent`, etc. Must have explicit `: VueWrapper` return type annotation.
- **PrimeVue Dialog teleports to `document.body`** — always stub in tests (`stubs: { Dialog: DialogStub }`). See `docs/vue-testing-patterns.md` for the stub template.
- **Wallaby for interactive sessions; `npx vitest run <spec> --reporter=verbose` for worktree agents** — Wallaby cannot see worktree files
- Interceptors live in `src/api/interceptors/` — each has its own spec with full coverage

See `cypress/CLAUDE.md` for E2E test rules.
