import { describe, it, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import EcPageLayout from './EcPageLayout.vue';

function createWrapper(
  props: { pageName: string; variant?: 'scrollable' | 'fixed' } = { pageName: 'test' },
  slots: Record<string, string> = {},
): VueWrapper {
  return mount(EcPageLayout, {
    props,
    slots,
  });
}

describe('EcPageLayout', () => {
  describe('data-page attribute', () => {
    it('renders data-page attribute with pageName value', () => {
      const wrapper = createWrapper({ pageName: 'institutions' });

      expect(wrapper.find('[data-page="institutions"]').exists()).toBe(true);
    });
  });

  describe('toolbar slot', () => {
    it('renders toolbar slot content when provided', () => {
      const wrapper = createWrapper(
        { pageName: 'test' },
        {
          toolbar: '<button data-testid="toolbar-btn">Action</button>',
        },
      );

      expect(wrapper.find('[data-testid="toolbar-btn"]').exists()).toBe(true);
    });

    it('does not render toolbar wrapper when no toolbar slot is provided', () => {
      const wrapper = createWrapper({ pageName: 'test' });

      expect(wrapper.find('.ec-page-layout__toolbar').exists()).toBe(false);
    });

    it('renders toolbar wrapper with correct CSS when toolbar slot is provided', () => {
      const wrapper = createWrapper(
        { pageName: 'test' },
        {
          toolbar: '<button>Action</button>',
        },
      );

      const toolbar = wrapper.find('.ec-page-layout__toolbar');
      expect(toolbar.exists()).toBe(true);
    });
  });

  describe('default slot', () => {
    it('renders default slot content', () => {
      const wrapper = createWrapper(
        { pageName: 'test' },
        {
          default: '<div data-testid="page-content">Content here</div>',
        },
      );

      expect(wrapper.find('[data-testid="page-content"]').exists()).toBe(true);
    });
  });

  describe('scrollable variant (default)', () => {
    it('applies scrollable modifier class by default', () => {
      const wrapper = createWrapper({ pageName: 'test' });

      expect(wrapper.find('.ec-page-layout--scrollable').exists()).toBe(true);
      expect(wrapper.find('.ec-page-layout--fixed').exists()).toBe(false);
    });

    it('applies scrollable modifier class when variant is explicitly scrollable', () => {
      const wrapper = createWrapper({ pageName: 'test', variant: 'scrollable' });

      expect(wrapper.find('.ec-page-layout--scrollable').exists()).toBe(true);
    });

    it('does not wrap default slot in content card', () => {
      const wrapper = createWrapper(
        { pageName: 'test' },
        {
          default: '<div data-testid="page-content">Content</div>',
        },
      );

      expect(wrapper.find('.ec-page-layout__content-card').exists()).toBe(false);
    });
  });

  describe('fixed variant', () => {
    it('applies fixed modifier class when variant is fixed', () => {
      const wrapper = createWrapper({ pageName: 'test', variant: 'fixed' });

      expect(wrapper.find('.ec-page-layout--fixed').exists()).toBe(true);
      expect(wrapper.find('.ec-page-layout--scrollable').exists()).toBe(false);
    });

    it('wraps default slot in content card', () => {
      const wrapper = createWrapper(
        { pageName: 'test', variant: 'fixed' },
        {
          default: '<div data-testid="page-content">Content</div>',
        },
      );

      const contentCard = wrapper.find('.ec-page-layout__content-card');
      expect(contentCard.exists()).toBe(true);
      expect(contentCard.find('[data-testid="page-content"]').exists()).toBe(true);
    });
  });
});
