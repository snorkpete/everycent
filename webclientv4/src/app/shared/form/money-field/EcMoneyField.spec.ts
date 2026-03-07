import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import EcMoneyField from './EcMoneyField.vue';

describe('EcMoneyField', () => {
  const label = 'Amount';

  function mountComponent(props: Record<string, unknown> = {}) {
    return mount(EcMoneyField, {
      props: {
        modelValue: 0,
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
      const wrapper = mountComponent({ modelValue: 1550 });

      expect(wrapper.text()).toContain(label);
    });

    it('displays a positive value formatted as dollars', () => {
      const cents = 1550;
      const expectedDisplay = '15.50';
      const wrapper = mountComponent({ modelValue: cents });

      expect(wrapper.text()).toContain(expectedDisplay);
    });

    it('displays a negative value formatted as dollars', () => {
      const cents = -1550;
      const expectedDisplay = '-15.50';
      const wrapper = mountComponent({ modelValue: cents });

      expect(wrapper.text()).toContain(expectedDisplay);
    });

    it('displays zero as 0.00', () => {
      const cents = 0;
      const expectedDisplay = '0.00';
      const wrapper = mountComponent({ modelValue: cents });

      expect(wrapper.text()).toContain(expectedDisplay);
    });

    it('formats large numbers with thousand separators', () => {
      const cents = 123456;
      const expectedDisplay = '1,234.56';
      const wrapper = mountComponent({ modelValue: cents });

      expect(wrapper.text()).toContain(expectedDisplay);
    });

    it('does not display an input field', () => {
      const wrapper = mountComponent({ modelValue: 1550 });

      expect(wrapper.find('input').exists()).toBe(false);
    });

    it('applies negative styling for negative values', () => {
      const cents = -500;
      const wrapper = mountComponent({ modelValue: cents });
      const valueEl = wrapper.find('.money-display');

      expect(valueEl.classes()).toContain('negative');
    });

    it('does not apply negative styling for positive values', () => {
      const cents = 500;
      const wrapper = mountComponent({ modelValue: cents });
      const valueEl = wrapper.find('.money-display');

      expect(valueEl.classes()).not.toContain('negative');
    });

    it('does not apply positive styling by default', () => {
      const cents = 500;
      const wrapper = mountComponent({ modelValue: cents });
      const valueEl = wrapper.find('.money-display');

      expect(valueEl.classes()).not.toContain('positive');
    });

    it('applies positive styling when highlightPositive is true', () => {
      const cents = 500;
      const wrapper = mountComponent({
        modelValue: cents,
        highlightPositive: true,
      });
      const valueEl = wrapper.find('.money-display');

      expect(valueEl.classes()).toContain('positive');
    });

    it('does not apply positive styling for negative values even when highlightPositive is true', () => {
      const cents = -500;
      const wrapper = mountComponent({
        modelValue: cents,
        highlightPositive: true,
      });
      const valueEl = wrapper.find('.money-display');

      expect(valueEl.classes()).not.toContain('positive');
      expect(valueEl.classes()).toContain('negative');
    });
  });

  describe('edit mode', () => {
    it('displays an input field', () => {
      const wrapper = mountComponent({ editMode: true, modelValue: 1550 });

      expect(wrapper.find('input').exists()).toBe(true);
    });

    it('displays the value in dollars in the input', () => {
      const cents = 1550;
      const expectedDollars = '15.50';
      const wrapper = mountComponent({ editMode: true, modelValue: cents });

      expect(wrapper.find('input').element.value).toBe(expectedDollars);
    });

    it('displays the label', () => {
      const wrapper = mountComponent({ editMode: true, modelValue: 0 });

      expect(wrapper.text()).toContain(label);
    });

    it('emits the value in cents when the user types a dollar amount', async () => {
      const wrapper = mountComponent({ editMode: true, modelValue: 0 });
      const dollarInput = '25.75';
      const expectedCents = 2575;

      await wrapper.find('input').setValue(dollarInput);

      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
        expectedCents,
      ]);
    });

    it('handles input with commas by stripping them before converting', async () => {
      const wrapper = mountComponent({ editMode: true, modelValue: 0 });
      const dollarInput = '1,234.56';
      const expectedCents = 123456;

      await wrapper.find('input').setValue(dollarInput);

      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
        expectedCents,
      ]);
    });

    it('emits 0 for non-numeric input', async () => {
      const wrapper = mountComponent({ editMode: true, modelValue: 100 });
      const dollarInput = 'abc';
      const expectedCents = 0;

      await wrapper.find('input').setValue(dollarInput);

      const emittedValue = wrapper.emitted('update:modelValue') ?? [];
      expect(emittedValue[0]).toEqual([expectedCents]);
    });

    it('applies negative styling to input for negative values', () => {
      const cents = -500;
      const wrapper = mountComponent({ editMode: true, modelValue: cents });
      const input = wrapper.find('.money-input');

      expect(input.classes()).toContain('negative');
    });
  });
});
