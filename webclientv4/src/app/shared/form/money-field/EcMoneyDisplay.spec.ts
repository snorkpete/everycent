import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EcMoneyDisplay from './EcMoneyDisplay.vue';
import { HighlightMode } from '../../constants/highlightMode';
import { Emphasis } from '../../constants/emphasis';

function createWrapper(props: Record<string, unknown> = {}) {
  return mount(EcMoneyDisplay, {
    props: {
      modelValue: 0,
      ...props,
    },
  });
}

describe('EcMoneyDisplay', () => {
  describe('formatting', () => {
    it('displays a positive value formatted as dollars', () => {
      const wrapper = createWrapper({ modelValue: 1550 });

      expect(wrapper.text()).toBe('15.50');
    });

    it('displays a negative value formatted as dollars', () => {
      const wrapper = createWrapper({ modelValue: -1550 });

      expect(wrapper.text()).toBe('-15.50');
    });

    it('displays zero as 0.00', () => {
      const wrapper = createWrapper({ modelValue: 0 });

      expect(wrapper.text()).toBe('0.00');
    });

    it('formats large numbers with thousand separators', () => {
      const wrapper = createWrapper({ modelValue: 123456 });

      expect(wrapper.text()).toBe('1,234.56');
    });

    it('treats null as 0.00', () => {
      const wrapper = createWrapper({ modelValue: null });

      expect(wrapper.text()).toBe('0.00');
    });

    it('treats undefined as 0.00', () => {
      const wrapper = createWrapper({ modelValue: undefined });

      expect(wrapper.text()).toBe('0.00');
    });
  });

  describe('highlightMode: balance (default)', () => {
    it('applies positive class for positive values by default', () => {
      const wrapper = createWrapper({ modelValue: 500 });
      const span = wrapper.find('.money-display');

      expect(span.classes()).toContain('positive');
    });

    it('applies negative class for negative values by default', () => {
      const wrapper = createWrapper({ modelValue: -500 });
      const span = wrapper.find('.money-display');

      expect(span.classes()).toContain('negative');
    });

    it('applies muted class for zero by default', () => {
      const wrapper = createWrapper({ modelValue: 0 });
      const span = wrapper.find('.money-display');

      expect(span.classes()).toContain('muted');
    });

    it('does not apply muted for non-zero values', () => {
      const wrapper = createWrapper({ modelValue: 500 });
      const span = wrapper.find('.money-display');

      expect(span.classes()).not.toContain('muted');
    });
  });

  describe('highlightMode: none', () => {
    it('does not apply positive class for positive values', () => {
      const wrapper = createWrapper({ modelValue: 500, highlightMode: HighlightMode.None });
      const span = wrapper.find('.money-display');

      expect(span.classes()).not.toContain('positive');
    });

    it('does not apply negative class for negative values', () => {
      const wrapper = createWrapper({ modelValue: -500, highlightMode: HighlightMode.None });
      const span = wrapper.find('.money-display');

      expect(span.classes()).not.toContain('negative');
    });

    it('does not apply muted class for zero', () => {
      const wrapper = createWrapper({ modelValue: 0, highlightMode: HighlightMode.None });
      const span = wrapper.find('.money-display');

      expect(span.classes()).not.toContain('muted');
    });
  });

  describe('highlightMode: income', () => {
    it('applies income class regardless of value', () => {
      const wrapper = createWrapper({ modelValue: 500000, highlightMode: HighlightMode.Income });
      const span = wrapper.find('.money-display');

      expect(span.classes()).toContain('income');
    });

    it('applies income class for zero value', () => {
      const wrapper = createWrapper({ modelValue: 0, highlightMode: HighlightMode.Income });
      const span = wrapper.find('.money-display');

      expect(span.classes()).toContain('income');
    });

    it('does not apply positive, negative, or muted classes', () => {
      const wrapper = createWrapper({ modelValue: 500000, highlightMode: HighlightMode.Income });
      const span = wrapper.find('.money-display');

      expect(span.classes()).not.toContain('positive');
      expect(span.classes()).not.toContain('negative');
      expect(span.classes()).not.toContain('muted');
    });
  });

  describe('highlightMode: difference', () => {
    it('applies positive class when value is zero', () => {
      const wrapper = createWrapper({ modelValue: 0, highlightMode: HighlightMode.Difference });
      const span = wrapper.find('.money-display');

      expect(span.classes()).toContain('positive');
    });

    it('applies negative class when value is positive', () => {
      const wrapper = createWrapper({ modelValue: 500, highlightMode: HighlightMode.Difference });
      const span = wrapper.find('.money-display');

      expect(span.classes()).toContain('negative');
    });

    it('applies negative class when value is negative', () => {
      const wrapper = createWrapper({ modelValue: -500, highlightMode: HighlightMode.Difference });
      const span = wrapper.find('.money-display');

      expect(span.classes()).toContain('negative');
    });
  });

  describe('dashIfZero', () => {
    it('displays a dash instead of 0.00 when dashIfZero is true and value is zero', () => {
      const wrapper = createWrapper({ modelValue: 0, dashIfZero: true });

      expect(wrapper.text()).toBe('—');
    });

    it('displays a dash for null value when dashIfZero is true', () => {
      const wrapper = createWrapper({ modelValue: null, dashIfZero: true });

      expect(wrapper.text()).toBe('—');
    });

    it('displays a dash for undefined value when dashIfZero is true', () => {
      const wrapper = createWrapper({ modelValue: undefined, dashIfZero: true });

      expect(wrapper.text()).toBe('—');
    });

    it('displays the formatted value for non-zero values when dashIfZero is true', () => {
      const wrapper = createWrapper({ modelValue: 1550, dashIfZero: true });

      expect(wrapper.text()).toBe('15.50');
    });

    it('displays 0.00 when dashIfZero is false', () => {
      const wrapper = createWrapper({ modelValue: 0, dashIfZero: false });

      expect(wrapper.text()).toBe('0.00');
    });

    it('defaults to showing 0.00 when dashIfZero is not provided', () => {
      const wrapper = createWrapper({ modelValue: 0 });

      expect(wrapper.text()).toBe('0.00');
    });
  });

  describe('emphasis', () => {
    it('applies emphasis-item class by default', () => {
      const wrapper = createWrapper({ modelValue: 1550 });
      const span = wrapper.find('.money-display');

      expect(span.classes()).toContain('emphasis-item');
    });

    it('applies emphasis-subtotal class', () => {
      const wrapper = createWrapper({ modelValue: 1550, emphasis: Emphasis.Subtotal });
      const span = wrapper.find('.money-display');

      expect(span.classes()).toContain('emphasis-subtotal');
    });

    it('applies emphasis-total class', () => {
      const wrapper = createWrapper({ modelValue: 1550, emphasis: Emphasis.Total });
      const span = wrapper.find('.money-display');

      expect(span.classes()).toContain('emphasis-total');
    });

    it('applies emphasis-headline class', () => {
      const wrapper = createWrapper({ modelValue: 1550, emphasis: Emphasis.Headline });
      const span = wrapper.find('.money-display');

      expect(span.classes()).toContain('emphasis-headline');
    });
  });
});
