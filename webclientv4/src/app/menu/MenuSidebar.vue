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
import { ref, onMounted, onUnmounted } from 'vue';
import PanelMenu from 'primevue/panelmenu';
import Button from 'primevue/button';
import Drawer from 'primevue/drawer';
import { useAuthStore } from '../../auth/authStore';
import { useRouter } from 'vue-router';
import { buildMenuItems } from './menuItems';

const DESKTOP_BREAKPOINT = '(min-width: 1024px)';

const authStore = useAuthStore();
const router = useRouter();
const drawerVisible = ref(false);
const isDesktop = ref(window.matchMedia(DESKTOP_BREAKPOINT).matches);

function onBreakpointChange(e: MediaQueryListEvent) {
  isDesktop.value = e.matches;
  if (e.matches) {
    drawerVisible.value = false;
  }
}

onMounted(() => {
  window.matchMedia(DESKTOP_BREAKPOINT).addEventListener('change', onBreakpointChange);
});

onUnmounted(() => {
  window.matchMedia(DESKTOP_BREAKPOINT).removeEventListener('change', onBreakpointChange);
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
