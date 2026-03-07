<template>
  <div class="institutions-page">
    <ul class="institution-list">
      <li
        v-for="institution in store.institutions"
        :key="institution.id"
        class="institution-item"
      >
        <span class="institution-name">{{ institution.name }}</span>
        <Button
          label="Edit"
          size="small"
          class="edit-btn"
          :data-testid="`edit-btn-${institution.id}`"
          @click="editInstitution(institution)"
        />
      </li>
    </ul>

    <div class="page-actions">
      <Button label="Add Institution" data-testid="add-btn" @click="addInstitution" />
      <Button label="Refresh" severity="secondary" data-testid="refresh-btn" @click="refresh" />
    </div>

    <InstitutionEditDialog
      :visible="dialogVisible"
      :institution="selectedInstitution"
      :initial-edit-mode="dialogEditMode"
      @update:visible="dialogVisible = $event"
      @save="onSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Button from 'primevue/button';
import { useHeadingStore } from '../toolbar/headingStore';
import { useInstitutionStore } from './institutionStore';
import { useNotifications } from '../notifications/useNotifications';
import InstitutionEditDialog from './InstitutionEditDialog.vue';
import type { InstitutionData } from './institution.types';

const store = useInstitutionStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();

const dialogVisible = ref(false);
const selectedInstitution = ref<InstitutionData>({});
const dialogEditMode = ref(false);

onMounted(() => {
  headingStore.setHeading('Financial Institutions');
  refresh();
});

function refresh() {
  store.fetchAll();
}

function editInstitution(institution: InstitutionData) {
  selectedInstitution.value = institution;
  dialogEditMode.value = false;
  dialogVisible.value = true;
}

function addInstitution() {
  selectedInstitution.value = {};
  dialogEditMode.value = true;
  dialogVisible.value = true;
}

async function onSave(institution: InstitutionData) {
  try {
    await store.save(institution);
    notifications.success('Institution saved');
    dialogVisible.value = false;
  } catch {
    notifications.error(store.error ?? 'Failed to save institution');
  }
}
</script>

<style scoped>
.institutions-page {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.institution-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--p-surface-200);
  border-radius: 6px;
  overflow: hidden;
}

.institution-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--p-surface-200);
  gap: 0.5rem;
}

.institution-item:last-child {
  border-bottom: none;
}

.institution-name {
  font-size: 0.9rem;
}

.edit-btn {
  margin-left: auto;
}

.page-actions {
  display: flex;
  gap: 0.75rem;
}
</style>
