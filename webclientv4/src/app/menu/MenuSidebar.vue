<template>
  <aside v-if="isDesktop" class="desktop-sidebar" data-testid="desktop-sidebar">
    <div class="brand">EveryCent</div>
    <PanelMenu :model="menuItems" />
  </aside>

  <template v-else>
    <Button
      icon="pi pi-bars"
      severity="secondary"
      text
      class="mobile-menu-toggle"
      data-testid="menu-toggle"
      @click="drawerVisible = true"
    />
    <Drawer v-model:visible="drawerVisible" data-testid="mobile-drawer">
      <PanelMenu :model="menuItems" />
    </Drawer>
  </template>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useBreakpoints, breakpointsPrimeFlex } from '@vueuse/core';
import PanelMenu from 'primevue/panelmenu';
import Button from 'primevue/button';
import Drawer from 'primevue/drawer';
import { useAuthStore } from '../../auth/authStore';
import { useRouter } from 'vue-router';
import { buildMenuItems } from './menuItems';

const breakpoints = useBreakpoints(breakpointsPrimeFlex);
const isDesktop = breakpoints.greaterOrEqual('lg');

const authStore = useAuthStore();
const router = useRouter();
const drawerVisible = ref(false);

watch(isDesktop, (desktop) => {
  if (desktop) {
    drawerVisible.value = false;
  }
});

function logout() {
  authStore.logOut();
  router.push('/login');
}

const menuItems = buildMenuItems(logout);
</script>

<style scoped>
.desktop-sidebar {
  width: 220px;
  flex-shrink: 0;
  background-color: #1a2332;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  /* Override PrimeVue hover/focus tokens for dark sidebar */
  --p-panelmenu-item-focus-background: rgba(255, 255, 255, 0.07);
  --p-panelmenu-item-focus-color: #e2e8f0;
  --p-panelmenu-item-icon-focus-color: #e2e8f0;
  --p-panelmenu-submenu-icon-focus-color: #e2e8f0;
}

.brand {
  padding: 1.25rem 1rem 1.1rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: 0.04em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.mobile-menu-toggle {
  position: fixed;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 100;
}

/* Reset PanelMenu chrome */
:deep(.p-panelmenu) {
  background: transparent;
  border: none;
  padding: 0.5rem 0;
}

:deep(.p-panelmenu-panel) {
  background: transparent;
  border: none;
  padding: 0;
}

/* All link styles shared between header items and submenu items */
:deep(.p-panelmenu-header-link),
:deep(.p-panelmenu-item-link) {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  margin: 0.1rem 0.5rem;
  border-radius: 6px;
  color: #94a3b8;
  text-decoration: none;
  transition:
    background 0.15s,
    color 0.15s;
  font-size: 0.9rem;
}

:deep(.p-panelmenu-header-link:hover),
:deep(.p-panelmenu-item-link:hover) {
  background: rgba(255, 255, 255, 0.07);
  color: #e2e8f0;
}

/* Active route */
:deep(.p-panelmenu-header-link.router-link-exact-active),
:deep(.p-panelmenu-item-link.router-link-exact-active) {
  background: rgba(20, 184, 166, 0.15);
  color: #2dd4bf;
}

/* Expanded group header */
:deep(.p-panelmenu-header-content) {
  background: transparent;
  border: none;
}

/* Submenu indent */
:deep(.p-panelmenu-submenu) {
  background: transparent;
  border: none;
  padding: 0;
  padding-left: 0.75rem;
}

:deep(.p-panelmenu-item-content) {
  background: transparent;
}

/* Icons inherit link colour */
:deep(.p-panelmenu-header-icon),
:deep(.p-panelmenu-item-icon) {
  font-size: 0.85rem;
  color: inherit;
  flex-shrink: 0;
}

/* No dividers between panels */
:deep(.p-panelmenu-panel + .p-panelmenu-panel) {
  border-top: none;
}
</style>
