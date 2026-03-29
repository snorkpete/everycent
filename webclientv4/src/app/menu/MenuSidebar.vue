<template>
  <aside v-if="isDesktop" class="desktop-sidebar" data-testid="desktop-sidebar">
    <div class="brand">
      <img src="/everycent-icon.jpeg" alt="EveryCent" class="brand-logo" />
      <span>EveryCent</span>
    </div>
    <PanelMenu v-model:expanded-keys="expandedKeys" :model="activeMenuItems" />
    <div class="color-picker">
      <button
        v-for="color in colorOptions"
        :key="color.name"
        class="color-swatch"
        :class="{ active: activeColor === color.name }"
        :style="{ backgroundColor: color.preview }"
        :title="`Switch to ${color.name} theme`"
        @click="setColor(color.name)"
      />
    </div>
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
      <PanelMenu v-model:expanded-keys="expandedKeys" :model="activeMenuItems" />
    </Drawer>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useBreakpoints, breakpointsPrimeFlex } from '@vueuse/core';
import PanelMenu from 'primevue/panelmenu';
import Button from 'primevue/button';
import Drawer from 'primevue/drawer';
import { updatePrimaryPalette } from '@primeuix/themes';
import { useAuthStore } from '../../auth/authStore';
import { useRouter, useRoute } from 'vue-router';
import { buildMenuItems } from './menuItems';
import type { AppMenuItem } from './menuItems';

const colorOptions = [
  { name: 'indigo', preview: '#6366f1' },
  { name: 'blue', preview: '#3b82f6' },
  { name: 'teal', preview: '#14b8a6' },
  { name: 'amber', preview: '#f59e0b' },
] as const;

type ColorName = (typeof colorOptions)[number]['name'];

const STORAGE_KEY = 'ec-primary-color';
const activeColor = ref<ColorName>((localStorage.getItem(STORAGE_KEY) as ColorName) || 'indigo');

function buildPalette(name: string) {
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
  return Object.fromEntries(shades.map((s) => [s, `{${name}.${s}}`]));
}

function setColor(name: ColorName) {
  activeColor.value = name;
  localStorage.setItem(STORAGE_KEY, name);
  updatePrimaryPalette(buildPalette(name));
}

// Apply saved color on startup (skips default to avoid unnecessary update)
onMounted(() => {
  if (activeColor.value !== 'indigo') {
    updatePrimaryPalette(buildPalette(activeColor.value));
  }
});

const breakpoints = useBreakpoints(breakpointsPrimeFlex);
const isDesktop = breakpoints.greaterOrEqual('lg');

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
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

const menuItems = buildMenuItems(logout, (path) => router.push(path));

// PanelMenu uses different props for active class depending on item depth:
//   depth 0 (top-level panel headers) → headerClass → targets .p-panelmenu-header
//   depth 1+ (sub-items rendered by PanelMenuList) → class → targets .p-panelmenu-item
function applyActiveClass(items: AppMenuItem[], currentPath: string, depth = 0): AppMenuItem[] {
  return items.map((item) => {
    if (item.separator) return item;
    if (item.items) {
      return { ...item, items: applyActiveClass(item.items, currentPath, depth + 1) };
    }
    if (!item.routePath || item.routePath !== currentPath) return item;
    return depth === 0 ? { ...item, headerClass: 'ec-active' } : { ...item, class: 'ec-active' };
  });
}

const activeMenuItems = computed(() => applyActiveClass(menuItems, route.path));

function activeExpandedKeys(currentPath: string): Record<string, boolean> {
  const keys: Record<string, boolean> = {};
  for (const item of menuItems) {
    if (item.key && item.items) {
      if (item.items.some((child: AppMenuItem) => child.routePath === currentPath)) {
        keys[item.key] = true;
      }
    }
  }
  return keys;
}

const expandedKeys = ref<Record<string, boolean>>(activeExpandedKeys(route.path));

watch(
  () => route.path,
  (newPath) => {
    // Merge rather than replace so manually-expanded groups remain open
    expandedKeys.value = { ...expandedKeys.value, ...activeExpandedKeys(newPath) };
  },
);
</script>

<style scoped>
.desktop-sidebar {
  width: 220px;
  flex-shrink: 0;
  background-color: #1a2332;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;

  /* Override PrimeVue hover/focus tokens for dark sidebar */
  --p-panelmenu-item-focus-background: rgba(255, 255, 255, 0.07);
  --p-panelmenu-item-focus-color: #e2e8f0;
  --p-panelmenu-item-icon-focus-color: #e2e8f0;
  --p-panelmenu-submenu-icon-focus-color: #e2e8f0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: 0.04em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.brand-logo {
  width: 28px;
  height: 28px;
  border-radius: 4px;
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

/* Active route — top-level leaf items; headerClass lands on .p-panelmenu-header */
:deep(.p-panelmenu-header.ec-active .p-panelmenu-header-link),
/* Active route — sub-items; class lands on .p-panelmenu-item (li) */
:deep(.p-panelmenu-item.ec-active .p-panelmenu-item-link) {
  background: color-mix(in srgb, var(--p-primary-400) 20%, transparent);
  color: var(--p-primary-300);
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

.color-picker {
  margin-top: auto;
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.color-swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition:
    border-color 0.15s,
    transform 0.15s;
  padding: 0;
}

.color-swatch:hover {
  transform: scale(1.15);
}

.color-swatch.active {
  border-color: #e2e8f0;
}
</style>
