<template>
  <Dialog
    :visible="visible"
    :header="specialEvent?.id ? 'Edit Special Event' : 'Add Special Event'"
    modal
    :style="{ width: '30rem' }"
    @update:visible="close"
  >
    <div class="form-fields">
      <EcTextField v-model="formData.name" label="Name" :edit-mode="true" />
      <EcMoneyField v-model="formData.budget_amount" label="Budget Amount" :edit-mode="true" />
      <EcDateField v-model="formData.start_date" label="Start Date" :edit-mode="true" />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button
          :label="specialEvent?.id ? 'Save' : 'Add'"
          data-testid="submit-btn"
          :disabled="!formData.name"
          @click="submit"
        />
        <Button label="Cancel" severity="secondary" data-testid="cancel-btn" @click="close" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import EcTextField from '../shared/form/text-field/EcTextField.vue';
import EcMoneyField from '../shared/form/money-field/EcMoneyField.vue';
import EcDateField from '../shared/form/date-field/EcDateField.vue';
import type { SpecialEventData } from './specialEvent.types';

interface SpecialEventFormData {
  name: string;
  budget_amount: number;
  start_date: string;
}

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

function close() {
  emit('update:visible', false);
}
</script>

<style scoped>
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;
}

.dialog-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
