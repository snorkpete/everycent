# Task: Move household-specific payee vocabulary out of prod code into per-household config

**ID:** move-household-specific-payee-vocabulary-out-of-prod-code-into-per-household-config
**Status:** raw
**Autonomous:** false
**Priority:** high
**Captured:** 2026-06-21
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## What This Task Is

Follow-on from the 2026-06 PII remediation. The payee name-extraction prod code hardcodes household-specific vocabulary (surname/location regexes, cardholder-annotation patterns, biller examples) as constants. These are real-data values that must stay in code to parse production transactions, so they were deliberately KEPT during the PII scrub and remain in the public repo. Move them into per-household config/DB so the extractor reads patterns from config, not literals. Behaviour-preserving (existing specs are the check; fixtures already fictionalized). Do AFTER month-end budget close so the payee pipeline isn't disrupted near close. Files: app/services/payee_transfer_detector.rb + payee_name_extractors/{base,abn_bank,abn_credit_card}.rb.

---

## Acceptance Criteria

- [ ] _Add acceptance criteria_

---

## Implementation Notes

_Remove if empty._
