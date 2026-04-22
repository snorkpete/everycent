<template>
  <Toast />
  <LoadingIndicator />

  <template v-if="authStore.loggedIn">
    <div class="app-layout">
      <MenuSidebar />

      <div class="main-content">
        <AppToolbar />

        <div class="page-content">
          <router-view />
        </div>
      </div>
    </div>

    <template v-if="isDev">
      <NlqChatButton @toggle="chatVisible = !chatVisible" />
      <NlqChatWindow v-model:visible="chatVisible" />
    </template>
  </template>

  <router-view v-else />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from './auth/authStore';
import Toast from 'primevue/toast';
import LoadingIndicator from './app/loading/LoadingIndicator.vue';
import MenuSidebar from './app/menu/MenuSidebar.vue';
import AppToolbar from './app/toolbar/AppToolbar.vue';
import NlqChatButton from './app/chat/NlqChatButton.vue';
import NlqChatWindow from './app/chat/NlqChatWindow.vue';

const authStore = useAuthStore();
const isDev = import.meta.env.DEV;
const chatVisible = ref(false);
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  background-color: var(--p-surface-50);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
