<template>
  <EcFormDialog
    :visible="visible"
    header="Institution Details"
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
import type { InstitutionData } from './institution.types';

const props = defineProps<{
  visible: boolean;
  institution: InstitutionData;
  initialEditMode: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  save: [institution: InstitutionData];
}>();

function toFormData(institution: InstitutionData) {
  return {
    id: institution.id,
    name: institution.name ?? '',
  };
}

const formData = reactive(toFormData(props.institution));

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      Object.assign(formData, toFormData(props.institution));
    }
  },
);

function saveChanges() {
  emit('save', { id: formData.id, name: formData.name });
}

function cancel() {
  if (formData.id) {
    Object.assign(formData, toFormData(props.institution));
  } else {
    emit('update:visible', false);
  }
}
</script>
