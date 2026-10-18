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

  it('is checking, and neither available nor needing install, until the check finishes', () => {
    const { isChecking, isAvailable, needsInstall } = setup({ availability: 'downloadable' });
    expect(isChecking.value).toBe(true);
    expect(isAvailable.value).toBe(false);
    expect(needsInstall.value).toBe(false);
  });

  it('is available and needs no install when the model is ready', async () => {
    const { isChecking, isAvailable, needsInstall } = setup({ availability: 'available' });
    await flushPromises();
    expect(isChecking.value).toBe(false);
    expect(isAvailable.value).toBe(true);
    expect(needsInstall.value).toBe(false);
  });

  it.each(['downloadable', 'downloading'] as const)(
    'is available but needs install when the model is %s',
    async (availability) => {
      const { isAvailable, needsInstall } = setup({ availability });
      await flushPromises();
      expect(isAvailable.value).toBe(true);
      expect(needsInstall.value).toBe(true);
    },
  );

  it('is not available when the browser has no model', async () => {
    const { isChecking, isAvailable, needsInstall } = setup();
    await flushPromises();
    expect(isChecking.value).toBe(false);
    expect(isAvailable.value).toBe(false);
    expect(needsInstall.value).toBe(false);
  });

  it('picks up changes on refresh', async () => {
    const { needsInstall, refresh } = setup({ availability: 'downloadable' });
    await flushPromises();

    buildPromptApiMock({ availability: 'available' });
    await refresh();

    expect(needsInstall.value).toBe(false);
  });
});
