<template>
  <aside v-if="isDesktop" class="desktop-sidebar" data-testid="desktop-sidebar">
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
  width: 280px;
  flex-shrink: 0;
  border-right: 1px solid var(--p-surface-200, #e5e7eb);
  overflow-y: auto;
}

.mobile-menu-toggle {
  position: fixed;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 100;
}
</style>
