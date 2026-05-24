<template>
  <EcFormDialog
    :visible="visible"
    header="LLM Model"
    :initial-edit-mode="initialEditMode"
    :always-edit="!model.id"
    @update:visible="$emit('update:visible', $event)"
    @save="saveChanges"
    @cancel="cancel"
  >
    <template #default="{ editMode }">
      <EcListField
        v-model="formData.provider"
        label="Provider"
        :edit-mode="editMode"
        :items="providerItems"
        data-testid="provider-field"
      />
      <EcTextField
        v-model="formData.name"
        label="Name"
        :edit-mode="editMode"
        data-testid="name-field"
      />
      <EcTextField
        v-model="formData.display_name"
        label="Display Name"
        :edit-mode="editMode"
        data-testid="display-name-field"
      />
      <EcTextField
        v-model="formData.input_token_cost"
        label="Input Token Cost (¢/M tokens)"
        type="number"
        :edit-mode="editMode"
        data-testid="input-token-cost-field"
      />
      <EcTextField
        v-model="formData.output_token_cost"
        label="Output Token Cost (¢/M tokens)"
        type="number"
        :edit-mode="editMode"
        data-testid="output-token-cost-field"
      />
      <EcTextField
        v-model="formData.cache_read_token_cost"
        label="Cache Read Token Cost (¢/M tokens)"
        type="number"
        :edit-mode="editMode"
        data-testid="cache-read-token-cost-field"
      />
      <EcTextField
        v-model="formData.cache_write_token_cost"
        label="Cache Write Token Cost (¢/M tokens)"
        type="number"
        :edit-mode="editMode"
        data-testid="cache-write-token-cost-field"
      />
      <EcTextField
        v-model="formData.thinking_token_cost"
        label="Thinking Token Cost (¢/M tokens)"
        type="number"
        :edit-mode="editMode"
        data-testid="thinking-token-cost-field"
      />
      <div class="toggle-field">
        <span class="label">Active</span>
        <template v-if="editMode">
          <ToggleSwitch v-model="formData.active" data-testid="active-field" />
        </template>
        <template v-else>
          <span class="value">{{ formData.active ? 'Yes' : 'No' }}</span>
        </template>
      </div>
    </template>
  </EcFormDialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import ToggleSwitch from 'primevue/toggleswitch';
import EcFormDialog from '../shared/form/form-dialog/EcFormDialog.vue';
import EcTextField from '../shared/form/text-field/EcTextField.vue';
import EcListField from '../shared/form/list-field/EcListField.vue';
import type { LlmModelData } from './llmModel.types';

interface LlmModelFormData {
  provider: string;
  name: string;
  display_name: string;
  input_token_cost: string;
  output_token_cost: string;
  cache_read_token_cost: string;
  cache_write_token_cost: string;
  thinking_token_cost: string;
  active: boolean;
}

const providerItems = [
  { id: 'ollama', name: 'ollama' },
  { id: 'anthropic', name: 'anthropic' },
  { id: 'openai', name: 'openai' },
  { id: 'google', name: 'google' },
  { id: 'voyage', name: 'voyage' },
];

const { visible, model, initialEditMode } = defineProps<{
  visible: boolean;
  model: LlmModelData;
  initialEditMode: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  save: [model: LlmModelData];
}>();

function toFormData(source: LlmModelData): LlmModelFormData {
  return {
    provider: source.provider ?? '',
    name: source.name ?? '',
    display_name: source.display_name ?? '',
    input_token_cost: source.input_token_cost != null ? String(source.input_token_cost) : '',
    output_token_cost: source.output_token_cost != null ? String(source.output_token_cost) : '',
    cache_read_token_cost:
      source.cache_read_token_cost != null ? String(source.cache_read_token_cost) : '',
    cache_write_token_cost:
      source.cache_write_token_cost != null ? String(source.cache_write_token_cost) : '',
    thinking_token_cost:
      source.thinking_token_cost != null ? String(source.thinking_token_cost) : '',
    active: source.active ?? true,
  };
}

function toApiData(form: LlmModelFormData): LlmModelData {
  return {
    provider: form.provider,
    name: form.name,
    display_name: form.display_name,
    input_token_cost: form.input_token_cost !== '' ? Number(form.input_token_cost) : 0,
    output_token_cost: form.output_token_cost !== '' ? Number(form.output_token_cost) : 0,
    cache_read_token_cost:
      form.cache_read_token_cost !== '' ? Number(form.cache_read_token_cost) : 0,
    cache_write_token_cost:
      form.cache_write_token_cost !== '' ? Number(form.cache_write_token_cost) : 0,
    thinking_token_cost: form.thinking_token_cost !== '' ? Number(form.thinking_token_cost) : 0,
    active: form.active,
  };
}

const formData = reactive<LlmModelFormData>(toFormData(model));

watch(
  () => visible,
  (isVisible) => {
    if (isVisible) {
      Object.assign(formData, toFormData(model));
    }
  },
);

function saveChanges() {
  const apiData = toApiData(formData);
  if (model.id) {
    apiData.id = model.id;
  }
  emit('save', apiData);
}

function cancel() {
  if (model.id) {
    Object.assign(formData, toFormData(model));
  } else {
    emit('update:visible', false);
  }
}
</script>

<style scoped>
.toggle-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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
</style>
