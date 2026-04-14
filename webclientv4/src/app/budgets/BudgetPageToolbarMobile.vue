<template>
  <Button
    v-tooltip="'Back to budget list'"
    icon="pi pi-arrow-left"
    outlined
    size="small"
    data-testid="back-btn"
    @click="$emit('back')"
  />
  <Button
    v-tooltip="'View transactions for this budget'"
    icon="pi pi-list"
    text
    severity="secondary"
    size="small"
    as="a"
    :href="transactionsHref"
    data-testid="view-transactions-btn"
  />
</template>

<script setup lang="ts">
defineProps<{
  transactionsHref: string;
}>();

defineEmits<{
  back: [];
}>();
</script>
