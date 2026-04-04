import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, nextTick } from 'vue';

const mockSmaller = vi.fn();
vi.mock('@vueuse/core', () => ({
  useBreakpoints: () => ({
    smaller: mockSmaller,
  }),
}));

import { useResponsive } from './useResponsive';

describe('useResponsive', () => {
  const mobileRef = ref(false);
  const compactRef = ref(false);

  beforeEach(() => {
    mobileRef.value = false;
    compactRef.value = false;
    mockSmaller.mockReset();
    mockSmaller.mockImplementation((key: string) => {
      if (key === 'mobile') return mobileRef;
      if (key === 'compact') return compactRef;
      return ref(false);
    });
  });

  function setup() {
    return useResponsive();
  }

  it('returns isMobile as false on desktop', () => {
    const { isMobile } = setup();

    expect(isMobile.value).toBe(false);
  });

  it('returns isCompact as false on desktop', () => {
    const { isCompact } = setup();

    expect(isCompact.value).toBe(false);
  });

  it('returns isMobile as true when viewport is below mobile breakpoint', () => {
    mobileRef.value = true;
    const { isMobile } = setup();

    expect(isMobile.value).toBe(true);
  });

  it('returns isCompact as true when viewport is below compact breakpoint', () => {
    compactRef.value = true;
    const { isCompact } = setup();

    expect(isCompact.value).toBe(true);
  });

  it('is reactive to viewport changes', async () => {
    const { isMobile, isCompact } = setup();

    expect(isMobile.value).toBe(false);
    expect(isCompact.value).toBe(false);

    mobileRef.value = true;
    compactRef.value = true;
    await nextTick();

    expect(isMobile.value).toBe(true);
    expect(isCompact.value).toBe(true);
  });

  it('calls useBreakpoints.smaller with correct breakpoint keys', () => {
    setup();

    expect(mockSmaller).toHaveBeenCalledWith('mobile');
    expect(mockSmaller).toHaveBeenCalledWith('compact');
  });
});
