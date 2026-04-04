import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import type { Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import AppToolbar from './AppToolbar.vue';
import { useHeadingStore } from './headingStore';

const isCompact = ref(false);
vi.mock('../shared/composables/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: ref(false),
    isCompact,
  }),
}));

describe('AppToolbar', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    isCompact.value = false;
  });

  function mountToolbar() {
    return mount(AppToolbar, {
      global: {
        plugins: [pinia, [PrimeVue, { theme: { preset: Aura } }]],
      },
    });
  }

  it('renders the page header container', () => {
    const wrapper = mountToolbar();

    expect(wrapper.find('[data-testid="page-header"]').exists()).toBe(true);
  });

  it('shows the page title when heading is set', () => {
    const headingStore = useHeadingStore();
    const heading = 'Current Budget';
    headingStore.setHeading(heading);

    const wrapper = mountToolbar();

    expect(wrapper.find('[data-testid="page-title"]').text()).toBe(heading);
  });

  it('hides the page title when heading is empty', () => {
    const wrapper = mountToolbar();

    expect(wrapper.find('[data-testid="page-title"]').exists()).toBe(false);
  });

  it('adds compact class on small viewports to clear the hamburger', () => {
    isCompact.value = true;

    const wrapper = mountToolbar();

    expect(wrapper.find('[data-testid="page-header"]').classes()).toContain('compact');
  });

  it('does not add compact class on desktop', () => {
    isCompact.value = false;

    const wrapper = mountToolbar();

    expect(wrapper.find('[data-testid="page-header"]').classes()).not.toContain('compact');
  });
});
