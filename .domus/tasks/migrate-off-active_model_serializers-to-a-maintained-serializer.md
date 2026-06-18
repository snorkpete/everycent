# Task: Migrate off active_model_serializers to a maintained serializer

**ID:** migrate-off-active_model_serializers-to-a-maintained-serializer
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-06-18
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Behaviour-preserving migration off `active_model_serializers` (0.10.15) to a maintained
serializer library. **The task includes choosing the replacement** — evaluate the
candidates below and commit to one with documented rationale, then port everything.

Home: **`healthcheck` worktree** (behaviour-preserving internal improvement). JSON output
must stay **byte-identical** — the contract is pinned by the Vue suite + rspec
controller/serializer specs, so the swap is verifiable.

### Why / urgency
- AMS 0.10.x is **end-of-line and unmaintained** — no upstream fix is coming.
- On Rails 8.1 it emits a deprecation: `active_model/serializer.rb` does
  `include ActiveSupport::Configurable`, which is **deprecated in 8.1 and removed in
  Rails 8.2**. So AMS becomes a **hard blocker at the Rails 8.2 step**.
- **Not urgent on 8.1** (log warning only — does not affect runtime or deploy). **Must be
  resolved before Rails 8.2.** Sequence it ahead of that upgrade.

### Footprint (small / shallow — this is a cheap migration)
- **22 serializers** in `app/serializers/`, all simple: `attributes`, `has_one`/`has_many`,
  a few custom attribute methods, AMS fragment `cache` in ~6.
- **No AMS initializer** — no custom adapter or key_transform. Output is **flat snake_case
  JSON, `root: false`**. The `type "..."` lines in serializers are **inert** (they only
  matter for the json_api adapter, which isn't used — there's no JSON:API envelope).
- **Single integration point:** the render helper in `app/controllers/application_controller.rb`:
  `ActiveModel::Serializer::CollectionSerializer.new(object, serializer:, root: false)` and
  `serializer.new(object, root: false)`, plus implicit `render json:`. This is what gets rewired.

### Candidate replacements — evaluate and choose

Verify maintenance status is still current **at decision time** (knowledge cutoff caveat —
don't trust a stale "actively maintained").

- **oj_serializers** — closest API to AMS, so the **most mechanical port** (least rewrite of
  the 22 serializers). Oj-backed (fast). Maintained. *Lean here if minimizing migration effort.*
- **Alba** — modern, flexible, minimal Rails coupling, actively maintained. **Best long-term
  footing.** Slightly more DSL translation than oj_serializers.
- **Blueprinter** — popular, simple `view`/`field` DSL, good docs, maintained. Solid middle option.
- **Reject `jsonapi-serializer`** — it targets the JSON:API envelope we deliberately don't use.
- **Also weigh:** *drop the dependency entirely* (PORO serializers / model `as_json`) — viable
  at only 22 simple serializers, removes a dep, but loses the declarative DSL for more
  boilerplate. *And/or* a **patch-in-place stopgap** (vendor/initializer swapping AMS's
  `Configurable` use for `class_attribute`, as the deprecation message suggests) if 8.2 lands
  before there's time for a full migration.

### Selection criteria
1. Behaviour-preserving — byte-identical flat snake_case JSON (Vue + rspec prove it).
2. Maintenance health — actively maintained, Rails 8.2+ compatible (verify fresh).
3. Migration effort from the AMS DSL (22 serializers + the one render helper).
4. **Fragment-cache parity** — preserve the ~6 `cache` usages (or consciously drop with rationale).
5. Performance (all candidates beat AMS; not a deciding factor on its own).

---

## Acceptance Criteria

- [ ] Replacement library chosen, with the rationale (against the criteria above) documented in this task / a short ADR
- [ ] All 22 serializers in `app/serializers/` ported
- [ ] `application_controller.rb` render helper rewired to the new library
- [ ] AMS fragment caching preserved where used (~6 serializers) — or dropped with explicit rationale
- [ ] `active_model_serializers` removed from the Gemfile + lock
- [ ] JSON output unchanged (byte-identical) — verified by green Vue suite + `bundle exec rspec`
- [ ] No remaining `ActiveSupport::Configurable` deprecation from this gem
- [ ] Landed **before** the Rails 8.2 upgrade

---

## Implementation Notes

- Supersedes the older "AMS sunset / flag eventual migration" note referenced in
  `upgrade-to-rails-81-ruby-34` (the Rails 8.1 upgrade adopted all framework defaults and
  left AMS in place deliberately; this task is the follow-up).
- The Rails 8.2 step (Rack 3, this AMS removal) is the next major backend upgrade after the
  8.1 work landed 2026-06 on the `healthcheck` worktree.
