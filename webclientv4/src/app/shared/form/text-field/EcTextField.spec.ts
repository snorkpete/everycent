import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import EcTextField from './EcTextField.vue';

describe('EcTextField', () => {
  const label = 'First Name';
  const value = 'John';

  function createWrapper(props: Record<string, unknown> = {}) {
    return mount(EcTextField, {
      props: {
        modelValue: value,
        label,
        editMode: false,
        ...props,
      },
      global: {
        plugins: [PrimeVue],
      },
    });
  }

  describe('read-only mode', () => {
    it('displays the label', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain(label);
    });

    it('displays the value as plain text', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain(value);
    });

    it('does not display an input field', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('input').exists()).toBe(false);
    });
  });

  describe('inline mode', () => {
    it('hides the label in read-only mode when inline=true', () => {
      const wrapper = createWrapper({ inline: true });

      expect(wrapper.text()).not.toContain(label);
      expect(wrapper.text()).toContain(value);
    });

    it('hides the label in edit mode when inline=true', () => {
      const wrapper = createWrapper({ editMode: true, inline: true });

      expect(wrapper.text()).not.toContain(label);
      expect(wrapper.find('input').exists()).toBe(true);
    });

    it('adds inline CSS class when inline=true', () => {
      const wrapper = createWrapper({ inline: true });

      expect(wrapper.find('.ec-text-field').classes()).toContain('ec-text-field--inline');
    });

    it('does not add inline CSS class by default', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('.ec-text-field').classes()).not.toContain('ec-text-field--inline');
    });
  });

  describe('edit mode', () => {
    it('displays an input field with the value', () => {
      const wrapper = createWrapper({ editMode: true });
      const input = wrapper.find('input');

      expect(input.exists()).toBe(true);
      expect(input.element.value).toBe(value);
    });

    it('displays the label', () => {
      const wrapper = createWrapper({ editMode: true });

      expect(wrapper.text()).toContain(label);
    });

    it('emits update:modelValue when the input changes', async () => {
      const newValue = 'Jane';
      const wrapper = createWrapper({ editMode: true });

      await wrapper.find('input').setValue(newValue);

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([newValue]);
    });

    it('uses the specified input type', () => {
      const type = 'email';
      const wrapper = createWrapper({ editMode: true, type });

      expect(wrapper.find('input').attributes('type')).toBe(type);
    });

    it('defaults to text type', () => {
      const wrapper = createWrapper({ editMode: true });

      expect(wrapper.find('input').attributes('type')).toBe('text');
    });
  });
});
