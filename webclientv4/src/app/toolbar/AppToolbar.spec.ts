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

  it('displays the app title', () => {
    const wrapper = mountToolbar();

    expect(wrapper.find('[data-testid="app-title"]').text()).toBe('EveryCent');
  });

  it('shows page heading when set', () => {
    const headingStore = useHeadingStore();
    const heading = 'Current Budget';
    headingStore.setHeading(heading);

    const wrapper = mountToolbar();

    expect(wrapper.find('[data-testid="page-heading"]').text()).toBe(heading);
  });

  it('hides page heading when empty', () => {
    const wrapper = mountToolbar();

    expect(wrapper.find('[data-testid="page-heading"]').exists()).toBe(false);
  });
});
