# Task: Remove the dead sink_funds#current endpoint

**ID:** remove-the-dead-sink_fundscurrent-endpoint
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

The GET /sink_funds/current endpoint (SinkFundsController#current) is dead code — it returns the most-recently-created open sink fund, a single-sink-fund-era heuristic that was orphaned when multiple sink funds were introduced; no frontend calls it.

- `app/controllers/sink_funds_controller.rb#current` returns `BankAccount.sink_funds.where(status: 'open').order(:created_at).last` — the newest open sink fund.
- History: introduced Feb 2017 (commit 586bc1a5d) when a household had exactly one active sink fund; v3 stopped using it in Feb 2018 (commit a3aee67cf) when multiple sink funds were allowed, switching to explicit `GET /sink_funds/:id`. v4 never wired up `getCurrent()` — no caller in `webclientv4/src`.
- It's a behaviour-preserving dead-code removal (health-check category): delete the `current` action and its route (`config/routes.rb`, the `get 'current'` under the sink_funds resources collection). Also remove any related spec.
- The `.order(:created_at).last` heuristic is also non-deterministic (no id tie-breaker) — another reason not to keep it.

---

## Acceptance Criteria

- [ ] Verify no live caller exists (grep `webclientv4/src` for `sink_funds/current` and `getCurrent`) before removing.
- [ ] Remove the `current` controller action and the route; remove any spec referencing it.
- [ ] `bundle exec rspec` green.
- [ ] No remaining references to the endpoint.

---

## Implementation Notes

_Remove if empty._
