<template>
  <div class="ec-money-field">
    <template v-if="editMode">
      <label :for="inputId">{{ label }}</label>
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
      <span class="label">{{ label }}</span>
      <span :class="['money-display', moneyDisplayClasses]">{{ formattedValue }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, useId } from 'vue';
import { dollarsToCents } from '../../util/dollars-to-cents';
import { centsToDollars } from '../../util/cents-to-dollars';

const props = defineProps<{
  label: string;
  editMode: boolean;
  highlightMode?: 'positive' | 'zero';
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

const formattedValue = computed(() => centsToDollars(model.value));

// Colour highlighting for displayed amounts:
//
//   (no mode)    — negatives red, everything else default
//   "positive"   — positives green, negatives red, zero default
//                   Use for values where positive = good (balances, net worth, assets)
//   "zero"       — zero green, non-zero red
//                   Use for values where zero = good (diffs, remaining balances)
const moneyDisplayClasses = computed(() => ({
  positive:
    props.highlightMode === 'positive'
      ? model.value > 0
      : props.highlightMode === 'zero'
        ? model.value === 0
        : false,
  negative: props.highlightMode === 'zero' ? model.value !== 0 : model.value < 0,
}));

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

.money-input {
  text-align: right;
}

.label {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.125;
  color: rgba(0, 0, 0, 0.54);
}

.money-display {
  font-size: 14px;
  text-align: right;
}

.negative {
  color: var(--p-red-600);
}

.positive {
  color: var(--p-green-600);
}
</style>
