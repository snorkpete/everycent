import { describe, it, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import EcToggleButton from './EcToggleButton.vue';
import { getTooltipValue } from '../../test/tooltip-helper';

function createWrapper(
  props: {
    modelValue?: boolean;
    tooltip?: string;
    variant?: 'dashIfZero' | 'wrap' | 'calculator';
    activeIcon?: string;
    inactiveIcon?: string;
  } = {},
): VueWrapper {
  return mount(EcToggleButton, {
    props: { modelValue: false, tooltip: 'Toggle something', ...props },
    global: { plugins: [PrimeVue] },
  });
}

describe('EcToggleButton', () => {
  describe('variant presets', () => {
    it('dashIfZero variant shows pi-minus when active', () => {
      const wrapper = createWrapper({ variant: 'dashIfZero', modelValue: true });

      expect(wrapper.find('.pi-minus').exists()).toBe(true);
    });

    it('dashIfZero variant shows pi-hashtag when inactive', () => {
      const wrapper = createWrapper({ variant: 'dashIfZero', modelValue: false });

      expect(wrapper.find('.pi-hashtag').exists()).toBe(true);
      expect(wrapper.find('.pi-minus').exists()).toBe(false);
    });

    it('wrap variant shows pi-arrows-h in both states', () => {
      const active = createWrapper({ variant: 'wrap', modelValue: true });
      const inactive = createWrapper({ variant: 'wrap', modelValue: false });

      expect(active.find('.pi-arrows-h').exists()).toBe(true);
      expect(inactive.find('.pi-arrows-h').exists()).toBe(true);
    });

    it('calculator variant shows pi-calculator in both states', () => {
      const active = createWrapper({ variant: 'calculator', modelValue: true });
      const inactive = createWrapper({ variant: 'calculator', modelValue: false });

      expect(active.find('.pi-calculator').exists()).toBe(true);
      expect(inactive.find('.pi-calculator').exists()).toBe(true);
    });
  });

  describe('explicit icon props', () => {
    it('shows activeIcon when modelValue is true', () => {
      const wrapper = createWrapper({ modelValue: true, activeIcon: 'pi pi-check' });

      expect(wrapper.find('.pi-check').exists()).toBe(true);
    });

    it('shows inactiveIcon when modelValue is false and inactiveIcon is provided', () => {
      const wrapper = createWrapper({
        modelValue: false,
        activeIcon: 'pi pi-check',
        inactiveIcon: 'pi pi-times',
      });

      expect(wrapper.find('.pi-times').exists()).toBe(true);
      expect(wrapper.find('.pi-check').exists()).toBe(false);
    });

    it('shows activeIcon when modelValue is false and no inactiveIcon is provided', () => {
      const wrapper = createWrapper({ modelValue: false, activeIcon: 'pi pi-arrows-h' });

      expect(wrapper.find('.pi-arrows-h').exists()).toBe(true);
    });

    it('explicit icon props override variant', () => {
      const wrapper = createWrapper({
        variant: 'dashIfZero',
        activeIcon: 'pi pi-star',
        modelValue: true,
      });

      expect(wrapper.find('.pi-star').exists()).toBe(true);
      expect(wrapper.find('.pi-minus').exists()).toBe(false);
    });
  });

  describe('active styling', () => {
    it('applies icon-btn--active class when modelValue is true', () => {
      const wrapper = createWrapper({ modelValue: true });
      const btn = wrapper.find('button');

      expect(btn.classes()).toContain('icon-btn--active');
    });

    it('does not apply icon-btn--active class when modelValue is false', () => {
      const wrapper = createWrapper({ modelValue: false });
      const btn = wrapper.find('button');

      expect(btn.classes()).not.toContain('icon-btn--active');
    });
  });

  describe('toggle emit', () => {
    it('emits update:modelValue with true when clicked while inactive', async () => {
      const wrapper = createWrapper({ modelValue: false });

      await wrapper.find('button').trigger('click');

      expect(wrapper.emitted('update:modelValue')).toEqual([[true]]);
    });

    it('emits update:modelValue with false when clicked while active', async () => {
      const wrapper = createWrapper({ modelValue: true });

      await wrapper.find('button').trigger('click');

      expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    });
  });

  describe('tooltip', () => {
    it('sets tooltip from prop', () => {
      const wrapper = createWrapper({ tooltip: 'Show dashes for zeroes' });
      const btn = wrapper.find('button');

      expect(getTooltipValue(btn)).toBe('Show dashes for zeroes');
    });
  });

  describe('button styling', () => {
    it('renders as text button with secondary severity', () => {
      const wrapper = createWrapper();
      const btn = wrapper.find('button');

      expect(btn.classes()).toContain('p-button-text');
      expect(btn.classes()).toContain('p-button-secondary');
    });

    it('renders with small size', () => {
      const wrapper = createWrapper();
      const btn = wrapper.find('button');

      expect(btn.classes()).toContain('p-button-sm');
    });
  });
});
