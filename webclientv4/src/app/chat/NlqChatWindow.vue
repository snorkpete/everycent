<template>
  <Dialog
    :visible="visible"
    header="Ask Everycent"
    position="bottomright"
    :modal="false"
    :closable="true"
    :style="{ width: '28rem', height: '32rem' }"
    :contentStyle="{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }"
    @update:visible="$emit('update:visible', $event)"
    @show="onShow"
  >
    <div ref="messagesContainer" class="chat-messages">
      <p v-if="messages.length === 0" class="empty-state">Ask a question about your finances.</p>

      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="chat-bubble"
        :class="msg.role"
      >
        {{ msg.content }}
      </div>

      <div v-if="loading" class="chat-bubble assistant loading-indicator">…</div>
    </div>

    <div class="chat-input">
      <InputText
        ref="inputRef"
        v-model="inputText"
        placeholder="Type a question..."
        fluid
        :disabled="loading"
        @keydown.enter="onSubmit"
      />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import type { ChatMessage } from './chat.types';

defineProps<{
  visible: boolean;
  messages: ChatMessage[];
  loading: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  submit: [content: string];
}>();

const inputText = ref('');
const inputRef = ref<{ $el: HTMLInputElement } | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);

function focusInput() {
  inputRef.value?.$el?.focus();
}

// Dialog's onAfterEnter steals focus to its close button after the transition.
// setTimeout(0) queues our focus call after that.
function onShow() {
  setTimeout(focusInput, 1000);
}

function onSubmit() {
  const trimmed = inputText.value.trim();
  if (!trimmed) return;
  emit('submit', trimmed);
  inputText.value = '';
  setTimeout(focusInput, 1000);
}

watch(
  () => messagesContainer.value?.scrollHeight,
  async () => {
    await nextTick();
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  },
);
</script>

<style scoped>
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-state {
  color: var(--p-text-muted-color);
  text-align: center;
  margin-top: 2rem;
}

.chat-bubble {
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  max-width: 85%;
  word-wrap: break-word;
}

.chat-bubble.user {
  align-self: flex-end;
  background-color: var(--p-primary-100);
  color: var(--p-primary-900);
}

.chat-bubble.assistant {
  align-self: flex-start;
  background-color: var(--p-surface-100);
  color: var(--p-text-color);
}

.loading-indicator {
  font-style: italic;
  color: var(--p-text-muted-color);
}

.chat-input {
  padding: 0.5rem;
  border-top: 1px solid var(--p-surface-200);
}
</style>
