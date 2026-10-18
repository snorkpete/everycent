import { describe, it, expect, vi, afterEach } from 'vitest';
import { defineComponent } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { useLanguageModelAvailability } from './useLanguageModelAvailability';
import { buildPromptApiMock } from '../../test/buildPromptApiMock';
import type { ModelAvailability } from './languageModel.types';

// onMounted needs a component, so the composable runs inside a minimal host
function setup({ availability }: { availability?: ModelAvailability } = {}) {
  if (availability) buildPromptApiMock({ availability });
  let result!: ReturnType<typeof useLanguageModelAvailability>;
  mount(
    defineComponent({
      setup() {
        result = useLanguageModelAvailability();
        return () => null;
      },
    }),
  );
  return result;
}

describe('useLanguageModelAvailability', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is null and not usable while checking', () => {
    const { availability, isUsable } = setup({ availability: 'available' });
    expect(availability.value).toBeNull();
    expect(isUsable.value).toBe(false);
  });

  it('is usable once the model is available', async () => {
    const { availability, isUsable } = setup({ availability: 'available' });
    await flushPromises();
    expect(availability.value).toBe('available');
    expect(isUsable.value).toBe(true);
  });

  it('is usable when the model still needs downloading', async () => {
    const { isUsable } = setup({ availability: 'downloadable' });
    await flushPromises();
    expect(isUsable.value).toBe(true);
  });

  it('is not usable when the browser has no model', async () => {
    const { availability, isUsable } = setup();
    await flushPromises();
    expect(availability.value).toBe('unavailable');
    expect(isUsable.value).toBe(false);
  });

  it('picks up changes on refresh', async () => {
    const { availability, refresh } = setup({ availability: 'downloadable' });
    await flushPromises();

    buildPromptApiMock({ availability: 'available' });
    await refresh();

    expect(availability.value).toBe('available');
  });
});
