<template>
  <div class="ec-date-field">
    <template v-if="editMode">
      <label :for="inputId">{{ label }}</label>
      <DatePicker
        :id="inputId"
        :model-value="dateValue"
        @update:model-value="onDateChange($event as Date | null)"
      />
    </template>
    <template v-else>
      <span class="label">{{ label }}</span>
      <span class="value">{{ formattedDate }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';
import DatePicker from 'primevue/datepicker';
import { formatDate } from '../../util/format-date';

const props = defineProps<{
  modelValue: string;
  label: string;
  editMode: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const inputId = useId();

const dateValue = computed(() => {
  if (!props.modelValue) return null;
  const [year = 0, month = 1, day = 1] = props.modelValue.split('-').map(Number);
  return new Date(year, month - 1, day);
});

const formattedDate = computed(() => formatDate(props.modelValue));

function onDateChange(date: Date | null) {
  if (!date) {
    emit('update:modelValue', '');
    return;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  emit('update:modelValue', `${year}-${month}-${day}`);
}
</script>

<style scoped>
.ec-date-field {
  display: flex;
  flex-direction: column;
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
