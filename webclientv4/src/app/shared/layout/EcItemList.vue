<template>
  <ul class="ec-item-list" :class="{ 'ec-item-list--actions-right': actionsRight }">
    <li v-for="item in items" :key="String(item[keyField])" class="ec-item-list__item">
      <slot name="item" :item="item" />
    </li>
  </ul>
</template>

<script setup lang="ts">
const {
  items,
  keyField = 'id',
  actionsRight = true,
} = defineProps<{
  items: Record<string, unknown>[];
  keyField?: string;
  actionsRight?: boolean;
}>();
</script>

<style scoped>
.ec-item-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--p-surface-200);
  border-radius: 6px;
  overflow: hidden;
}

.ec-item-list__item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--p-surface-200);
  gap: 0.5rem;
}

.ec-item-list__item:last-child {
  border-bottom: none;
}

.ec-item-list--actions-right .ec-item-list__item > :last-child {
  margin-left: auto;
}
</style>
