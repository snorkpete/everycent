# Task: Centralize household tenant scoping (controller-side + spec tenant reset)

**ID:** centralize-household-tenant-scoping-controller-side-spec-tenant-reset
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-28
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Remove the per-controller `acts_as_tenant` boilerplate and fix the leaked-tenant spec flakiness, as one behaviour-preserving change. Two parts:

**(1) Controller centralization.** ~17 controllers each repeat:
```ruby
set_current_tenant_through_filter
before_action { set_current_tenant current_household }
```
(e.g. `app/controllers/transactions_controller.rb:4-6`; `Mcp::AppController` adds `require_household!`). `ApplicationController` already exists and all controllers inherit it, but it does NOT set the tenant. Move the two lines into `ApplicationController`, **guarded on `current_user&.household`** so the auth controllers (`auth/google`, `auth/dev_login`, `auth/sessions` — they inherit `ApplicationController` but run before a tenant/user exists) skip it cleanly. `Mcp::AppController`'s `require_household!` still composes on top.

**(2) Spec tenant reset.** Fixes the `transcripts_rake` order-dependent flakiness at its root. The `transcripts:purge` examples pass 7/7 in isolation but fail under full-suite defined order because a sibling spec leaves `ActsAsTenant.current_tenant` set; the spec's bare finders (`ConversationTurn.exists?(id)` at `spec/tasks/transcripts_rake_spec.rb:62/76/93/106`) then scope to the leaked tenant and return false. Reproduced deterministically (2026-06-28): `bundle exec rspec --order defined` → 4 failures, incl. recent/llm records reported "missing" though they can't have been purged. Fix: reset `ActsAsTenant.current_tenant = nil` in a global `rails_helper` `around`/`after(:each)` — kills the whole *class* of this pollution, not just this file.

### Out of scope (deliberately)

Do **NOT** move `acts_as_tenant` to `ApplicationRecord`. The gem (1.0.1) has no per-model opt-out macro, and `User`/`Session`/`Household` sit under `ApplicationRecord` — `User` carries `household_id` so it would scope **silently** and break login (`User.find_by(email:)` / `Session.find_by(token)` run before a tenant exists). If model-side centralization is ever wanted, use an opt-**in** `TenantScoped` concern, not opt-out — but skipped for now (marginal benefit; 16 one-liners aren't a real burden). Per-action opt-out already exists via `ActsAsTenant.without_tenant` / `with_tenant`.

---

## Acceptance Criteria

- [ ] Full backend suite green under `bundle exec rspec --order defined` (transcripts_rake no longer flaky)
- [ ] All controller specs green
- [ ] Auth/login flows unaffected (Google sign-in, dev login, session token lookup)
- [ ] No per-controller tenant boilerplate remaining except the single guarded declaration in `ApplicationController`
- [ ] `acts_as_tenant` NOT moved to `ApplicationRecord` (verify auth tables remain unscoped)

---

## Implementation Notes

Healthcheck-category (behaviour-preserving internal improvement) — do in the healthcheck worktree. The `transcripts_rake` half of `fix-order-dependent-load-induced-spec-flakiness-transcripts_rake-router` is absorbed here; that task is narrowed to its `router.spec.ts` load-timeout half.
