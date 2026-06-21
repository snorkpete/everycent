# Task: Clean up the unused UsersController

**ID:** clean-up-the-unused-userscontroller
**Status:** raw
**Autonomous:** false
**Priority:** low
**Captured:** 2026-06-21
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

`app/controllers/users_controller.rb` is unused. Its own comment states it manages the user list, does NOT handle auth, and "is not being used." Authentication is Google-only via the `Auth::` controllers + the `sessions` table; identity is matched by email; users are created out-of-band (Rails console / seeds) and that will stay the case for a while. So the controller's `index` / `create` / `update` / `destroy` / `show` on users is unreachable dead code.

**Scope:**
- Delete the controller.
- Remove its routes in `config/routes.rb`.
- Remove any user-management serializer fields / frontend API calls that exist solely for it.
- Remove its specs.
- If any thin slice turns out to be referenced by live code, justify keeping it and trim the rest instead.

**Verify before delete:** grep for references (routes, frontend API clients, specs) and confirm no live path depends on it before removing anything.

**Reference:** `knowledge-base/tables/users.md` and `knowledge-base/concepts/session-auth.md` document how auth/identity actually work.

---

## Acceptance Criteria

- [ ] `UsersController` and its dead routes are removed.
- [ ] `bundle exec rspec` is green.
- [ ] If any FE code is touched, webclientv4 `npm run type-check` and `npm run test` are green.
- [ ] No remaining references to `UsersController` anywhere (routes, frontend API clients, specs).
- [ ] Knowledge base updated only if the removal changes a documented fact.

---

## Implementation Notes

_Remove if empty._
