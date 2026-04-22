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
  >
    <div class="chat-messages">
      <p class="empty-state">Ask a question about your finances.</p>
    </div>

    <div class="chat-input">
      <InputText
        v-model="inputText"
        placeholder="Type a question..."
        fluid
        @keydown.enter="inputText = ''"
      />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';

defineProps<{
  visible: boolean;
}>();

defineEmits<{
  'update:visible': [value: boolean];
}>();

const inputText = ref('');
</script>

<style scoped>
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.empty-state {
  color: var(--p-text-muted-color);
  text-align: center;
  margin-top: 2rem;
}

.chat-input {
  padding: 0.5rem;
  border-top: 1px solid var(--p-surface-200);
}
</style>
