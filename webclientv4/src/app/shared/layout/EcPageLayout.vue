<template>
  <div class="ec-page-layout" :class="`ec-page-layout--${variant}`" :data-page="pageName">
    <div v-if="$slots.toolbar" class="ec-page-layout__toolbar">
      <slot name="toolbar" />
    </div>
    <template v-if="variant === 'fixed'">
      <div class="ec-page-layout__content-card">
        <slot />
      </div>
    </template>
    <template v-else>
      <slot />
    </template>
  </div>
</template>

<script setup lang="ts">
const { pageName, variant = 'scrollable' } = defineProps<{
  pageName: string;
  variant?: 'scrollable' | 'fixed';
}>();
</script>

<style scoped>
.ec-page-layout {
  display: flex;
  flex-direction: column;
}

.ec-page-layout--scrollable {
  padding: 1rem 1.5rem 1.5rem;
  gap: 1rem;
  height: 100%;
  overflow: auto;
}

.ec-page-layout--fixed {
  padding: 0.75rem 1.5rem 0;
  gap: 0;
  height: 100%;
  overflow: hidden;
}

.ec-page-layout__toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.ec-page-layout__content-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  background-color: var(--p-surface-0);
}
</style>
