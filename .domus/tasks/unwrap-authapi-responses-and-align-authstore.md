# Task: Unwrap authApi responses and align authStore

**ID:** unwrap-authapi-responses-and-align-authstore
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-04-10
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

[HC §5.3] authApi is the only API module not doing .then(r => r.data). Clean up so authStore matches other stores (no .data navigation, no axios.isAxiosError). Drive-by.

---

## Acceptance Criteria

- [ ] Every `authApi` method chains `.then(r => r.data)` to unwrap the axios response, matching the pattern in `bankAccountApi.ts` and all other API modules
- [ ] `authApi.validateToken()` has a return type annotation (e.g. `Promise<{ success: boolean }>`) so the unwrapped shape is typed
- [ ] `authStore.checkSession()` reads `response.success` instead of `response.data.success`
- [ ] `authStore` no longer imports `axios` — the `axios.isAxiosError` check is replaced with the store-standard `e instanceof Error` pattern
- [ ] `authStore.logIn` and `authStore.logInWithGoogle` error handling uses an `extractAuthError()` helper (see implementation notes) to preserve server-side error messages without coupling to axios internals
- [ ] `authApi.spec.ts` assertions updated — mock resolved values return unwrapped data (not `{ data: ... }`) and return values are asserted
- [ ] `authStore.spec.ts` mock resolved values updated to return unwrapped data; error mocks still reject with the same error objects (rejection path is unchanged by `.then` unwrap)
- [ ] All existing tests pass: `npm run test` and `npm run type-check` in `webclientv4/`

---

## Implementation Notes

### Files to change

| File | What changes |
|------|-------------|
| `webclientv4/src/auth/authApi.ts` | Add `.then(r => r.data)` to all 4 methods; add return type for `validateToken` |
| `webclientv4/src/auth/authApi.spec.ts` | Update mock resolved values and add return-value assertions |
| `webclientv4/src/auth/authStore.ts` | Remove `import axios`; update `checkSession` and error handling in `logIn`/`logInWithGoogle` |
| `webclientv4/src/auth/authStore.spec.ts` | Update mock resolved values from `{ data: X }` to `X` |

### authApi — before/after

**Before** (all 4 methods return raw `AxiosPromise`):
```ts
signIn: (email: string, password: string) =>
  apiGateway.post('/auth/sign_in', { email, password }),
validateToken: () => apiGateway.get('/auth/validate_token'),
```

**After** (unwrap `.data`, matching bankAccountApi pattern):
```ts
signIn: (email: string, password: string) =>
  apiGateway.post('/auth/sign_in', { email, password }).then(r => r.data),
validateToken: () =>
  apiGateway.get<{ success: boolean }>('/auth/validate_token').then(r => r.data),
```

### authStore — checkSession before/after

**Before:** `const response = await authApi.validateToken(); loggedIn.value = response.data.success === true;`
**After:** `const response = await authApi.validateToken(); loggedIn.value = response.success === true;`

### authStore — error handling design decision

The catch blocks in `logIn` and `logInWithGoogle` currently use `axios.isAxiosError(e)` to dig into `e.response?.data?.errors?.[0]` for server-side error messages (e.g. "Invalid credentials", "No account found for this Google identity"). Other stores use the simpler `e instanceof Error ? e.message : 'fallback'` pattern, but those stores don't display domain-specific server error messages — they just show generic "Failed to load X".

Auth is different: the login UI **needs** to show the server's specific error message. Switching blindly to `e instanceof Error ? e.message` would surface axios's generic "Request failed with status code 422" instead of "Invalid credentials".

**Approach:** Extract a small helper `extractAuthError(e: unknown, fallback: string): string` that does the `e.response?.data?.errors?.[0]` digging via a type guard on the error shape (not `axios.isAxiosError`). This removes the `axios` import while preserving the server error messages. The helper can live at the top of `authStore.ts` (private to the module — not worth a separate file for one consumer).

```ts
function extractAuthError(e: unknown, fallback: string): string {
  const errors = (e as { response?: { data?: { errors?: string[] } } })
    ?.response?.data?.errors;
  return errors?.[0] ?? fallback;
}
```

Then the catch blocks simplify to:
```ts
} catch (e: unknown) {
  loggedIn.value = false;
  error.value = extractAuthError(e, 'Login failed');
  throw e;
}
```

### Test changes

**authApi.spec.ts:** Currently mocks return `{ data: {} }` and only assert the call was made. After unwrapping, mocks should still return `{ data: X }` (the mock stands in for apiGateway which returns `AxiosResponse`), but now the tests should also assert the *return value* of each authApi method equals `X` (the unwrapped data), confirming the `.then(r => r.data)` is working.

**authStore.spec.ts:** These mock `apiGateway` directly (not `authApi`), so mock resolved values stay as `{ data: X }` — the real `authApi` code runs in the test path and does the unwrap. The `checkSession` tests with `data: { success: true }` continue to work as-is because the gateway mock returns `{ data: { success: true } }`, authApi unwraps to `{ success: true }`, and the store reads `.success`. The error tests (rejected promises) don't change at all — `.then(r => r.data)` only affects the success path; rejections bypass it.

The one substantive change in authStore specs: the error-path tests currently construct plain objects with `isAxiosError: true` that `axios.isAxiosError()` recognizes. After switching to the shape-based `extractAuthError` helper, these mocks still work because the helper reads `e.response.data.errors` which is the same shape already present in the mock objects.
