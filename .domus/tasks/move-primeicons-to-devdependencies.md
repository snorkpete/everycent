# Task: Move primeicons to devDependencies

**ID:** move-primeicons-to-devdependencies
**Status:** done
**Autonomous:** true
**Priority:** low
**Captured:** 2026-04-10
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

`primeicons` is listed in `dependencies` but only used as a CSS import (`primeicons/primeicons.css` in `main.ts`). Vite resolves and bundles this at build time — it's a dev dependency, not a runtime one.

---

## Acceptance Criteria

- [x] `primeicons` moved from `dependencies` to `devDependencies` in `package.json`
- [x] `package-lock.json` updated accordingly (committed — real dependency change)
- [x] Build succeeds (`npm run build` in webclientv4/)
- [x] Icons still render correctly (no missing icon regressions)
- [x] Pre-commit checks pass (type-check + test suite)

---

## Implementation Notes

### Files to change
- `webclientv4/package.json` — move `primeicons` entry from `dependencies` to `devDependencies`

### Approach
- Move the line, run `npm install` to regenerate lockfile, verify build
- No source code changes needed — `import 'primeicons/primeicons.css'` in `main.ts` stays as-is

### Risks
- None. Vite resolves all imports at build time regardless of dep vs devDep classification.

### Commit scope
- Single commit
