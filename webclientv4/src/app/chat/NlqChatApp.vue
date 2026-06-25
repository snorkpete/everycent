<template>
  <NlqChatButton @toggle="chatVisible = !chatVisible" />
  <NlqChatWindow
    :key="mode"
    v-model:visible="chatVisible"
    :mode="mode"
    @switch-mode="mode = $event"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ChatMode } from './chat.types';
import NlqChatButton from './NlqChatButton.vue';
import NlqChatWindow from './NlqChatWindow.vue';

const chatVisible = ref(false);
const mode = ref<ChatMode>('nlq');
</script>
