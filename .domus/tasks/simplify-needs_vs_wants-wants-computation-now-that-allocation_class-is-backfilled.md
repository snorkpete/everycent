# Task: Simplify needs_vs_wants 'wants' computation now that allocation_class is backfilled

**ID:** simplify-needs_vs_wants-wants-computation-now-that-allocation_class-is-backfilled
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

In `app/models/report.rb`, the needs_vs_wants report derives wants as a residual (income − needs − savings) rather than reading `allocation_class='want'` directly. Investigate whether, now that `allocation_class` is fully backfilled and defaults to `'want'`, the report can sum `'want'` allocations directly (a behaviour-preserving simplification). The residual approach is likely a legacy artifact from before `allocation_class` had defaults/backfill (when a missing value meant "assume want"). Verify the two approaches produce identical numbers on real data before switching.

---

## Acceptance Criteria

- [ ] Confirm whether the residual vs direct-`'want'` computations differ on current data
- [ ] If equivalent: switch to summing `allocation_class='want'` directly and remove the residual computation; rspec green
- [ ] If NOT equivalent: document why the residual is still needed and close as won't-fix with the explanation

---

## Implementation Notes

_Remove if empty._
