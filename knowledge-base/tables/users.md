---
type: table
title: users
term: user
definition: "A person who logs in. Belongs to one household; a household can have several (this one has two). Email is the sole Google-login join key. Most columns are dead devise residue."
lexicon: true
description: >-
  Login identity. belongs_to one household (N users per household — both partners
  use the same one). Email is the unique Google join key. The bulk of the columns
  are vestigial devise/devise_token_auth fields left by the additive auth rebuild.
resource: everycent:table:users
tags: [table, auth]
timestamp: 2026-06-21T00:00:00Z
---

# users

A person who logs in. Authentication is **Google-only** and runs through
[sessions](/tables/sessions.md) — this table is just **identity + the household
link**. See [session auth](/concepts/session-auth.md) for the login flow.

## Multi-user households

`belongs_to :household`; a household can have **several users** — this household has
**two** (both partners), who log in separately and operate on the **same** household
data. There is no `has_many :users` convenience association on `Household` and the
`UsersController` CRUD is unused (users are created out-of-band), but multi-user is a
real, live arrangement, not a latent one. Each user reaches household data via
`has_many … through: :household`; `current_household = current_user.household` drives
`acts_as_tenant` scoping.

## Schema

| Column | Status | Meaning |
|---|---|---|
| `id` | live | Primary key. |
| `email` | **live** | The **sole Google-login join key** (`User.find_by(email:)`, no tenant scope). Globally **unique, case-insensitive**, presence-validated in the model (devise used to enforce this). |
| `first_name` / `last_name` | live | Display name. |
| `household_id` | **live** | Tenant link. |
| `provider` / `uid` | vestigial | devise_token_auth identity keys; now **hardcoded** by `generate_uid` (`provider = 'email'`, `uid = email`). Redundant with email uniqueness; the `uid_and_provider` unique index is effectively dead. |
| `admin` | **dead** | Devise-era flag; no code reads it (D12). |
| `encrypted_password`, `reset_password_token`, `reset_password_sent_at`, `remember_created_at`, `sign_in_count`, `current_sign_in_at`, `last_sign_in_at`, `current_sign_in_ip`, `last_sign_in_ip`, `confirmation_token`, `confirmed_at`, `confirmation_sent_at`, `unconfirmed_email`, `tokens`, `image`, `nickname` | **dead** | devise / devise_token_auth residue (D11). Left in place by the additive auth rebuild; destructive drop gated on prod soak. |
| `created_at` / `updated_at` | live | Timestamps. |

See [dead schema](/tracking/dead-schema.md) (D11–D13) for the cleanup register and the
gating task.
