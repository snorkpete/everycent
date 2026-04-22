# Task: Remove vueuse core dep and replace useBreakpoints with native matchMedia

**ID:** remove-vueuse-core-dep-and-replace-usebreakpoints-with-native-matchmedia
**Status:** done
**Autonomous:** true
**Priority:** high
**Captured:** 2026-04-10
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

`@vueuse/core` (300+ composables) is a runtime dependency used for a single `useBreakpoints` call in `useResponsive.ts`. Replace with native `window.matchMedia` and remove the dependency.

---

## Acceptance Criteria

- [x] `useResponsive.ts` uses native `window.matchMedia` instead of `useBreakpoints` from `@vueuse/core`
- [x] Same breakpoint values preserved: `mobile: 576`, `compact: 992`
- [x] Return shape unchanged: `{ isMobile: Ref<boolean>, isCompact: Ref<boolean> }`
- [x] All 13 consumers work without modification
- [x] `@vueuse/core` removed from `package.json` dependencies
- [x] `useResponsive.spec.ts` updated — mocks `matchMedia` instead of `@vueuse/core`
- [x] Pre-commit checks pass (type-check + test suite)
- [x] `package-lock.json` changes committed (this is a real dependency removal)

---

## Implementation Notes

### Files to change
- `webclientv4/src/app/shared/composables/useResponsive.ts` — replace `useBreakpoints` with `matchMedia`
- `webclientv4/src/app/shared/composables/useResponsive.spec.ts` — mock `window.matchMedia` instead of `@vueuse/core`
- `webclientv4/package.json` — remove `@vueuse/core`

### Approach
- Use `window.matchMedia('(max-width: <breakpoint - 1>px)')` to replicate `smaller()` semantics (viewport strictly below the breakpoint value)
- Wrap each query in a Vue `ref`, update via `MediaQueryList.addEventListener('change', ...)`
- Clean up listeners with `onScopeDispose` (from Vue) so it works in any effect scope, not just component setup
- The composable API (`isMobile`, `isCompact` as `Ref<boolean>`) stays identical — zero consumer changes

### Risks
- None significant. `matchMedia` is universally supported. The composable is already the sole abstraction layer — consumers are insulated.

### Commit scope
- Single commit: implementation + dep removal + test update
