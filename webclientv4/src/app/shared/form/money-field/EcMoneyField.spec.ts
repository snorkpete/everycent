import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import EcMoneyField from './EcMoneyField.vue';

describe('EcMoneyField', () => {
  const label = 'Amount';

  function createWrapper(props: Record<string, unknown> = {}) {
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
      const wrapper = createWrapper({ modelValue: 1550 });

      expect(wrapper.text()).toContain(label);
    });

    it('displays a positive value formatted as dollars', () => {
      const cents = 1550;
      const expectedDisplay = '15.50';
      const wrapper = createWrapper({ modelValue: cents });

      expect(wrapper.text()).toContain(expectedDisplay);
    });

    it('displays a negative value formatted as dollars', () => {
      const cents = -1550;
      const expectedDisplay = '-15.50';
      const wrapper = createWrapper({ modelValue: cents });

      expect(wrapper.text()).toContain(expectedDisplay);
    });

    it('displays zero as 0.00', () => {
      const cents = 0;
      const expectedDisplay = '0.00';
      const wrapper = createWrapper({ modelValue: cents });

      expect(wrapper.text()).toContain(expectedDisplay);
    });

    it('formats large numbers with thousand separators', () => {
      const cents = 123456;
      const expectedDisplay = '1,234.56';
      const wrapper = createWrapper({ modelValue: cents });

      expect(wrapper.text()).toContain(expectedDisplay);
    });

    it('does not display an input field', () => {
      const wrapper = createWrapper({ modelValue: 1550 });

      expect(wrapper.find('input').exists()).toBe(false);
    });

    it('does not apply any styling by default (no highlight mode)', () => {
      const wrapper = createWrapper({ modelValue: -500 });
      const valueEl = wrapper.find('.money-display');

      expect(valueEl.classes()).not.toContain('negative');
      expect(valueEl.classes()).not.toContain('positive');
      expect(valueEl.classes()).not.toContain('muted');
    });

    it('applies balance highlight mode styling when specified', () => {
      const wrapper = createWrapper({
        modelValue: 500,
        highlightMode: 'balance',
      });
      const valueEl = wrapper.find('.money-display');

      expect(valueEl.classes()).toContain('positive');
    });

    it('applies muted styling for zero in balance mode', () => {
      const wrapper = createWrapper({
        modelValue: 0,
        highlightMode: 'balance',
      });
      const valueEl = wrapper.find('.money-display');

      expect(valueEl.classes()).toContain('muted');
    });
  });

  describe('edit mode', () => {
    it('displays an input field', () => {
      const wrapper = createWrapper({ editMode: true, modelValue: 1550 });

      expect(wrapper.find('input').exists()).toBe(true);
    });

    it('displays the value in dollars in the input', () => {
      const cents = 1550;
      const expectedDollars = '15.50';
      const wrapper = createWrapper({ editMode: true, modelValue: cents });

      expect(wrapper.find('input').element.value).toBe(expectedDollars);
    });

    it('displays the label', () => {
      const wrapper = createWrapper({ editMode: true, modelValue: 0 });

      expect(wrapper.text()).toContain(label);
    });

    it('emits the value in cents when the user types a dollar amount', async () => {
      const wrapper = createWrapper({ editMode: true, modelValue: 0 });
      const dollarInput = '25.75';
      const expectedCents = 2575;

      await wrapper.find('input').setValue(dollarInput);

      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([expectedCents]);
    });

    it('handles input with commas by stripping them before converting', async () => {
      const wrapper = createWrapper({ editMode: true, modelValue: 0 });
      const dollarInput = '1,234.56';
      const expectedCents = 123456;

      await wrapper.find('input').setValue(dollarInput);

      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([expectedCents]);
    });

    it('emits 0 for non-numeric input', async () => {
      const wrapper = createWrapper({ editMode: true, modelValue: 100 });
      const dollarInput = 'abc';
      const expectedCents = 0;

      await wrapper.find('input').setValue(dollarInput);

      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([expectedCents]);
    });

    it('selects all text when focused', async () => {
      const cents = 1550;
      const wrapper = createWrapper({ editMode: true, modelValue: cents });
      const inputEl = wrapper.find('input').element as HTMLInputElement;

      await wrapper.find('input').trigger('focus');

      expect(inputEl.selectionStart).toBe(0);
      expect(inputEl.selectionEnd).toBe(inputEl.value.length);
    });

    it('reformats the display via the watcher when input is committed without a prior focus', async () => {
      const wrapper = createWrapper({ editMode: true, modelValue: 0 });

      await wrapper.find('input').setValue('15.5');

      expect(wrapper.find('input').element.value).toBe('15.50');
    });

    it('updates the model value immediately on input', async () => {
      const wrapper = createWrapper({ editMode: true, modelValue: 0 });
      const input = wrapper.find('input');

      await input.trigger('focus');
      input.element.value = '1500';
      await input.trigger('input');

      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([150000]);
    });

    it('does not reformat the display when the model is updated externally while focused', async () => {
      const wrapper = createWrapper({ editMode: true, modelValue: 0 });
      const input = wrapper.find('input');

      await input.trigger('focus');
      input.element.value = '1500';
      await input.trigger('input');

      await wrapper.setProps({ modelValue: 99999 });

      expect(input.element.value).toBe('1500');
    });

    it('resumes accepting external model updates after the user blurs', async () => {
      const wrapper = createWrapper({ editMode: true, modelValue: 0 });
      const input = wrapper.find('input');

      await input.trigger('focus');
      input.element.value = '1500';
      await input.trigger('input');
      await input.trigger('blur');

      await wrapper.setProps({ modelValue: 50000 });

      expect(input.element.value).toBe('500.00');
    });

    it('reformats the display value on blur', async () => {
      const wrapper = createWrapper({ editMode: true, modelValue: 0 });
      const input = wrapper.find('input');

      await input.trigger('focus');
      input.element.value = '15.5';
      await input.trigger('input');

      expect(input.element.value).toBe('15.5');

      await input.trigger('blur');

      expect(input.element.value).toBe('15.50');
    });

    it('does not apply any styling to input by default', () => {
      const wrapper = createWrapper({ editMode: true, modelValue: -500 });
      const input = wrapper.find('.money-input');

      expect(input.classes()).not.toContain('negative');
      expect(input.classes()).not.toContain('positive');
      expect(input.classes()).not.toContain('muted');
    });

    it('applies negative styling to input in balance mode', () => {
      const wrapper = createWrapper({ editMode: true, modelValue: -500, highlightMode: 'balance' });
      const input = wrapper.find('.money-input');

      expect(input.classes()).toContain('negative');
    });
  });

  describe('highlightMode: difference', () => {
    describe('read-only mode', () => {
      it('applies positive styling when value is zero', () => {
        const wrapper = createWrapper({ modelValue: 0, highlightMode: 'difference' });
        const valueEl = wrapper.find('.money-display');

        expect(valueEl.classes()).toContain('positive');
        expect(valueEl.classes()).not.toContain('negative');
      });

      it('applies negative styling when value is positive', () => {
        const wrapper = createWrapper({ modelValue: 500, highlightMode: 'difference' });
        const valueEl = wrapper.find('.money-display');

        expect(valueEl.classes()).toContain('negative');
        expect(valueEl.classes()).not.toContain('positive');
      });

      it('applies negative styling when value is negative', () => {
        const wrapper = createWrapper({ modelValue: -500, highlightMode: 'difference' });
        const valueEl = wrapper.find('.money-display');

        expect(valueEl.classes()).toContain('negative');
        expect(valueEl.classes()).not.toContain('positive');
      });
    });

    describe('edit mode', () => {
      it('applies positive styling to input when value is zero', () => {
        const wrapper = createWrapper({
          editMode: true,
          modelValue: 0,
          highlightMode: 'difference',
        });
        const input = wrapper.find('.money-input');

        expect(input.classes()).toContain('positive');
        expect(input.classes()).not.toContain('negative');
      });

      it('applies negative styling to input when value is positive', () => {
        const wrapper = createWrapper({
          editMode: true,
          modelValue: 500,
          highlightMode: 'difference',
        });
        const input = wrapper.find('.money-input');

        expect(input.classes()).toContain('negative');
        expect(input.classes()).not.toContain('positive');
      });

      it('applies negative styling to input when value is negative', () => {
        const wrapper = createWrapper({
          editMode: true,
          modelValue: -500,
          highlightMode: 'difference',
        });
        const input = wrapper.find('.money-input');

        expect(input.classes()).toContain('negative');
        expect(input.classes()).not.toContain('positive');
      });
    });
  });
});
