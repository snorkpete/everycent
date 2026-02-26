<template>
  <div class="ec-money-field">
    <template v-if="editMode">
      <label :for="inputId">{{ label }}</label>
      <InputText
        :id="inputId"
        v-model="model"
        type="text"
        :class="['money-input', moneyDisplayClasses]"
      />
    </template>
    <template v-else>
      <span class="label">{{ label }}</span>
      <span :class="['money-display', moneyDisplayClasses]">{{ model }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import {computed, useId} from 'vue';
import InputText from 'primevue/inputtext';
import {dollarsToCents} from "../../util/dollars-to-cents.ts";
import {centsToDollars} from "../../util/cents-to-dollars.ts";

const {label = '', modelValue = 0, highlightPositive = false}  = defineProps<{
    modelValue: number;
    label: string;
    editMode: boolean;
    type?: string;
    highlightPositive?: boolean;
  }>();

const model = defineModel( 'modelValue', {
  get(valueInCents: number): string {
    return centsToDollars(valueInCents);
  },
  set(newValue: string): number {
    return dollarsToCents(newValue);
  }
});

const isPositive = computed(() =>   modelValue > 0);

const moneyDisplayClasses = computed(() => ({
  positive: highlightPositive && isPositive.value,
  negative: !isPositive.value,
  right: true,
  value: true
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

.value {
  font-size: 14px;
  text-align: right;
}
</style>
