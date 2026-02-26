import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import EcTextField from './EcTextField.vue';

describe('EcTextField', () => {
  const label = 'First Name';
  const value = 'John';

  function mountComponent(props: Record<string, unknown> = {}) {
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
      const wrapper = mountComponent();

      expect(wrapper.text()).toContain(label);
    });

    it('displays the value as plain text', () => {
      const wrapper = mountComponent();

      expect(wrapper.text()).toContain(value);
    });

    it('does not display an input field', () => {
      const wrapper = mountComponent();

      expect(wrapper.find('input').exists()).toBe(false);
    });
  });

  describe('edit mode', () => {
    it('displays an input field with the value', () => {
      const wrapper = mountComponent({ editMode: true });
      const input = wrapper.find('input');

      expect(input.exists()).toBe(true);
      expect(input.element.value).toBe(value);
    });

    it('displays the label', () => {
      const wrapper = mountComponent({ editMode: true });

      expect(wrapper.text()).toContain(label);
    });

    it('emits update:modelValue when the input changes', async () => {
      const newValue = 'Jane';
      const wrapper = mountComponent({ editMode: true });

      await wrapper.find('input').setValue(newValue);

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([newValue]);
    });

    it('uses the specified input type', () => {
      const type = 'email';
      const wrapper = mountComponent({ editMode: true, type });

      expect(wrapper.find('input').attributes('type')).toBe(type);
    });

    it('defaults to text type', () => {
      const wrapper = mountComponent({ editMode: true });

      expect(wrapper.find('input').attributes('type')).toBe('text');
    });
  });
});
