# Task: Dedupe Google Sign-In initialize() on LoginPage

**ID:** dedupe-google-sign-in-initialize-on-loginpage
**Status:** raw
**Autonomous:** false
**Priority:** low
**Captured:** 2026-06-15
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

**Observed:** During a logout -> re-login cycle in the browser, the console logs 3 identical warnings:

> `[GSI_LOGGER]: google.accounts.id.initialize() is called multiple times. This could cause unexpected behavior and only the last initialized instance will be used.`

(from `https://accounts.google.com/gsi/client`). No errors, no functional impact — sign-in works correctly.

**Cause:** `webclientv4/src/auth/LoginPage.vue` calls `window.google.accounts.id.initialize()` inside `onMounted` (~lines 78-103). The SPA does not reload between logout and re-login, so every time LoginPage mounts (each return to `/login`) it calls `initialize()` again. GSI warns on the 2nd+ call but handles it ("only the last initialized instance will be used").

**Pre-existing:** This predates the Google-only auth migration (the migration removed the password form but did not change the Google init code).

**Fix options:** Guard `initialize()` to run at most once per page load — e.g. a module-level "initialized" flag, or initialize outside the component lifecycle, or check whether it's already initialized before calling. KEEP the per-mount `renderButton()` call (the button container is per-LoginPage-instance and must re-render each mount). Add/adjust the `LoginPage.spec.ts` coverage so the init-once behaviour is asserted.

Priority is low: cosmetic / console-cleanliness only — no functional impact.

---

## Acceptance Criteria

- [ ] No "initialize() is called multiple times" GSI warning after a logout -> re-login cycle
- [ ] Google sign-in still works
- [ ] LoginPage tests green (`LoginPage.spec.ts` asserts init-once behaviour)

---

## Implementation Notes

_Remove if empty._
