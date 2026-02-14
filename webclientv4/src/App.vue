<template>
  <LoadingIndicator />

  <template v-if="authStore.loggedIn">
    <div class="app-layout">
      <MenuSidebar />

      <div class="main-content">
        <AppToolbar />

        <router-view />
      </div>
    </div>
  </template>

  <router-view v-else />
</template>

<script setup lang="ts">
import { useAuthStore } from './auth/authStore';
import LoadingIndicator from './app/loading/LoadingIndicator.vue';
import MenuSidebar from './app/menu/MenuSidebar.vue';
import AppToolbar from './app/toolbar/AppToolbar.vue';

const authStore = useAuthStore();
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  min-width: 0;
}
</style>
