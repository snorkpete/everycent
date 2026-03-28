import { describe, it, expect } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import DatePicker from 'primevue/datepicker';
import EcDateField from './EcDateField.vue';

describe('EcDateField', () => {
  const label = 'Transaction Date';
  const isoDate = '2024-12-25';

  function mountComponent(props: Record<string, unknown> = {}) {
    return mount(EcDateField, {
      props: {
        modelValue: isoDate,
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

    it('displays the formatted date', () => {
      const expectedDisplay = '25-12-2024';
      const wrapper = mountComponent();

      expect(wrapper.text()).toContain(expectedDisplay);
    });

    it('displays an empty string for an empty value', () => {
      const wrapper = mountComponent({ modelValue: '' });

      expect(wrapper.find('.value').text()).toBe('');
    });

    it('does not display a DatePicker', () => {
      const wrapper = mountComponent();

      expect(wrapper.findComponent(DatePicker).exists()).toBe(false);
    });
  });

  describe('edit mode', () => {
    it('displays a DatePicker', () => {
      const wrapper = mountComponent({ editMode: true });

      expect(wrapper.findComponent(DatePicker).exists()).toBe(true);
    });

    it('displays the label', () => {
      const wrapper = mountComponent({ editMode: true });

      expect(wrapper.text()).toContain(label);
    });

    it('passes a Date object to the DatePicker', () => {
      const wrapper = mountComponent({ editMode: true });
      const dateValue = wrapper.findComponent(DatePicker).props('modelValue') as Date;

      expect(dateValue).toBeInstanceOf(Date);
      expect(dateValue.getFullYear()).toBe(2024);
      expect(dateValue.getMonth()).toBe(11); // December is month index 11
      expect(dateValue.getDate()).toBe(25);
    });

    it('passes null to the DatePicker for an empty value', () => {
      const wrapper = mountComponent({ editMode: true, modelValue: '' });
      const dateValue = wrapper.findComponent(DatePicker).props('modelValue');

      expect(dateValue).toBeNull();
    });

    it('emits an ISO string when the DatePicker value changes', async () => {
      const wrapper = mountComponent({ editMode: true });
      const newDate = new Date(2024, 0, 15); // Jan 15, 2024
      const expectedIso = '2024-01-15';

      wrapper.findComponent(DatePicker).vm.$emit('update:modelValue', newDate);
      await nextTick();

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([expectedIso]);
    });

    it('emits zero-padded month and day', async () => {
      const wrapper = mountComponent({ editMode: true });
      const newDate = new Date(2024, 0, 5); // Jan 5, 2024
      const expectedIso = '2024-01-05';

      wrapper.findComponent(DatePicker).vm.$emit('update:modelValue', newDate);
      await nextTick();

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([expectedIso]);
    });

    it('emits an empty string when the date is cleared', async () => {
      const wrapper = mountComponent({ editMode: true });

      wrapper.findComponent(DatePicker).vm.$emit('update:modelValue', null);
      await nextTick();

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['']);
    });
  });
});
