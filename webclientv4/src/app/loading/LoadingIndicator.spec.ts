import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import type { Pinia } from 'pinia';
import LoadingIndicator from './LoadingIndicator.vue';
import { useLoadingIndicatorStore } from './loadingIndicatorStore';

describe('LoadingIndicator', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  function mountComponent() {
    return mount(LoadingIndicator, {
      global: {
        plugins: [pinia],
      },
    });
  }

  it('shows the progress bar when loading', () => {
    const store = useLoadingIndicatorStore();
    store.startRequest();

    const wrapper = mountComponent();

    expect(wrapper.find('[data-testid="progress-bar"]').exists()).toBe(true);
  });

  it('hides the progress bar when not loading', () => {
    const wrapper = mountComponent();

    expect(wrapper.find('[data-testid="progress-bar"]').exists()).toBe(false);
  });

  it('reacts to loading state changes', async () => {
    const store = useLoadingIndicatorStore();
    const wrapper = mountComponent();

    expect(wrapper.find('[data-testid="progress-bar"]').exists()).toBe(false);

    store.startRequest();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="progress-bar"]').exists()).toBe(true);

    store.finishRequest();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="progress-bar"]').exists()).toBe(false);
  });
});
