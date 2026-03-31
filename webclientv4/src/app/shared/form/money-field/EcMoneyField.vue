<template>
  <div :class="['ec-money-field', { 'ec-money-field--inline': inline }]">
    <template v-if="editMode">
      <label v-if="!inline" :for="inputId">{{ label }}</label>
      <!--
        Native <input> is used instead of PrimeVue's InputText component intentionally.
        We rely on native @focus (select-all), @input (live model update), and @blur
        (display reformat) — events that are not reliably forwarded through the PrimeVue
        component layer. The p-inputtext class replicates InputText's visual styling.

        Pattern (mirrors the Angular implementation):
        - @input: parse raw text → update model value immediately, leave display alone
        - @blur:  reformat displayText ref → Vue re-renders input with formatted value

        displayText is a plain ref, not a computed. It only changes on blur or when the
        model is updated externally (while the input is not focused). This prevents Vue
        from overwriting the user's raw typed text on every keystroke.
      -->
      <input
        :id="inputId"
        :value="displayText"
        type="text"
        :class="['p-inputtext', 'money-input', moneyDisplayClasses]"
        @focus="onFocus"
        @input="onInput"
        @blur="onBlur"
      />
    </template>
    <template v-else>
      <span v-if="!inline" class="label">{{ label }}</span>
      <EcMoneyDisplay :model-value="model" :highlight-mode="highlightMode ?? HighlightMode.None" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, useId } from 'vue';
import { dollarsToCents } from '../../util/dollars-to-cents';
import { centsToDollars } from '../../util/cents-to-dollars';
import EcMoneyDisplay from './EcMoneyDisplay.vue';
import { HighlightMode } from '../../constants/highlightMode';
import type { HighlightMode as HighlightModeType } from '../../constants/highlightMode';

const { label = '', editMode, highlightMode, inline } = defineProps<{
  label?: string;
  editMode: boolean;
  highlightMode?: HighlightModeType;
  inline?: boolean;
}>();

const model = defineModel<number>({ default: 0 });

// Separate display state from model state so Vue doesn't overwrite the user's
// raw input during typing. Updated only on blur or on external model changes.
const displayText = ref(centsToDollars(model.value));
const isEditing = ref(false);

watch(model, (newVal) => {
  if (!isEditing.value) {
    displayText.value = centsToDollars(newVal);
  }
});

const moneyDisplayClasses = computed(() => {
  if (!highlightMode || highlightMode === HighlightMode.None) return {};

  if (highlightMode === HighlightMode.Balance) {
    return {
      positive: model.value > 0,
      negative: model.value < 0,
      muted: model.value === 0,
    };
  }

  // Difference: zero is good, nonzero is bad
  return {
    positive: model.value === 0,
    negative: model.value !== 0,
  };
});

const inputId = useId();

function onFocus(event: Event) {
  isEditing.value = true;
  (event.target as HTMLInputElement).select();
}

function onInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value;
  displayText.value = raw; // keep bound value in sync with DOM so Vue doesn't overwrite it
  model.value = dollarsToCents(raw);
}

function onBlur() {
  isEditing.value = false;
  displayText.value = centsToDollars(model.value);
}
</script>

<style scoped>
.ec-money-field {
  display: flex;
  flex-direction: column;
}

.ec-money-field--inline {
  flex-direction: row;
  justify-content: flex-end;
}

.ec-money-field--inline .money-display {
  font-variant-numeric: tabular-nums;
}

.money-input {
  text-align: right;
}

.label {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.125;
  color: var(--p-text-muted-color);
}

.negative {
  color: var(--p-red-600);
}

.positive {
  color: var(--p-green-600);
}

.muted {
  color: var(--p-text-muted-color);
}
</style>
