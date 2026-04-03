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

  describe('toolbar slot (legacy escape hatch)', () => {
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

    it('renders toolbar wrapper when toolbar slot is provided', () => {
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

  describe('toolbar-left and toolbar-right slots', () => {
    it('renders toolbar when toolbar-left slot is provided', () => {
      const wrapper = createWrapper(
        { pageName: 'test' },
        {
          'toolbar-left': '<button data-testid="left-btn">Left</button>',
        },
      );

      expect(wrapper.find('.ec-page-layout__toolbar').exists()).toBe(true);
      expect(wrapper.find('[data-testid="left-btn"]').exists()).toBe(true);
    });

    it('renders toolbar when toolbar-right slot is provided', () => {
      const wrapper = createWrapper(
        { pageName: 'test' },
        {
          'toolbar-right': '<button data-testid="right-btn">Right</button>',
        },
      );

      expect(wrapper.find('.ec-page-layout__toolbar').exists()).toBe(true);
      expect(wrapper.find('[data-testid="right-btn"]').exists()).toBe(true);
    });

    it('renders toolbar when both toolbar-left and toolbar-right slots are provided', () => {
      const wrapper = createWrapper(
        { pageName: 'test' },
        {
          'toolbar-left': '<button data-testid="left-btn">Left</button>',
          'toolbar-right': '<button data-testid="right-btn">Right</button>',
        },
      );

      expect(wrapper.find('.ec-page-layout__toolbar').exists()).toBe(true);
      expect(wrapper.find('[data-testid="left-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="right-btn"]').exists()).toBe(true);
    });

    it('renders toolbar-left content inside the left zone element', () => {
      const wrapper = createWrapper(
        { pageName: 'test' },
        {
          'toolbar-left': '<span data-testid="left-content">Left</span>',
        },
      );

      const leftZone = wrapper.find('.ec-page-layout__toolbar-left');
      expect(leftZone.exists()).toBe(true);
      expect(leftZone.find('[data-testid="left-content"]').exists()).toBe(true);
    });

    it('renders toolbar-right content inside the right zone element', () => {
      const wrapper = createWrapper(
        { pageName: 'test' },
        {
          'toolbar-right': '<span data-testid="right-content">Right</span>',
        },
      );

      const rightZone = wrapper.find('.ec-page-layout__toolbar-right');
      expect(rightZone.exists()).toBe(true);
      expect(rightZone.find('[data-testid="right-content"]').exists()).toBe(true);
    });

    it('does not render toolbar wrapper when no toolbar slots are provided', () => {
      const wrapper = createWrapper({ pageName: 'test' });

      expect(wrapper.find('.ec-page-layout__toolbar').exists()).toBe(false);
    });

    it('prefers toolbar-left/right over legacy toolbar slot when both provided', () => {
      const wrapper = createWrapper(
        { pageName: 'test' },
        {
          'toolbar-left': '<span data-testid="left">Left</span>',
          toolbar: '<span data-testid="legacy">Legacy</span>',
        },
      );

      expect(wrapper.find('.ec-page-layout__toolbar-left').exists()).toBe(true);
      expect(wrapper.find('[data-testid="left"]').exists()).toBe(true);
      // Legacy toolbar slot is not rendered when toolbar-left/right are present
      expect(wrapper.find('[data-testid="legacy"]').exists()).toBe(false);
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
  });

  describe('fixed variant', () => {
    it('applies fixed modifier class when variant is fixed', () => {
      const wrapper = createWrapper({ pageName: 'test', variant: 'fixed' });

      expect(wrapper.find('.ec-page-layout--fixed').exists()).toBe(true);
      expect(wrapper.find('.ec-page-layout--scrollable').exists()).toBe(false);
    });

    it('renders default slot content directly without wrapping', () => {
      const wrapper = createWrapper(
        { pageName: 'test', variant: 'fixed' },
        {
          default: '<div data-testid="page-content">Content</div>',
        },
      );

      expect(wrapper.find('[data-testid="page-content"]').exists()).toBe(true);
    });
  });
});
