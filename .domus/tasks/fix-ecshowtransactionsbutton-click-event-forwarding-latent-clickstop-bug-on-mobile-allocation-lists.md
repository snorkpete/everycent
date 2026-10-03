# Task: Fix EcShowTransactionsButton click-event forwarding (latent @click.stop bug on mobile allocation lists)

**ID:** fix-ecshowtransactionsbutton-click-event-forwarding-latent-clickstop-bug-on-mobile-allocation-lists
**Status:** raw
**Autonomous:** false
**Priority:** normal
**Captured:** 2026-10-03
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

EcShowTransactionsButton emits 'click' with no event argument, so '@click.stop' on it throws "Cannot read properties of undefined (reading 'stopPropagation')" before the handler runs. Hit while building the special-event mobile detail; worked around there with a wrapper span (@click.stop on the span). BudgetAllocationListMobile.vue (~L150) and likely SinkFundAllocationListMobile.vue use @click.stop directly on the same button and have no test for the eye icon, so they are probably broken on mobile — UNVERIFIED, reproduce at phone width first. Likely fix: make the button forward the event (emit click: [MouseEvent]), then drop the wrapper span in SpecialEventDetailMobile.vue and add tests.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
