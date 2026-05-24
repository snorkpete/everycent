import { describe, it, expect } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import LlmModelEditDialog from './LlmModelEditDialog.vue';
import EcTextField from '../shared/form/text-field/EcTextField.vue';
import type { LlmModelData } from './llmModel.types';
import { DialogStub } from '../../test/stubs';

const existingModel: LlmModelData = {
  id: 1,
  provider: 'anthropic',
  name: 'claude-sonnet-4-6',
  url: 'https://api.anthropic.com',
  display_name: 'Claude Sonnet',
  input_token_cost: 300,
  output_token_cost: 1500,
  cache_read_token_cost: 30,
  cache_write_token_cost: 375,
  thinking_token_cost: 1500,
  active: true,
};

const newModel: LlmModelData = {};

function createWrapper(props: Record<string, unknown> = {}): ReturnType<typeof mount> {
  return mount(LlmModelEditDialog, {
    props: {
      visible: true,
      model: existingModel,
      initialEditMode: false,
      ...props,
    },
    global: {
      plugins: [PrimeVue],
      stubs: { Dialog: DialogStub },
    },
  });
}

describe('LlmModelEditDialog', () => {
  describe('view mode (existing model)', () => {
    it('shows the model provider and name', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain(existingModel.provider);
      expect(wrapper.text()).toContain(existingModel.name);
    });

    it('shows the display name', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain(existingModel.display_name);
    });

    it('shows active status as Yes', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Yes');
    });

    it('shows Make Changes and Close buttons', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="close-btn"]').exists()).toBe(true);
    });

    it('does not show Save or Cancel buttons', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(false);
    });

    it('switches to edit mode when Make Changes is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true);
    });
  });

  describe('edit mode (existing model)', () => {
    it('shows Save and Cancel buttons', () => {
      const wrapper = createWrapper({ initialEditMode: true });

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(true);
    });

    it('emits save with correctly shaped API data when Save is clicked', async () => {
      const wrapper = createWrapper({ initialEditMode: true });

      await wrapper.find('[data-testid="save-btn"]').trigger('click');

      const emitted = wrapper.emitted('save');
      expect(emitted).toBeDefined();
      const saved = emitted![0][0] as LlmModelData;
      expect(saved.id).toBe(existingModel.id);
      expect(saved.provider).toBe(existingModel.provider);
      expect(saved.name).toBe(existingModel.name);
      expect(saved.url).toBe(existingModel.url);
      expect(saved.input_token_cost).toBe(300);
      expect(typeof saved.input_token_cost).toBe('number');
      expect(saved.output_token_cost).toBe(1500);
      expect(saved.cache_read_token_cost).toBe(30);
      expect(saved.cache_write_token_cost).toBe(375);
      expect(saved.thinking_token_cost).toBe(1500);
      expect(saved.active).toBe(true);
    });

    it('returns to view mode when Cancel is clicked on an existing model', async () => {
      const wrapper = createWrapper({ initialEditMode: true });

      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
    });

    it('does not emit update:visible when Cancel is clicked on an existing model', async () => {
      const wrapper = createWrapper({ initialEditMode: true });

      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

      expect(wrapper.emitted('update:visible')).toBeUndefined();
    });
  });

  describe('create mode (new model)', () => {
    it('opens with empty fields', () => {
      const wrapper = createWrapper({ model: newModel, initialEditMode: true });

      const nameField = wrapper.find('[data-testid="name-field"]');
      expect(nameField.exists()).toBe(true);
    });

    it('emits save with numbers converted from strings', async () => {
      const wrapper = createWrapper({ model: newModel, initialEditMode: true });

      // Fields order: name (index 0), url (1), display_name (2), input_token_cost (3), ...
      const textFields = wrapper.findAllComponents(EcTextField);
      const nameField = textFields[0];
      await nameField.vm.$emit('update:modelValue', 'gpt-4o');
      await nextTick();

      const inputCostField = textFields[3];
      await inputCostField.vm.$emit('update:modelValue', '250');
      await nextTick();

      await wrapper.find('[data-testid="save-btn"]').trigger('click');

      const emitted = wrapper.emitted('save');
      expect(emitted).toBeDefined();
      const saved = emitted![0][0] as LlmModelData;
      expect(saved.name).toBe('gpt-4o');
      expect(saved.input_token_cost).toBe(250);
      expect(typeof saved.input_token_cost).toBe('number');
    });

    it('defaults empty cost fields to 0', async () => {
      const wrapper = createWrapper({ model: newModel, initialEditMode: true });

      await wrapper.find('[data-testid="save-btn"]').trigger('click');

      const emitted = wrapper.emitted('save');
      expect(emitted).toBeDefined();
      const saved = emitted![0][0] as LlmModelData;
      expect(saved.input_token_cost).toBe(0);
      expect(saved.output_token_cost).toBe(0);
      expect(saved.cache_read_token_cost).toBe(0);
      expect(saved.cache_write_token_cost).toBe(0);
      expect(saved.thinking_token_cost).toBe(0);
    });

    it('emits update:visible false when Cancel is clicked on a new model', async () => {
      const wrapper = createWrapper({ model: newModel, initialEditMode: true });

      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    });
  });

  describe('clearing optional fields on edit', () => {
    it('emits display_name as empty string when cleared (not undefined)', async () => {
      const wrapper = createWrapper({ model: existingModel, initialEditMode: true });

      const textFields = wrapper.findAllComponents(EcTextField);
      // display_name is the third EcTextField (after name and url)
      const displayNameField = textFields[2];
      await displayNameField.vm.$emit('update:modelValue', '');
      await nextTick();

      await wrapper.find('[data-testid="save-btn"]').trigger('click');

      const emitted = wrapper.emitted('save');
      expect(emitted).toBeDefined();
      const saved = emitted![0][0] as LlmModelData;
      // Key MUST be present in the payload so backend updates the column.
      // Stripping to `undefined` would silently fail to clear the field.
      expect('display_name' in saved).toBe(true);
      expect(saved.display_name).toBe('');
    });
  });

  describe('form reset on re-open', () => {
    it('resets form data when dialog becomes visible again with a new model', async () => {
      const wrapper = createWrapper({ initialEditMode: false });
      await nextTick();

      await wrapper.setProps({ visible: false });
      await wrapper.setProps({
        visible: true,
        model: { id: 2, provider: 'openai', name: 'gpt-4o', active: false },
      });

      expect(wrapper.text()).toContain('gpt-4o');
      expect(wrapper.text()).toContain('openai');
    });
  });

  describe('required field validation', () => {
    it('does not include id in save payload for new model', async () => {
      const wrapper = createWrapper({ model: newModel, initialEditMode: true });

      await wrapper.find('[data-testid="save-btn"]').trigger('click');

      const emitted = wrapper.emitted('save');
      expect(emitted).toBeDefined();
      const saved = emitted![0][0] as LlmModelData;
      expect(saved.id).toBeUndefined();
    });

    it('includes id in save payload for existing model', async () => {
      const wrapper = createWrapper({ initialEditMode: true });

      await wrapper.find('[data-testid="save-btn"]').trigger('click');

      const emitted = wrapper.emitted('save');
      expect(emitted).toBeDefined();
      const saved = emitted![0][0] as LlmModelData;
      expect(saved.id).toBe(existingModel.id);
    });
  });
});
