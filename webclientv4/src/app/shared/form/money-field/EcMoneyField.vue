<template>
  <div class="ec-money-field">
    <template v-if="editMode">
      <label :for="inputId">{{ label }}</label>
      <InputText
        :id="inputId"
        v-model="displayValue"
        type="text"
        :class="['money-input', moneyDisplayClasses]"
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
import InputText from 'primevue/inputtext';
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
  negative: !isPositive.value,
}));

const inputId = useId();
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
