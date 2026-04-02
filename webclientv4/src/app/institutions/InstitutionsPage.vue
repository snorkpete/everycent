<template>
  <EcPageLayout page-name="institutions">
    <EcItemList :items="store.institutions" key-field="id">
      <template #item="{ item: institution }">
        <span class="institution-name">{{ institution.name }}</span>
        <Button
          label="Edit"
          size="small"
          :data-testid="`edit-btn-${institution.id}`"
          @click="editInstitution(institution)"
        />
      </template>
    </EcItemList>

    <div class="page-actions">
      <Button label="Add Institution" data-testid="add-btn" @click="addInstitution" />
      <Button
        label="Refresh"
        severity="secondary"
        data-testid="refresh-btn"
        :loading="store.loading"
        @click="refresh"
      />
    </div>

    <InstitutionEditDialog
      :visible="dialogVisible"
      :institution="selectedInstitution"
      :initial-edit-mode="dialogEditMode"
      @update:visible="dialogVisible = $event"
      @save="onSave"
    />
  </EcPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Button from 'primevue/button';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import EcItemList from '../shared/layout/EcItemList.vue';
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
.institution-name {
  font-size: 0.9rem;
}

.page-actions {
  display: flex;
  gap: 0.75rem;
}
</style>
