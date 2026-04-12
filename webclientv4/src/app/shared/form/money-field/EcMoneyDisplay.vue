<template>
  <span :class="['money-display', emphasisClass, highlightClasses]">{{ formattedValue }}</span>
</template>

<!--
  EcMoneyDisplay — read-only money display.

  Replaces scattered inline money formatting. All money values rendered for
  display (not input) should use this component.

  Props:
  - modelValue: cents value (formatted via centsToDollars)
  - highlightMode: color coding (default: Balance)
      - None       — no color classes
      - Balance    — green if positive, red if negative, muted if zero
      - Difference — green if zero (balanced), red if nonzero (off-balance).
                     Inverse of Balance: in budget contexts, zero is "good".
      - Income     — income-specific styling
  - emphasis: font size/weight tier (default: Item)
      - Item (row), Subtotal, Total, Headline
  - dashIfZero: shows "—" instead of "0.00" when value is zero (default: false)

  HighlightMode / Emphasis use the const-object + type pattern — see
  webclientv4/docs/vue-coding-rules.md for the project convention on domain enums.
-->
<script setup lang="ts">
import { computed } from 'vue';
import { centsToDollars } from '../../util/centsToDollars';
import { HighlightMode } from '../../constants/highlightMode';
import { Emphasis } from '../../constants/emphasis';
import type { HighlightMode as HighlightModeType } from '../../constants/highlightMode';
import type { Emphasis as EmphasisType } from '../../constants/emphasis';

const {
  modelValue = 0,
  highlightMode = HighlightMode.Balance,
  emphasis = Emphasis.Item,
  dashIfZero = false,
} = defineProps<{
  modelValue?: number | null;
  highlightMode?: HighlightModeType;
  emphasis?: EmphasisType;
  dashIfZero?: boolean;
}>();

const formattedValue = computed(() => {
  if (dashIfZero && (modelValue ?? 0) === 0) return '—';
  return centsToDollars(modelValue);
});

const emphasisClass = computed(() => `emphasis-${emphasis}`);

const highlightClasses = computed(() => {
  const value = modelValue ?? 0;
  if (highlightMode === HighlightMode.None) return {};

  if (highlightMode === HighlightMode.Income) {
    return { income: true };
  }

  if (highlightMode === HighlightMode.Balance) {
    return {
      positive: value > 0,
      negative: value < 0,
      muted: value === 0,
    };
  }

  // Difference: zero is good, nonzero is bad
  return {
    positive: value === 0,
    negative: value !== 0,
  };
});
</script>

<style scoped>
.money-display {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ── Emphasis tiers ── */
.emphasis-item {
  font-size: 0.875rem;
  font-weight: 400;
}

.emphasis-subtotal {
  font-size: 0.95rem;
  font-weight: 600;
}

.emphasis-total {
  font-size: 0.9375rem;
  font-weight: 700;
}

.emphasis-headline {
  font-size: 1.05rem;
  font-weight: 700;
}

/* ── Highlight colours ── */
.positive {
  color: var(--p-green-600);
}

.negative {
  color: var(--p-red-600);
}

.muted {
  color: var(--p-text-muted-color);
}

.income {
  color: var(--p-primary-600);
}
</style>
