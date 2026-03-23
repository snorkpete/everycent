<template>
  <div class="settings-page">
    <div class="form-fields">
      <EcListField
        :model-value="formData.primary_budget_account_id"
        label="Primary Budget Account"
        :edit-mode="editMode"
        :items="bankAccountItems"
        data-testid="primary-budget-account"
        @update:model-value="onPrimaryBudgetAccountChange"
      />

      <EcListField
        :model-value="formData.default_allocation_category_id_for_special_events"
        label="Default Allocation Category for Special Events"
        :edit-mode="editMode"
        :items="allocationCategoryItems"
        data-testid="default-allocation-category"
        @update:model-value="onDefaultAllocationCategoryChange"
      />

      <EcListField
        :model-value="formData.family_type"
        label="Type of Household"
        :edit-mode="editMode"
        :items="familyTypeItems"
        data-testid="family-type"
        @update:model-value="onFamilyTypeChange"
      />

      <template v-if="formData.family_type === 'single'">
        <EcTextField
          v-model="formData.single_person"
          label="Person's Name"
          :edit-mode="editMode"
          data-testid="single-person"
        />
      </template>
      <template v-else-if="formData.family_type === 'couple'">
        <EcTextField
          v-model="formData.husband"
          label="Husband's Name"
          :edit-mode="editMode"
          data-testid="husband"
        />
        <EcTextField
          v-model="formData.wife"
          label="Wife's Name"
          :edit-mode="editMode"
          data-testid="wife"
        />
      </template>
    </div>

    <div class="page-actions">
      <template v-if="editMode">
        <Button label="Save" data-testid="save-btn" @click="saveSettings" />
        <Button label="Cancel" severity="secondary" data-testid="cancel-btn" @click="cancelEdit" />
      </template>
      <template v-else>
        <Button label="Make Changes" data-testid="edit-btn" @click="editMode = true" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import Button from 'primevue/button';
import { useHeadingStore } from '../toolbar/headingStore';
import { useSettingsStore } from './settingsStore';
import { useNotifications } from '../notifications/useNotifications';
import EcTextField from '../shared/form/text-field/EcTextField.vue';
import EcListField from '../shared/form/list-field/EcListField.vue';
import type { ListItem } from '../shared/form/list-field/ec-list-field.types';
import type { SettingsData } from './settings.types';

const store = useSettingsStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();

const editMode = ref(false);

function toFormData(s: SettingsData): SettingsData {
  return {
    // Explicitly carry bank_charges_allocation_name so it survives a save round-trip
    // even though it is not currently rendered as an editable field.
    bank_charges_allocation_name: s.bank_charges_allocation_name,
    primary_budget_account_id: s.primary_budget_account_id,
    default_allocation_category_id_for_special_events: s.default_allocation_category_id_for_special_events,
    // Default to 'couple' only before the real data loads; overwritten in onMounted .then()
    family_type: s.family_type ?? 'couple',
    husband: s.husband ?? '',
    wife: s.wife ?? '',
    single_person: s.single_person ?? '',
  };
}

const formData = reactive<SettingsData>(toFormData({}));

const bankAccountItems = computed<ListItem[]>(() =>
  store.bankAccounts
    .filter((a): a is { id: number; name: string } => a.id != null && a.name != null)
    .map((a) => ({ id: a.id, name: a.name })),
);

const allocationCategoryItems = computed<ListItem[]>(() =>
  store.allocationCategories
    .filter((c): c is { id: number; name: string } => c.id != null && c.name != null)
    .map((c) => ({ id: c.id, name: c.name })),
);

const familyTypeItems: ListItem[] = [
  { id: 'couple', name: 'Couple' },
  { id: 'single', name: 'Single' },
];

function onPrimaryBudgetAccountChange(value: number | string | boolean | null) {
  formData.primary_budget_account_id = value as number | undefined;
}

function onDefaultAllocationCategoryChange(value: number | string | boolean | null) {
  formData.default_allocation_category_id_for_special_events = value as number | undefined;
}

function onFamilyTypeChange(value: number | string | boolean | null) {
  formData.family_type = value as 'single' | 'couple' | undefined;
}

onMounted(() => {
  headingStore.setHeading('General Settings');
  store
    .fetchAll()
    .then(() => {
      Object.assign(formData, toFormData(store.settings));
    })
    .catch(() => {
      notifications.error(store.error ?? 'Failed to load settings');
    });
});

async function saveSettings() {
  try {
    await store.save({ ...formData });
    notifications.success('Settings saved');
    editMode.value = false;
  } catch {
    notifications.error(store.error ?? 'Failed to save settings');
  }
}

function cancelEdit() {
  Object.assign(formData, toFormData(store.settings));
  editMode.value = false;
}
</script>

<style scoped>
.settings-page {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-actions {
  display: flex;
  gap: 0.75rem;
}
</style>
