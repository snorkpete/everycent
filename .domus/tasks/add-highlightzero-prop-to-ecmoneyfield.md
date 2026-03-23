# Task: Add highlightZero prop to EcMoneyField

**ID:** add-highlightzero-prop-to-ecmoneyfield
**Status:** done
**Autonomous:** true
**Priority:** normal
**Captured:** 2026-03-15
**Parent:** none
**Depends on:** none
**Idea:** none
**Spec refs:** none

---

## Orientation

Read `webclientv4/src/app/shared/form/money-field/EcMoneyField.vue` and `EcMoneyField.spec.ts` before starting — the existing `highlightPositive` prop and `moneyDisplayClasses` computed are the pattern to follow.

---

## What This Task Is

Add a `highlightZero` boolean prop to EcMoneyField. When true: zero value renders green, non-zero (both positive and negative) renders red. Needed by the transactions redesign for Diff and Unpaid Diff fields.

Current colouring modes:
- Default (no props): negative → red, otherwise black
- `highlightPositive`: negative → red, positive → green

New mode:
- `highlightZero`: zero → green, non-zero (either sign) → red

The `negative` class logic changes when `highlightZero` is true: a positive non-zero value should also be red, not black.

---

## Acceptance Criteria

- [ ] `highlightZero` prop accepted as boolean
- [ ] When `highlightZero` is true and value === 0: green
- [ ] When `highlightZero` is true and value !== 0 (positive or negative): red
- [ ] When `highlightZero` is false/absent: existing behaviour unchanged
- [ ] `highlightPositive` and `highlightZero` are mutually exclusive (document this — no need to guard against both being set)
- [ ] All new branches covered by tests in `EcMoneyField.spec.ts`
- [ ] Run senior-code-reviewer before committing

---

## Implementation Notes

Add `highlightZero?: boolean` to the props. Update `moneyDisplayClasses` computed:

```typescript
const moneyDisplayClasses = computed(() => ({
  positive: props.highlightPositive && isPositive.value,
  negative: props.highlightZero ? model.value !== 0 : model.value < 0,
  // when highlightZero, zero gets 'positive' class (green)
  // when highlightZero, non-zero gets 'negative' class (red) regardless of sign
}))
```

Wait — the above uses `positive` for zero and `negative` for non-zero, but the class names become semantically misleading. Consider whether to add new CSS classes (`zero`, `nonzero`) or reuse existing ones. Reusing is simpler; document the intent.
