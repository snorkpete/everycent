<template>
  <Button
    v-tooltip="'Add new budget'"
    icon="pi pi-plus"
    size="small"
    data-testid="add-budget-btn"
    @click="$emit('addBudget')"
  />
  <Button
    v-tooltip="'Reopen last closed budget'"
    icon="pi pi-history"
    severity="warn"
    size="small"
    data-testid="reopen-btn"
    @click="$emit('reopenLast')"
  />
  <Button
    v-tooltip="'Refresh budget list'"
    icon="pi pi-refresh"
    text
    severity="secondary"
    size="small"
    data-testid="refresh-btn"
    @click="$emit('refresh')"
  />
</template>

<script setup lang="ts">
defineEmits<{
  addBudget: [];
  reopenLast: [];
  refresh: [];
}>();
</script>
