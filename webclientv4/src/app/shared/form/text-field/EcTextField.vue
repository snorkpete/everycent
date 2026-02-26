<template>
  <div class="ec-text-field">
    <template v-if="editMode">
      <label :for="inputId">{{ label }}</label>
      <InputText
        :id="inputId"
        :model-value="modelValue"
        :type="type"
        @update:model-value="$emit('update:modelValue', $event ?? '')"
      />
    </template>
    <template v-else>
      <span class="label">{{ label }}</span>
      <span class="value">{{ modelValue }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue';
import InputText from 'primevue/inputtext';

withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    editMode: boolean;
    type?: string;
  }>(),
  {
    type: 'text',
  },
);

defineEmits<{
  'update:modelValue': [value: string];
}>();

const inputId = useId();
</script>

<style scoped>
.ec-text-field {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.125;
  color: rgba(0, 0, 0, 0.54);
}

.value {
  font-size: 14px;
}
</style>
