<template>
  <EcFormDialog
    :visible="visible"
    header="Add New Budget"
    width="24rem"
    :always-edit="true"
    :save-disabled="!startDate"
    @update:visible="$emit('update:visible', $event)"
    @save="save"
  >
    <EcDateField v-model="startDate" label="Start Date" :edit-mode="true" data-testid="start-date-picker" />
  </EcFormDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import EcFormDialog from '../shared/form/form-dialog/EcFormDialog.vue';
import EcDateField from '../shared/form/date-field/EcDateField.vue';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{
  'update:visible': [value: boolean];
  save: [startDate: string];
}>();

const startDate = ref('');

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      startDate.value = '';
    }
  },
);

function save() {
  if (startDate.value) {
    emit('save', startDate.value);
    emit('update:visible', false);
  }
}
</script>
