<template>
  <div :class="['ec-text-field', { 'ec-text-field--inline': inline }]">
    <template v-if="editMode">
      <label v-if="!inline" :for="inputId">{{ label }}</label>
      <InputText
        :id="inputId"
        v-bind="$attrs"
        :model-value="modelValue"
        :type="type"
        @update:model-value="$emit('update:modelValue', $event ?? '')"
      />
    </template>
    <template v-else>
      <span v-if="!inline" class="label">{{ label }}</span>
      <span v-bind="$attrs" class="value">{{ modelValue }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue';
import InputText from 'primevue/inputtext';

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    editMode: boolean;
    type?: string;
    /** When true: hides the label and renders as a single-line inline widget. */
    inline?: boolean;
  }>(),
  {
    type: 'text',
    inline: false,
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

.ec-text-field--inline {
  flex-direction: row;
  align-items: center;
}

.label {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.125;
  color: var(--p-text-muted-color);
}

.value {
  font-size: 14px;
}
</style>
