<template>
  <Dialog
    :visible="visible"
    header="Institution Details"
    modal
    :style="{ width: '30rem' }"
    @update:visible="close"
  >
    <div class="form-fields">
      <EcTextField v-model="formData.name" label="Name" :edit-mode="editMode" />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <template v-if="editMode">
          <Button label="Save" data-testid="save-btn" @click="saveChanges" />
          <Button label="Cancel" severity="secondary" data-testid="cancel-btn" @click="cancel" />
        </template>
        <template v-else>
          <Button label="Make Changes" data-testid="edit-btn" @click="editMode = true" />
          <Button label="Close" severity="secondary" data-testid="close-btn" @click="close" />
        </template>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
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

const editMode = ref(props.initialEditMode);

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
      editMode.value = props.initialEditMode;
    }
  },
);

function saveChanges() {
  emit('save', { id: formData.id, name: formData.name });
}

function cancel() {
  if (formData.id) {
    Object.assign(formData, toFormData(props.institution));
    editMode.value = false;
  } else {
    emit('update:visible', false);
  }
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
