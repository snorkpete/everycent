<template>
  <Dialog
    :visible="visible"
    position="bottomright"
    :modal="false"
    :closable="true"
    :style="{ width: '28rem', height: '32rem' }"
    :content-style="{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }"
    @update:visible="$emit('update:visible', $event)"
    @show="onShow"
  >
    <template #header>
      <div class="chat-header">
        <span class="chat-title">Ask Everycent</span>
        <Button
          v-tooltip.bottom="'New chat'"
          icon="pi pi-plus"
          text
          rounded
          size="small"
          :disabled="messages.length === 0"
          @click="$emit('clear')"
        />
      </div>
    </template>

    <div ref="messagesContainer" class="chat-messages">
      <p v-if="messages.length === 0" class="empty-state">Ask a question about your finances.</p>

      <div v-for="(msg, i) in renderedMessages" :key="i" class="message-wrapper" :class="msg.role">
        <div
          v-if="msg.role === 'assistant' && msg.thinking"
          class="thinking-disclosure"
          :class="{ expanded: isThinkingExpanded(i, msg) }"
        >
          <button class="thinking-toggle" @click="toggleThinking(i)">
            <span class="thinking-label">Thinking</span>
            <span class="thinking-chevron">{{ isThinkingExpanded(i, msg) ? '▲' : '▼' }}</span>
          </button>
          <div v-show="isThinkingExpanded(i, msg)" class="thinking-content">{{ msg.thinking }}</div>
        </div>
        <div class="chat-bubble markdown-body" :class="msg.role" v-html="msg.html" />
      </div>

      <div v-if="thinking" class="chat-bubble assistant loading-indicator">Thinking...</div>
      <div v-if="toolStatus" class="chat-bubble assistant loading-indicator">{{ toolStatus }}</div>

      <div v-if="error" class="chat-bubble error">{{ error }}</div>
    </div>

    <div class="chat-input">
      <Textarea
        ref="inputRef"
        v-model="inputText"
        placeholder="Type a question..."
        fluid
        :rows="3"
        :disabled="loading"
        @keydown.enter.exact.prevent="onSubmit"
      />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { marked } from 'marked';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import type { ChatMessage } from './chat.types';

marked.setOptions({ breaks: true });

const props = defineProps<{
  visible: boolean;
  messages: ChatMessage[];
  loading: boolean;
  thinking: boolean;
  toolStatus: string | null;
  error: string | null;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  submit: [content: string];
  clear: [];
}>();

const renderedMessages = computed(() =>
  props.messages.map((msg) => ({
    ...msg,
    html: marked.parse(msg.content) as string,
  })),
);

// Track which message indices the user has manually toggled.
// true = user forced open, false = user forced closed.
// If not in this map, auto-expand logic applies.
const manualExpand = ref<Map<number, boolean>>(new Map());

function isThinkingExpanded(index: number, msg: { thinking?: string; content: string }): boolean {
  if (manualExpand.value.has(index)) {
    return manualExpand.value.get(index)!;
  }
  // Auto-expand while streaming thinking (no content yet)
  // Auto-collapse once content starts arriving
  return !!msg.thinking && msg.content === '';
}

function toggleThinking(index: number) {
  const current = manualExpand.value.get(index);
  // If no manual state, derive the current auto state from the message, then flip
  const msg = renderedMessages.value[index];
  if (msg === undefined) return;
  const currentExpanded = current !== undefined ? current : !!msg.thinking && msg.content === '';
  manualExpand.value = new Map(manualExpand.value).set(index, !currentExpanded);
}

// Clear manual expand state when messages are cleared (new chat)
watch(
  () => props.messages.length,
  (newLen, oldLen) => {
    if (newLen < oldLen) {
      manualExpand.value = new Map();
    }
    scrollToBottom();
  },
);

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

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

watch(() => props.messages[props.messages.length - 1]?.content.length, scrollToBottom);
watch(() => props.messages[props.messages.length - 1]?.thinking?.length, scrollToBottom);
</script>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.chat-title {
  font-weight: 600;
  font-size: 1.1rem;
}

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

.message-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.message-wrapper.user {
  align-items: flex-end;
}

.message-wrapper.assistant {
  align-items: flex-start;
}

.thinking-disclosure {
  max-width: 85%;
  width: 100%;
  border: 1px solid var(--p-surface-300);
  border-radius: 0.5rem;
  overflow: hidden;
  font-size: 0.8rem;
}

.thinking-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.3rem 0.6rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  text-align: left;
}

.thinking-toggle:hover {
  background-color: var(--p-surface-100);
}

.thinking-label {
  font-style: italic;
}

.thinking-chevron {
  font-size: 0.65rem;
}

.thinking-content {
  padding: 0.4rem 0.6rem;
  color: var(--p-text-muted-color);
  font-style: italic;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  border-top: 1px solid var(--p-surface-300);
  max-height: 8rem;
  overflow-y: auto;
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

.chat-bubble.error {
  align-self: center;
  background-color: var(--p-red-50);
  color: var(--p-red-700);
  font-size: 0.85rem;
  text-align: center;
}

.chat-input {
  padding: 0.5rem;
  border-top: 1px solid var(--p-surface-200);
}

.markdown-body :deep(p) {
  margin: 0 0 0.25rem;
}

.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0.25rem 0;
  padding-left: 1.25rem;
}

.markdown-body :deep(code) {
  background-color: var(--p-surface-200);
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  font-size: 0.85em;
}

.markdown-body :deep(pre) {
  background-color: var(--p-surface-200);
  padding: 0.5rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.25rem 0;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}
</style>
