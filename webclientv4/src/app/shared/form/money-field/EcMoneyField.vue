<template>
  <div class="ec-money-field">
    <template v-if="editMode">
      <label :for="inputId">{{ label }}</label>
      <!--
        Native <input> is used instead of PrimeVue's InputText component intentionally.
        We rely on native @focus (select-all) and @change (parse/format on commit) events.
        PrimeVue components only guarantee their own 'update:modelValue' custom event, which
        fires on every keystroke — that would reformat the value mid-type. Native DOM events
        like 'change' are not reliably forwarded through the PrimeVue component layer.
        The p-inputtext class replicates the visual styling InputText would normally apply.
      -->
      <input
        :id="inputId"
        :value="displayValue"
        type="text"
        :class="['p-inputtext', 'money-input', moneyDisplayClasses]"
        @focus="onFocus"
        @change="onInputChange"
      />
    </template>
    <template v-else>
      <span class="label">{{ label }}</span>
      <span :class="['money-display', moneyDisplayClasses]">{{ displayValue }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';
import { dollarsToCents } from '../../util/dollars-to-cents';
import { centsToDollars } from '../../util/cents-to-dollars';

const props = defineProps<{
  label: string;
  editMode: boolean;
  highlightPositive?: boolean;
}>();

const model = defineModel<number>({ default: 0 });

const displayValue = computed({
  get: () => centsToDollars(model.value),
  set: (v: string) => {
    model.value = dollarsToCents(v);
  },
});

const isPositive = computed(() => model.value > 0);

const moneyDisplayClasses = computed(() => ({
  positive: props.highlightPositive && isPositive.value,
  negative: model.value < 0,
}));

const inputId = useId();

function onFocus(event: Event) {
  (event.target as HTMLInputElement).select();
}

function onInputChange(event: Event) {
  displayValue.value = (event.target as HTMLInputElement).value;
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
