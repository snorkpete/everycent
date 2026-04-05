# Vue Testing Patterns

## Page Specs: Mini-Integration Tests

Page specs are mini-integration tests — mount real child components, mock only at the API boundary.

**Why:** Stubbing child components in page specs defeats the purpose of page-level testing. If a child component is broken or its interface changes, the page spec should catch it.

**How to apply:**
- In page specs: use `vi.mock()` only for API modules (e.g. `homeApi`, `transactionApi`). Never stub child components.
- Unit-level isolation belongs in the child component's own spec, not in the page spec.
- If a child component requires complex setup that bleeds into the page spec, that's a smell in the child, not a reason to stub.
- Reference: `HomePage.spec.ts` — API mock only, real `WhatsNew` component mounted.
