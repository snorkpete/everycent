<template>
  <NlqChatButton @toggle="chatVisible = !chatVisible" />
  <NlqChatWindow
    v-model:visible="chatVisible"
    :messages="chatStore.messages"
    :loading="chatStore.loading"
    :thinking="chatStore.thinking"
    :error="chatStore.error"
    @submit="chatStore.sendMessage($event)"
    @clear="chatStore.clearMessages()"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NlqChatButton from './NlqChatButton.vue';
import NlqChatWindow from './NlqChatWindow.vue';
import { useChatStore } from './chatStore';

const chatStore = useChatStore();
const chatVisible = ref(false);
</script>
