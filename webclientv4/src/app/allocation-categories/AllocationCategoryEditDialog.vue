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

      <div v-if="editMode" class="checkbox-field">
        <Checkbox
          v-model="formData.exclude_from_overspend_tracking"
          input-id="exclude-from-overspend"
          binary
          data-testid="exclude-from-overspend-checkbox"
        />
        <label for="exclude-from-overspend" class="checkbox-label"
          >Exclude from overspend tracking</label
        >
      </div>
      <div v-else-if="formData.exclude_from_overspend_tracking" class="checkbox-view">
        <span class="label">Overspend tracking</span>
        <span class="value">Excluded</span>
      </div>
    </template>
  </EcFormDialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import Checkbox from 'primevue/checkbox';
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
    exclude_from_overspend_tracking: category.exclude_from_overspend_tracking ?? false,
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
    exclude_from_overspend_tracking: formData.exclude_from_overspend_tracking,
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

<style scoped>
.checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label {
  font-size: 14px;
  cursor: pointer;
}

.checkbox-view {
  display: flex;
  flex-direction: column;
}

.checkbox-view .label {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.125;
  color: var(--p-text-muted-color);
}

.checkbox-view .value {
  font-size: 14px;
}
</style>
