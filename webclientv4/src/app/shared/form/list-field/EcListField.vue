<template>
  <div class="ec-list-field">
    <template v-if="editMode">
      <label :for="inputId">{{ label }}</label>
      <Select
        :id="inputId"
        :model-value="modelValue"
        :options="displayOptions"
        option-label="name"
        option-value="id"
        :option-group-label="groupBy ? 'label' : undefined"
        :option-group-children="groupBy ? 'items' : undefined"
        :filter="filterable"
        :auto-filter-focus="filterable"
        :auto-option-focus="filterable"
        :select-on-focus="false"
        :reset-filter-on-hide="true"
        show-clear
        fluid
        placeholder=" "
        :pt="selectPt"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </template>
    <template v-else>
      <span class="label">{{ label }}</span>
      <span class="value">{{ selectedItemName }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';
import Select from 'primevue/select';
import type { ListItem, ListGroup } from './ec-list-field.types';

const { modelValue, label = '', editMode, items, groupBy, filterable } = defineProps<{
  modelValue: number | string | boolean | null | undefined;
  label?: string;
  editMode: boolean;
  items: ListItem[];
  /**
   * When set, groups items by this field name. Expects each item to have a
   * `{groupBy}_id` property and a nested `{groupBy}.name` string.
   * Example: groupBy="category" requires items with `category_id` and `category.name`.
   */
  groupBy?: string;
  filterable?: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: number | string | boolean | null];
}>();

const inputId = useId();

const selectedItemName = computed(() =>
  modelValue != null ? (items.find((item) => item.id === modelValue)?.name ?? '') : '',
);

const groups = computed((): ListGroup[] => {
  if (!groupBy || !items.length) return [];

  const groupByIdField = `${groupBy}_id`;
  const groupByField = groupBy;

  const grouped: Record<string, ListGroup> = {};
  for (const item of items) {
    const groupId = String(item[groupByIdField]);
    if (!grouped[groupId]) {
      const groupObj = item[groupByField] as { name: string } | undefined;
      grouped[groupId] = {
        label: groupObj?.name ?? groupId,
        items: [],
      };
    }
    grouped[groupId].items.push(item);
  }

  return Object.values(grouped).sort((a, b) => a.label.localeCompare(b.label));
});

const displayOptions = computed(() => (groupBy ? groups.value : items));

const selectPt = computed(() => {
  const pt: Record<string, Record<string, string>> = {
    label: { class: 'ec-select-label' },
  };
  if (groupBy) {
    pt.optionGroupLabel = { class: 'ec-group-label' };
    pt.option = { class: 'ec-group-option' };
  }
  return pt;
});
</script>

<style scoped>
.ec-list-field {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.label {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.125;
  color: var(--p-text-muted-color);
}

.value {
  font-size: 14px;
}
</style>

<style>
/* Unscoped so PT classes apply to the teleported overlay */
.ec-group-label {
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--p-primary-color);
  padding: 0.6rem 0.75rem 0.25rem;
}

.ec-group-option {
  padding-left: 1.5rem !important;
  font-size: 0.8rem;
}

.p-select.p-component .ec-select-label {
  min-height: 2.6rem;
  display: flex;
  align-items: center;
}
</style>
