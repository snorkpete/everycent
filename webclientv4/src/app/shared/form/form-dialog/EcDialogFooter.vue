<template>
  <div class="dialog-footer">
    <slot />
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
      @click="$emit('cancel')"
    />
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';

const {
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  saveDisabled = false,
} = defineProps<{
  saveLabel?: string;
  cancelLabel?: string;
  saveDisabled?: boolean;
}>();

defineEmits<{
  save: [];
  cancel: [];
}>();
</script>

<style scoped>
.dialog-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
