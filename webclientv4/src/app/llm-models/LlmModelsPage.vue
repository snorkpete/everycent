<template>
  <EcPageLayout page-name="llm-models">
    <EcItemList :items="store.models" key-field="id">
      <template #item="{ item: model }">
        <span class="model-label" :data-testid="`model-label-${model.id}`">
          {{ modelDisplayLabel(model as LlmModelData) }}
        </span>
        <span
          class="model-status"
          :class="model.active ? 'model-status--active' : 'model-status--inactive'"
          :data-testid="`model-status-${model.id}`"
        >
          {{ model.active ? 'Active' : 'Inactive' }}
        </span>
        <Button
          v-tooltip="'Edit this model'"
          icon="pi pi-pencil"
          size="small"
          severity="secondary"
          :data-testid="`edit-btn-${model.id}`"
          @click="editModel(model as LlmModelData)"
        />
        <Button
          v-tooltip="'Delete this model'"
          icon="pi pi-trash"
          size="small"
          severity="danger"
          :data-testid="`delete-btn-${model.id}`"
          @click="confirmDelete(model as LlmModelData)"
        />
      </template>
      <template #page-actions>
        <Button label="Add Model" data-testid="add-btn" @click="addModel" />
        <Button
          label="Refresh"
          severity="secondary"
          data-testid="refresh-btn"
          :loading="store.loading"
          @click="refresh"
        />
      </template>
    </EcItemList>

    <LlmModelEditDialog
      :visible="dialogVisible"
      :model="selectedModel"
      :initial-edit-mode="dialogEditMode"
      @update:visible="dialogVisible = $event"
      @save="onSave"
    />

    <ConfirmDialog />
  </EcPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import EcItemList from '../shared/layout/EcItemList.vue';
import { useHeadingStore } from '../toolbar/headingStore';
import { useLlmModelStore } from './llmModelStore';
import { useNotifications } from '../notifications/useNotifications';
import LlmModelEditDialog from './LlmModelEditDialog.vue';
import type { LlmModelData } from './llmModel.types';

const store = useLlmModelStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();
const confirm = useConfirm();

const dialogVisible = ref(false);
const selectedModel = ref<LlmModelData>({});
const dialogEditMode = ref(false);

onMounted(() => {
  headingStore.setHeading('Model Registry');
  refresh();
});

function refresh() {
  store.fetchAll();
}

function modelDisplayLabel(model: LlmModelData): string {
  const label = model.display_name || model.name || '';
  return model.provider ? `${model.provider} / ${label}` : label;
}

function editModel(model: LlmModelData) {
  selectedModel.value = model;
  dialogEditMode.value = false;
  dialogVisible.value = true;
}

function addModel() {
  selectedModel.value = {};
  dialogEditMode.value = true;
  dialogVisible.value = true;
}

async function onSave(model: LlmModelData) {
  try {
    await store.save(model);
    notifications.success('Model saved');
    dialogVisible.value = false;
  } catch {
    notifications.error(store.error ?? 'Failed to save model');
  }
}

function confirmDelete(model: LlmModelData) {
  confirm.require({
    message: `Delete model "${model.display_name || model.name}"?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteModel(model),
  });
}

async function deleteModel(model: LlmModelData) {
  if (!model.id) return;
  try {
    await store.destroy(model.id);
    notifications.success('Model deleted');
  } catch {
    notifications.error(store.error ?? 'Failed to delete model');
  }
}
</script>

<style scoped>
.model-label {
  font-size: 0.9rem;
  flex: 1;
}

.model-status {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
}

.model-status--active {
  background-color: var(--p-green-100);
  color: var(--p-green-700);
}

.model-status--inactive {
  background-color: var(--p-surface-200);
  color: var(--p-text-muted-color);
}
</style>
