<template>
  <Dialog
    :visible="visible"
    :header="header"
    modal
    :style="mergedStyle"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="form-fields">
      <slot :edit-mode="editMode" />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <slot name="footer-extra" :edit-mode="editMode" />
        <template v-if="alwaysEdit || editMode">
          <Button
            :label="saveLabel"
            data-testid="save-btn"
            :disabled="saveDisabled"
            @click="$emit('save')"
          />
          <Button
            :label="cancelLabel"
            severity="secondary"
            data-testid="cancel-btn"
            @click="handleCancel"
          />
        </template>
        <template v-else>
          <Button :label="editLabel" data-testid="edit-btn" @click="editMode = true" />
          <Button
            :label="closeLabel"
            severity="secondary"
            data-testid="close-btn"
            @click="$emit('update:visible', false)"
          />
        </template>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, type CSSProperties } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

const {
  visible,
  header,
  width = '30rem',
  initialEditMode = false,
  alwaysEdit = false,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  editLabel = 'Make Changes',
  closeLabel = 'Close',
  saveDisabled = false,
  dialogStyle,
} = defineProps<{
  visible: boolean;
  header: string;
  width?: string;
  initialEditMode?: boolean;
  alwaysEdit?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  editLabel?: string;
  closeLabel?: string;
  saveDisabled?: boolean;
  dialogStyle?: CSSProperties;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  save: [];
  cancel: [];
}>();

const editMode = ref(alwaysEdit || initialEditMode);

const mergedStyle = computed(() => ({
  width,
  ...dialogStyle,
}));

watch(
  () => visible,
  (isVisible) => {
    if (isVisible) {
      editMode.value = alwaysEdit || initialEditMode;
    }
  },
);

function handleCancel() {
  if (alwaysEdit) {
    emit('cancel');
    emit('update:visible', false);
  } else {
    editMode.value = false;
    emit('cancel');
  }
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
