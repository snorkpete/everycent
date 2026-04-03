import { describe, it, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import EcDialogFooter from './EcDialogFooter.vue';

function createWrapper(props: Record<string, unknown> = {}, slots: Record<string, string> = {}): VueWrapper {
  return mount(EcDialogFooter, {
    props,
    slots,
    global: {
      plugins: [PrimeVue],
    },
  });
}

describe('EcDialogFooter', () => {
  describe('default rendering', () => {
    it('renders Save button with default label', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid="save-btn"]').text()).toBe('Save');
    });

    it('renders Cancel button with default label', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid="cancel-btn"]').text()).toBe('Cancel');
    });

    it('Save button is enabled by default', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid="save-btn"]').attributes('disabled')).toBeUndefined();
    });
  });

  describe('custom labels', () => {
    it('renders custom save label', () => {
      const wrapper = createWrapper({ saveLabel: 'Transfer' });
      expect(wrapper.find('[data-testid="save-btn"]').text()).toBe('Transfer');
    });

    it('renders custom cancel label', () => {
      const wrapper = createWrapper({ cancelLabel: 'Dismiss' });
      expect(wrapper.find('[data-testid="cancel-btn"]').text()).toBe('Dismiss');
    });
  });

  describe('save disabled state', () => {
    it('disables Save button when saveDisabled is true', () => {
      const wrapper = createWrapper({ saveDisabled: true });
      expect(wrapper.find('[data-testid="save-btn"]').attributes('disabled')).toBeDefined();
    });

    it('enables Save button when saveDisabled is false', () => {
      const wrapper = createWrapper({ saveDisabled: false });
      expect(wrapper.find('[data-testid="save-btn"]').attributes('disabled')).toBeUndefined();
    });
  });

  describe('events', () => {
    it('emits save when Save button is clicked', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      expect(wrapper.emitted('save')).toBeTruthy();
    });

    it('emits cancel when Cancel button is clicked', async () => {
      const wrapper = createWrapper();
      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');
      expect(wrapper.emitted('cancel')).toBeTruthy();
    });
  });

  describe('default slot', () => {
    it('renders slot content before the buttons', () => {
      const wrapper = createWrapper(
        {},
        { default: '<span data-testid="extra-content">Extra</span>' },
      );
      expect(wrapper.find('[data-testid="extra-content"]').exists()).toBe(true);
    });
  });
});
