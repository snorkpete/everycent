<template>
  <header v-if="authStore.loggedIn" class="top-bar" data-testid="top-bar">
    <span class="app-title" data-testid="app-title">EveryCent</span>
    <div class="header-actions">
      <a href="/#/" class="old-version-link" data-testid="old-version-link">Old Version</a>
      <Button label="Log Out" severity="secondary" size="small" data-testid="logout-button" @click="logout" />
    </div>
  </header>
  <router-view />
</template>

<script setup lang="ts">
import { useAuthStore } from './auth/authStore';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const authStore = useAuthStore();
const router = useRouter();

function logout() {
  authStore.logOut();
  router.push('/login');
}
</script>

<style scoped>
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #ddd;
}

.app-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.old-version-link {
  color: inherit;
  text-decoration: none;
  font-size: 0.875rem;
}

.old-version-link:hover {
  text-decoration: underline;
}
</style>
