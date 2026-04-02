<template>
  <EcFormDialog
    :visible="visible"
    :header="specialEvent?.id ? 'Edit Special Event' : 'Add Special Event'"
    :always-edit="true"
    :save-label="specialEvent?.id ? 'Save' : 'Add'"
    :save-disabled="!formData.name"
    @update:visible="$emit('update:visible', $event)"
    @save="submit"
  >
    <EcTextField v-model="formData.name" label="Name" :edit-mode="true" />
    <EcMoneyField v-model="formData.budget_amount" label="Budget Amount" :edit-mode="true" />
    <EcDateField v-model="formData.start_date" label="Start Date" :edit-mode="true" />
  </EcFormDialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import EcFormDialog from '../shared/form/form-dialog/EcFormDialog.vue';
import EcTextField from '../shared/form/text-field/EcTextField.vue';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import EcDateField from '../shared/form/date-field/EcDateField.vue';
import type { SpecialEventData, SpecialEventFormData } from './specialEvent.types';

const props = defineProps<{
  visible: boolean;
  specialEvent: SpecialEventData | null;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  submit: [data: Partial<SpecialEventData>];
}>();

function toFormData(event: SpecialEventData | null): SpecialEventFormData {
  return {
    name: event?.name ?? '',
    budget_amount: event?.budget_amount ?? 0,
    start_date: event?.start_date ?? '',
  };
}

const formData = reactive<SpecialEventFormData>(toFormData(props.specialEvent));

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      Object.assign(formData, toFormData(props.specialEvent));
    }
  },
);

function submit() {
  const data: Partial<SpecialEventData> = {
    name: formData.name,
    budget_amount: formData.budget_amount,
  };
  if (formData.start_date) {
    data.start_date = formData.start_date;
  }
  if (props.specialEvent?.id) {
    data.id = props.specialEvent.id;
  }
  emit('submit', data);
}
</script>
