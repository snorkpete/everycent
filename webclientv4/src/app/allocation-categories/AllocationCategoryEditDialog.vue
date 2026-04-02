<template>
  <EcFormDialog
    :visible="visible"
    header="Allocation Category Details"
    :initial-edit-mode="initialEditMode"
    @update:visible="$emit('update:visible', $event)"
    @save="saveChanges"
    @cancel="cancel"
  >
    <template #default="{ editMode }">
      <EcTextField v-model="formData.name" label="Name" :edit-mode="editMode" />
    </template>
  </EcFormDialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import EcFormDialog from '../shared/form/form-dialog/EcFormDialog.vue';
import EcTextField from '../shared/form/text-field/EcTextField.vue';
import type { AllocationCategoryData } from './allocationCategory.types';

const props = defineProps<{
  visible: boolean;
  allocationCategory: AllocationCategoryData;
  initialEditMode: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  save: [category: AllocationCategoryData];
}>();

function toFormData(category: AllocationCategoryData) {
  return {
    id: category.id,
    name: category.name ?? '',
  };
}

const formData = reactive(toFormData(props.allocationCategory));

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      Object.assign(formData, toFormData(props.allocationCategory));
    }
  },
);

function saveChanges() {
  emit('save', { id: formData.id, name: formData.name });
}

function cancel() {
  if (formData.id) {
    Object.assign(formData, toFormData(props.allocationCategory));
  } else {
    emit('update:visible', false);
  }
}
</script>
