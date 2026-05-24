<template>
  <EcPageLayout page-name="chat-settings">
    <div class="settings-card" data-testid="chat-settings-card">
      <div class="form-fields">
        <div class="toggle-field">
          <span class="label">Chat Enabled</span>
          <template v-if="editMode">
            <ToggleSwitch v-model="formData.chat_enabled" data-testid="chat-enabled" />
          </template>
          <template v-else>
            <span class="value">{{ formData.chat_enabled ? 'Yes' : 'No' }}</span>
          </template>
        </div>

        <EcTextField
          v-model="formData.ollama_url"
          label="Ollama URL"
          :edit-mode="editMode"
          data-testid="ollama-url"
        />

        <EcListField
          v-model="formData.llm_model_id"
          label="Model"
          :edit-mode="editMode"
          :items="modelItems"
          data-testid="llm-model"
        />

        <EcTextField
          v-model="formData.ollama_model"
          label="Ollama Model (legacy — used as fallback if no Model is selected)"
          :edit-mode="editMode"
          data-testid="ollama-model"
        />

        <EcTextField
          v-model="formData.max_tool_iterations"
          label="Max Tool Iterations"
          type="number"
          :edit-mode="editMode"
          data-testid="max-tool-iterations"
        />

        <div class="extras-field">
          <span class="label">Extras (JSON)</span>
          <template v-if="editMode">
            <Textarea v-model="formData.extras" rows="4" auto-resize data-testid="extras" />
          </template>
          <template v-else>
            <span class="value extras-value">{{ formData.extras }}</span>
          </template>
        </div>
      </div>
    </div>

    <div class="page-actions">
      <template v-if="editMode">
        <Button label="Save" data-testid="save-btn" @click="saveSettings" />
        <Button label="Cancel" severity="secondary" data-testid="cancel-btn" @click="cancelEdit" />
      </template>
      <template v-else>
        <Button label="Make Changes" data-testid="edit-btn" @click="editMode = true" />
      </template>
    </div>
  </EcPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import Button from 'primevue/button';
import ToggleSwitch from 'primevue/toggleswitch';
import Textarea from 'primevue/textarea';
import EcPageLayout from '../shared/layout/EcPageLayout.vue';
import EcTextField from '../shared/form/text-field/EcTextField.vue';
import EcListField from '../shared/form/list-field/EcListField.vue';
import { useHeadingStore } from '../toolbar/headingStore';
import { useChatSettingsStore } from './chatSettingsStore';
import { useLlmModelStore } from '../llm-models/llmModelStore';
import { useNotifications } from '../notifications/useNotifications';
import type { ChatSettingsData } from './chatSettings.types';

const store = useChatSettingsStore();
const llmModelStore = useLlmModelStore();
const headingStore = useHeadingStore();
const notifications = useNotifications();

const modelItems = computed(() =>
  llmModelStore.models.map((m) => ({
    id: m.id as number,
    name: m.display_name || `${m.provider}/${m.name}`,
  })),
);

const editMode = ref(false);

interface ChatSettingsFormData {
  chat_enabled: boolean;
  ollama_url: string;
  ollama_model: string;
  llm_model_id: number | null;
  max_tool_iterations: string;
  extras: string;
}

function toFormData(s: ChatSettingsData): ChatSettingsFormData {
  return {
    chat_enabled: s.chat_enabled,
    ollama_url: s.ollama_url ?? '',
    ollama_model: s.ollama_model ?? '',
    llm_model_id: s.llm_model_id,
    max_tool_iterations: String(s.max_tool_iterations),
    extras: Object.keys(s.extras).length > 0 ? JSON.stringify(s.extras, null, 2) : '',
  };
}

function toApiData(f: ChatSettingsFormData): ChatSettingsData {
  let extras: Record<string, unknown> = {};
  if (f.extras.trim()) {
    try {
      extras = JSON.parse(f.extras) as Record<string, unknown>;
    } catch {
      // invalid JSON — will be handled by backend
    }
  }

  return {
    chat_enabled: f.chat_enabled,
    ollama_url: f.ollama_url || null,
    ollama_model: f.ollama_model || null,
    llm_model_id: f.llm_model_id,
    max_tool_iterations: Number(f.max_tool_iterations) || 5,
    extras,
  };
}

const formData = reactive<ChatSettingsFormData>(toFormData(store.settings));

onMounted(() => {
  headingStore.setHeading('Chat Settings');
  llmModelStore.fetchAll();
  store
    .fetch()
    .then(() => {
      Object.assign(formData, toFormData(store.settings));
    })
    .catch(() => {
      notifications.error(store.error ?? 'Failed to load chat settings');
    });
});

async function saveSettings() {
  try {
    await store.save(toApiData(formData));
    notifications.success('Chat settings saved');
    editMode.value = false;
  } catch {
    notifications.error(store.error ?? 'Failed to save chat settings');
  }
}

function cancelEdit() {
  Object.assign(formData, toFormData(store.settings));
  editMode.value = false;
}
</script>

<style scoped>
.settings-card {
  border: 1px solid var(--p-surface-300);
  border-radius: 6px;
  background-color: var(--p-surface-0);
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toggle-field,
.extras-field {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.125;
  color: var(--p-text-muted-color);
}

.value {
  font-size: 14px;
}

.extras-value {
  white-space: pre-wrap;
  font-family: monospace;
}

.page-actions {
  display: flex;
  gap: 0.75rem;
}
</style>
