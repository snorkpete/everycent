<template>
  <span :class="['money-display', emphasisClass, highlightClasses]">{{ formattedValue }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { centsToDollars } from '../../util/cents-to-dollars';
import { HighlightMode } from '../../constants/highlightMode';
import { Emphasis } from '../../constants/emphasis';
import type { HighlightMode as HighlightModeType } from '../../constants/highlightMode';
import type { Emphasis as EmphasisType } from '../../constants/emphasis';

const { modelValue = 0, highlightMode = HighlightMode.Balance, emphasis = Emphasis.Item } = defineProps<{
  modelValue?: number | null;
  highlightMode?: HighlightModeType;
  emphasis?: EmphasisType;
}>();

const formattedValue = computed(() => centsToDollars(modelValue));

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
