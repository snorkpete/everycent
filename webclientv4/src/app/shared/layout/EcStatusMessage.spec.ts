import { describe, it, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import EcStatusMessage from './EcStatusMessage.vue';

function createWrapper(props: { loading?: boolean; error?: string | null } = {}): VueWrapper {
  return mount(EcStatusMessage, { props });
}

describe('EcStatusMessage', () => {
  describe('when neither loading nor error is passed', () => {
    it('renders nothing when no props are provided', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="status-message"]').exists()).toBe(false);
    });
  });

  describe('loading state', () => {
    it('renders "Loading..." when loading is true', () => {
      const wrapper = createWrapper({ loading: true });

      const element = wrapper.find('[data-testid="status-message"]');
      expect(element.exists()).toBe(true);
      expect(element.text()).toBe('Loading...');
    });

    it('does not have the error modifier class when loading', () => {
      const wrapper = createWrapper({ loading: true });

      const element = wrapper.find('[data-testid="status-message"]');
      expect(element.classes()).not.toContain('ec-status-message--error');
    });

    it('loading wins when both loading and error are provided', () => {
      const wrapper = createWrapper({ loading: true, error: 'Something went wrong' });

      const element = wrapper.find('[data-testid="status-message"]');
      expect(element.exists()).toBe(true);
      expect(element.text()).toBe('Loading...');
      expect(element.classes()).not.toContain('ec-status-message--error');
    });
  });

  describe('error state', () => {
    it('renders the error message when error is a non-empty string', () => {
      const wrapper = createWrapper({ error: 'Something went wrong' });

      const element = wrapper.find('[data-testid="status-message"]');
      expect(element.exists()).toBe(true);
      expect(element.text()).toBe('Something went wrong');
    });

    it('has the error modifier class when error is set', () => {
      const wrapper = createWrapper({ error: 'Something went wrong' });

      const element = wrapper.find('[data-testid="status-message"]');
      expect(element.classes()).toContain('ec-status-message--error');
    });
  });

  describe('edge cases', () => {
    it('renders nothing when loading is false and error is null', () => {
      const wrapper = createWrapper({ loading: false, error: null });

      expect(wrapper.find('[data-testid="status-message"]').exists()).toBe(false);
    });

    it('renders nothing when loading is false and error is empty string', () => {
      const wrapper = createWrapper({ loading: false, error: '' });

      expect(wrapper.find('[data-testid="status-message"]').exists()).toBe(false);
    });
  });
});
