<template>
  <div class="allocation-categories-page">
    <EcItemList :items="store.allocationCategories" key-field="id">
      <template #item="{ item: category }">
        <span class="category-name">{{ category.name }}</span>
        <Button
          label="Edit"
          size="small"
          :data-testid="`edit-btn-${category.id}`"
          @click="editCategory(category)"
        />
      </template>
    </EcItemList>

    <div class="page-actions">
      <Button label="Add Allocation Category" data-testid="add-btn" @click="addCategory" />
      <Button label="Refresh" severity="secondary" data-testid="refresh-btn" @click="refresh" />
    </div>

    <AllocationCategoryEditDialog
      :visible="dialogVisible"
      :allocation-category="selectedCategory"
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
import { useAllocationCategoryStore } from './allocationCategoryStore';
import { useNotifications } from '../notifications/useNotifications';
import EcItemList from '../shared/layout/EcItemList.vue';
import AllocationCategoryEditDialog from './AllocationCategoryEditDialog.vue';
import type { AllocationCategoryData } from './allocationCategory.types';

const store = useAllocationCategoryStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();

const dialogVisible = ref(false);
const selectedCategory = ref<AllocationCategoryData>({});
const dialogEditMode = ref(false);

onMounted(() => {
  headingStore.setHeading('Allocation Categories');
  refresh();
});

function refresh() {
  store.fetchAll();
}

function editCategory(category: AllocationCategoryData) {
  selectedCategory.value = category;
  dialogEditMode.value = false;
  dialogVisible.value = true;
}

function addCategory() {
  selectedCategory.value = {};
  dialogEditMode.value = true;
  dialogVisible.value = true;
}

async function onSave(category: AllocationCategoryData) {
  try {
    await store.save(category);
    notifications.success('Allocation category saved');
    dialogVisible.value = false;
  } catch {
    notifications.error(store.error ?? 'Failed to save allocation category');
  }
}
</script>

<style scoped>
.allocation-categories-page {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-name {
  font-size: 0.9rem;
}

.page-actions {
  display: flex;
  gap: 0.75rem;
}
</style>
