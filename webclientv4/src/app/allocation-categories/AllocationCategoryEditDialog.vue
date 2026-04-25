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

      <EcListField
        v-model="formData.budget_role"
        label="Budget Role"
        :items="roleItems"
        :edit-mode="editMode"
        data-testid="budget-role-select"
      />
    </template>
  </EcFormDialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import EcFormDialog from '../shared/form/form-dialog/EcFormDialog.vue';
import EcTextField from '../shared/form/text-field/EcTextField.vue';
import EcListField from '../shared/form/list-field/EcListField.vue';
import {
  BUDGET_ROLES,
  BUDGET_ROLE_LABELS,
  type AllocationCategoryData,
  type BudgetRole,
} from './allocationCategory.types';

const props = defineProps<{
  visible: boolean;
  allocationCategory: AllocationCategoryData;
  initialEditMode: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  save: [category: AllocationCategoryData];
}>();

const roleItems = BUDGET_ROLES.map((role) => ({
  id: role,
  name: BUDGET_ROLE_LABELS[role],
}));

function toFormData(category: AllocationCategoryData) {
  return {
    id: category.id,
    name: category.name ?? '',
    budget_role: category.budget_role ?? 'spending',
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
  emit('save', {
    id: formData.id,
    name: formData.name,
    budget_role: formData.budget_role as BudgetRole,
  });
}

function cancel() {
  if (formData.id) {
    Object.assign(formData, toFormData(props.allocationCategory));
  } else {
    emit('update:visible', false);
  }
}
</script>
