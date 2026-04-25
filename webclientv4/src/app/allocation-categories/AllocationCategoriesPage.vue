<template>
  <EcPageLayout page-name="allocation-categories">
    <EcItemList :items="store.allocationCategories" key-field="id">
      <template #item="{ item: category }">
        <span class="category-name-row">
          <a
            class="category-name"
            href="#"
            :data-testid="`category-link-${category.id}`"
            @click.prevent="editCategory(category)"
            >{{ category.name }}</a
          >
          <span
            v-if="category.exclude_from_overspend_tracking"
            class="excluded-badge"
            :data-testid="`excluded-badge-${category.id}`"
            >excluded</span
          >
        </span>
        <Button
          label="View"
          size="small"
          :data-testid="`view-btn-${category.id}`"
          @click="editCategory(category)"
        />
      </template>
      <template #page-actions>
        <Button label="Add Allocation Category" data-testid="add-btn" @click="addCategory" />
        <Button label="Refresh" severity="secondary" data-testid="refresh-btn" @click="refresh" />
      </template>
    </EcItemList>

    <AllocationCategoryEditDialog
      :visible="dialogVisible"
      :allocation-category="selectedCategory"
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
import { useAllocationCategoryStore } from './allocationCategoryStore';
import { useNotifications } from '../notifications/useNotifications';
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
.category-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-name {
  font-size: 0.9rem;
  color: var(--p-primary-color);
  text-decoration: none;
  cursor: pointer;
}

.category-name:hover {
  text-decoration: underline;
}

.excluded-badge {
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  border: 1px solid var(--p-text-muted-color);
  border-radius: 0.25rem;
  padding: 0.1rem 0.35rem;
  line-height: 1.2;
}
</style>
