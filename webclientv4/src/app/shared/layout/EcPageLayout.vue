<template>
  <div
    class="ec-page-layout"
    :class="[
      `ec-page-layout--${variant}`,
      { 'ec-page-layout--mobile': isMobile, 'ec-page-layout--content-bg': contentBg },
    ]"
    :data-page="pageName"
  >
    <div v-if="$slots['toolbar-left'] || $slots['toolbar-right']" class="ec-page-layout__toolbar">
      <div class="ec-page-layout__toolbar-left">
        <slot name="toolbar-left" />
      </div>
      <div class="ec-page-layout__toolbar-right">
        <slot name="toolbar-right" />
      </div>
    </div>
    <div v-else-if="$slots.toolbar" class="ec-page-layout__toolbar">
      <slot name="toolbar" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useResponsive } from '../composables/useResponsive';

const {
  pageName,
  variant = 'scrollable',
  contentBg = false,
} = defineProps<{
  pageName: string;
  variant?: 'scrollable' | 'fixed';
  contentBg?: boolean;
}>();

const { isMobile } = useResponsive();
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
  margin-bottom: 0.5rem;
}

.ec-page-layout--content-bg {
  background-color: var(--p-surface-100);
}

.ec-page-layout__toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.ec-page-layout__toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

/* ── Mobile: tighter side padding ── */
.ec-page-layout--mobile.ec-page-layout--scrollable {
  padding: 0.75rem 0.75rem 1rem;
}

.ec-page-layout--mobile.ec-page-layout--fixed {
  padding: 0.5rem 0.75rem 0;
}
</style>
