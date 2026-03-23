import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import type { Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import AppToolbar from './AppToolbar.vue';
import { useHeadingStore } from './headingStore';

describe('AppToolbar', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
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
});
