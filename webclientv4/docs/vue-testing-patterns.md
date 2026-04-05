# Vue Testing Patterns

## Extract Test Values into Variables

Don't duplicate literal test values between setup (arrange) and assertion (assert) sections. Declare test values as variables at the top of the test, then reference them in both setup and expectations.

**Bad:**
```ts
it('does something', () => {
  localStorage.setItem('access-token', 'test-token');
  const result = doThing();
  expect(result).toBe('test-token');
});
```

**Good:**
```ts
it('does something', () => {
  const accessToken = 'test-token';
  localStorage.setItem('access-token', accessToken);
  const result = doThing();
  expect(result).toBe(accessToken);
});
```

This makes test values easy to update in one place and makes the relationship between setup and assertion explicit.

## Prefer Explicit Assertions over Loops

Don't use loops or filters to assert missing values. List each assertion explicitly so test failures clearly identify which key failed.

**Bad:**
```ts
for (const key of AUTH_HEADER_KEYS.filter((k) => k !== 'access-token')) {
  expect(result.headers.has(key)).toBe(false);
}
```

**Good:**
```ts
expect(result.headers.has('client')).toBe(false);
expect(result.headers.has('expiry')).toBe(false);
expect(result.headers.has('token-type')).toBe(false);
expect(result.headers.has('uid')).toBe(false);
```

## Use data-testid for Element Selection

Don't use CSS classes, tag names, or positional selectors (e.g. `findAll('input')[0]`) to find elements. Use `data-testid` attributes instead — they're decoupled from styling and structure, making tests resilient to refactors.

**Bad:**
```ts
wrapper.find('.app-title')
wrapper.find('h1')
wrapper.findAll('input')[0]
```

**Good:**
```ts
wrapper.find('[data-testid="app-title"]')
wrapper.find('[data-testid="welcome-heading"]')
wrapper.find('[data-testid="email-input"]')
```

Exception: test-controlled stubs (e.g. `RouterView: { template: '<div class="router-view" />' }`) can use classes since the stub is defined in the test itself.

## Export Functions for Testability

Don't reach into library internals (e.g. `as any` hacks on Axios interceptors). Instead, export the logic as named functions, register them on the library, and test the exported functions directly.

## PrimeVue Overlay/Popup Components

PrimeVue components like `DatePicker` and `Select` call `window.matchMedia` on mount, which jsdom doesn't implement. Add a `beforeAll` mock at the top of any spec file that mounts these:

```ts
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});
```

A global `src/test/setup.ts` is also wired into `vite.config.ts` `setupFiles`, which will apply this after a Wallaby restart.

## Triggering Child Component Events

To simulate a Vue component event from a child (e.g. PrimeVue DatePicker or Select emitting `update:modelValue`), use `vm.$emit` + `await nextTick()`:

```ts
wrapper.findComponent(DatePicker).vm.$emit('update:modelValue', new Date(2024, 0, 15));
await nextTick();
expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2024-01-15']);
```

## Test Runner: Wallaby vs Vitest

**Interactive sessions (Claude in main working tree):** Use Wallaby MCP tools (`wallaby_failingTests`, `wallaby_allTestsForFile`). Wallaby runs continuously and gives instant feedback.

**Worktree agents:** Must use vitest CLI — Wallaby only watches the main working tree (whatever branch is checked out there) and cannot see files in worktrees. Any agent running in a worktree must verify tests with:
```bash
cd /Users/kion/code/everycent/webclientv4 && npx vitest run <spec-file> --reporter=verbose
```
This rule exists because the worktree agent for the import migration marked tests as "verified by logic review" (since Wallaby couldn't see them), and they were silently broken — caught only after landing.

## PrimeVue Dialog Teleport in Tests

PrimeVue Dialog teleports its content to `document.body`, making `wrapper.find()` unable to locate elements inside it. Always stub the Dialog component when testing components that wrap PrimeVue Dialog:

```ts
// Stub PrimeVue Dialog to avoid teleport complexity in tests
const DialogStub = {
  name: 'Dialog',
  template: '<div><slot /><slot name="footer" /></div>',
  props: ['visible'],
  emits: ['update:visible'],
};

// In mount options:
global: {
  plugins: [PrimeVue, createPinia()],
  stubs: { Dialog: DialogStub },
}
```

Reference implementation: `BankAccountEditDialog.spec.ts`.

## Factories: Migrate on Touch

When modifying any `.spec.ts` file in webclientv4, replace hand-built inline test data with builders from `src/test/factories/`. Import from the barrel: `import { buildBankAccount, buildTransaction } from '@/test/factories'` (or relative path).

**Why:** Gradual migration strategy. Factories exist for all domain types but many existing specs still use inline object literals. Migrating on touch avoids a big-bang refactor.

**How to apply:** Any time a spec file is opened for changes, look for inline object literals that match a factory type and swap them. Don't migrate files you're not already changing.

**Retirement criteria:** This rule can retire when all `.spec.ts` files use factories.

## Page Specs: Mini-Integration Tests

Page specs are mini-integration tests — mount real child components, mock only at the API boundary.

**Why:** Stubbing child components in page specs defeats the purpose of page-level testing. If a child component is broken or its interface changes, the page spec should catch it.

**How to apply:**
- In page specs: use `vi.mock()` only for API modules (e.g. `homeApi`, `transactionApi`). Never stub child components.
- Unit-level isolation belongs in the child component's own spec, not in the page spec.
- If a child component requires complex setup that bleeds into the page spec, that's a smell in the child, not a reason to stub.
- Reference: `HomePage.spec.ts` — API mock only, real `WhatsNew` component mounted.

## Store Testing: Real Pinia, Not Reactive Mocks

Use a real Pinia store (via `createPinia()`) and mock at the API layer — not a hand-rolled reactive mock object.

**Why:** A reactive `mockStore` doesn't exercise the store's actions, getters, or state transitions. When the store interface changes, mock-store tests pass silently while the real behavior breaks.

**How to apply:**
- Add `createPinia()` to `global.plugins` in the mount helper
- Seed state by calling store actions (e.g. `await store.fetchList()`) with a mocked API response
- Use factories from `src/test/factories/` for domain objects passed to mocked API responses
- Never create a hand-built `const mockStore = { list: ref([...]), ... }` and inject it via `provide`
- This applies to pre-existing specs too — when modifying a spec that uses a reactive mock store, migrate it to the real Pinia pattern

**Reference:** `SinkFundAllocationListMobile.spec.ts`
