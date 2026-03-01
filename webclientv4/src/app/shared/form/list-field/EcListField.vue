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

const props = defineProps<{
  modelValue: number | string | boolean | null;
  label: string;
  editMode: boolean;
  items: ListItem[];
  /**
   * When set, groups items by this field name. Expects each item to have a
   * `{groupBy}_id` property and a nested `{groupBy}.name` string.
   * Example: groupBy="category" requires items with `category_id` and `category.name`.
   */
  groupBy?: string;
}>();

defineEmits<{
  'update:modelValue': [value: number | string | boolean | null];
}>();

const inputId = useId();

const selectedItemName = computed(
  () =>
    props.modelValue != null
      ? (props.items.find((item) => item.id === props.modelValue)?.name ?? '')
      : '',
);

const groups = computed((): ListGroup[] => {
  if (!props.groupBy || !props.items.length) return [];

  const groupByIdField = `${props.groupBy}_id`;
  const groupByField = props.groupBy;

  const grouped: Record<string, ListGroup> = {};
  for (const item of props.items) {
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

const displayOptions = computed(() => (props.groupBy ? groups.value : props.items));
</script>

<style scoped>
.ec-list-field {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.125;
  color: rgba(0, 0, 0, 0.54);
}

.value {
  font-size: 14px;
}
</style>
