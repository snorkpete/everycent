<template>
  <div class="ec-item-list-container">
    <div
      v-if="$slots['page-actions'] || $slots.controls"
      class="ec-item-list__action-bar"
      :class="{ 'ec-item-list__action-bar--bottom': actionsPosition === 'bottom' }"
    >
      <div class="ec-item-list__controls">
        <slot name="controls" />
      </div>
      <div class="ec-item-list__page-actions">
        <slot name="page-actions" />
      </div>
    </div>

    <ul class="ec-item-list" :class="{ 'ec-item-list--actions-right': actionsRight }">
      <li v-for="item in items" :key="String(item[keyField])" class="ec-item-list__item">
        <slot name="item" :item="item" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const {
  items,
  keyField = 'id',
  actionsRight = true,
  actionsPosition = 'top',
} = defineProps<{
  items: Record<string, unknown>[];
  keyField?: string;
  actionsRight?: boolean;
  actionsPosition?: 'top' | 'bottom';
}>();
</script>

<style scoped>
.ec-item-list-container {
  display: flex;
  flex-direction: column;
}

.ec-item-list__action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
}

/* Visually moves the action bar below the list. Works because the container
   is column-flex and the <ul> defaults to order: 0. */
.ec-item-list__action-bar--bottom {
  order: 1;
}

.ec-item-list__page-actions {
  display: flex;
  gap: 0.75rem;
}

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
