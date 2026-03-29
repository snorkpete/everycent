<template>
  <Dialog
    :visible="visible"
    header="Add New Budget"
    modal
    :style="{ width: '24rem' }"
    @update:visible="close"
  >
    <div class="field">
      <label class="field-label" for="start-date">Start Date</label>
      <DatePicker
        v-model="startDate"
        input-id="start-date"
        date-format="yy-mm-dd"
        data-testid="start-date-picker"
        class="w-full"
      />
    </div>

    <template #footer>
      <Button label="Cancel" severity="secondary" data-testid="cancel-btn" @click="close" />
      <Button label="Save" data-testid="save-btn" :disabled="!startDate" @click="save" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{
  'update:visible': [value: boolean];
  save: [startDate: string];
}>();

const startDate = ref<Date | null>(null);

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      startDate.value = null;
    }
  },
);

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function close() {
  emit('update:visible', false);
}

function save() {
  if (startDate.value) {
    emit('save', formatDate(startDate.value));
    close();
  }
}
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 600;
  font-size: 0.875rem;
}
</style>
